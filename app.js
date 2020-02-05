var express = require("express"),
    app     = express(),
    bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));

/* INDEX ROUTE - Home Page */
app.get("/", function(req,res) {
    res.render("index");
});

/* SHOW ROUTE - Show All Work Orders */
app.get("/workorders", function(req, res) {
    res.render("workOrder");
});

/* SHOW ROUTE - Show All Zoo Keepers */
app.get("/zookeepers", function(req, res) {
    res.render("zookeepers");
});

/* NEW ROUTE - Create a New Work Order*/
app.get("/workorders/new", function(req, res) {
    res.render("newOrder");
});

/* NEW ROUTE - Push New Work Order to DB */
app.post("/workorders", function(req,res) {
    res.redirect("/workorders");
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("The Server Has Started!");
});