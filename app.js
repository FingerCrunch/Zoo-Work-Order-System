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

/*********************************************************
 *                      HOME PAGE
*********************************************************/

/* INDEX ROUTE - Home Page */
app.get("/", function(req,res) {
    var zookeepers = [], supplies = [], enclosures = [], workOrders = [];       // used to hold rows of information from MySQL
    var sql = 'SELECT * FROM Zoo_Keepers WHERE onshift_status = 1',
        sql2 = 'SELECT * FROM Supplies',
        sql3 = 'SELECT * FROM Animal_Enclosures',
        sql4 = 'SELECT * FROM Work_Orders';
    pool.query(sql, function(err1, rows1, field1) {
        if(err1) {
            console.log(JSON.stringify(err1))
            res.write(JSON.stringify(err1));
            res.end();
        }
        for (let i in rows1) {      // pushes each zookeeper row from MySQL into an array for us to manipulate
            zookeepers.push(rows1[i]);
            // console.log(zookeepers[i]);
        }
        pool.query(sql2, function(err2, rows2, field2) {   
            if(err2) {
                console.log(JSON.stringify(err2))
                res.write(JSON.stringify(err2));
                res.end();
            }
            for (let i in rows2) {      // pushes each supply row from MySQL into an array for us to manipulate
                supplies.push(rows2[i]);
                // console.log(supplies[i]);
            }
            pool.query(sql3, function(err3, rows3, field3) {   
                if(err3) {
                    console.log(JSON.stringify(err3))
                    res.write(JSON.stringify(err3));
                    res.end();
                }
                for (let i in rows3) {  // pushes each animal enclosure row from MySQL into an array for us to manipulate
                    enclosures.push(rows3[i]);
                    // console.log(enclosures[i]);
                }
                pool.query(sql4, function(err4, rows4, field4) {
                    if (err4) {
                        console.log(JSON.stringify(err4))
                        res.write(JSON.stringify(err4));
                        res.end();
                    } 
                    for (var i in rows4) {
                        workOrders.push(rows4[i]);
                    }
                    res.render("index", {zookeepers: zookeepers, supplies: supplies, enclosures: enclosures, workOrders: workOrders});      // this passes the zookeepers, supplies, and enclosures array to ejs file
                });
            }); 
        });
    });
});

/*********************************************************
 *                      ZOO_KEEPERS
*********************************************************/

