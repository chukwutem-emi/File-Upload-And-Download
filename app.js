const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
require("dotenv").config();

const store = new MongoDBStore({
  uri: process.env.DATABASE_CONFIG,
  collection: "sessions",

})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require("./routes/auth");
const flash = require("connect-flash");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: false, store: store, cookie: {sameSite: "strict", secure: true}})); 

app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next()
})
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);
app.use(errorController.get404);

// Error handling middleware
app.use((error, reg, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Server Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
})

mongoose
  .connect(process.env.DATABASE_CONFIG)
  .then(result => {
  app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
