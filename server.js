const { response } = require('express');
const express = require('express');
const app = express();
const mongodb = require('mongodb');
var bodyparser = require('body-parser');
app.use(bodyparser.json()); 

// for parsing application/xwww-
app.use(bodyparser.urlencoded({ extended: true })); 

app.set(`view engine`, `ejs`);
//getting database connection
const url = 'mongodb://localhost:27017/';
var db = null;
var total = 0;
mongodb.MongoClient.connect(url,(error,client)=>{
     if(error)console.log(error);
     else{
          db = client.db("Note");
          if(db){
               console.log("SuccessfullyConnected to database!");
          }
          else{
               console.log("Failed to Connect!");
          }
     }
})

app.get('/',(req,res)=>{
     if(db){
          console.log("Yes");
          db.collection("Notes").find({}).toArray((error,result)=>{
               if(error){
                    res.render("index.ejs");
               }
               else {
                    console.log(result);
                    db.collection("Notes").count({},(error,result)=>{
                         if(error) console.log("Error in count!");
                         else{
                              total = result;
                              console.log(result);
                         }
                    })
                    res.render("index.ejs",{result:result});
               }
          });
     }
});
app.post('/',(req,res)=>{
     console.log("POST");
     console.log(req.body.note);
     if(req.body.note){
          console.log("Not null",req.body.note);
          if(db){
               console.log("DB alive");
               db.collection("Notes").count({},(error,result)=>{
                    if(error) console.log("Error in count!");
                    else{
                         total = result;
                         console.log(result);
                    }
               })
               console.log(total+1);
               total = total+1;
               var obj = {id:total,note:req.body.note,date:Date.now()};
               db.collection("Notes").insertOne(obj,(error,response)=>{
                    if(error) console.log("Error in insertion!");
                    else console.log("inserted!");
               })
          }
     }
     res.redirect('/');
});

app.get('/delete/:id',(req,res)=>{
     console.log(req.params.id,"Delete called!");
     var myquery = {id:parseInt(req.params.id)};
     console.log(myquery);
     db.collection("Notes").deleteOne(myquery, function(err, obj) {
          if (err) console.log(err);
          else console.log("1 document deleted");
     });
     res.redirect('/');
});
app.get('/edit/:edit',(req,res)=>{
     res.render("edit.ejs",{edit:req.params.edit});
});

app.post('/edit/:edit',(req,res)=>{
     console.log(req.params.edit)
     if(db){
          console.log("Entered!");
          var query = {id : parseInt(req.params.edit)};
          var newvalues = {$set:{note : req.body.note}};
          db.collection('Notes').updateOne(query,newvalues,(error,res)=>{
               if(error) console.log("Error in update");
               else console.log("Success");
          });
     }
     res.redirect('/');
});

app.listen(3000,(error,res)=>{
     if(error)console.log(error);
     else{
          console.log("Listening to 3000...!");
     }
})