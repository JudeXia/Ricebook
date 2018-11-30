const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  thirdParty: [{
    party: String, 
    username: String
  }],
  salt: String, 
  hash: String, 
});

module.exports = mongoose.model("User", UserSchema);
