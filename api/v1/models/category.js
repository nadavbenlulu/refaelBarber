const mongoose=require('mongoose');

const Schema= new mongoose.Schema({
    cid:Number,
    catname:String
});
module.exports=mongoose.model('category',Schema);