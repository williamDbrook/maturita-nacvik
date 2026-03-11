const express = require("express")
const fs = require("fs")
const bcrypt = require("bcrypt")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static("public"))

const USERS_FILE = "users.json"

function loadUsers(){
    return JSON.parse(fs.readFileSync(USERS_FILE))
}

function saveUsers(users){
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

app.post("/register", async (req,res)=>{

    const {username, password} = req.body

    if(!username || !password){
        return res.status(400).json({error:"Missing data"})
    }

    const users = loadUsers()

    const exists = users.find(u => u.username === username)

    if(exists){
        return res.status(400).json({error:"Username already exists"})
    }

    const hashedPassword = await bcrypt.hash(password,10)

    users.push({
        username: username,
        password: hashedPassword
    })

    saveUsers(users)

    res.json({message:"User created"})
})

app.post("/login", async (req,res)=>{

    const {username,password} = req.body

    const users = loadUsers()

    const user = users.find(u => u.username === username)

    if(!user){
        return res.status(400).json({error:"User not found"})
    }

    const match = await bcrypt.compare(password,user.password)

    if(!match){
        return res.status(400).json({error:"Wrong password"})
    }

    res.json({message:"Login success"})
})

app.listen(3000,()=>{
    console.log("Server running on port 3000")
})