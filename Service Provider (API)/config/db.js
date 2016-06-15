/** Database Connection **/

var redis = require("redis");

var state = {
    db : null
}

exports.connect = function() {
    state.db = redis.createClient();
}

exports.get = function() {
    return state.db
}

