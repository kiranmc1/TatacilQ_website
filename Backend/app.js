const express = require('express');

const app = express();

const UseRoutes = require('./src/Routers/userRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/",(req,res)=>{
   res.json({
    status:"Up"
   });
});

app.use('/Users',UseRoutes)



app.listen(2000,()=>{
   console.log("app is running")
})

