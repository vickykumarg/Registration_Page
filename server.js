require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_demo';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change_this_secret';


mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>console.log('Connected to MongoDB'))
.catch(err=>console.error('MongoDB connection error:', err));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));


app.use(express.static(path.join(__dirname, 'public')));


app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, age, dob, phone } = req.body;
    if(!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if(existing) return res.status(400).json({ error: 'Email already exists' });

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      age: age ? Number(age) : undefined,
      dob: dob ? new Date(dob) : undefined,
      phone
    });

    await user.save();
    
    req.session.userId = user._id;
    res.json({ message: 'Registration successful', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if(!user) return res.status(400).json({ error: 'Invalid email or password' });

    const valid = await user.comparePassword(password);
    if(!valid) return res.status(400).json({ error: 'Invalid email or password' });

    req.session.userId = user._id;
    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


function requireAuth(req, res, next) {
  if(req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}


app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password -__v');
    if(!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if(err) {
      console.error(err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

app.put('/api/profile', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

  const { name, age, dob, phone } = req.body;
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (age) user.age = age;
    if (dob) user.dob = dob;
    if (phone) user.phone = phone;

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
