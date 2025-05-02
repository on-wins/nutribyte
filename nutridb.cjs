const express = require("express");
const router = express.Router();
const mongoose = require("./nutridbconn.cjs");
const numberInt = require("mongoose-int32");

//Make sure that the datatypes here match with datatypes in MongoDB
const branded_food_schema = new mongoose.Schema({
    fdcId: Number,
    description: String,
    brandOwner: String,
    marketCountry: String,
    gtinUpc: String,
    ingredients: String,
    servingSize: Number,
    servingSizeUnit: String,
    householdServingFullText: String,
    brandedFoodCategory: String,
    publicationDate: String
}, {collection: "branded_foods"});

const Food = mongoose.model("Food", branded_food_schema);

const food_nutrients_schema = new mongoose.Schema({
    fdcId: Number,
    nutrientId: Number,
    nutrientName: String,
    nutrientNumber: String,
    nutrientUnit: String,
    amount: Number
}, { collection: "food_nutrients" });

const Nutrient = mongoose.model("Nutrient", food_nutrients_schema);

const foodLogSchema = new mongoose.Schema({
    userId: String,
    log: [
        {
            fdcId: Number,
            count: Number
        }
    ]
}, { collection: "food_logs" });

const FoodLog = mongoose.model("FoodLog", foodLogSchema);

// Test for GET request 
router.get("/hello", function (req, res) {
   res.send("<h1>Hello, Mongodb!</h1>");
});

// Test for MongoDB connectivity 
router.get("/food", async function(req, res) {
    try {
        const searchString = req.query.searchString || "";
        const category = req.query.category;

        const query = {
            description: { "$regex": searchString, "$options": 'i' }
        };        

        if (category && category !== "All") {
            query.brandedFoodCategory = category;
        }

        const food = await Food.find(query).limit(50); // Limit AFTER filtering
        res.json(food);
    } catch (e) {
        res.status(400).send(e.message);
    }
}); 

// Nutrients route
router.get("/nutrients/:fdcId", async function(req, res) {
    try {
        const nutrients = await Nutrient.find({ fdcId: Number(req.params.fdcId) });
        res.json(nutrients);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

// GET
router.get("/log/:userId", async (req, res) => {
    try {
        const userLog = await FoodLog.findOne({ userId: req.params.userId });
        res.json(userLog ? userLog.log : []);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error fetching log");
    }
});

// POST
router.post("/log/:userId", async (req, res) => {
    try {
        await FoodLog.findOneAndUpdate(
            { userId: req.params.userId },
            { log: req.body },
            { upsert: true }
        );
        res.sendStatus(200);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error saving log");
    }
});

module.exports = router;