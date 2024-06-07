const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the user already exists
  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  if (userExists) {
    return res.status(409).send('Username or email already in use.'); // Conflict status code
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

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
    return res.status(404).send('User not found'); // Not found status code
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (passwordMatch) {
    req.session.userId = user._id; // Set the user's session ID to maintain their login state
    res.redirect('/home'); // Redirect to the home page after successful login
  } else {
    res.status(401).send('Credentials do not match'); // Unauthorized status code
  }
};

module.exports = { registerUser, loginUser };
