const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cfjij.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 5000
const app = express()
app.use(cors());
app.use(bodyParser.json());
const serviceAccount = require("./configs/burj-al-arab-f78c7-firebase-adminsdk-ltynk-1be5e07bf8.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:process.env.FIRE_DB
});


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  app.post('/addBooking',(req, res)=>{
      const newBooking = req.body;
      bookings.insertOne(newBooking)
      .then(result=>{
         // console.log(result);
         res.send(result);
      })
      console.log(newBooking);
  });
  app.get('/bookings', (req, res)=>{  
   const bearer = req.headers.authorization;
   if (bearer && bearer.startsWith('Bearer ')){
     const idToken= bearer.split(' ')[1];
     console.log({idToken});
     admin.auth().verifyIdToken(idToken)
     .then(function(decodedToken) {          
       const tokenEmail= decodedToken.email;
       const queryEmail= req.query.email;
       console.log({tokenEmail,queryEmail});
       if(tokenEmail == queryEmail){
        bookings.find({email: req.query.email})
        .toArray((err,documents)=>{
            res.status(200).send(documents);
        })         
       }
       else{
        res.status(401).send('un-authorized access')
       }
     }).catch(function(error) {   

     });
     
   }
   else {
    res.status(401).send('un-authorized access')
  }
 
}) 
 
});
app.listen(process.env.PORT || port)