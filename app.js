var bodyParser = require("body-parser"),
    express    = require("express"),
    app        = express(),
    mysql      = require("mysql"),
    pool       = require("./pool");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));

/* INDEX ROUTE - Home Page */
app.get("/", function(req,res) {
    let zookeepers = [], supplies = [], enclosures = [];
    pool.query('SELECT * FROM Zoo_Keepers WHERE onshift_status = 1', function(err1, rows1, field1) {
        if(err1) {
            console.log(err1);
        }
        for (let i in rows1) {
            zookeepers.push(rows1[i]);
            console.log(zookeepers[i]);
        }
        pool.query('SELECT * FROM Supplies', function(err2, rows2, field2) {
            if(err2) {
                console.log(err2);
            }
            for (let i in rows2) {
                supplies.push(rows2[i]);
                console.log(supplies[i]);
            }
            pool.query('SELECT * FROM Animal_Enclosures', function(err3, rows3, field3) {
                if(err3) {
                    console.log(err3);
                }
                for (let i in rows3) {
                    enclosures.push(rows3[i]);
                    console.log(enclosures[i]);
                }
                res.render("index", {zookeepers: zookeepers, supplies: supplies, enclosures: enclosures}); 
            }); 
        });
    });
});

/* SHOW ROUTE - Show All Work Orders OR Individual Specific Work Order Details */
app.get("/workorders", function(req, res) {
    res.render("workOrder");
});

/* SHOW ROUTE - Show All Zoo Keepers */
app.get("/zookeepers", function(req, res) {
    let zookeepers = [];
    pool.query('SELECT * FROM Zoo_Keepers', function(err, rows, field) {
        if(err) {
            console.log(err);
        }
        for (let i in rows) {
            zookeepers.push(rows[i]);
            console.log(zookeepers[i]);
        }
        res.render("zookeepers", {zookeepers: zookeepers});
    });
});

/* Not working yet */
/* NEW ROUTE - Push New Work Order to DB */
app.post("/workorders", function(req,res) {
    let zookeeper = req.body.zookeeper,
        enclosure = req.body.enclosure,
        task      = req.body.task,
        supply    = req.body.supplies,
        available = true,
        overdue   = false,
        accepted = true;
    
    let workOrder = [];
    pool.query('INSERT INTO Work_Orders (zookeeper_id, enclosure_id, task_name, supply_id, available, overdue_status, accepted) VALUES (zookeeper, enclosure, task, supply, available, overdue, accepted)', function(err, rows, field) {
     
    });
});


/* Code to start server and view HTML in web browser */
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("The Server Has Started!");
});