const httpStatus = require('http-status');
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const {getProductById}= require("./product.service");
const { cartService } = require(".");
// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const userCart = await Cart.findOne({ email: user.email });
  console.log(userCart,"userCart ")
  if (!userCart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  } 
  await userCart.save()
  return userCart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  const email = user.email;
  let userCart = await Cart.findOne({ email: user.email });

  if (!userCart) {
    try {
      userCart = await Cart.create({ email });
      if (!userCart) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "");
      }
    } catch (err) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "");
    }
  }
  if (userCart) {
    const {cartItems} = userCart
    console.log(cartItems)
    cartItems.forEach(item=>{
      if(item.product._id.toString() === productId.toString() ){
        throw new ApiError(httpStatus.BAD_REQUEST,'Product already in cart. Use the cart sidebar to update or remove product from cart')
      }
      
    })
    const product = await getProductById(productId)
    console.log(product)
    if(!product){
      throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database")
    }
    userCart.cartItems.push({product,quantity})
    await userCart.save()
    return userCart;
  }
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const email = user.email;
let userCart  = await Cart.findOne({email:user.email})
if(!userCart){
  throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart. Use POST to create cart and add a product")
}
const product = await getProductById(productId)
if(!product){
  throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database")
}
 
if(userCart){
const {cartItems} = userCart
console.log(cartItems,'cartItems')
// cartItems.forEach(item=>{
//   console.log(item,"cartItem item")
//   console.log(item)
  
// })}
let productFind= false;
cartItems.forEach(item=>{
  if(item.product._id.toString() === productId){
    productFind= true
    item.quantity = quantity
  }

})
if(!productFind){
  throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
}
userCart.cartItems = cartItems;
await userCart.save()
return userCart;
}; }     

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
const email = user.email;
let userCart  = await Cart.findOne({email})

if(!userCart){
  throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart")
}

const {cartItems} = userCart
console.log(cartItems)
cartItems.forEach(item=>{
// console.log(productId,"item.product._id")
  
  if(item.product._id.toString() !== productId.toString()){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
  }
}) 

// const itemIndex =  userCart.cartItems.findIndex((item)=>{item.product._id === productId})
// if(itemIndex === -1){
//   throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
// }
// // console.log(itemIndex,"itemIndex")
// userCart.cartItems.splice(itemIndex,1)
// await userCart.save()
// // return userCart;

const productIndex=userCart.cartItems.findIndex((item)=>item.product._id==productId);
  if(productIndex==-1)
    throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
    userCart.cartItems.splice(productIndex,1)
  await userCart.save();

};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
 const checkout = async (user) => {
  const userCart = await Cart.findOne({ email: user.email });
  let wallet =  user.walletMoney
  if (!userCart) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Cart is not present for the user"
    );
  }
  if (!userCart.cartItems.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User's cart does not have any products"
    );
  }
  let address = await user.hasSetNonDefaultAddress();
  if (!address) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User must specify a valid address"
    );
  }
  let total = 0;
  userCart.cartItems.forEach((item) => {
    total = total + (item.product.cost * item.quantity);
  });

  if (wallet < total) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Wallet Balance is insufficient"
    );
  }

  user.walletMoney = wallet - total;
  userCart.cartItems = [];
  await userCart.save();
  return userCart;
};


module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
