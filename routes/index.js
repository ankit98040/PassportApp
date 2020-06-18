var express = require('express');
var router = express.Router();

router.get('/',ensureAuthenticated, function(req, res){
	res.render('index');
});

function ensureAuthenticated(req,res,next){
	if (req.isAuthenticated()){
		return next();
	}
	//if not authenticated, will redirect to login screen
	res.redirect('/users/login');
}

module.exports = router;