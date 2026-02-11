const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: String,
    email: { type: String, required: true, unique: true }, // אימייל ייחודי לכל משתמש
    password: { type: String, required: true },
    uid: Number 
});

module.exports = mongoose.model('user', userSchema);






// const mongoose=require('mongoose');

// const Schema= new mongoose.Schema({
//     uid:Number,
//     username:String,
//     password:String
// });
// module.exports=mongoose.model('user',Schema)