const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const path = require('path');

const User = require('./models/User');
const Chatroom = require('./models/Chatroom');
const authHandler = require('./controllers/auth');
const homeHandler = require('./controllers/home');
const roomHandler = require('./controllers/room');

const app = express();
const port = 8080;  

// Connect to MongoDB
mongoose.connect('mongodb+srv://nnath003:1234@chat.yinbwpp.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true }
}));

// View Engine Setup
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: path.join(__dirname, '/views/layouts/') }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Define the requireAuth middleware before using it in routes
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes
app.get('/', (req, res) => res.render('login')); // Serve the login page directly from the root URL
app.get('/signup', (req, res) => res.render('signup')); // Route to show the signup page
app.get('/login', (req, res) => res.render('login')); // Route to show the login page
app.post('/signup', authHandler.registerUser);
app.post('/login', authHandler.loginUser);

// Home page route, accessible only after login
app.get('/home', homeHandler.getHome);

// Route to delete a chatroom
app.delete('/delete/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
      await Chatroom.deleteOne({ roomId });
      res.sendStatus(200); 
  } catch (error) {
      console.error("Error:", error);
      res.sendStatus(500); 
  }
});

// Route to delete all users
app.delete('/delete-all-users', async (req, res) => {
  try {
    await User.deleteMany({});
    res.sendStatus(200).send('All users deleted successfully');
  } catch (error) {
    console.error("Error:", error);
    res.sendStatus(500);
  }
});

// Route to leave a chatroom
app.get('/leave-chatroom', requireAuth, (req, res) => {
    // Logic to handle user leaving the chatroom could be implemented here
    res.render('home'); // Redirect to home after leaving the chatroom
});

// Sign out route
app.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.render('login'); // Redirect to login page after signing out
  });
});

// Dynamic routes
app.post('/create', roomHandler.createRoom);
app.get('/:roomName', roomHandler.getRoom);
app.get('/:roomName/messages', roomHandler.getMessages);
app.post('/:roomName/messages', roomHandler.postMessage);
app.put('/messages/:messageId', roomHandler.editMessage);
app.delete('/messages/:messageId', roomHandler.deleteMessage);

// Add route for searching messages in a chatroom
app.get('/:roomName/messages/search', roomHandler.searchMessages);

// Protected Route Example
app.get('/protected-route', requireAuth, (req, res) => {
  res.send('This is a protected route');
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Listen on Port
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
