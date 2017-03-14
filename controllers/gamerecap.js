//SETUP ROUTER
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = mongoose.connection;
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
}));
//router.use(bodyParser.json());

//*******************//
/*use promise.race to find the weeek that the gamelog is present in. then,
loop through the 7 stat categories to get the data for that game, then promise.all*/

router.get('/:id', function(req, res) {
    var gameID = null;

    if (req.params.id != 'style.css' && req.params.id != 'favicon.ico') {
        gameID = req.params.id;
    }

    var weeksPromiseArray = [];

    for (let i = 1; i <= 4; i++) {
        var prefix = "weekpre";
        if (gameID != null) {
            weeksPromiseArray.push(getWeekOfGameId(prefix, i, gameID));
        }
    }

    for (let i = 1; i <= 22; i++) {
        var prefix = "weekreg";
        if (i != 21 && gameID != null) {
            weeksPromiseArray.push(getWeekOfGameId(prefix, i, gameID));
        }
    }

    Promise.race(weeksPromiseArray).then(function(response, error) {
        console.log("prom race");
        gameLogDataPromiseArray = [];
        var dataFieldsToGet = (response[1] == "weekreg") ? 8 : 2;
        var dataFields = ["gameScheduleInfoList", "teamStatInfoList", "playerDefensiveStatInfoList", "playerKickingStatInfoList", "playerPassingStatInfoList", "playerPuntingStatInfoList", "playerReceivingStatInfoList", "playerRushingStatInfoList"];
        for (let i = 0; i < dataFieldsToGet; i++) {
            var prefix = response[1];
            var week = response[0]
            gameLogDataPromiseArray.push(getGameLog(prefix, week + 1, dataFields[i], gameID));
        }

        // including query to get team names with the game log promise array for simplicity. It will be the last item in the array.
        gameLogDataPromiseArray.push(getTeamNames());
        Promise.all(gameLogDataPromiseArray).then(function(responses, error) {
            console.log(responses.length);
            // length -1 because response 8 is team name list
            for (let i = 0; i < responses.length - 1; i++) {
                responses[i] = filterGameLogs(responses[i], gameID);
            };
            if (responses.length == 9) {

                responses[8] = filterTeams(responses[8], responses[1][0].teamId, responses[1][1].teamId)
            } else {
                responses[2] = filterTeams(responses[2], responses[1][0].teamId, responses[1][1].teamId)
            }

            if (responses.length == 9) {

                res.render('recap', {
                    gameScheduleInfoList: responses[0],
                    teamStatInfoList: responses[1],
                    playerDefensiveStatInfoList: responses[2],
                    playerKickingStatInfoList: responses[3],
                    playerPassingStatInfoList: responses[4],
                    playerPuntingStatInfoList: responses[5],
                    playerReceivingStatInfoList: responses[6],
                    playerRushingStatInfoList: responses[7],
                    teamNames: responses[8]
                });
            } else {
                console.log("else");
                res.render('recap', {
                    gameScheduleInfoList: responses[0],
                    teamStatInfoList: responses[1],
                    playerDefensiveStatInfoList: null,
                    playerKickingStatInfoList: null,
                    playerPassingStatInfoList: null,
                    playerPuntingStatInfoList: null,
                    playerReceivingStatInfoList: null,
                    playerRushingStatInfoList: null,
                    teamNames: responses[2]
                })
            }

        });
    })

});

function getTeamNames() {
    return new Promise(function(resolve, reject) {
        var collection = db.collection('leagueteams');
        collection.find().toArray(
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

function filterTeams(teamIdList, teamId1, teamId2) {
    //console.log(teamIdList)
    for (let i = teamIdList.length - 1; i >= 0; i--) {
        if (teamIdList[i].teamId != teamId1 && teamIdList[i].teamId != teamId2) {
            teamIdList.splice(i, 1);
        }
    }
    return teamIdList;
}

function filterGameLogs(gameLog, gameID) {
    for (let i = gameLog.length - 1; i >= 0; i--) {
        if (gameLog[i].scheduleId != gameID) {
            gameLog.splice(i, 1);
        }
    }
    return gameLog;
}

function getGameLog(prefix, weekIndex, dataField, gameID) {
    return new Promise(function(resolve, reject) {

        gameID = Number(gameID);
        queryField = "data." + dataField;
        var collection = db.collection(prefix + weekIndex);
        collection.find({
            [queryField]: {
                $elemMatch: {
                    scheduleId: gameID
                }
            }

        }).toArray(
            function(err, doc) {

                if (err) {
                    console.log(err);
                    reject(err);
                } else if (doc.length > 0) {
                    resolve(doc[0].data[dataField]);
                }

            });
    });
}

function getWeekOfGameId(prefix, weekIndex, gameID) {
    return new Promise(function(resolve, reject) {
        gameID = Number(gameID);
        var collection = db.collection(prefix + weekIndex);
        collection.find({
            "data.gameScheduleInfoList": {
                $elemMatch: {
                    scheduleId: gameID
                }
            }

        }).toArray(
            function(err, doc) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else if (doc.length > 0) {
                    resolve([doc[0].data.gameScheduleInfoList[0].weekIndex, prefix]);
                }

            });

    });
}

module.exports = router;
