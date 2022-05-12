const express = require("express");
const app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/hosteldb")
    .then(() => {
        console.log("Mongodb connected ...");
    })
    .catch((err) => {
        console.log("Mongodb failed to connect ...");
        console.log(err);
    });

app.listen(3000, () => {
    console.log("Express started on port 3000 ...");
});
app.use(express.json());

const adminModel = require("./Models/admin");
const studentModel = require("./Models/student");

const adminFunction = require('./adminFunctionality');
const studentFunction = require("./studentFunctionality");

const { auth } = require("./auth");

// route for admin create,login,view

//CREATE
app.post("/admin", adminFunction.createNewAdmin);
//LOGIN
app.post("/admin/login", adminFunction.login);
//VIEW
app.get("/admin/info", auth, adminFunction.hostelInfo);

//route for student

//CREATE
app.post("/student", studentFunction.createNewStudent)
//LOGIN
app.post("/student/login", studentFunction.login);
//VIEW INFO
app.get("/student", auth, studentFunction.info);
//UPDATE PRESENT OR FOODPREFARENCE
app.put("/student", auth, studentFunction.update);