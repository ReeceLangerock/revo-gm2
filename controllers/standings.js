//SETUP ROUTER
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = mongoose.connection;
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());


router.get('/division', function(req, res) {

    getStandings().then(function(response, error) {
        res.render('standingsDiv', {
            standings: response
        });
    });


});

router.get('/conference', function(req, res) {
  getStandings().then(function(response, error) {
      res.render('standingsConf', {
          standings: response
      });
  });
});

router.get('/league', function(req, res) {
  getStandings().then(function(response, error) {
      res.render('standings', {
          standings: response
      });
  });
});


function getStandings() {
    return new Promise(function(resolve, reject) {
        var collection = db.collection('standings');
        collection.find({}).toArray(
            function(err, doc) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                  var filteredDoc = doc[0].data.teamStandingInfoList.sort(function(a, b) {
                      return b.totalWins - a.totalWins;

                  })
                    resolve(filteredDoc);
                }
            });

    });
}

module.exports = router;
