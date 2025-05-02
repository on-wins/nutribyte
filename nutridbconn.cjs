require('dotenv').config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;

try {
    mongoose.connect(uri, {dbName:'nutribyte'});
    console.log("Connected to Mongodb");
} catch (e) {
    console.log(e);
    console.log("Mongodb connection failed");
}

module.exports = mongoose;