// Application Log
var log4js = require('log4js');
var log4js_extend = require('log4js-extend');
log4js_extend(log4js, {
    path: __dirname,
    format: '(@file:@line:@column)'
});
log4js.configure(__dirname + '/log4js.json');
var logger = log4js.getLogger('nodeCent');
logger.info('app.js start~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
var express = require('express');
var hashtable = require(__dirname + '/hashtable.js');

// 建立 express service
var express = require('express');  // var 宣告express物件， require請求
var app = express();
var fs = require('graceful-fs');

var port = process.env.PORT || 443;  //run 在443 port上
var privateKey = require('fs').readFileSync('/etc/letsencrypt/live/lineservice.gov.taipei/privkey.pem');
var certificate = require('fs').readFileSync('/etc/letsencrypt/live/lineservice.gov.taipei/cert.pem');
option = {
    key: privateKey,
    cert: certificate
};
var https = require('http');
var server = https.createServer(app).listen(port);
/*
var port = process.env.PORT || 8080;  //run 在8080 port上
var http = require('http');
var server = http.Server(app).listen(port);*/
var bodyParser = require('body-parser');  //JSON解析body的資料
var mysql = require('mysql'); // mysql
var url = require("url");
var fs = require('graceful-fs');
var config = fs.readFileSync(__dirname + '/config.json', 'utf8');
config = JSON.parse(config);
var jwtDecode = require('jwt-decode');
var db = require(__dirname + '/taipeidbtest');

app.use(bodyParser.urlencoded({  //app使用bodyParser來做解析
    extended: true
}));
app.use(bodyParser.json());
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    next();
});
app.use(express.static(__dirname + '/pages/tpe/channelwebs/assets'));

process.on('uncaughtException', function (e) {
    logger.info('process.on==============================================================');
    logger.error(e);
});

//mysql----------------------------------------------------------------------------------------------------------------
var pool = mysql.createPool({
    connectionLimit: 100,
    host: db.host, //如果database在另一台機器上，要改這裡
    user: db.user,
    password: db.password,
    database: db.database, //要抓的database名稱
    waitForConnections: true
});
app.get("/login/:page", function (request, response) {
    logger.info('-------------------------------------------login-------------------------------------------');
    try {
        var page = request.params.page;
        //下面的跳轉網頁會跳轉到line登入的頁面，同時會在那邊進行登入 然後跳轉到conig的redirect_uri
        if (page == 'airbox') {
            response.redirect('https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=' + config.channel_id + '&redirect_uri=' + config.redirect_uri + 'air_pollutioninfo' + '&state=reportAuth&scope=openid%20profile&nonce=myapp');
        } else if (page == 'ncdr') {
            response.redirect('https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=' + config.channel_id + '&redirect_uri=' + config.redirect_uri + 'flood_control' + '&state=reportAuth&scope=openid%20profile&nonce=myapp');
        }
    } catch (err) {
        logger.info(err);
    }

});
var choose = 0; //判斷空氣盒子和防汛
app.get('/air_pollutioninfo', function (request, response) {
    logger.info('GET/(空氣盒子)');
    choose = 1;
    //pathname 會包含state跟code  其中的code會是我們所需要的Authorization code然後state會是你在上面login跳轉網頁的url所設定的state state本身應該是用來防止攻擊驗證是不是本身的訊息的
    var pathname = url.parse(request.url).query;
    //獲得user_profile並解碼
    if (String(pathname).indexOf("error_description") < 0) {
        var mid;
        GetUserProfile(choose, pathname, function (data) {
            if (data != false) {
                var profile = JSON.parse(data);
                var decode = jwtDecode(profile.id_token);
                mid = decode.sub;
                var profile_data = {
                    'memberId': decode.sub,
                    'displayName': decode.name,
                    'pictureUrl': decode.picture,
                    'statusMessage': 'statusMsg',
                    //'access_token': profile.access_token,
                }
                var airpollutioninfo;
                request.header("Content-Type", 'text/html');
                fs.readFile(__dirname + '/pages/tpe/channelwebs/air_pollutioninfo/index.htm', 'utf8', function (err, data) {
                    if (err) {
                        logger.info(err);
                        this.res.send(err);
                        return;
                    }
                    data = data + '<script type="text/javascript"> var mid = "' + mid + '"; </script>';
                    this.res.send(data);
                }.bind({ req: request, res: response }));
            }
        });
    } else {
        logger.info("false");
        logger.info('取得使用者資訊錯誤。');
        //response.send("<h1>無法取得權限<h1>");
        var notLogin;
        if (notLogin == undefined) {
            fs.readFile(__dirname+'/pages/tpe/channelwebs/index.htm', 'utf8', function (err, data) {
                if (err) {
                    logger.info(err);
                    this.res.send(err);
                    return;
                }
                //data = data + '<script language="Javascript">history.go(-2);</script>';
                notLogin = data;
                this.res.send(data);
            }.bind({ req: request, res: response }));
        } else {
            logger.info(notLogin);
            response.send(notLogin);
        }
    }
});
var airMap;
app.get('/air_pollutioninfo' + '/air_map', function (request, response) {
    logger.info('GET/(GoogleMap)');
    request.header("Content-Type", 'text/html');
    if (airMap == undefined) {
        fs.readFile(__dirname + '/pages/tpe/channelwebs/air_pollutioninfo/air_map.htm', 'utf8', function (err, data) {
            if (err) {
                logger.info(err);
                this.res.send(err);
                return;
            }
            airMap = data;
            this.res.send(data);
        }.bind({ req: request, res: response }));
    } else {
        logger.info(airMap);
        response.send(airMap);
    }
});
var activeSuggestion;
app.get('/air_pollutioninfo' + '/active_suggestion', function (request, response) {
    logger.info('GET/(active_suggestion)');
    request.header("Content-Type", 'text/html');
    if (activeSuggestion == undefined) {
        fs.readFile(__dirname + '/pages/tpe/channelwebs/air_pollutioninfo/active_suggestion.htm', 'utf8', function (err, data) {
            if (err) {
                logger.info(err);
                this.res.send(err);
                return;
            }
            activeSuggestion = data
            this.res.send(data);
        }.bind({ req: request, res: response }));
    } else {
        logger.info(activeSuggestion);
        response.send(activeSuggestion);
    }
});
var setupAirboxSubinfo;
app.get('/air_pollutioninfo' + '/setup_airbox_subinfo', function (request, response) {
    logger.info('GET/(setup_airbox_subinfo)');
    request.header("Content-Type", 'text/html');
    if (setupAirboxSubinfo == undefined) {
        fs.readFile(__dirname + '/pages/tpe/channelwebs/air_pollutioninfo/setup_airbox_subinfo.htm', 'utf8', function (err, data) {
            if (err) {
                logger.info(err);
                this.res.send(err);
                return;
            }
            setupAirboxSubinfo = data;
            this.res.send(data);
        }.bind({ req: request, res: response }));
    } else {
        logger.info(setupAirboxSubinfo);
        response.send(setupAirboxSubinfo);
    }
});
var tpeline;
app.get('/tpelinebot' + '/503.html', function (request, response) {
    logger.info('GET/(tpeline)');
    request.header("Content-Type", 'text/html');
    if (tpeline == undefined) {
        fs.readFile(__dirname + '/pages/tpe/channelwebs/503.html', 'utf8', function (err, data) {
            if (err) {
                logger.info(err);
                this.res.send(err);
                return;
            }
            tpeline = data;
            this.res.send(data);
        }.bind({ req: request, res: response }));
    } else {
        logger.info(tpeline);
        response.send(tpeline);
    }
});

