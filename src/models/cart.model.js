const mongoose = require('mongoose');
const { productSchema } = require('./product.model');
const config = require("../config/config");
const { string } = require('joi');

// TODO: CRIO_TASK_MODULE_CART - Complete cartSchema, a Mongoose schema for "carts" collection
const cartSchema = mongoose.Schema(
  {
    email:{
type:String,
required:true,
trim:true,
  },
  cartItems:[{
    product:productSchema,
    quantity:Number
  }],
  paymentOption:{
    type:String,
    default:"PAYMENT_OPTION_DEFAULT"
  }
  },
  {
    timestamps: false,
  }
);


/**
 * @typedef Cart
 */
const Cart = mongoose.model('Cart', cartSchema);

module.exports.Cart = Cart;