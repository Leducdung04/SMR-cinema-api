const mongoose = require("mongoose");
const Scheme = mongoose.Schema;
const Movies = new Scheme(
  {
    name: { type: String },
    category:{type: String },
    content:{type: String },
    director:{type: String },
    performer:{type: String },
    time:{type: Number },
    Release_date:{type: String },
    img:{type: String}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("movies", Movies);
