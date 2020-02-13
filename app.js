var bodyParser = require("body-parser"),
    express    = require("express"),
    app        = express(),
    mysql      = require("mysql"),
    pool       = require("./pool");        // need to provide your own pool.js file to connect

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

/* INDEX ROUTE - Home Page */
app.get("/", function(req,res) {
    let zookeepers = [], supplies = [], enclosures = [];       // used to hold rows of information from MySQL
    pool.query('SELECT * FROM Zoo_Keepers WHERE onshift_status = 1', function(err1, rows1, field1) {
        if(err1) {
            console.log(err1);
        }
        for (let i in rows1) {      // pushes each zookeeper row from MySQL into an array for us to manipulate
            zookeepers.push(rows1[i]);
            console.log(zookeepers[i]);
        }
        pool.query('SELECT * FROM Supplies', function(err2, rows2, field2) {   
            if(err2) {
                console.log(err2);
            }
            for (let i in rows2) {      // pushes each supply row from MySQL into an array for us to manipulate
                supplies.push(rows2[i]);
                console.log(supplies[i]);
            }
            pool.query('SELECT * FROM Animal_Enclosures', function(err3, rows3, field3) {   
                if(err3) {
                    console.log(err3);
                }
                for (let i in rows3) {  // pushes each animal enclosure row from MySQL into an array for us to manipulate
                    enclosures.push(rows3[i]);
                    console.log(enclosures[i]);
                }
                res.render("index", {zookeepers: zookeepers, supplies: supplies, enclosures: enclosures});      // this passes the zookeepers, supplies, and enclosures array to ejs file
            }); 
        });
    });
});

/* Not implemented yet - working on POST request to add new Work Orders to DB */
/* SHOW ROUTE - Show All Work Orders OR Individual Specific Work Order Details */
app.get("/workorders", function(req, res) {
    res.render("workOrder");
});

/* SHOW ROUTE - Show All Zoo Keepers */
app.get("/zookeepers", function(req, res) {
    pool.query('SELECT * FROM Zoo_Keepers', function(err, zookeepers) {
        if(err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        }
        else{
            res.render("zookeepers", {zookeepers: zookeepers})};
    });
});

/* ADD ROUTE - Add New Zoo Keeper */
app.post("/zookeepers", function(req, res){
    var sql = "INSERT INTO Zoo_Keepers (first_name, last_name, phone_number, supervisor) VALUES (?,?,?,?)";
    var inserts = [req.body.fname, req.body.lname, req.body.phoneNumber, req.body.supervisor];
    pool.query(sql, inserts, function(error, results, fields){
        if(error){
            console.log(JSON.stringify(error))
            res.write(JSON.stringify(error));
            res.end();
        }else{
            res.redirect('/zookeepers');
        }
    });
});

/* DELETE ROUTE - Delete Zoo Keeper */
app.delete('/zookeepers/delete/:id', function(req, res){
    var sql = "DELETE FROM Zoo_Keepers WHERE zookeeper_id = ?";
    var inserts = [req.params.id];
    pool.query(sql, inserts, function(error, results, fields){
        if(error){
            console.log(error)
            res.write(JSON.stringify(error));
            res.status(400);
            res.end();
        }else{
            res.redirect("/zookeepers");
        }
    })
});

/* SHOW ROUTE - Show Edit Zookeeper Page */
app.get("/zookeepers/edit/:id", function(req, res) {
    var sql = "SELECT * FROM Zoo_Keepers WHERE zookeeper_id = ?";
    var inserts = [req.params.id];
    pool.query(sql, inserts, function(err, zookeepers) {
        if(err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        }
        else{
            res.render("editZookeepers", {zookeepers: zookeepers})};
    });
});
/* EDIT ROUTE - Edit Zookeeper Row in Database */
app.put("/zookeepers/edit/:id", function(req, res){
    var sql = "UPDATE Zoo_Keepers SET first_name=?, last_name=?, phone_number=?, supervisor=?, onshift_status=? WHERE zookeeper_id=?";
    var inserts = [req.body.fname, req.body.lname, req.body.phoneNumber, req.body.supervisor, req.body.onshift_status, req.params.id];
    pool.query(sql, inserts, function(error, results, fields){
        if(error){
            console.log(JSON.stringify(error))
            res.write(JSON.stringify(error));
            res.end();
        }else{
            res.redirect('/zookeepers');
        }
    });
});

/* SHOW ROUTE - Show All Supplies */
app.get("/supplies", function(req, res) {
    pool.query('SELECT * FROM Supplies', function(err, supplies) {
        if(err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        }
        else{
            res.render("supplies", {supplies: supplies})};
    });
});

/* ADD ROUTE - Add New Supply Item */
app.post("/supplies", function(req, res){
    var sql = "INSERT INTO Supplies (supply_name, in_stock) VALUES (?,?)";
    var inserts = [req.body.supply_name, req.body.in_stock];
    pool.query(sql, inserts, function(error, results, fields){
        if(error){
            console.log(JSON.stringify(error))
            res.write(JSON.stringify(error));
            res.end();
        }else{
            res.redirect('/supplies');
        }
    });
});

/* DELETE ROUTE - Delete Supply Item */
app.delete('/supplies/delete/:id', function(req, res){
    var sql = "DELETE FROM Supplies WHERE supply_id = ?";
    var inserts = [req.params.id];
    pool.query(sql, inserts, function(error, results, fields){
        if(error){
            console.log(error)
            res.write(JSON.stringify(error));
            res.status(400);
            res.end();
        }else{
            res.redirect("/supplies");
        }
    })
});

/* SHOW ROUTE - Show Edit Supplies Page */
app.get("/supplies/edit/:id", function(req, res) {
    var sql = "SELECT * FROM Supplies WHERE supply_id = ?";
    var inserts = [req.params.id];
    pool.query(sql, inserts, function(err, supplies) {
        if(err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        }
        else{
            res.render("editSupplies", {supplies: supplies})};
    });
});
/* EDIT ROUTE - Edit Supply Row in Database */
app.put("/supplies/edit/:id", function(req, res){
    var sql = "UPDATE Supplies SET supply_name=?, in_stock=? WHERE supply_id=?";
    var inserts = [req.body.supply_name, req.body.in_stock, req.params.id];
    pool.query(sql, inserts, function(error, results, fields){
        if(error){
            console.log(JSON.stringify(error))
            res.write(JSON.stringify(error));
            res.end();
        }else{
            res.redirect('/supplies');
        }
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