app.get('/flood_control', function (request, response) {
    logger.info('GET/(floodControl)');
    choose = 2;
    //pathname 會包含state跟code  其中的code會是我們所需要的Authorization code然後state會是你在上面login跳轉網頁的url所設定的state state本身應該是用來防止攻擊驗證是不是本身的訊息的
    var pathname = url.parse(request.url).query;
    //獲得user_profile並解碼
    if (String(pathname).indexOf("error_description") < 0) {
        var mid;
        GetUserProfile(choose, pathname, function (data) {
            if (data) {
                var profile = JSON.parse(data);
                var decode = jwtDecode(profile.id_token);
                mid = decode.sub;
                var profile_data = {
                    'memberId': decode.sub,
                    'displayName': decode.name,
                    'pictureUrl': decode.picture,
                    'statusMessage': 'statusMsg',
                    //'access_token': profile.access_token,
                }
            }
            request.header("Content-Type", 'text/html');
            fs.readFile(__dirname + '/pages/tpe/channelwebs/flood_control/index.htm', 'utf8', function (err, data) {
                if (err) {
                    this.res.send(err);
                }
                data = data + '<script type="text/javascript"> var mid = "' + mid + '"; </script>';
                this.res.send(data);
            }.bind({ req: request, res: response }));
        });
    } else {
        logger.info("false");
        logger.info('取得使用者資訊錯誤。');
        //response.send("<h1>無法取得權限<h1>");
        var notLogin;
        if (notLogin == undefined) {
            fs.readFile(__dirname + '/pages/tpe/channelwebs/index.htm', 'utf8', function (err, data) {
                if (err) {
                    logger.info(err);
                    this.res.send(err);
                    return;
                }
                //data = data + '<script language="Javascript">history.go(-2);</script>';
                notLogin = data;
                this.res.send(data);
            }.bind({ req: request, res: response }));
        } else {
            logger.info(notLogin);
            response.send(notLogin);
        }
    }
});
app.get('/get_center_control', function (request, response) {
    logger.info('GET/(get_center_control)');
    /*var url = 'http://210.59.250.198/DisasterOperationSystemWebAPIUnite/api/DisasterServiceApi/GetCenterControl';
    //request.header("Content-Type", 'application/json');
    response.writeHead(200, {"Content-Type": 'application/json'});
    response.write(url);
    response.end();*/
    var options = {
        host: config.eocip,
        path: '/DisasterOperationSystemWebAPIUnite/api/DisasterServiceApi/GetCenterControl',
        method: 'GET',
        headers: {
            'Content-Type': 'Content-Type: application/json;charset=UTF-8'
        }
    };
    var http = require('http');
    var sendData = "";
    var req = http.get(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            logger.info('Response: ' + chunk);
            sendData = sendData + chunk;
        });

        res.on('end', function () {
            if (res.statusCode == 200) {
                var finalData = {
                    "Data": ""
                }
                finalData.Data = sendData;
				logger.info(finalData.Data);
				logger.info(finalData);
                response.send(finalData.Data);
                logger.info('success end');
            } else {
                var finalData = {
                    "isCenterOpen": false
                }
                response.send(finalData);
                logger.info('false end');
            }
        });
        /*
        fs.readFile(__dirname + '/pages/tpe/channelwebs/flood_control/EOC.htm', 'utf8', function (err, data) {
            if (err) {
                logger.info(err);
                this.res.send(err);
                return;
            }
            this.res.send(data);
        }.bind({ req: request, res: response }));
        */
    });
    req.end();
});
app.get('/get_disaster_stat/:id', function (request, response) {
    logger.info('GET /setting request (get_disaster_stat)');
    var id = request.params.id;
    var options = {
        host: config.eocip,
        path: '/DisasterOperationSystemWebAPIUnite/api/DisasterServiceApi/GetDisasterCategoryAndSumByDPID?District=' + id,
        method: 'GET',
        headers: {
            'Content-Type': 'Content-Type: application/json;charset=UTF-8'
        }
    };
    var http = require('http');
    var sendData = "";
    var req = http.get(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            logger.info('Response: ' + chunk);
            sendData = sendData + chunk;
        });

        res.on('end', function () {
            if (res.statusCode == 200) {
                var finalData = {
                    "Data": ""
                }
                finalData.Data = sendData;
                response.send(finalData.Data);//不確定Data是什麼有可能EOC無法顯示
                logger.info('success end');
            } else {
                response.send(false);
                logger.info('false end');
            }
        });
    });
    req.end();
});
var floodcontrolEOC;
app.get('/flood_control' + '/EOC', function (request, response) {
    logger.info('GET/(EOC)');
    request.header("Content-Type", 'text/html');
    if (floodcontrolEOC == undefined) {
        fs.readFile(__dirname + '/pages/tpe/channelwebs/flood_control/EOC.htm', 'utf8', function (err, data) {
            if (err) {
                logger.info(err);
                this.res.send(err);
                return;
            }
            floodcontrolEOC = data;
            this.res.send(data);
        }.bind({ req: request, res: response }));
    } else {
        response.send(floodcontrolEOC);
    }
});
var NCDRSubLists;
app.get('/flood_control' + '/NCDRSubLists', function (request, response) {
    logger.info('GET/(NCDRSubLists)');
    request.header("Content-Type", 'text/html');
    if (NCDRSubLists == undefined) {
        fs.readFile(__dirname + '/pages/tpe/channelwebs/flood_control/NCDRSubLists.htm', 'utf8', function (err, data) {
            if (err) {
                logger.info('NCDRSubLists error');
                logger.info(err);
                this.res.send(err);
                return;
            }
            NCDRSubLists = data;
            this.res.send(data);
        }.bind({ req: request, res: response }));
    } else {
        response.send(NCDRSubLists);
    }
});
var NCDRFlood;
app.get('/flood_control' + '/NCDRFlood', function (request, response) {
    logger.info('GET/(NCDRFlood)');
    request.header("Content-Type", 'text/html');
    if (NCDRFlood == undefined) {
        fs.readFile(__dirname + '/pages/tpe/channelwebs/flood_control/NCDRFlood.htm', 'utf8', function (err, data) {
            if (err) {
                logger.info(err);
                this.res.send(err);
                return;
            }
            NCDRFlood = data;
            this.res.send(data);
        }.bind({ req: request, res: response }));
    } else {
        response.send(NCDRFlood);
    }
});
/////////////////////////////////////////////////////////////////////////////////////////
app.use(express.static('pages/tpe'));
/////////////////////////////////////////////////////////////////////////////////////////

