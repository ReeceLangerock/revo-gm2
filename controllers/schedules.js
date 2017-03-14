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

// This accepts all posts requests!
router.get('/', function(req, res) {


    var schedulePromiseArray = [];

    for (let i = 1; i <= 4; i++) {
        var prefix = "weekpre";
        schedulePromiseArray.push(getSchedule(prefix, i));
    }

    for (let i = 1; i <= 22; i++) {
        var prefix = "weekreg";
        if (i != 21) {
            schedulePromiseArray.push(getSchedule(prefix, i));
        }
    }

    Promise.all(schedulePromiseArray).then(function(responses, error) {
        var responses = responses;
        getTeamIDList().then((teamIdList, error) => {

                for (let weekIndex = 0; weekIndex < responses.length; weekIndex++) {

                    for (let i = 0; i <= responses[weekIndex][0].length - 1; i++) {

                        if (responses[weekIndex][0][i].homeTeamId) {
                            var homeTeamId = responses[weekIndex][0][i].homeTeamId;
                            var awayTeamId = responses[weekIndex][0][i].awayTeamId;



                            var homeTeamName = teamIdList.find(x => x.teamId == homeTeamId).displayName;
                            var awayTeamName = teamIdList.find(x => x.teamId == awayTeamId).displayName;

                            responses[weekIndex][0][i].homeTeamId = homeTeamName;
                            responses[weekIndex][0][i].awayTeamId = awayTeamName;
                        }

                    }
                }
                return responses;

            })
            .then(function(responses, error) {

                var filteredResponses = responses.sort(function(a, b) {
                    return a[1].week - b[1].week;
                });

                res.render('schedules', {
                    schedule: filteredResponses
                });

            })

    });
});

function getTeamIDList() {
    return new Promise(function(resolve, reject) {
        var collection = db.collection('leagueteams');
        collection.find({}).toArray(
            function(err, doc) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(doc[0].data.leagueTeamInfoList);

                }
            });

    });
}

function getSchedule(prefix, weekIndex) {
    return new Promise(function(resolve, reject) {

        var collection = db.collection(prefix + weekIndex);
        collection.find({
            label: "gameScheduleInfoList"
        }).toArray(
            function(err, doc) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve([doc[0].data.gameScheduleInfoList, {
                        week: weekIndex
                    }]);
                }
            });

    });
}

module.exports = router;
