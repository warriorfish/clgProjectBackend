const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
    "name": {
        "type": "String",
        "required": true
    },

    "password": {
        "type": "String",
        "required": true
    },

    "hostelID": {
        "type": "String",
        "required": true
    },

    "foodPrefarence": {
        "type": "String",
        "required": true,
        "enum": ["veg", "nonVeg"],
        "default": "veg"
    },

    "presentStatus": {
        "type": "String",
        "required": true,
        "enum": ["present", "absent"],
        "default": "present"
    },

    "personalNumber": {
        "type": "String",
        "required": true,
        "minlength": 10,
        "maxlength": 10,
        "unique": true
    },

    "guardianNumber": {
        "type": "String",
        "required": true,
        "minlength": 10,
        "maxlength": 10,
        "unique": true
    },

    "roomNo": {
        "type": Number,
        "required": true,
        "min": 1
    }
});

studentSchema.pre("save", async function () {
    const hashedPassword = bcrypt.hashSync(this.password, 10);
    this.password = hashedPassword;
})

const studentModel = mongoose.model("Students", studentSchema);

module.exports = studentModel;