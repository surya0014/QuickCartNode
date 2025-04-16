var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var config = require("../configuration.json");
const { MongoClient } = require("mongodb");
const ObjectID = require("mongodb").ObjectId;
var dbURL = config.mongoDBURL;
let db;

MongoClient.connect(dbURL)
  .then((mydb) => {
    db = mydb.db();
    console.log("user.js : DB connection established!");
  })
  .catch((err) => {
    console.log("user.js : ERROR : DB connection failed using mongodb");
    return err;
  });

router.post("/addNewUser", async function (req, res) {
  //res.header("Strict-Transport-Security", "max-age=604800"); // 1 week in seconds
  //res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  console.log("-----addNewUser------");

  console.log(req.body);
  try {
    let emailId = req.body.emailId;
    let pwd = req.body.password;
    let userName = req.body.userName;
    const password = bcrypt.hashSync(pwd, config.saltRounds);
    let customerID = new ObjectID();

    const result = await db.collection("users").insertOne({
      _id: customerID,
      emailId: emailId,
      password: password,
      userName: userName,
    });

    console.log("Data inserted:", result);
    return res
      .status(200)
      .json({ message: "User Successfully Added", userId: customerID });
  } catch (error) {
    console.error("Error in creating new user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  console.log("-----login------");
  console.log(req.body);
  const { emailId, password } = req.body;

  try {
    // Search for the user in the database
    const user = await db.collection("users").findOne({ emailId });
    console.log(user);
    if (!user) {
      console.log("Invalid user credentials");
      return res.status(401).json({ message: "Invalid user credentials" });
    }

    // Compare password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(passwordMatch);
    if (!passwordMatch) {
      console.log("Invalid password credentials");
      return res.status(401).json({ message: "Invalid password credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, emailId: user.emailId, userName: user.userName },
      config.bcryptSecretKey, // Secret key for signing the JWT
      { expiresIn: "1h" } // Token expiration time (1 hour)
    );
    let cartOrder = [];
    
    console.log(user.cartProducts);
    if (user.cartProducts) {
      if (user.cartProducts.length > 0) {cartOrder = user.cartProducts;
    }
  }
     let userRes={ token:token, cartOrder: cartOrder };
     console.log(userRes);
    // Send token in response
    return res.status(200).json(userRes);
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/shareCartItem", async function (req, res) {
  console.log("------shareCartItem()------");

  console.log(req.body);
  let cartOwnerId = req.body.cartOwnerId;
  let recipientMailId = req.body.cartDetails.recipientMailId;
  let cartProducts = req.body.cartDetails;
  cartProducts.cartOwnerId = cartOwnerId;
  console.log(recipientMailId + " : " + cartOwnerId + " : " + cartProducts);
  try {
    const user = await db.collection("users").updateOne(
      { emailId: recipientMailId },
      { $push: { cartProducts: cartProducts } } // Append one item
    );

    return res.status(200).json({ message: "orders added to user" });
  } catch (error) {
    console.log("Error:", error);
    return res
      .status(500)
      .json({ message: "Error in getting category List", error: error });
  }
});

module.exports = router;

/*  await db.collection("users").insertOne({ "_id": cutomerID, "emailId":emailId ,"password":password}, function (err1, dbResult) {
    if (err1) {
      console.log("Error in creating newCustomer :  " + err1);
      return res.status(500).json(err1);
    }
    else {
        console.log("data inserted");
        return res.status(200).json({ message: "User Successfully Added", userId: customerID });
    }
    }); */