function GetUserProfile(choose, pathname, callback) {
    var code, state, friendship_status_changed;
    if (String(pathname).indexOf("friendship_status_changed") > 0) {
        friendship_status_changed = String(pathname).split("=")[1].split("&")[0];
        code = String(pathname).split("=")[2].split("&")[0];
        state = String(pathname).split("=")[3];
    } else {
        code = String(pathname).split("=")[1].split("&")[0];
        state = String(pathname).split("=")[2];
    }
    if (choose == 1) {
        var data = {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: config.redirect_uri + 'air_pollutioninfo',
            client_id: config.channel_id,
            client_secret: config.channel_secret
        }
    } else {
        var data = {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: config.redirect_uri + 'flood_control',
            client_id: config.channel_id,
            client_secret: config.channel_secret
        }

    }
    var dns = require('dns');
    dns.lookup('api.line.me', function (err, result) {
        logger.info(result);
    });
    var postdata = "grant_type=" + data.grant_type + "&code=" + data.code + "&redirect_uri=" + data.redirect_uri + "&client_id=" + data.client_id + "&client_secret=" + data.client_secret;
    var options = {
        host: 'api.line.me',
        port: '443',
        path: '/oauth2/v2.1/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': Buffer.byteLength(postdata)
        }
    };
    var https = require('https');
    var req = https.request(options, function (res) {
        var access;
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            logger.info('Response: ' + chunk);
            if (access == true) {
                callback(chunk);
            }
            else callback(access);
        });
        res.on('end', function () {
        });
        logger.info('Reply message status code: ' + res.statusCode);
        if (res.statusCode == 200) {
            logger.info('Reply message success');
            access = true;
        } else {
            logger.info('Reply message failure');
            access = false;
        }
    });
    req.write(postdata);
    req.end();
};

