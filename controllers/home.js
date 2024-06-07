// Controller handler to handle functionality in home page
const Chatroom = require('../models/Chatroom');

const getHome = async (request, response) => {
  try {
      const chatrooms = await Chatroom.find({}, 'roomId name');
      const {name, email, username} = request.session;
      response.render('home', { 
        title: 'Home', 
        chatrooms: chatrooms.map(chatroom => ({ name: chatroom.name, roomId: chatroom.roomId, username})),
        name: name,
        email: email,
        username: username
      });
    } catch (error) {
      response.status(500).send(error.message);
  }
};

module.exports = { getHome };
