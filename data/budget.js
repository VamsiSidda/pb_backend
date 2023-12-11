const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
    title : {
        type: String,
        require: true
    },
    related_value : {
        type: Number,
        required: true
    },
    color : {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^#[0-9A-Fa-f]{6}$/.test(value);
            },
            message: "Color must be a valid hexadecimal ",
        },
    },
    userId: {
        type: String,
    }
});

module.exports = mongoose.model("budget", budgetSchema)