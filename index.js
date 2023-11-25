
import express from "express";
import path from "path";
import mongoose from "mongoose";
import { name } from "ejs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from  "bcrypt";
mongoose.connect("mongodb://localhost:27017").then(
console.log("database connected")

).catch((error) => console.log(error))
const app = express();

const userschemaa =  new mongoose.Schema({
  name : String,
  email : String,
  password : String
});

const User = mongoose.model("User",userschemaa);

app.set("view engine", "ejs")

app.use(express.static(path.join(path.resolve(), "public")))
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())


app.get("/", (req,res) => {
   
    const pathlocation  = path.resolve();
    console.log(pathlocation);
   
    res.render("index")

    const {token} = req.cookies;
    console.log(req.cookies)
    const decoded = jwt.verify(token,'sdsdsd');
    console.log(decoded)
   

    if(token) {
        res.render("logout",{name: req.user.name})
    }
    else {
        res.render("login")
    }

    
});

      


    



app.post("/", async (req,res) => {
    const {token} = req.cookies;

    if(token) {
        const decoded = jwt.verify(token,"sdsdsd");

        req.user = await User.findById(decoded._id);
        console.log(req.user)
        
        res.render("logout")
    }
    else {
        res.render("login")
    }
 

 console.log(req.body);
 

 
});

app.get("/login", async (req,res) => {
    const {token} = req.cookies;


    if(token) {
        const decoded = jwt.verify(token,"sdsdsd");

        req.user = await User.findById(decoded._id);
        console.log(req.user)
        res.render("logout")
    }
    else {
        res.render("login")
    }
})



app.post("/login", async  (req,res) => {

    const {name,email,password } = req.body;

    let user = await User.findOne({email})
    if(!user) {
        res.redirect("/register")
        return console.log("register first")
    }

    const checkpassword =  bcrypt.compare(password,user.password);

    if(!checkpassword) return res.render("login",{messsage : "incorrectpass"})
    
    const token = jwt.sign({_id : user._id},"sdsdsd");
    res.cookie("token", token, {
        httpOnly:true
    })
   res.redirect("/")
 


})


app.get("/logout", async (req,res) => {
  const {token} = req.cookies;

  const decoded = jwt.verify(token,"sdsdsd");
  req.user = await User.findById(decoded._id)
  

    res.render("logout",{name : req.user.name});
})


app.post("/logout",(req,res) => {
    
    res.cookie("token",null,{
        expires: new Date(Date.now())
       
    })
    console.log("loged out")
    res.redirect("/")
})

app.get("/contact",(res,req) => {
   
   
    
})

app.get("/success", (req,res) => {
    res.render("success");
})



app.get("/register", (req,res) => {
    res.render("register")
})

app.post("/register",async (req,res) => {
    const {name,email,password}  = req.body;


    const hashedpassword = await bcrypt.hash(password,10);

  let userr = await User.findOne({email})
  if(userr) {
    res.redirect("/login ")
  }

   const user = await User.create({
        name,
        email,
        password: hashedpassword,
    });

    const token = jwt.sign({_id : user._id},"sdsdsd");
    res.cookie("token", token, {
        httpOnly:true
    })
   res.redirect("/")
})


app.listen(5000,() => {
    console.log("server is working");
})