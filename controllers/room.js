const Chatroom = require('../models/Chatroom');
const Message = require('../models/Message');
const { roomIdGenerator } = require('../util/roomIdGenerator.js');

const createRoom = async (req, res) => {
  try {
    const { roomName } = req.body;
    const roomId = roomIdGenerator();
    const newChatroom = new Chatroom({ name: roomName, roomId });
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
    const chatroom = await Chatroom.findOne({ roomId: roomName });
    if (!chatroom) {
      return res.status(404).send('Chatroom not found');
    }
    res.render('room', { title: 'Chatroom', roomName: chatroom.roomId });
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

module.exports = { createRoom, getRoom, getMessages, postMessage };