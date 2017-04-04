const mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({
  text: 'string',

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },

  childComments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

let getSubTreeHeight = (comment) => {
  if (!comment.childComments.length)
    return Promise.resolve(1);

  return Comment.find({_id: {$in: comment.childComments}})
    .then(comments => {
      return Promise.all(comments.map(getSubTreeHeight));
    })
    .then(heights => {
      return Math.max.apply(null, heights) + 1;
    });
}

commentSchema.statics.getTreeHeight = function() {
  return Comment.find({parentComment: null})
    .then(rootComments => {
       if (!rootComments.length) return [0];

       return Promise.all(rootComments.map(getSubTreeHeight));
    })
    .then(heights => {
      return Math.max.apply(null, heights);
    });
}

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
