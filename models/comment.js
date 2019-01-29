const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile"
    },
    displayName: String, 
    avatar: String
  }
});

module.exports = mongoose.model("Comment", CommentSchema);