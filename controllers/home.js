//
const Chatroom = require('../models/Chatroom');

const getHome = async (request, response) => {
  try {
      const chatrooms = await Chatroom.find({}, 'roomId name'); 
      response.render('home', { title: 'Home', chatrooms: chatrooms.map(chatroom => ({ name: chatroom.name, roomId: chatroom.roomId })) });
    } catch (error) {
      response.status(500).send(error.message);
  }
};

module.exports = { getHome };
