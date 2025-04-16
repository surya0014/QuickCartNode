var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require('path');
require('dotenv').config();
var config = require("../configuration.json");
const { MongoClient } = require("mongodb");
const ObjectID = require("mongodb").ObjectId;


var dbURL = process.env.mongodbUrl;
let db;

MongoClient.connect(dbURL)
  .then((mydb) => {
    db = mydb.db();
    console.log("admin.js : DB connection established!");
  })
  .catch((err) => {
    console.log("admin.js : ERROR : DB connection failed using mongodb");
    return err;
  });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    console.log(file.originalname);
    const fileNameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
    cb(null,fileNameWithoutExt +"_"+Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/addProducts", upload.single("productImage"), function (req, res) {
  try {
    console.log("-----addProducts---");
    const file = req.file;
    console.log(req.body.productName);
    console.log(file)
    if (!file) {
      return res.status(500).json({ message: "No file uploaded" });
    }
    let customerId = new ObjectID();
    const imagePath = "uploads/" + file.filename; 
    console.log(" dimensions : "+req.body.dimensions);

    let dimensions=JSON.parse(req.body.dimensions);

    const result= db.collection("product").insertOne({
      _id: customerId,
      productName:req.body.productName,
      description:req.body.description,
      price:req.body.price,
      currency:req.body.currency,
      category:req.body.category,
      availableStock:req.body.availableStock,
      manufacturer:req.body.manufacturer,
      model:req.body.model,
      tags:req.body.tags,
      productImage:imagePath,
      dimensions:dimensions,
      productFeature:req.body.productFeatures
    });

    return res.status(200).json({ message: "Product Added" });
  } catch (error) {
    console.log("error :"+error)
    return res.status(500).json({ message: "File upload failed", error: error.message });
  }
});



module.exports = router;
