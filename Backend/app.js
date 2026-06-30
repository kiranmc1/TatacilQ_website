require('dotenv').config();
const express = require('express');

const app = express();

const UseRoutes = require('./src/Routers/userRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware to allow requests from frontend during development
app.use((req, res, next) => {
   const origin = req.headers.origin;
   const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

   if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
   }
   res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
   );
   res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
   if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
   }
   next();
});

app.get("/",(req,res)=>{
   res.json({
    status:"Up"
   });
});

app.use('/Users',UseRoutes)



app.listen(2000,()=>{
   console.log("app is running")
})

