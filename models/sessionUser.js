const mongoose = require("mongoose");

const SessionUserSchema = new mongoose.Schema({
  username: String,
  sessionKey: String
});

module.exports = mongoose.model("SessionUser", SessionUserSchema);