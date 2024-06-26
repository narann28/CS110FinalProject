const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: String,
  nickname: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', messageSchema);
