const express = require("express")
const bcrypt = require("bcrypt")
const cors = require("cors")
const path = require("path")
const open = require("open").default
const mongoose = require("mongoose")

const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())

// --------------------
// MONGODB CONNECTION
// --------------------
mongoose.connect(
  "mongodb+srv://usrname:passwd@matura-test.sxnalj4.mongodb.net/?appName=matura-test"
)
mongoose.connection.on("connected", () => {
  console.log("[INFO] MongoDB connected")
})
mongoose.connection.on("error", (err) => {
  console.error("[ERROR] MongoDB connection error:", err)
})

// --------------------
// USER MODEL
// --------------------
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  notes: [
    {
      text: String,
      important: Boolean,
      date: Number
    }
  ]
})
const User = mongoose.model("User", UserSchema)

// --------------------
// API ROUTES
// --------------------

// registrace
app.post("/register", async (req, res) => {
  const { username, password } = req.body
  console.log(`[${new Date().toISOString()}] POST /register`, req.body)

  if (!username || !password) return res.status(400).json({ error: "Missing data" })

  const existing = await User.findOne({ username })
  if (existing) {
    console.log(`[WARN] Username already exists: ${username}`)
    return res.status(400).json({ error: "Username already exists" })
  }

  const hash = await bcrypt.hash(password, 10)
  const user = new User({ username, password: hash, notes: [] })
  await user.save()
  console.log(`[INFO] User created: ${username}`)
  res.json({ message: "User created" })
})

// login
app.post("/login", async (req, res) => {
  const { username, password } = req.body
  console.log(`[${new Date().toISOString()}] POST /login`, req.body)

  const user = await User.findOne({ username })
  if (!user) {
    console.log(`[WARN] User not found: ${username}`)
    return res.status(400).json({ error: "User not found" })
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    console.log(`[WARN] Wrong password for: ${username}`)
    return res.status(400).json({ error: "Wrong password" })
  }

  console.log(`[INFO] Login success for: ${username}`)
  res.json({ message: "Login success" })
})

// získání poznámek
app.post("/get-notes", async (req, res) => {
  const { username } = req.body
  console.log(`[${new Date().toISOString()}] POST /get-notes`, req.body)

  const user = await User.findOne({ username })
  if (!user) {
    console.log(`[WARN] User not found for get-notes: ${username}`)
    return res.status(400).json({ error: "User not found" })
  }

  console.log(`[INFO] Returning ${user.notes.length} notes for user: ${username}`)
  res.json({ notes: user.notes })
})

// přidání poznámky
app.post("/add-note", async (req, res) => {
  const { username, text } = req.body
  console.log(`[${new Date().toISOString()}] POST /add-note`, req.body)

  const user = await User.findOne({ username })
  if (!user) {
    console.log(`[WARN] User not found for add-note: ${username}`)
    return res.status(400).json({ error: "User not found" })
  }

  user.notes.push({ text, important: false, date: Date.now() })
  await user.save()
  console.log(`[INFO] Note added for user: ${username}`)
  res.json({ message: "Note added" })
})

// smazání poznámky
app.post("/delete-note", async (req, res) => {
  const { username, noteIndex } = req.body
  console.log(`[${new Date().toISOString()}] POST /delete-note`, req.body)

  const user = await User.findOne({ username })
  if (!user) {
    console.log(`[WARN] User not found for delete-note: ${username}`)
    return res.status(400).json({ error: "User not found" })
  }

  user.notes.splice(noteIndex, 1)
  await user.save()
  console.log(`[INFO] Note deleted for user: ${username}`)
  res.json({ message: "Note deleted" })
})

// toggle důležitosti poznámky
app.post("/toggle-important", async (req, res) => {
  const { username, noteIndex } = req.body
  console.log(`[${new Date().toISOString()}] POST /toggle-important`, req.body)

  const user = await User.findOne({ username })
  if (!user) {
    console.log(`[WARN] User not found for toggle-important: ${username}`)
    return res.status(400).json({ error: "User not found" })
  }

  user.notes[noteIndex].important = !user.notes[noteIndex].important
  await user.save()
  console.log(`[INFO] Note importance toggled for user: ${username}`)
  res.json({ message: "Note updated" })
})

// smazání účtu
app.post("/delete-account", async (req, res) => {
  const { username, password } = req.body
  console.log(`[${new Date().toISOString()}] POST /delete-account`, req.body)

  const user = await User.findOne({ username })
  if (!user) {
    console.log(`[WARN] User not found for delete-account: ${username}`)
    return res.status(400).json({ error: "User not found" })
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    console.log(`[WARN] Wrong password for delete-account: ${username}`)
    return res.status(400).json({ error: "Wrong password" })
  }

  await User.deleteOne({ username })
  console.log(`[INFO] Account deleted for user: ${username}`)
  res.json({ message: "Account deleted" })
})

// --------------------
// STATIC FILES
// --------------------
app.use(express.static(path.join(__dirname, "public")))

// --------------------
// ROUTING
// --------------------
app.get("/", (req, res) => {
  console.log(`[INFO] GET / → register-login.html`)
  res.sendFile(path.join(__dirname, "public", "register-login.html"))
})

app.get("/notes", (req, res) => {
  console.log(`[INFO] GET /notes → notes.html`)
  res.sendFile(path.join(__dirname, "public", "notes.html"))
})

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`
  console.log(`[INFO] Server running on port ${PORT}`)
  console.log(`[INFO] Open: ${url}`)
  open(url)
})
