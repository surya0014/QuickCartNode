var express = require("express");
var router = express.Router();
const path = require("path");

var config = require("../configuration.json");
const { MongoClient } = require("mongodb");
const ObjectID = require("mongodb").ObjectId;
require('dotenv').config();
var dbURL = process.env.mongodbUrl;
//config.mongoDBURL;
let db;

MongoClient.connect(dbURL)
  .then((mydb) => {
    db = mydb.db();
    console.log("product.js : DB connection established!");
  })
  .catch((err) => {
    console.log("product.js : ERROR : DB connection failed using mongodb");
    console.error(err);
    return err;
  });

router.get("/getCategoryList",async function (req, res) {
  console.log("------getCategoryList()------");

  try {
    const category= await db.collection('categories').find({},{projection:{category:1,_id: 0}}).toArray();
  
    console.log(category[0].category);
    
    return res.status(200).json(category[0].category)

  } catch (error) {
    console.log("Error:", error)
    return res.status(500).json({"message":"Error in getting category List","error":error})
  }
});


  

module.exports = router;
