const mongoose = require("mongoose");

const expensesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    related_value : {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    userId: {
        type: String
    }

});

module.exports = mongoose.model("expense", expensesSchema);