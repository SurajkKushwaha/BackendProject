// require('dotenv').config({path: './env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config(
    { path: './env' }
);

connectDB()







//first approach to connect to MongoDB
// import express from "express";

// const app = express();


// //better  to use iife for immediately invoking
// ;( async ()=>{
//     try {
//           await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//           app.on("error",(error)=>{
//             console.log(error);
            
//           })

//           app.listen(process.env.PORT, () => {
//             console.log('app is listening on port', process.env.PORT);  
            
//           })
        
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//         throw error;
//     }
// } )()