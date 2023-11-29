const express = require("express");
const morgan = require('morgan');
const methodOvveride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const app = express()
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const eventRoutes = require('./routes/eventRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');

const HOST = "localhost";
const PORT = 3000;
const URL = 'mongodb+srv://elijahingr:4166@uncc-cluster.z0dlyks.mongodb.net/nbda-project3?retryWrites=true&w=majority'

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded());
app.use(morgan('tiny'));
app.use(methodOvveride('_method'));



mongoose.connect(URL)
.then(
  app.listen(PORT, HOST, () => {
    console.log("Listening on "+ HOST +":"+ PORT);
  })
)
.catch(err => {
  console.log(err);
});

app.use(session({
  secret: "ajfeirfsdfgwerwer23sd",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongoUrl: URL}),
  cookie: {maxAge: 60*60*1000}
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.errorMessages = req.flash('error');
  res.locals.successMessages = req.flash('success');
  console.log(req.flash());
  next();
});

app.use('/', mainRoutes);
app.use('/events', eventRoutes);
app.use('/users', userRoutes);

app.use((req, resp, next) => {
  err = new Error('The server cannot locate '+ req.url);
  err.status = 404;
  next(err);
});

app.use((err, req, resp, next) => {
  console.log(err.stack);
  if(!err.status) {
      err.status = 500;
      err.message = "Internal Server Error";
  }

  resp.status(err.status);
  resp.render('error',{error: err});
});

