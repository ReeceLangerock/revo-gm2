//SETUP
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var port = process.env.PORT || 3000;
var app = express();
//var config = require('./config.js');
//var flash = require("connect-flash");
var bodyParser = require('body-parser');
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));


var mongoUser = process.env.DB_USERNAME //|| config.getMongoUser();
var mongoPass = process.env.DB_PASSWORD //|| config.getMongoPass()


mongoose.connect(`mongodb://${mongoUser}:${mongoPass}@ds161485.mlab.com:61485/revo-gm`);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection eror:'));
db.once('open', function(){
  console.log("connected");
})

//EXPRESS SETUP
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');


/*app.use(flash());
app.use(function(req, res, next){
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});*/

//ROUTES
app.use('/', require('./controllers/index'));
app.use('/standings', require('./controllers/standings'));
app.use('/schedules', require('./controllers/schedules'));
app.use('/recap', require('./controllers/gamerecap'));
app.use('/import', require('./controllers/import'));

/*app.use(function (req, res, next) {
  res.status(404).render('404');
})*/



//launch
app.listen(port, function(){
  console.log(`Revo-GM listening on port ${port}!`);
})
