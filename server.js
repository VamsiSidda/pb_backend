const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require("body-parser");
const compression =require("compression");
const budgetModel = require("./data/budget");
const userModel = require('./data/user')
const expensesModel = require('./data/expense');
const app = express();
const PORT = process.env.PORT || 5000;
// const MONGODB_URI = "mongodb://127.0.0.1:27017/Personal_budget_DB";
 // Replace with your MongoDB connection URI
const MONGODB_URI= "mongodb+srv://suryavamsi:surya1459@finalproject.zqnxrkg.mongodb.net/?retryWrites=true&w=majority";
app.use(express.json());
app.use(cors());
app.use(compression());

mongoose.connect(MONGODB_URI);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

const SECRET_KEY = 'myKey'; // Change this to a secure random key in production

var currentUser = "";
// const UserSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// const userModel = mongoose.model('User', UserSchema);

// Middleware to verify JWT and authenticate users

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Create a new user (signup) route
app.post('/api/signup', async (req, res) => {
  const { email, password, displayName } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({ email, password: hashedPassword, displayName});

    const user = { id: newUser._id, email: newUser.email};
    const token = jwt.sign(user, SECRET_KEY);
    currentUser = user.id;
    res.json({ token });
  } catch (error) {
    console.error('Error creating user', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create a login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });

    if (!existingUser) {
      currentUser = "";
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      currentUser = "";
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    currentUser = existingUser._id;
    const user = { id: existingUser._id, email: existingUser.email };
    const token = jwt.sign(user, SECRET_KEY);

    res.json({ token });
  } catch (error) {
    currentUser = "";
    console.error('Login failed', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Protected route example
app.get('/api/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'You have access to this protected resource!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



app.get('/api/budgets', (req, res) => {
    budgetModel.find({})
    .then((data)=> {
      res.json(data);
      console.log(data);
    })
});

app.get('/api/budgets/user', (req, res) => {
  budgetModel.find({userId:currentUser})
  .then((data)=> {
    res.json(data);
    console.log(data);
  })
});

app.post('/api/budgets', (req, res) => {
  const newBudget = new budgetModel(req.body);
  newBudget.userId = currentUser;
  budgetModel.create(newBudget);
  console.log(newBudget);
  res.json(newBudget);
});

app.get('/api/expenses', (req,res) => {
  expensesModel.find({})
  .then((data)=> {
    res.json(data);
    console.log(data);
  })
});

app.get('/api/expenses/user', (req,res) => {
  expensesModel.find({userId:currentUser})
  .then((data)=> {
    res.json(data);
    console.log(data);
  })
});

app.post('/api/expenses', (req, res) => {
  const newExpense = new expensesModel(req.body);
  newExpense.userId = currentUser;

  var dataLimit = 0;
  budgetModel.find({})
  .then((data) => {
      for(var i = 0; i < data.length; i++){
        if (newExpense.title == data[i].title){
            dataLimit = data[i].related_value;
        }
    }
  })

  var usedBudget = 0;
  expensesModel.find({})
  .then((expensesData) => {
    for(var i = 0; i < expensesData.length; i++){
      if (currentUser == expensesData[i].userId && newExpense.title == expensesData[i].title){
          usedBudget += expensesData[i].related_value;
      }
  }
  })
  
  console.log(newExpense);
  console.log(usedBudget,dataLimit);
  if ( usedBudget + newExpense.related_value > dataLimit ){
    newExpense.alert = "Limit Exceeded!";
  }
  expensesModel.create(newExpense);
  res.json(newExpense);
  
});

