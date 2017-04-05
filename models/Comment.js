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

commentSchema.statics.getTreeHeight = function() {
  return Comment.aggregate([
    { $match: { parentComment: null } },

    { $graphLookup: {
      from: 'comments',
      startWith: '$_id',
      connectFromField: '_id',
      connectToField: 'parentComment',
      as: 'comments'
    } },

    { $project: {
      height: { $size: '$comments' }
    } },

    { $sort: {
      height: -1
    } },

    { $limit: 1 },

    { $project: {
      height: { $add: ['$height', 1] }
    } }
  ]);
}

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
