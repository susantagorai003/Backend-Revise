const mongoose=require('mongoose')
const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type:Schema.Types.ObjectId, // one who is subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,  // one who is being subscribed to
        ref:"User"
    }

},{timestamps:true});

module.exports = mongoose.model('Subscription', subscriptionSchema); 