const request = require('supertest');
const config = require('../config/config');
const HttpServer = require('../http_server/Server');
const mongoose = require('mongoose');
const expect = require('chai').expect;

const server = new HttpServer(config.port, false);
server.initializeExpress();
const app = server.app;

mongoose.Promise = Promise;

let testJWT = '';
let testComment = '';

const check = (done, f) => {
  try {
    f();
    done();
  } catch(e) {
    done(e);
  }
}

describe('Routes', () => {
  before(done => {
    mongoose.connect(config.mongoTestUrl).then(() => {
      mongoose.connection.db.dropDatabase().then(() => done());
    });
  });

  describe('User', () => {
    it('POST /user', (done) => {
      const data = {
        email: 'some@some',
        password: 'somepassword'
      };

      request(app)
        .post('/user')
        .send(data)
        .expect(200, done);
    });

    it('POST /user/login', (done) => {
      const data = {
        email: 'some@some',
        password: 'somepassword'
      };

      request(app)
        .post('/user/login')
        .send(data)
        .expect(res => {
          testJWT = res.body.token;
        })
        .then(res => {
          check(done, () => {
            expect(res.body.success).to.equal(true);
            expect(res.body.token).to.be.defined;
          });
        });
    });
  });

  describe('Comment', () => {
    describe('Comments', () => {
      it ('POST /comment without auth', (done) => {
        // expect unauthorized
        request(app)
          .post('/comment')
          .expect(401, done);
      });

      it('POST /comment', (done) => {
        const data = {
          text: 'new commentary'
        };

        request(app)
          .post('/comment')
          .set('Authorization', 'JWT ' + testJWT)
          .send(data)
          .expect(200)
          .expect(res => {
            testComment = res.body._id;
          })
          .then(res => {
            check(done, () => {
              expect(res.body._id).to.be.defined;
              expect(res.body.text).to.be.defined;
              expect(res.body.parentComment).to.equal(null);
            });
          })
      });

      it('GET /comment/:id', (done) => {
        request(app)
          .get('/comment/' + testComment)
          .expect(200)
          .then(res => {
            check(done, () => {
              expect(res.body._id).to.equal(testComment);
              expect(res.body.text).to.equal('new commentary');
            });
          });
      });
      
      it('POST /comment with parentComment', (done) => {
        const data = {
          text: 'new child commentary',
          parentComment: testComment
        };

        request(app)
          .post('/comment')
          .set('Authorization', 'JWT ' + testJWT)
          .send(data)
          .expect(200)
          .then(res => {
            check(done, () => {
              expect(res.body._id).to.be.defined;
              expect(res.body.text).to.be.defined;
              expect(res.body.parentComment).to.equal(testComment);
            });
          });
      });

      it('GET /comment', (done) => {
        request(app)
          .get('/comment')
          .expect(200)
          .then(res => {
            check(done, () => {
              expect(res.body.length).to.equal(2);
              expect(res.body[0].text).to.equal('new commentary');
              expect(res.body[0].parentComment).to.not.be.defined;

              expect(res.body[1].text).to.equal('new child commentary');
              expect(res.body[1].parentComment).to.equal(testComment);
            });
          });
      });
    });


    describe('Comments and authors', () => {
      it('GET /user/comments', (done) => {
        request(app)
          .get('/user/comments')
          .expect(200)
          .then(res => {
            check(done, () => {
              expect(res.body.length).to.equal(1);
              expect(res.body[0].author).to.be.defined;
              expect(res.body[0].author.email).to.equal('some@some');
              expect(res.body[0].commentsCount).to.equal(2);
            })
          });
      });
    });

    describe('Comments tree', () => {
      it('GET /height with built tree', (done) => {
        request(app)
          .get('/comment/height')
          .expect(200)
          .then(res => { 
            check(done, () => {
              expect(res.body.height).to.equal(2);
            });
           });
      });

      it('GET /height with no comments', (done) => {
        mongoose.connection.db.collection('comments').remove({})
          .then(() => {
            request(app)
              .get('/comment/height')
              .expect(200)
              .then(res => { 
                check(done, () => {
                  expect(res.body.height).to.equal(0);
                });
              });
          });
      });
    });
  });
});
