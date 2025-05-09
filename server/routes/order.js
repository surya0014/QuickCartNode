var express = require("express");
var router = express.Router();
const path = require("path");

var config = require("../configuration.json");
const { MongoClient } = require("mongodb");
const ObjectID = require("mongodb").ObjectId;

require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // test key
var dbURL = process.env.mongodbUrl;
let db;

MongoClient.connect(dbURL)
  .then((mydb) => {
    db = mydb.db();
    console.log("order.js : DB connection established!");
  })
  .catch((err) => {
    console.log("order.js : ERROR : DB connection failed using mongodb");
    return err;
  });

router.post("/create-checkout-session", async function (req, res) {
  console.log("------create-checkout-session()------");

  console.log(req.body);
  let totalAmount=Number(req.body.totalPrice)*100;
  console.log(typeof totalAmount)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: "QuickCart Orders",
          },
          unit_amount: totalAmount//150000, // $15.00 CAD (in cents)
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    // success_url: "http://localhost:5000/payment",
    // cancel_url: "http://localhost:5000/cancel",
    success_url: "https://quickcartnode.onrender.com/payment",
    cancel_url: "https://quickcartnode.onrender.com/cancel",
   
  });

  res.json({ id: session.id });
  try {
    //const category= await db.collection('categories').find({},{projection:{category:1,_id: 0}}).toArray();
    //console.log(category[0].category);
    //return res.status(200).json(category[0].category)
  } catch (error) {
    console.log("Error:", error);
    return res
      .status(500)
      .json({ message: "Error in getting category List", error: error });
  }
});

module.exports = router;
