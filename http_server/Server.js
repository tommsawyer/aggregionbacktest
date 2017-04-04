const express      = require('express');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('cookie-session');
const passport     = require('passport');
const logger       = require('morgan');

const UserRouter = require('./controllers/user');
const CommentRouter = require('./controllers/comment');

class HttpServer {
  constructor(port, logger) {
    this.logger = logger;
    this.port = port;
    this.app  = express();
  }

  initializeExpress() {
    if (this.logger)
      this.app.use(logger('dev'));

    this.app.use(bodyParser.json());
    this.app.use(passport.initialize());
    require('../config/passport')(passport);

    this.app.use('/user', UserRouter);
    this.app.use('/comment', CommentRouter);

    this.app.use(this._notFound.bind(this));
    this.app.use(this._errorHandler.bind(this));
  }

  _notFound(req, res, next) {
    return next(new Error('Not found'));
  }

  _errorHandler(err, req, res, next) {
    res.json(err.toString());
  }

  listen() {
    this.initializeExpress();

    return new Promise((resolve, reject) => {
      this.app.listen(this.port, (err) => {
        if (err) return reject(err);

        resolve();
      })
    });
  }
}

module.exports = HttpServer;