//restfulapi
app.get('/restfulapi/v1/listDatasetInfoToShow/', function (request, response) {
    logger.info('GET /setting request listDatasetInfoToShow_query');
    try {
        var authToken = request.query.authToken;
        var datasetId = request.query.datasetId;
        var areaCode = request.query.areaCode;
        var rst_false = {
            result: '',
            errorMessage: ''
        };
        if (authToken == undefined) {
            logger.info("No authorization key");
            rst_false = {
                result: false,
                errorMessage: 'No authorization key'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (datasetId == undefined) {
            logger.info("No dataset id");
            rst_false = {
                result: false,
                errorMessage: 'No dataset id'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (areaCode == undefined) {
            logger.info("No areaCode id");
            rst_false = {
                result: false,
                errorMessage: 'No areaCode id'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (authToken != config.AUTH_TOKEN) {
            logger.info("Authorization fail");
            rst_false = {
                result: false,
                errorMessage: 'Authorization fail'
            };
            response.send(JSON.stringify(rst_false));
        }
        listDatasetInfoToShow(datasetId, areaCode, function (data) {
            logger.info("listDatasetInfoToShow_sendData: " + JSON.stringify(data));
            response.send(data);
        });
        //response.end();
    } catch (err) {
        logger.info('error(listDatasetInfoToShow)');
        logger.info(err);
    }

});
function listDatasetInfoToShow(did, area, callback) {
    logger.info('function listDatasetInfoToShow');
    logger.info("SELECT info_to_show FROM dataset_to_display WHERE (id = '" + did + "' AND area_code = '" + area + "')");
    pool.getConnection(function (error, connection) {
        // mysql
        if (!!error) {
            logger.info('connection.query error');
            logger.info(err);
        } else {
            connection.query("SELECT info_to_show FROM dataset_to_display WHERE (id = '" + did + "' AND area_code = '" + area + "')", function (error, result) {
                var rst_false = {
                    result: '',
                    errorMessage: ''
                };
                var rst_true = {
                    result: '',
                    errorMessage: '',
                    data: ''
                };
                if (error) {
                    logger.info(error);
                } else {
                    try {
                        if (result == '') {
                            try {
                                logger.info('Error in the query(listDatasetInfoToShow)');

                                rst_false = {
                                    result: false,
                                    errorMessage: 'no subscription yet'
                                };
                                logger.info(rst_true);
                                connection.release();
                                callback(rst_false);
                                return;
                            } catch (err) {
                                logger.info('result------------------------------------------------------------------------------------------');
                                logger.info(err);
                            }
                        } else {
                            logger.info('Successful query');
                            rst_true = {
                                'result': true,
                                'errorMessage': 'success',
                                'data': JSON.stringify(result)
                            };
                            connection.release();
                            callback(rst_true);
                            return;
                        }
                    } catch (err) {
                        logger.info('result != "" ');
                        logger.info(err);
                    }
                }
                connection.release();
            });

        }
    });
};
app.get('/restfulapi/v1/listSubscriptionContainer/', function (request, response) {
    logger.info('GET /setting request listSubscriptionContainer');
    logger.info("listSubscriptionContainer_query: " + JSON.stringify(request.query));
    try {
        var authToken = request.query.authToken;
        var datasetId = request.query.datasetId;
        var memberId = request.query.memberId;
        var rst_false = {
            result: '',
            errorMessage: ''
        };
        if (authToken == undefined) {
            logger.info("No authorization key");
            rst_false = {
                result: false,
                errorMessage: 'No authorization key'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (datasetId == undefined) {
            logger.info("No dataset id");
            rst_false = {
                result: false,
                errorMessage: 'No dataset id'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (memberId == undefined) {
            logger.info("No memberId id");
            rst_false = {
                result: false,
                errorMessage: 'No memberId id'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (authToken != config.AUTH_TOKEN) {
            logger.info("Authorization fail");
            rst_false = {
                result: false,
                errorMessage: 'Authorization fail'
            };
            response.send(JSON.stringify(rst_false));
        }
        listSubscriptionContainer(memberId, datasetId, function (data) {
            logger.info("listSubscriptionContainer_sendData: " + JSON.stringify(data));
            response.send(data);
        });
        //response.end();
    } catch (err) {
        logger.info('error(listSubscriptionContainer)');
        logger.info(err);
    }

});
function listSubscriptionContainer(mid, did, callback) {
    logger.info('function listSubscriptionContainer');
    logger.info('------------------------------------------------------' + "SELECT * FROM subscription_container WHERE (mid = '" + mid + "' AND dataset_id = '" + did + "')");
    var timestamp = new Date().getTime();
    logger.info('1.' + timestamp);
    pool.getConnection(function (error, connection) {
        logger.info('2.' + this.timestamp);
        // mysql
        if (!!error) {
            logger.info('Database Error');
            logger.info(error);
        } else {
            logger.info('Database Connected');
            logger.info('------------------------------------------------------' + "SELECT * FROM subscription_container WHERE (mid = '" + mid + "' AND dataset_id = '" + did + "')");
            connection.query("SELECT * FROM subscription_container WHERE (mid = '" + mid + "' AND dataset_id = '" + did + "')", function (error, result) {
                var rst_false = {
                    result: '',
                    errorMessage: ''
                };
                var rst_true = {
                    result: '',
                    errorMessage: '',
                    data: ''
                };
                if (error) {
                    logger.info(error);
                } else {
                    if (result == '') {
                        try {
                            logger.info('Error in the query(listSubscriptionContainer)');
                            rst_false = {
                                result: false,
                                errorMessage: 'no subscription yet'
                            };
                            logger.info(rst_false);
                            connection.release();
                            callback(rst_false);
                            return;
                        } catch (err) {
                            logger.info('result================================================================');
                            logger.info(err);
                        }
                    } else {
                        logger.info('Successful query');
                        rst_true = {
                            'result': true,
                            'errorMessage': 'already subscribed',
                            'data': JSON.stringify(result)
                        };
                        connection.release();
                        callback(rst_true);
                        return;
                    }
                }
                connection.release();
            });
        }
    }.bind({ timestamp: timestamp }));
};
app.post('/restfulapi/v1/addSubscriptionContainer/', function (request, response) {
    logger.info('POST/ (addSubscriptionContainer)');
    logger.info("addSubscriptionContainer_query: " + JSON.stringify(request.body));
    try {
        var authToken = request.body.authToken;
        var memberId = request.body.memberId;
        var datasetId = request.body.datasetId;
        var subscribeDetail = request.body.subscribeDetail;
        var rst_false = {
            result: '',
            errorMessage: ''
        };
        if (authToken == undefined) {
            logger.info("No authorization key");
            rst_false = {
                result: false,
                errorMessage: 'No authorization key'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (datasetId == undefined) {
            logger.info("No dataset id");
            rst_false = {
                result: false,
                errorMessage: 'No dataset id'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (memberId == undefined) {
            logger.info("No member id");
            rst_false = {
                result: false,
                errorMessage: 'No member id'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (authToken != config.AUTH_TOKEN) {
            logger.info("Authorization fail");
            rst_false = {
                result: false,
                errorMessage: 'Authorization fail'
            };
            response.send(JSON.stringify(rst_false));
        }
        addSubscriptionContainer(memberId, datasetId, subscribeDetail, function (data) {
            logger.info("addSubscriptionContainer_sendData: " + JSON.stringify(data));
            response.send(data);
        });
    } catch (err) {
        logger.info('error(addSubscriptionContainer)');
        logger.info(err);
    }
});
function addSubscriptionContainer(mid, did, sdetail, callback) {
    logger.info('function addSubscriptionContainer');
    var MysqlFormat = new Date().toISOString().
        replace(/T/, ' ').      // replace T with a space
        replace(/\..+/, '');
    MysqlFormat = 'NOW()';
    logger.info(MysqlFormat);
    logger.info("INSERT INTO subscription_container VALUES ('" + mid + "','" + did + "','" + sdetail + "','0'," + MysqlFormat + ", " + MysqlFormat + " ,'1')");
    pool.getConnection(function (error, connection) {
        // mysql
        if (!!error) {
            logger.info('Database Error');
            logger.info(error);
        } else {
            logger.info('Database Connected');
            connection.query("INSERT INTO subscription_container VALUES ('" + mid + "','" + did + "','" + sdetail + "','0'," + MysqlFormat + "," + MysqlFormat + ",'1')", function (error, result) {
                var rst_false = {
                    result: '',
                    errorMessage: ''
                };
                var rst_true = {
                    result: '',
                    errorMessage: '',
                    data: ''
                };
                if (error) {
                    logger.info(error)
                } else {
                    if (result == '') {
                        logger.info('Error in the query(addSubscriptionContainer)');
                        rst_false = {
                            result: false,
                            errorMessage: 'errorMessage'
                        };
                        connection.release();
                        callback(rst_false);
                        return;
                    } else {
                        logger.info('Successful query');
                        rst_true = {
                            'result': true,
                            'errorMessage': 'success',
                            'data': JSON.stringify(result)
                        };
                        connection.release();
                        callback(rst_true);
                        return;
                    }
                }
                connection.release();
            });
        }
    });
};

app.put('/restfulapi/v1/updateSubscriptionContainer/', function (request, response) {
    logger.info('PUT updateSubscriptionContainer');
    var authToken = request.body.authToken;
    var memberId = request.body.memberId;
    var datasetId = request.body.datasetId;
    var subscribeDetail = request.body.subscribeDetail;
    var todo = request.body.todo;
    var rst_false = {
        result: '',
        errorMessage: ''
    };
    try {
        if (authToken == undefined) {
            logger.info("No authorization key");
            rst_false = {
                result: false,
                errorMessage: 'No authorization key'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (datasetId == undefined) {
            logger.info("No dataset id");
            rst_false = {
                result: false,
                errorMessage: 'No dataset id'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (memberId == undefined) {
            logger.info("No member id");
            rst_false = {
                result: false,
                errorMessage: 'No member id'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (authToken != config.AUTH_TOKEN) {
            logger.info("Authorization fail");
            rst_false = {
                result: false,
                errorMessage: 'Authorization fail'
            };
            response.send(JSON.stringify(rst_false));
        }
        updateSubscriptionContainer(memberId, datasetId, subscribeDetail, todo, function (data) {
            logger.info("updateSubscriptionContainerr_sendData: " + JSON.stringify(data));
            response.send(data);
        });
    } catch (err) {
        logger.info('--------------------------------------------------------------/updateSubscriptionContainer');
        logger.info(err);
    }

});
function updateSubscriptionContainer(mid, did, dataToUpdate, todo, callback) {
    var origRaw, origData, origArea;
    if (todo != undefined) {
        var MysqlFormat = new Date().toISOString().
            replace(/T/, ' ').      // replace T with a space
            replace(/\..+/, '');
        MysqlFormat = 'NOW()';
        listSubscriptionContainer(mid, did, function (origRaw) {
            try {
                switch (todo) {
                    case 'cancelArea':
                        // cancel ncdr area
                        logger.info("cancelArea");
                        logger.info("listSubscriptionContainer_sendData: " + JSON.stringify(origRaw));
                        origData = JSON.parse(origRaw['data']);
                        logger.info("origData: " + JSON.stringify(origData));
                        origArea = JSON.parse(origData[0]['detail']);
                        logger.info("origArea: " + JSON.stringify(origArea));
                        logger.info('++++++++++++++++++++++++++++++++++++++++' + dataToUpdate);
                        dataToUpdate = JSON.parse(dataToUpdate);
                        logger.info("dataToUpdate: " + JSON.stringify(dataToUpdate));
                        origArea['area'].forEach(function (v, k) {//
                            logger.info("v: " + JSON.stringify(v) + " k: " + k);
                            if (v == dataToUpdate['area'][0]) {
                                logger.info("find equal");
                                origArea['area'].splice(k, 1);
                            }
                        });
                        logger.info("origArea['area']: " + JSON.stringify(origArea['area']) + "length: " + origArea['area'].length);
                        var newArea = origArea['area'];
                        logger.info("newArea: " + JSON.stringify(newArea) + "length: " + newArea.length);
                        dataToUpdate['area'] = newArea;
                        logger.info("dataToUpdate['area']: " + JSON.stringify(dataToUpdate['area']) + "dataToUpdate['area']: " + dataToUpdate['area'].length);
                        if (dataToUpdate['area'].length == 0) {
                            deleteSubscriptionContainer(mid, did, function (data) {
                                logger.info("updateSubscriptionContainerr_sendData1: " + JSON.stringify(data));
                                callback(data);
                            });
                            return;
                        }
                        dataToUpdate = JSON.stringify(dataToUpdate);
                        break;
                    case 'addArea':
                        // add ncdr area
                        logger.info("addArea");
                        logger.info("listSubscriptionContainer_sendData: " + JSON.stringify(origRaw));
                        origData = JSON.parse(origRaw['data']);
                        logger.info("origData: " + JSON.stringify(origData));
                        origArea = JSON.parse(origData[0]['detail']);
                        logger.info("origArea: " + JSON.stringify(origArea));
                        logger.info('-------------------------------------------------------------------' + dataToUpdate);
                        dataToUpdate = dataToUpdate;

                        origArea['area'].push(dataToUpdate['area'][0]);
                        dataToUpdate['area'] = origArea['area'];
                        dataToUpdate = JSON.stringify(dataToUpdate);
                        logger.info("dataToUpdate: " + JSON.stringify(dataToUpdate));
                        break;
                    case 'addAirboxSubArea':
                        logger.info("addAirboxSubArea");
                        logger.info("listSubscriptionContainer_sendData: " + JSON.stringify(origRaw));
                        origData = JSON.parse(origRaw['data']);
                        logger.info("origData: " + JSON.stringify(origData));

                        origArea = JSON.parse(origData[0]['detail']);
                        logger.info("origArea: " + JSON.stringify(origArea));

                        logger.info('*********************************************' + dataToUpdate);
                        dataToUpdate = JSON.parse(dataToUpdate);
                        logger.info("dataToUpdate: " + JSON.stringify(dataToUpdate));
                        origArea.push(dataToUpdate);
                        dataToUpdate = JSON.stringify(origArea);
                        logger.info("dataToUpdate: " + JSON.stringify(dataToUpdate));
                        break;
                    case 'updateAirboxSubArea':
                        logger.info("updateAirboxSubArea");
                        logger.info("listSubscriptionContainer_sendData: " + JSON.stringify(origRaw));

                        origData = JSON.parse(origRaw['data']);
                        logger.info("origData: " + JSON.stringify(origData));

                        origArea = JSON.parse(origData[0]['detail']);
                        logger.info("origArea: " + JSON.stringify(origArea));
                        logger.info('///////////////////////////////////////////////////////////////////////////////////////' + dataToUpdate);

                        dataToUpdate = JSON.parse(dataToUpdate);
                        logger.info("dataToUpdate: " + JSON.stringify(dataToUpdate));
                        origArea.forEach(function (v, k) {//
                            logger.info("v: " + JSON.stringify(v) + " k: " + k);
                            if (v['area'] === dataToUpdate['area']) {
                                origArea[k]['timeToPush'] = dataToUpdate['timeToPush'];
                            }
                        });
                        dataToUpdate = JSON.stringify(origArea);
                        logger.info("dataToUpdate: " + JSON.stringify(dataToUpdate));
                        //logger.info(mid + " AND " + did);
                        break;
                    case 'cancelAirboxSubArea'://
                        logger.info("cancelAirboxSubArea");
                        logger.info("listSubscriptionContainer_sendData: " + JSON.stringify(origRaw));

                        origData = JSON.parse(origRaw['data']);
                        logger.info("origData: " + JSON.stringify(origData));

                        origArea = JSON.parse(origData[0]['detail']);
                        logger.info("origArea: " + JSON.stringify(origArea));

                        logger.info('========================================' + dataToUpdate);
                        dataToUpdate = JSON.parse(dataToUpdate);
                        logger.info("dataToUpdate: " + JSON.stringify(dataToUpdate));
                        var index;
                        origArea.forEach(function (v, k) {//
                            logger.info("v: " + JSON.stringify(v) + " k: " + k);
                            if (v['area'] === dataToUpdate['area']) {
                                origArea.splice(k, 1);
                            }
                        });
                        var newArea = origArea;
                        if (origArea.length == 0) {
                            deleteSubscriptionContainer(mid, did, function (data) {
                                logger.info("updateSubscriptionContainerr_sendData2: " + JSON.stringify(data));
                                callback(data);
                            });
                            return;
                        }
                        dataToUpdate = JSON.stringify(newArea);
                        break;
                    // case 'pushNotification':
                    //     $query = "UPDATE `subscription_container` SET `last_pushed_at` = NOW(), `is_pushed` = 1 WHERE `mid` = :mid AND `dataset_id` = :did;";
                    //     break;
                    // case 'parseNotification':
                    //     $query = "UPDATE `subscription_container` SET `last_pushed_at` = NOW(), `is_pushed` = 0 WHERE `mid` = :mid AND `dataset_id` = :did;";
                    //     break;
                    default:
                        break;
                }
            } catch (err) {
                logger.info(err);
            }
            pool.getConnection(function (error, connection) {
                // mysql
                if (!!error) {
                    logger.info('Database Error');
                    logger.info(error);
                } else {
                    connection.query("UPDATE subscription_container SET detail = '" + dataToUpdate + "' , changed_at = " + MysqlFormat + " WHERE (dataset_id = '" + did + "' AND mid = '" + mid + "')", function (error, result) {
                        var rst_false = {
                            result: '',
                            errorMessage: ''
                        };
                        var rst_true = {
                            result: '',
                            errorMessage: '',
                            data: ''
                        };
                        if (error) {
                            logger.info(error);
                        } else {

                            if (result == '') {
                                logger.info('Update failed');
                                rst_false = {
                                    result: false,
                                    errorMessage: 'Update failed'
                                };
                                connection.release();
                                callback(rst_false);
                                return;
                            } else {
                                logger.info('subscription container updated');
                                rst_true = {
                                    'result': true,
                                    'errorMessage': 'subscription container updated',
                                    'data': JSON.stringify(result)
                                };
                                connection.release();
                                callback(rst_true);
                                return;
                            }
                        }
                        connection.release();
                    });
                }
            });
        });
    }
};
app.get('/restfulapi/v1/listDataset/', function (request, response) {
    logger.info('GET/(listDataset)');
    var authToken = request.query.authToken;
    var datasetId = request.query.datasetId;
    var memberId = request.query.memberId;
    var areaCode = request.query.areaCode;
    var rst_false = {
        result: '',
        errorMessage: ''
    };
    if (authToken == undefined) {
        logger.info("No authorization key");
        rst_false = {
            result: false,
            errorMessage: 'No authorization key'
        };
        response.send(JSON.stringify(rst_false));
    }
    if (datasetId == undefined) {
        logger.info("No dataset id");
        rst_false = {
            result: false,
            errorMessage: 'No dataset id'
        };
        response.send(JSON.stringify(rst_false));
    }
    if (memberId == undefined) {
        logger.info("No memberId id");
        rst_false = {
            result: false,
            errorMessage: 'No memberId id'
        };
        response.send(JSON.stringify(rst_false));
    }
    if (authToken != config.AUTH_TOKEN) {
        logger.info("Authorization fail");
        rst_false = {
            result: false,
            errorMessage: 'Authorization fail'
        };
        response.send(JSON.stringify(rst_false));
    }
    listDataset(datasetId, areaCode, function (data) {
        logger.info("listDataset_sendData: " + JSON.stringify(data));
        response.send(data);
    });
    //response.end();
});
function listDataset(did, area, callback) {
    logger.info('function listDataset');
    pool.getConnection(function (error, connection) {
        // mysql
        if (!!error) {
            logger.info('Database Error');
            logger.info(error);
        } else {
            connection.query("SELECT * FROM dataset_to_display WHERE (id = '" + did + "' AND area_code = '" + area + "')", function (error, result) {
                var rst_false = {
                    result: '',
                    errorMessage: ''
                };
                var rst_true = {
                    result: '',
                    errorMessage: '',
                    data: ''
                };
                if (error) {
                    logger.info('error');
                } else {
                    if (result == '') {
                        logger.info('Error in the query(listDataset)');
                        rst_false = {
                            result: false,
                            errorMessage: 'no subscription yet'
                        };
                        connection.release();
                        callback(rst_false);
                        return;
                    } else {
                        logger.info('Successful query');
                        rst_true = {
                            'result': true,
                            'errorMessage': 'success',
                            'data': JSON.stringify(result)
                        };
                        connection.release();
                        callback(rst_true);
                        return;
                    }
                }
                connection.release();
            });
        }
    });

}
app.get('/restfulapi/v1/listPDatasetInfoToShow/', function (request, response) {
    logger.info('GET/(listPDatasetInfoToShow)');
    var authToken = request.query.authToken;
    var datasetId = request.query.datasetId;
    var areaCode = request.query.areaCode;
    var rst_false = {
        result: '',
        errorMessage: ''
    };
    if (authToken == undefined) {
        logger.info("No authorization key");
        rst_false = {
            result: false,
            errorMessage: 'No authorization key'
        };
        response.send(JSON.stringify(rst_false));
    }
    if (datasetId == undefined) {
        logger.info("No dataset id");
        rst_false = {
            result: false,
            errorMessage: 'No dataset id'
        };
        response.send(JSON.stringify(rst_false));
    }
    if (authToken != config.AUTH_TOKEN) {
        logger.info("Authorization fail");
        rst_false = {
            result: false,
            errorMessage: 'Authorization fail'
        };
        response.send(JSON.stringify(rst_false));
    }
    listPDatasetInfoToShow(datasetId, areaCode, function (data) {
        logger.info("listPDatasetInfoToShow_sendData: " + JSON.stringify(data));
        response.send(data);
    });
    //response.end();
});
function listPDatasetInfoToShow(did, area, callback) {
    logger.info('listPDatasetInfoToShow');
    pool.getConnection(function (error, connection) {
        // mysql
        if (!!error) {
            logger.info('Database Error');
            logger.info(error);
        } else {
            connection.query("SELECT info_to_show FROM dataset_to_push WHERE (id = '" + did + "' AND area_code = '" + area + "' AND (UNIX_TIMESTAMP(" + Date.now() + ")-UNIX_TIMESTAMP(`changed_at`) < 86400 ))", function (error, result) {
                var rst_false = {
                    result: '',
                    errorMessage: ''
                };
                var rst_true = {
                    result: '',
                    errorMessage: '',
                    data: ''
                };
                if (error) {
                    logger.info(error);
                } else {
                    if (result == '') {
                        logger.info('Error in the query(listPDatasetInfoToShow)');
                        rst_false = {
                            result: false,
                            errorMessage: 'no subscription yet'
                        };
                        connection.release();
                        callback(rst_false);
                        return;
                    } else {
                        logger.info('Successful query');
                        rst_true = {
                            'result': true,
                            'errorMessage': 'success',
                            'data': JSON.stringify(result)
                        };
                        connection.release();
                        callback(rst_true);
                        return;
                    }
                }
                connection.release();
            });

        }
    });

}
app.delete('/restfulapi/v1/deleteSubscriptionContainer/', function (request, response) {
    logger.info('delete/ (SubscriptionContainer)');
    try {
        var authToken = request.body.authToken;
        var datasetId = request.body.datasetId;
        var memberId = request.body.memberId;
        var rst_false = {
            result: '',
            errorMessage: ''
        };
        if (authToken == undefined) {
            logger.info("No authorization key");
            rst_false = {
                result: false,
                errorMessage: 'No authorization key'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (datasetId == undefined) {
            logger.info("No dataset id");
            rst_false = {
                result: false,
                errorMessage: 'No dataset id'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (memberId == undefined) {
            logger.info("No memberId id");
            rst_false = {
                result: false,
                errorMessage: 'No memberId id'
            };
            response.send(JSON.stringify(rst_false));
        }
        if (authToken != config.AUTH_TOKEN) {
            logger.info("No memberId id");
            rst_false = {
                result: false,
                errorMessage: 'Authorization fail'
            };
            response.send(JSON.stringify(rst_false));
        }
        deleteSubscriptionContainer(memberId, datasetId, function (data) {
            logger.info("deleteSubscriptionContainer_sendData: " + JSON.stringify(data));
            response.send(data);
        });
    } catch (err) {
        logger.info(err);
    }
});
function deleteSubscriptionContainer(mid, did, callback) {
    logger.info('function deleteSubscriptionContainer');
    try {
        pool.getConnection(function (error, connection) {
            // mysql
            if (!!error) {
                logger.info('Database Error');
                logger.info(error);
            } else {
                connection.query("DELETE FROM subscription_container WHERE mid = '" + mid + "' AND dataset_id = '" + did + "'", function (error, result) {
                    var rst_false = {
                        result: '',
                        errorMessage: ''
                    };
                    var rst_true = {
                        result: '',
                        errorMessage: '',
                        data: ''
                    };
                    if (error) {
                        logger.info('Delete error');
                        logger.info(error);
                    } else {
                        if (result == '') {
                            logger.info('Invalid input');
                            rst_false = {
                                result: false,
                                errorMessage: 'Invalid input'
                            };
                            connection.release();
                            callback(rst_false);
                            return;
                        } else {
                            logger.info('subscription container deleted');
                            rst_true = {
                                'result': true,
                                'errorMessage': 'subscription container deleted',
                                'data': JSON.stringify(result)
                            };
                            connection.release();
                            callback(rst_true);
                            return;
                        }
                    }
                    connection.release();
                });
            }
        });
    } catch (err) {
        logger.info(err);
    }
};
