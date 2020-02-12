var mysql = require("mysql"),
    pool  = mysql.createPool({
        host: "classmysql.engr.oregonstate.edu",
        user: "cs340_riemere",
        password: "1970",
        database: "cs340_riemere",
        connectionLimit: 10
    });


// Ensures proper connection to mysql server
pool.getConnection(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
   console.log('Connected to the MySQL server.');
});

module.exports = pool;