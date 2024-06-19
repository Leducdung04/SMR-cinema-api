const mongoose = require("mongoose");
const Scheme = mongoose.Schema;
const Bills = new Scheme(
  {
    payment_amount: { type: Number },
    Number_of_tickets:{type: Number },
    Payment_methods:{type: Number },
    date:{type: String },
    time:{type: String },
    id_uer:{type: mongoose.Schema.Types.ObjectId, ref: 'uers'},
    status:{type: Number },
    img:{type: Array}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("bills", Bills);
