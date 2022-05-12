const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    "collegeName": {
        "type": "String",
        "required": true
    },

    "hostelName": {
        "type": "String",
        "required": true
    },

    "password": {
        "type": "String",
        "required": true
    }
});

adminSchema.pre("save", async function () {
    const hashedPassword = bcrypt.hashSync(this.password, 10);
    this.password = hashedPassword;
})


const adminModel = mongoose.model("Admin", adminSchema);

module.exports = adminModel;
