const express = require("express");
var PORT = process.env.PORT || 8080;
var app = express();
var path = require('path');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
require("./routes.js")(app);
app.listen(PORT, function(){
    console.log('current port:' + PORT);
})