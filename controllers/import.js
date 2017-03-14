//SETUP ROUTER
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = mongoose.connection;
var bodyParser = require('body-parser');

router.use(bodyParser.json({
    limit: '50mb'
}));
router.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
// This accepts all posts requests!
router.post('/*', function(req, res) {

    var leagueID = req.params[0].split("/")[1];

    if (leagueID != "5414177") {
        console.log("Nice try, asshole.");
        res.send("Nice try, asshole.");
    }

    var collection = req.params[0].split("/");
    var label = "data";
    if (collection.length == 3) {
        collection = collection[2];
    } else if (collection.includes("week")) {
        collection = collection.slice(2, 5);
        collection = collection.join('');
        label = Object.keys(req.body)[0]

    } else if (collection.includes("team") && collection.length > 4) {
        collection = collection.slice(3, 4);
        label = "roster"
        collection = collection.join('');

    } else {
        collection = collection.slice(2, 5);
        collection = collection.join('');
    }

    var data = req.body;
    remove(label, collection).then(function(response, error) {
        if (response == 'REMOVED') {
            db.collection(collection).insert({
                label: label,
                data: data
            });
            res.end();
        }
    })

});

function remove(label, collection) {
    return new Promise(function(resolve, reject) {
            db.collection(collection).remove({
                label: label
            }, function(err, doc) {
                if (err) {
                    reject(err);
                } else {
                    resolve("REMOVED")
                }
            });
        });

    }

    module.exports = router;
