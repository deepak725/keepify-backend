const express = require('express');
const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
const { Schema, model } = mongoose
const { connectDatabase } = require("./DB/dbconnect.js")
const app = express();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
app.use(express.json());
connectDatabase()

const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions))

app.get('/', (req, res) => {
  res.send('Hello Express app!kya baaat haiiii')
});

const date = new Date();
//Notes model
const sch = {
    user:{
        
        id:Schema.Types.ObjectId
    },
    note:{
        title:String,
        content:String,
        tag:[],
        color:String
    },
    createdAt:{
            time:Date
    }
    
    
}

//Todo schema
const sch2 = {
    user:{
        id:Schema.Types.ObjectId
    },
    todo:{
        title:String,
        selected:Boolean,
        important:Boolean,
        tag:[]  
    },
    createdAt:{
        time:Date
    }
}
//Notes model
const monmodel = mongoose.model("Notes",sch)


//Todo model
const monmodel2 = mongoose.model("Todo",sch2)


const sch3 = 
{
        name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
	
}
const userModel = mongoose.model("User",sch3)


//user route
app.get('/username',async (req,res)=>{
    const token = req.headers['x-access-token']
    try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email
		const user = await userModel.findOne({ email: email })
        console.log(user.name);
		return res.json({ status: 'ok', data: user })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}
})

app.delete('/deleteuser',async (req,res) =>{
    const token = req.headers['x-access-token']
    try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email
		//console.log(decoded);
        const user = await userModel.findOne({ email: email })
        const todo = await monmodel2.deleteMany({"user.id":user._id})
        const notes = await monmodel.deleteMany({"user.id":user._id})
        const user2 = await userModel.deleteOne({"_id":user._id})
        console.log(todo);
        console.log(notes);
        console.log(user2);
		return res.json({ status: 'ok', data: user2 })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	} 
} )

//Login and register route
app.post('/register', async (req, res) => {
	console.log(req.body)
	try {
		const newPassword = await bcrypt.hash(req.body.password, 10)
		await userModel.create({
			name: req.body.name,
			email: req.body.email,
			password: newPassword,
		})
		res.json({ status: 'ok' })
	} catch (err) {
        console.log(err);
		res.json({ status: 'error', error: 'Duplicate email' })
	}
})

app.post('/login', async (req, res) => {
	const user = await userModel.findOne({
		email: req.body.email,
	})

	if (!user) {
		return res.json({ status: 'error', error:"Email not found"  })
	}

	const isPasswordValid = await bcrypt.compare(
		req.body.password,
		user.password
	)

	if (isPasswordValid) {
		const token = jwt.sign(
			{
				name: user.name,
				email: user.email,
			},
			'secret123'
		)

		return res.json({ status: 'ok', user: token })
	} else {
		return res.json({ status: 'error', user: false })
	}
})


//Todo  router 
app.post("/todo",async(req,res)=>{

    
    const token = req.headers['x-access-token']
    try {
            const decoded = jwt.verify(token, 'secret123')
            const email = decoded.email
            const user = await userModel.findOne({ email: email })
            console.log(user.name);
            console.log(user.id);
            console.log("inside a post function!");
            const data = new monmodel2({
                user:{
                    id:user.id
                },todo:{
                    title:req.headers.title,
                    tag:req.headers.tag,
                    important:req.headers.important,
                    selected:req.headers.selected,
                
                },
                createdAt:{
                    time:Date.now()
                }
                
            });
                const val = await data.save();
               
            
            return res.json({ status: 'ok' ,data:val })
        } 
        catch (error) {
            console.log(error)
            res.json({ status: 'error', error: 'invalid token' })
        }
    // console.log("inside a todo post function!");
   

})

app.get("/todo",async(req,res) => {
      
    const token = req.headers['x-access-token']
    try {
            const decoded = jwt.verify(token, 'secret123')
            const email = decoded.email
            const user = await userModel.findOne({ email: email })
            console.log(user.name);
            console.log(user);
            console.log("inside a get function!");
            const todo = await monmodel2.find({"user.id":user._id})
            console.log(todo);
            // res.json(user);
            return res.json({data:todo})
        } 
        catch (error) {
            console.log(error)
            res.json({ status: 'error', error: 'invalid token' })
        }
        console.log("inside a get request");
       
        try{
                // const user = await monmodel.findOne({"user.email":req.query.email})
                
               
            }catch(e){
                console.log(e.message)
            }
    

})

