const mongoose=require('mongoose');
const Scheme=mongoose.Schema;
const Videos=new Scheme({
    video:{type: Array},
    content:{type: String},
    comment:{type:Array},
    id_movie:{type: mongoose.Schema.Types.ObjectId, ref: 'movie'}
},{
    timestamps:true
})

module.exports=mongoose.model('videos',Videos)