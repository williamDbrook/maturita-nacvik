const express = require("express")
const fs = require("fs")
const bcrypt = require("bcrypt")
const cors = require("cors")
const path = require("path")
const open = require("open").default

const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())

const USERS_FILE = "users.json"

// --------------------
// Pomocné funkce
// --------------------
function loadUsers(){
    if(!fs.existsSync(USERS_FILE)) return []
    return JSON.parse(fs.readFileSync(USERS_FILE))
}

function saveUsers(users){
    fs.writeFileSync(USERS_FILE, JSON.stringify(users,null,2))
}

// --------------------
// API
// --------------------

app.post("/register", async (req,res)=>{
    const {username,password}=req.body
    if(!username || !password)
        return res.status(400).json({error:"Missing data"})

    const users=loadUsers()

    if(users.find(u=>u.username===username))
        return res.status(400).json({error:"Username already exists"})

    const hash=await bcrypt.hash(password,10)

    users.push({
        username,
        password:hash,
        notes:[]
    })

    saveUsers(users)

    res.json({message:"User created"})
})

app.post("/login", async (req,res)=>{
    const {username,password}=req.body

    const users=loadUsers()
    const user=users.find(u=>u.username===username)

    if(!user)
        return res.status(400).json({error:"User not found"})

    const match=await bcrypt.compare(password,user.password)

    if(!match)
        return res.status(400).json({error:"Wrong password"})

    res.json({message:"Login success"})
})

app.post("/get-notes",(req,res)=>{
    const {username}=req.body

    const users=loadUsers()
    const user=users.find(u=>u.username===username)

    if(!user)
        return res.status(400).json({error:"User not found"})

    res.json({notes:user.notes})
})

app.post("/add-note",(req,res)=>{
    const {username,text}=req.body

    const users=loadUsers()
    const user=users.find(u=>u.username===username)

    if(!user)
        return res.status(400).json({error:"User not found"})

    user.notes.push({
        text,
        important:false,
        date:Date.now()
    })

    saveUsers(users)

    res.json({message:"Note added"})
})

app.post("/delete-note",(req,res)=>{
    const {username,noteIndex}=req.body

    const users=loadUsers()
    const user=users.find(u=>u.username===username)

    if(!user)
        return res.status(400).json({error:"User not found"})

    user.notes.splice(noteIndex,1)

    saveUsers(users)

    res.json({message:"Note deleted"})
})

app.post("/toggle-important",(req,res)=>{
    const {username,noteIndex}=req.body

    const users=loadUsers()
    const user=users.find(u=>u.username===username)

    if(!user)
        return res.status(400).json({error:"User not found"})

    user.notes[noteIndex].important=!user.notes[noteIndex].important

    saveUsers(users)

    res.json({message:"Note updated"})
})

app.post("/delete-account", async (req,res)=>{
    const {username,password}=req.body

    const users=loadUsers()
    const index=users.findIndex(u=>u.username===username)

    if(index===-1)
        return res.status(400).json({error:"User not found"})

    const match=await bcrypt.compare(password,users[index].password)

    if(!match)
        return res.status(400).json({error:"Wrong password"})

    users.splice(index,1)

    saveUsers(users)

    res.json({message:"Account deleted"})
})


// --------------------
// STATIC FILES
// --------------------

app.use(express.static(path.join(__dirname,"public")))


// --------------------
// ROUTING
// --------------------

// LOGIN PAGE
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"public","register-login.html"))
})

// NOTES PAGE
app.get("/notes",(req,res)=>{
    res.sendFile(path.join(__dirname,"public","index.html"))
})


// --------------------
// START SERVER
// --------------------

app.listen(PORT,()=>{
    const url=`http://localhost:${PORT}`
    console.log("Server running on port",PORT)
    console.log("Open:",url)

    open(url)
})