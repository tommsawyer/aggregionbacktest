const express = require('express');
const passport = require('passport');
const User = require('../../models/User');
const Comment = require('../../models/Comment');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

let router = express.Router();

router.post('/', (req, res, next) => {
  let newUser = new User({
    email: req.body.email,
    password: req.body.password
  });

  newUser.save()
    .then(() => {
      res.json({
        success: true
      });
    })
    .catch(next);
});

router.post('/login', (req, res, next) => {
  let user;

  User.findOne({ email: req.body.email })
    .then(loadedUser => {
      user = loadedUser;

      if (!user) throw new Error('User not found');

      return user.comparePassword(req.body.password)
    })
    .then(isMatch => {
      if (isMatch) {
        let token = jwt.sign(user.toJSON(), config.auth.secret, {expiresIn: '2 days'});
        return res.json({
          success: true,
          token
        });
      } else {
        return res.json({
          success: false
        })
      }

    })
    .catch(next);
});

router.get('/comments', (req, res, next) => {
  Comment.aggregate([
    {
      $group: {
        _id: '$author',
        commentsCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'author'
      }
    },
    {
      $sort: {
        total: -1
      }
    }
  ])
  .exec()
  .then(result => {
    res.json(result.map(result => {
      return {
        author: {
          _id: result.author[0]._id,
          email: result.author[0].email
        },

        commentsCount: result.commentsCount
      };
    }));
  }) 
});

module.exports = router;
