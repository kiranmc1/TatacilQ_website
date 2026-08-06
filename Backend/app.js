require('dotenv').config();
const express = require('express');
const paymentController = require('./src/controllers/paymentController');

const app = express();

const UseRoutes = require('./src/Routers/userRouter');
const allowedOrigins = [process.env.FRONTEND_URL, ...(process.env.CORS_ALLOWED_ORIGINS || '')]
  .split(',')
  .map((origin) => origin && origin.trim())
  .filter(Boolean);

app.post('/Users/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware to allow requests from frontend during development
app.use((req, res, next) => {
   const origin = req.headers.origin;

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

const port = Number(process.env.PORT) || 2000;
app.listen(port,()=>{
   console.log(`app is running on port ${port}`)
})

