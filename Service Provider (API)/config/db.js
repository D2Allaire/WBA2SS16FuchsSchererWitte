/** Database Connection **/

var redis = require("redis");

var state = {
    db : null
}

// Initialize database
exports.connect = function() {
    state.db = redis.createClient();
}

// Get database client
exports.get = function() {
    return state.db
}

