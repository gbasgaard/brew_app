var express = require('express');
var app = express();
var pgp = require('pg-promise')();
var mustacheExpress = require('mustache-express');
var bodyParser = require("body-parser");
var methodOverride = require('method-override');
// var session = require('express-session');
var PORT = process.env.PORT || 3000;
var db = pgp(process.env.DATABASE_URL || 'postgres://gbasgaard@localhost:5432/brew_db');
var KEY = process.env.BREWERY_DB_API;

/* BCrypt stuff here */
var bcrypt = require('bcrypt');

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use("/", express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(PORT, function() {
  console.log('Brew app is running on', PORT);
});

// app.use(session({
//   secret: 'theTruthIsOutThere51',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false }
// }))

// app.get("/", function(req, res){
//   var logged_in;
//   var email;

//   if(req.session.user){
//     logged_in = true;
//     email = req.session.user.email;
//   }

//   var data = {
//     "logged_in": logged_in,
//     "email": email
//   }

//   res.render('index', data);
// });

app.get('/', function(req,res) {
  res.render('index');
});

app.get('/signup', function(req,res) {
  res.render('signup/index')
})

app.post('/signup', function(req, res){
  var data = req.body;
  console.log(data);

    db.none(
      "INSERT INTO users (email, password_digest) VALUES ($1, $2)",
      [data.email, data.password]
    ).catch(function(user) {
      res.send('Error.')
    }).then(function(){
      res.send('User created!');
    })
})

app.post('/login', function(req, res){
  var data = req.body;

  db.one(
    "SELECT * FROM users WHERE email = $1",
    [data.email]
  ).catch(function(){
    res.send('Email/Password not found.')
  }).then(function(user){
    bcrypt.compare(data.password, user.password_digest, function(err, cmp){
      if(cmp){
        req.session.user = user;
        res.redirect('/');
      } else {
        res.send('Email/Password not found.')
      }
    });
  });
});







