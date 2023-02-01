const mongoose = require("mongoose");
// NOTE - "validator" external library and not the custom middleware at src/middlewares/validate.js
const validator = require("validator");
const config = require("../config/config");
const bcrypt  = require("bcryptjs")

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Complete userSchema, a Mongoose schema for "users" collection
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email:{
      type:String,
      required:true,
      trim:true
    },
    password: {
      type: String,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    walletMoney: {
      type:Number,
      required: true,
      default:500
    },
    address: {
      type: String,
      default: config.default_address,
    },
  },
  // Create createdAt and updatedAt fields automatically
  {
    timestamps: true,
  }
);

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement the isEmailTaken() static method
/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
  const user = await this.findOne({email});
 if(!user){
  return false
 }
 return true
}

/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */

// Hash the password before saving the user
userSchema.pre("save", async function (next) {
  const user = this;

  // Hash the password only if it has been modified or is new
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Method to check if an input password is matching with the stored one
userSchema.methods.isPasswordMatch  = async function (password) {
  const user = this;
  return await bcrypt.compare(password, user.password);
};
/**
 * In this version, the bcryptjs library is imported at the top, which is used to hash the password before saving it to the database.
A pre hook added to the schema to perform the hashing operation before saving the document. The userSchema.pre("save", async function (next) {...} is a middleware, Mongoose's way to add additional functionality to the built-in save method. The method compares the password field of the document being saved to check if the password has been modified, if it has, it uses bcrypt's hash() method to create a new hashed password.

Also, it has added a method to check if an input password is matching with the stored one userSchema.methods.isValidPassword, which uses bcrypt's compare() method to compare the input password with the hashed password stored in the database.
 */

/**
 * Check if user have set an address other than the default address
 * - should return true if user has set an address other than default address
 * - should return false if user's address is the default address
 *
 * @returns {Promise<boolean>}
 */
 userSchema.methods.hasSetNonDefaultAddress = async function () {
  const user = this;
   return user.address !== config.default_address;
};





// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS
/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * @typedef User
 */
const User= mongoose.model('User',userSchema);
module.exports= {User};
