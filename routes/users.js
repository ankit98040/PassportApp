var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('passportapp',['users']);

//bcrypt for encrypting the passwords
var bcrypt = require('bcryptjs');

//for authentication
var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;

// Login Page - GET
router.get('/login', function(req, res){
	res.render('login');
});

// Register Page - GET
router.get('/register', function(req, res){
	res.render('register');
});

// Register Page - POST
router.post('/register', function(req, res){
	//console.log('User Registered');
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	//validation
	req.checkBody('name', 'Name Field is Required').notEmpty();
	req.checkBody('email', 'Email Field is Required').notEmpty();
	req.checkBody('email', 'Use Valid Email').isEmail();
	req.checkBody('username', 'Username Field is Required').notEmpty();
	req.checkBody('password', 'password Field is Required').notEmpty();
	req.checkBody('password2', 'Password Do Not Match').equals(req.body.password);

	//check for errors
	var errors = req.validationErrors();
	if(errors){
		console.log('Form has errors');
		res.render('register',{
			errors: errors,
			name: name,
			email: email,
			username: username,
			password: password,
			password2: password2
		});
	} else {
		//console.log('Success')
		var newUser = {
			name: name,
			email: email,
			username: username,
			password: password
		}

		//for encrypting the password
		//gensalt- generate a salt
		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(newUser.password, salt, function(err, hash){
				newUser.password = hash;

				db.users.insert(newUser, function(err, doc){
				if (err){
					res.send(err);
				} else {
					console.log('User Added');

				//flash message
				req.flash('Success', 'You are now registered. Please Log In');
				//redirect after register
				res.location('/');
				res.redirect('/');
					}
				});
			});
		});
	}
});

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
 db.users.findOne({_id: mongojs.ObjectId(id)}, function(err, user){
 	done(err, user);
 });
});


passport.use(new LocalStrategy(
		function(username, password, done){
			db.users.findOne({username: username}, function(err,user){
				if (err){
					return done(err);
				}
				if(!user){
					return done(null, false, {message: 'Incorrect Username'});
				}

				bcrypt.compare(password, user.password, function(err, isMatch){
					if(err){
						return done(err);
					}
					if(isMatch){
						return done(null, user);
					} else {
						return done(null, false, {message: 'Incorrect Password'});
					}
				});
			});
		}
	));

// Login POST
//local strategy
router.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/users/login',
                                   failureFlash: 'Invalid Username or Password' }), 
  	function(req, res){
  		console.log('Auth Successfull');
  		res.redirect('/');
  });


//Logout
router.get('/logout', function(req,res){
	req.logout();
	req.flash('success', 'You have Logged Out.');
	res.redirect('/users/login');
});

module.exports = router;