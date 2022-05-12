require("dotenv").config();
const studentModel = require("./Models/student");
const adminModel = require("./Models/admin");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function createNewStudent(req, res) {
    const { name, personalNumber, guardianNumber, hostelID, password, roomNo } = req.body;

    if (!name || !personalNumber || !guardianNumber || !hostelID || !password || !roomNo) {
        console.log("Insufficient Credentials");
        res.status(401);
        res.json({ "error": "Insufficient Credentials" });
        return;
    }

    if (adminModel.findById(hostelID).length === 0) {
        console.log(`The hostel id ${hostelID} does not exist`);
        res.status(401);
        res.json({ "error": "Invalid hostel ID provided" });
        return;
    }

    if (studentModel.find({ "personalNumber": personalNumber }).length > 0) {
        console.log("phone number already registered");
        res.status(401);
        res.json({ "error": "Phone number already registered" });
        return;
    }

    const newStudentUser = new studentModel({
        "name": name,
        "password": password,
        "hostelID": hostelID,
        "personalNumber": personalNumber,
        "guardianNumber": guardianNumber,
        "roomNo": roomNo
    })

    newStudentUser.save()
        .then(() => {
            const accessToken = jwt.sign({ "id": newStudentUser._id }, process.env.ACCESS_TOKEN_SECRET);
            res.json({ "jwtToken": accessToken });
            return;
        })
        .catch((err) => {
            console.log("STUDENT CREATE ERROR");
            console.log(err);
            res.status(500);
            res.json({ "error": "Internal Server Error" });
            return;
        })
}

function login(req, res) {
    const { personalNumber, password } = req.body;
    if (!personalNumber || !password) {
        console.log("Insufficient Credentials");
        res.staus(401);
        res.json({ "error": "Insufficient Credentials" });
        return;
    }
    studentModel.findOne({ "personalNumber": personalNumber })
        .then((studentUser) => {
            if (!studentUser) {
                console.log("Phone number not registered");
                res.status(401);
                res.json({ "error": "Phone Number not registered" });
                return;
            }

            bcrypt.compare(password, studentUser.password, (err, result) => {
                if (err) {
                    console.log("student creditial check failed");
                    console.log(err);
                    res.status(500);
                    res.json({ "error": "Internal Server Error" });
                    return;
                }

                else if (!result) {
                    console.log("wrong Password");
                    res.status(403);
                    res.json({ "error": "Wrong password" });
                    return;
                }

                else {
                    const accessToken = jwt.sign({ "id": studentUser._id }, process.env.ACCESS_TOKEN_SECRET);
                    res.json({ "jwtToken": accessToken });
                    return;
                }
            })
        })
        .catch((err) => {
            console.log("Student Login Error");
            console.log(err);
            res.status(500);
            res.json({ "error": "Internal Server Error" });
        })
}

function view(req, res) {
    studentModel.findById(req.id)
        .then((studentPointer) => {
            if (!studentPointer) {
                console.log("Invalid user sent");
                res.status(401);
                res.json({
                    "error": "Token for invalid user sent"
                });
                return;
            }


            let studentUser = {
                "name": studentPointer.name,
                "foodPrefarence": studentPointer.foodPrefarence,
                "presentStatus": studentPointer.presentStatus,
                "personalNumber": studentPointer.personalNumber,
                "guardianNumber": studentPointer.guardianNumber,
                "roomNo": studentPointer.roomNo,
                "collegeName": undefined
            }

            adminModel.findById(studentPointer.hostelID)
                .then((adminPointer) => {
                    if (!adminPointer) {
                        console.log(`Invalid hostel ID saved in database for the student with id ${studentUser._id.toString()}`);
                        res.status(500);
                        res.json({
                            "error": "Internal server error / the hostel id no longer valid"
                        });
                        return;
                    }
                    studentUser.collegeName = adminPointer.collegeName;
                    res.json(studentUser);
                })
                .catch((err) => {
                    console.log("error finding collegename with id");
                    console.log(err);
                    res.status(500);
                    res.json({
                        "error": "Internal server error"
                    });
                    return;
                })
        })
        .catch((err) => {
            console.log("Mongoose student id finding error");
            console.log(err);
            res.status(500);
            res.json({ "error": "Internal Server Error" });
            return;
        })
}

function update(req, res) {
    studentModel.findById(req.id)
        .then((studentPointer) => {
            if (!studentPointer) {
                console.log("Invalid user sent");
                res.status(401);
                res.json({
                    "error": "Invalid user token sent"
                });
                return;
            }

            const { foodPrefarence, presentStatus } = req.body;

            if (!foodPrefarence && !presentStatus) {
                console.log("Insufficient values sent");
                res.status(401);
                res.json({
                    "error": "both foodPrefarence and presentStatus is missing"
                });
                return;
            }

            if (presentStatus) {
                studentPointer.presentStatus = presentStatus;
            }

            if (foodPrefarence) {
                studentPointer.foodPrefarence = foodPrefarence;
            }

            studentPointer.save();
            res.send("updated sucessfully");
        })
        .catch((err) => {
            console.log("student find for update error");
            console.log(err);
            res.status(500);
            res.json({
                "error": "Internal server error"
            });
            return;
        })
}

module.exports = {
    "createNewStudent": createNewStudent,
    "login": login,
    "info": view,
    "update": update
};