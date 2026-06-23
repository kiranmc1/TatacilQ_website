const express = require('express');

const app = express();

const UseRoutes = require('./src/Routers/userRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware to allow requests from frontend during development
app.use((req, res, next) => {
   res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
   res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
   );
   if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
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

