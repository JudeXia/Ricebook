const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  text: String,
  image: {
    type: String, 
    default: null
  },
  image_id: {
    type: String, 
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile"
  }, 
	comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

module.exports = mongoose.model("Article", ArticleSchema);