/* SHOW ROUTE - Show All Zoo Keepers */
app.get("/zookeepers", function(req, res) {
    var sql = 'SELECT * FROM Zoo_Keepers';
    pool.query(sql, function(err, zookeepers) {
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
    pool.query(sql, inserts, function(err, results, fields){
        if(err){
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
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
    pool.query(sql, inserts, function(err, results, fields){
        if(err){
            console.log(err)
            res.write(JSON.stringify(err));
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
            res.render("editZookeepers", {zookeepers: zookeepers});
        }
    });
});
/* EDIT ROUTE - Edit Zookeeper Row in Database */
app.put("/zookeepers/edit/:id", function(req, res){
    var sql = "UPDATE Zoo_Keepers SET first_name=?, last_name=?, phone_number=?, supervisor=?, onshift_status=? WHERE zookeeper_id=?";
    var inserts = [req.body.fname, req.body.lname, req.body.phoneNumber, req.body.supervisor, req.body.onshift_status, req.params.id];
    pool.query(sql, inserts, function(err, results, fields){
        if(err){
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        }else{
            res.redirect('/zookeepers');
        }
    });
});

/*********************************************************
 *                      WORK_ORDERS
*********************************************************/

/* SHOW ROUTE - Show All Work Orders OR Individual Specific Work Order Details */
app.get("/workorders", function(req, res) {
    var sql = "SELECT wo.work_order_id, zk.first_name, zk.last_name, ae.location, ae.species, wo.task_name, s.supply_name, wo.available, wo.available_time, wo.overdue_time, wo.overdue_status, wo.accepted_task, wo.completed_task FROM Work_Orders AS wo INNER JOIN Zoo_Keepers AS zk ON wo.zookeeper_id = zk.zookeeper_id INNER JOIN Animal_Enclosures AS ae ON wo.enclosure_id = ae.enclosure_id INNER JOIN Supplies AS s ON s.supply_id = wo.supply_id";
    pool.query(sql, function(err, workOrders) {
        if (err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        } else {
            console.log(workOrders);
            res.render("workOrder", {workOrders: workOrders});
        }
    });
});

/* NEW ROUTE - Push New Work Order to DB */
app.post("/workorders", function(req,res) {
    var sql = "INSERT INTO Work_Orders (zookeeper_id, enclosure_id, task_name, supply_id, available, available_time, overdue_time, overdue_status, accepted_task, completed_task) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    var inserts = [req.body.zookeeper_id, req.body.enclosure_id, req.body.task_name, req.body.supply_id, 1, req.body.available_time, req.body.overdue_time, 0, 1, 0];
    pool.query(sql, inserts, function(err, rows, field) {
        if(err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        } else {
            res.redirect('/workorders');
        }
    });
});

/* DELETE ROUTE - Delete Work Order */
app.delete("/workorders/delete/:id", function(req, res) {
    var sql = "DELETE FROM Work_Orders WHERE work_order_id = ?";
    var inserts = [req.params.id];
    pool.query(sql, inserts, function(err, results, fields) {
        if(err){
            console.log(err)
            res.write(JSON.stringify(err));
            res.status(400);
            res.end();
        } else{
            res.redirect("/workorders");
        }
    });
});

/* SHOW ROUTE - Show Edit Work Orders Page */
app.get("/workorders/edit/:id", function(req, res) {
    var zookeepers = [], supplies = [], enclosures = [], workOrders = [];       // used to hold rows of information from MySQL
    var sql = "SELECT * FROM Work_Orders WHERE work_order_id = ?",
        sql2 = "SELECT * FROM Supplies",
        sql3 = "SELECT * FROM Animal_Enclosures",
        sql4 = "SELECT * FROM Zoo_Keepers"; 
    var inserts = [req.params.id];
    pool.query(sql, inserts, function(err, workOrders) {
        if(err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        }
        pool.query(sql2, function(err2, rows2, field2) {
            if(err2) {
                console.log(JSON.stringify(err2))
                res.write(JSON.stringify(err2));
                res.end();
            }
            for (var i in rows2) {
                supplies.push(rows2[i]);
            }
            pool.query(sql3, function(err3, rows3, field3) {
                if (err3) {
                    console.log(JSON.stringify(err2))
                    res.write(JSON.stringify(err2));
                    res.end();
                }
                for (var i in rows3) {
                    enclosures.push(rows3[i]);
                }
                pool.query(sql4, function(err4, rows4, field4) {
                    if (err4) {
                        console.log(JSON.stringify(err2))
                        res.write(JSON.stringify(err2));
                        res.end();
                    }
                    for (var i in rows4) {
                        zookeepers.push(rows4[i]);
                    }
                    res.render("editWorkOrders", {workOrders: workOrders, zookeepers:zookeepers, enclosures: enclosures, supplies: supplies});
                });
            });
        });
    });
});

/* EDIT ROUTE - Edit Work Order */
app.put("/workorders/edit/:id", function(req, res) {

});

/*********************************************************
 *                      SUPPLIES
*********************************************************/
/* SHOW ROUTE - Show All Supplies */
app.get("/supplies", function(req, res) {
    var sql = 'SELECT * FROM Supplies';
    pool.query(sql, function(err, supplies) {
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
    pool.query(sql, inserts, function(err, results, fields){
        if(err){
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
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
    pool.query(sql, inserts, function(err, results, fields){
        if(err){
            console.log(err)
            res.write(JSON.stringify(err));
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
    pool.query(sql, inserts, function(err, results, fields){
        if(err){
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        }else{
            res.redirect('/supplies');
        }
    });
});

/*********************************************************
 *                      ENCLOSURES
*********************************************************/

/* SHOW ROUTE - Animal Enclosures */
app.get("/enclosures", function(req,res) {
    var sql = "SELECT * FROM Animal_Enclosures";
    var enclosures = [];
    pool.query(sql, function(err, rows, fields) {
        if(err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        }
        for (let i in rows) {      // pushes each zookeeper row from MySQL into an array for us to manipulate
            enclosures.push(rows[i]);
        }
        res.render("enclosures", {enclosures: enclosures});
    });
});

/* ADD ROUTE - Animal Enclosures */
app.post("/enclosures", function(req, res) {
   var sql = "INSERT INTO Animal_Enclosures (location, size_sqft, species, total_number, diet_type) VALUES (?, ?, ?, ?, ?)";
   var inserts = [req.body.location, req.body.size_sqft, req.body.species, req.body.total_number, req.body.diet_type];
   
   pool.query(sql, inserts, function(err, results, fields) {
       if(err) {
           console.log(err);
       } else {
           res.redirect("/enclosures");
       }
   });
});

/* DELETE ROUTE  - Animal Enclosures */
app.delete('/enclosures/delete/:id', function(req, res) {
    var sql = "DELETE FROM Animal_Enclosures WHERE enclosure_id =?";
    var inserts = [req.params.id];

    pool.query(sql, inserts, function(err, results, fields) {
        if(err) {
            console.log(err);
            res.write(JSON.stringify(err));
            res.status(400);
            res.end();
        } else {
            res.redirect("/enclosures");
        }
    });
});

/* SHOW ROUTE - Edit Animal Enclosures Page */
app.get('/enclosures/edit/:id', function(req, res) {
    var sql = "SELECT * FROM Animal_Enclosures WHERE enclosure_id =?";
    var inserts = [req.params.id];
    pool.query(sql, inserts, function(err, enclosures) {
        if (err) {
            console.log(JSON.stringify(err))
            res.write(JSON.stringify(err));
            res.end();
        } else {
            res.render('editEnclosures', {enclosures: enclosures});
        }
    });
});

/* EDIT ROUTE - Edit Animal Enclosures Row in Database */
app.put('/enclosures/edit/:id', function(req, res) {
   var sql = "UPDATE Animal_Enclosures SET location=?, size_sqft=?, species=?, total_number=?, diet_type=? WHERE enclosure_id=?";
   var inserts = [req.body.location, req.body.size_sqft, req.body.species, req.body.total_number, req.body.diet_type, req.params.id];
   pool.query(sql, inserts, function(err, results, fields) {
    if (err) {
        console.log(JSON.stringify(err))
        res.write(JSON.stringify(err));
        res.end();
    } else {
        res.redirect("/enclosures");
    }
   });
});

/*********************************************************
 * Code to start server and view HTML in web browser
*********************************************************/
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("The Server Has Started!");
});