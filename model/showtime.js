const mongoose = require("mongoose");
const Scheme = mongoose.Schema;
const Showtimes = new Scheme(
  {
    date: { Type: String },
    room: { Type: String },
    time: { Type: String },
    fare: { Type: Number },
    id_movie: {type: mongoose.Schema.Types.ObjectId, ref: 'movie'}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("showtimes", Showtimes);
