const Chatroom = require('../models/Chatroom');
const Message = require('../models/Message');
const { roomIdGenerator } = require('../util/roomIdGenerator.js');

const createRoom = async (req, res) => {
  try {
    const { roomName } = req.body;
    const roomId = roomIdGenerator();
    const newChatroom = new Chatroom({ name: roomName, roomId});
    await newChatroom.save();
    res.redirect(`/${newChatroom.roomId}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getMessages = async (req, res) => {
  try {
    const { roomName } = req.params;
    const messages = await Message.find({ roomId: roomName }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getRoom = async (req, res) => {
  try {
    const { roomName } = req.params;
    const { username } = req.session;
    const chatroom = await Chatroom.findOne({ roomId: roomName });
    if (!chatroom) {
      return res.status(404).send('Chatroom not found');
    }
    res.render('room', { title: 'Chatroom', roomName: chatroom.roomId , username: username});
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const postMessage = async (req, res) => {
  try {
    const { nickname, text } = req.body;
    const { roomName } = req.params;
    const newMessage = new Message({ roomId: roomName, nickname, text, createdAt: new Date() });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const updatedMessage = await Message.findByIdAndUpdate(messageId, { text, edited: true }, { new: true });
    if (!updatedMessage) {
      return res.status(404).send('Message not found');
    }
    res.json(updatedMessage);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const deletedMessage = await Message.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).send('Message not found');
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = { createRoom, getRoom, getMessages, postMessage, editMessage, deleteMessage };
