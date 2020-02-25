var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'Web Dev\'n' });
});


router.get('/test',function(req, res, next){
  res.render('testEnv', { title: 'testing env' });
});



module.exports = router;
