const express = require("express");
const cors = require("cors");
const path = require('path');
/* const connectDB = require("./config/db");

dotenv.config();
connectDB(); */

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// for development 
/* app.get("/", (req, res) => {
    res.send("QuickCart API is running...");
}); */



let userRoutes = require('./routes/user.js');
//var loginRouter = require('./routes/login.js');
let adminRoutes=require('./routes/admin.js');
let productRoutes=require('./routes/products.js');
let orderRoutes=require('./routes/order.js');

app.use('/user/', userRoutes);
app.use('/admin/',adminRoutes);
app.use('/product/',productRoutes);
app.use('/order/',orderRoutes);

app.use('/uploads',express.static("uploads"))

// production 
app.use(express.static(path.join(__dirname, '..','public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..','public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

