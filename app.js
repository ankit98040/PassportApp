//mongojs 2.4.0
// passport used for authentication
//flash and express messages work together

var express = require('express');
var path = require('path');
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyparser = require('body-parser');
var flash = require('connect-flash');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname+ '/node_modules/bootstrap/dist/css'));

//bodyperser
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

//express session
app.use(session({
	secret:'secret',
	saveUninitialized: true,
	resave: true
})); //secret - used to sign the session ID cookie

//passport
app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//connect-flash
app.use(flash());
app.use(function(req,res, next){
	res.locals.messages = require('express-messages')(req, res);
	next();
});

//global variable for fetching data

app.get('*', function(req,res,next){
  res.locals.user = req.user || null;
  next();
})

//define routes
app.use('/', routes);
app.use('/users', users);

app.listen(3000);
console.log('server started at port 3000');