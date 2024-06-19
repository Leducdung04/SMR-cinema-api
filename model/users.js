const mongoose = require("mongoose");
const Scheme=mongoose.Schema;

const users= new Scheme({
    name: { type: String,required: true},
    email: { type: String,required: true,unique: true },
    phone: { type: String ,required: true,unique: true },
    password: { type: String ,required: true},
    date: { type: String ,required: true},
    sex: { type: String ,required: true},
},{
    timestamps:true
})

module.exports= mongoose.model('uers',users)

