const mongoose = require("mongoose");
const Scheme=mongoose.Schema;

const Tickets= new Scheme({
    chair:{type:String,required: true},
    pay:{type:String,required:true},
    status:{type:String,required:true},
    id_showtimes:{type: mongoose.Schema.Types.ObjectId, ref: 'showtimes'},
    id_users:{type: mongoose.Schema.Types.ObjectId, ref: 'uers'},
    id_bills:{type: mongoose.Schema.Types.ObjectId, ref: 'bills'},
},{
    timestamps:true
})

module.exports= mongoose.model('tickets',Tickets)

