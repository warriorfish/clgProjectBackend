require('dotenv').config();
const adminModel = require("./Models/admin");
const studentModel = require("./Models/student");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


function createNewAdmin(req, res) {
    const { clgName, hostelName, password } = req.body;
    if (!clgName || !hostelName || !password) {
        console.log("Insufficient credentials");
        res.status(401);
        res.json({ "error": "Insufficient credentials" });
        return;
    }
    const newAdminUser = new adminModel({
        "collegeName": clgName,
        "hostelName": hostelName,
        "password": password
    })

    newAdminUser.save()
        .then(() => {
            const id = newAdminUser._id.toString();
            const accessToken = jwt.sign({ "id": id }, process.env.ACCESS_TOKEN_SECRET);
            res.json({
                "jwtToken": accessToken,
                "id": id
            });
            return;
        })
        .catch((err) => {
            console.log("ADMIN CREATE ERROR");
            console.log(err);
            res.status(500);
            res.json({ "error": "Internal Server Error" });
            return;
        })

}

function login(req, res) {
    const { id, password } = req.body;
    if (!id || !password) {
        console.log("Insufficient Credentials");
        res.status(401);
        res.json({ "error": "Insufficient Credentials" });
        return;
    }
    adminModel.findById(id)
        .then((adminUser) => {
            if (!adminUser) {
                console.log("Invalid user id");
                res.status(401);
                res.json({ "error": "Invalid User ID" });
                return;
            }

            bcrypt.compare(password, adminUser.password, (err, result) => {
                if (err) {
                    console.log("Admin credential check error");
                    console.log(err);
                    res.status(500);
                    res.json({ "error": "Internal Server Error" });
                    return;
                }

                else if (!result) {
                    console.log("Wrong password");
                    res.status(403);
                    res.json({ "error": "Wrong password" });
                    return;
                }

                else {
                    const accessToken = jwt.sign({ "id": id }, process.env.ACCESS_TOKEN_SECRET);
                    res.json({ "jwtToken": accessToken });
                    return;
                }
            });
        }
        )
        .catch((err) => {
            console.log("Admin Login Error");
            console.log(err);
            res.status(500);
            res.json({ "error": "Internal Server Error" });
            return;
        })
}


function hostelInfo(req, res) {

    studentModel.find({ "hostelID": req.id }, (err, studentPointer) => {

        if (err) {
            console.log("Mongoose query error adminfunctinality.js:89");
            console.log(err);
            res.status(500);
            res.json({ "error": "Internal Server Error" });
        }

        let info = {
            "vegCount": 0,
            "nonVegCount": 0,
            "studentInfo": []
        };

        for (let i = 0; i < studentPointer.length; i++) {
            const currentStudent = studentPointer[i];

            const newStudentInfo = {
                "name": currentStudent.name,
                "foodPrefarence": currentStudent.foodPrefarence,
                "presentStatus": currentStudent.presentStatus,
                "personalNumber": currentStudent.personalNumber,
                "guardianNumber": currentStudent.guardianNumber,
                "roomNo": currentStudent.roomNo
            };

            info.studentInfo.push(newStudentInfo);

            if (currentStudent.presentStatus === "present") {
                if (currentStudent.foodPrefarence === "veg") {
                    info.vegCount += 1;
                }
                else if (currentStudent.foodPrefarence === "nonVeg") {
                    info.nonVegCount += 1;
                }
            }

        }

        res.json(info);
        return;
    })
}

module.exports = {
    "createNewAdmin": createNewAdmin,
    "login": login,
    "hostelInfo": hostelInfo
};