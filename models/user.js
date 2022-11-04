
const mongoose = require('../config/database');

const { Schema, model } = mongoose;



////////////////////////////////////////////////
// Define Model
////////////////////////////////////////////////



// Embedding seems like a better idea than referencing here.
//make Transaction schema
const transactionSchema  = new Schema({
    payer:{type:String},
    points:{type:Number},
    timestamp:Date,
    used:{type:Boolean,default:false}
    })

// make Product schema
const userSchema  = new Schema({
username: { type: String, required: true, unique: true },
transactions:[transactionSchema]
},{
    timestamps: true,
    toJSON: { virtuals: true }
})




const User = model("User", userSchema);



///////////////////////////////////////////////////
// Export Model
///////////////////////////////////////////////////
module.exports = User;