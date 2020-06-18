var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('passportapp',['users']);

//bcrypt for encrypting the passwords
var bcrypt = require('bcryptjs');

//for authentication
var passport = require('passport');

var LocalStrategy = require('passport-local').Stratrgy;

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

module.exports = router;