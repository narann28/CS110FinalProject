const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;

  // Check if the user already exists
  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  if (userExists) {
    return res.status(409).send('Username or email already in use.'); // Conflict status code
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, username, email, password: hashedPassword });

  try {
    await newUser.save();
    res.redirect('/login'); // Redirect to login after successful registration
  } catch (error) {
    res.status(500).send('Error creating user: ' + error.message); // Internal server error response
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).send('User not found');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (passwordMatch) {
    req.session.userId = user._id;
    req.session.name = user.name; 
    req.session.email = user.email; 
    req.session.username = user.username;
    res.redirect('/home');
  } else {
    res.status(401).send('Credentials do not match');
  }
};


module.exports = { registerUser, loginUser };
