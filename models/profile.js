const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  displayName: String,
  email: String,
  phone: String,
  zipcode: String,
  birthday: String,
  avatar: {
    type: String,
    default: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'
  },
  avatar_id: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  headline: {
    type: String,
    default: 'My default headline'
  }, 
  following: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile"
  }
]
});

module.exports = mongoose.model("Profile", ProfileSchema);