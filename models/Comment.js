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
  }
});

commentSchema.statics.getTreeHeight = function(comment) {
  comment = comment || {_id: null};

  return Comment.find({parentComment: comment._id})
    .then(comments => {
      if (comments.length === 0)
        return [-1];

      return Promise.all(comments.map(Comment.getTreeHeight));
    })
    .then(heights => {
      return Math.max.apply(null, heights) + 1;
    });
}

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