app.delete("/todo",async(req,res)=>{
    // console.log(req.body.email);
    
    try{
        const user = await monmodel2.deleteOne({"_id":req.headers.id})
        console.log(user);
        res.json(user);
    }catch(e){
        console.log(e.message)
    }
})
app.put("/todo",async(req,res) =>{
    console.log(req.body.title);
   try{
   
       const user = await monmodel2.updateOne({
           "_id" :req.body.id, 
       },
        {
            
            "todo.title":req.body.title
            // "note.content":req.body.content
        }
       )
       console.log(user);
        res.json(user);
   }catch(e){
       console.log(e.message)
   }
})

app.put("/todo/checkUpdate",async(req,res) => {
    try{
   
        const user = await monmodel2.updateOne({
            "_id" :req.headers.id, 
        },
         {
             
             "todo.selected":true
             // "note.content":req.body.content
         }
        )
        console.log(user);
         res.json(user);
    }catch(e){
        console.log(e.message)
    }
})


app.delete("/todoclearall",async(req,res)=>{
    // console.log(req.body.email);
    
    try{
        const user = await monmodel2.deleteMany({"user.email":req.body.email})
        console.log(user);
        res.json(user);
    }catch(e){
        console.log(e.message)
    }
})

//Notes router
app.get("/notes",async(req,res) => {
        
    const token = req.headers['x-access-token']
    try {
            const decoded = jwt.verify(token, 'secret123')
            const email = decoded.email
            const user = await userModel.findOne({ email: email })
            console.log(user.name);
            console.log(user);
            console.log("inside a get function!");
            const notes = await monmodel.find({"user.id":user._id})
            console.log(notes);
            // res.json(user);
            return res.json({ status: 'ok' , data:notes })
        } 
        catch (error) {
            console.log(error)
            res.json({ status: 'error', error: 'invalid token' })
        }
        console.log("inside a get request");
       
       
    
})
app.post("/notes",async(req,res)=>{

    const token = req.headers['x-access-token']
    try {
            const decoded = jwt.verify(token, 'secret123')
            const email = decoded.email
            const user = await userModel.findOne({ email: email })
            console.log(user.name);
            console.log("inside a post function!");
            const data = new monmodel({
            user:{
                id:user.id
                
            },note:{
                title:req.headers.title,
                content:req.headers.content,
                tag:req.headers.tag,
                color:req.headers.color
            },
            createdAt:{
                time:Date.now()
            }
            
        });
        const val = await data.save();
        // res.json(val);
            
            return res.json({ status: 'ok', data: val })
        } 
        catch (error) {
            console.log(error)
            res.json({ status: 'error', error: 'invalid token' })
        }

    
})
app.delete("/notes",async(req,res) =>{
     console.log(req.body.email);
    try{
        const user = await monmodel.deleteOne({"_id":req.body.id})
        console.log(user);
        res.json(user);
    }catch(e){
        console.log(e.message)
    }
})
app.put("/notes",async(req,res) =>{
    console.log(req.body.email);
   try{
   
       const user = await monmodel.updateOne({
           "_id" :req.body.id, 
       },
        {
            "note.title":req.body.title,
            "note.content":req.body.content
        }
       )
       console.log(user);
        res.json(user);
   }catch(e){
       console.log(e.message)
   }
})
app.get("/search",async(req,res) => {
        
    const token = req.headers['x-access-token']
    try {
            const decoded = jwt.verify(token, 'secret123')
            const email = decoded.email
            const user = await userModel.findOne({ email: email })
            console.log(user.name);
            console.log(user);
            console.log("inside a get function!");
           
            const notes = await monmodel.find({"user.id":user._id,"note.title": { $regex: req.headers.search}})
            console.log(notes);
            // res.json(user);
            return res.json({ status: 'ok' , data:notes })
        } 
        catch (error) {
            console.log(error)
            res.json({ status: 'error', error: 'invalid token' })
        }
        console.log("inside a get request");
       
       
    
})


app.listen(3001, () => {
  console.log('server started');
});