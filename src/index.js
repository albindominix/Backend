const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");

let server;
// console.log(config.port);
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port
mongoose.connect(config.mongoose.url,{useNewUrlParser: true,useUnifiedTopology: true})
.then(()=>app.listen(config.port, ()=>console.log(`listening on port: ${config.port}`)))
.catch(err=>console.log(`error: ${err}`))

