require("dotenv").config()
const express = require('express')
const PORT = 3000
const app = require("liquid-express-views")(express());
const methodOverride = require("method-override")
const TransactionRouter = require("./controllers/transactions")
const path = require("path")


/////////////////////////////////////////////////////
/// Middleware
/////////////////////////////////////////////////////
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"))
app.use(methodOverride("_method"));




/////////////////////////////////////////////////////
// Routes
/////////////////////////////////////////////////////
app.use("/transaction",TransactionRouter)



//////////////////////////////////////////////
// Server Listener
//////////////////////////////////////////////
app.listen(PORT, () => {
    console.log(`Port is listening on ${PORT}`)
})




