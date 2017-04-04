const express = require('express');
const Comment = require('../../models/Comment');
const passport = require('passport');
const ObjectId = require('mongodb').ObjectId;

let router = express.Router();

router.post('/', passport.authenticate('jwt', {session: false}), (req, res, next) => {
  let userId = req.user._id;
  let parentComment = req.body.parentComment || null;

  let comment = new Comment({
    text: req.body.text,
    author: userId,
    parentComment
  });

  Promise.resolve()
    .then(() => {
      if (parentComment) {
        return Comment.findById(new ObjectId(parentComment));
      }
    })
    .then(parent => {
      if (!parent && parentComment) {
        throw new Error('No such parent comment');
      }

      return comment.save();
    })
    .then(() => {
      res.json(comment);
    })
    .catch(next);
});

router.get('/height', (req, res, next) => {
  Comment.getTreeHeight()
    .then(height => res.json({ height }))
    .catch(next);
});

router.get('/:id', (req, res, next) => {
  Comment.findById(req.params.id)
    .then(comment => {
      if (comment) {
        return res.json(comment);
      }

      return next(new Error('Not found'));
    })
    .catch(next);
});

router.get('/', (req, res, next) => {
  Comment.find({})
    .then(comments => {
      res.json(comments);
    })
    .catch(next);
});

module.exports = router;
