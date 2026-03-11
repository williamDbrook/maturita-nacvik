const express = require("express")
const fs = require("fs")
const bcrypt = require("bcrypt")
const cors = require("cors")
const path = require("path")
const open = require("open").default // fix pro Node 24

const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())

const USERS_FILE = "users.json"

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return []
  return JSON.parse(fs.readFileSync(USERS_FILE))
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

// ROOT → login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register-login.html"))
})

// STATICKÉ SOUBORY (CSS, JS, obrázky)
app.use(express.static(path.join(__dirname, "public")))

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: "Missing data" })

  const users = loadUsers()
  if (users.find(u => u.username === username)) return res.status(400).json({ error: "Username exists" })

  const hashedPassword = await bcrypt.hash(password, 10)
  users.push({ username, password: hashedPassword })
  saveUsers(users)

  res.json({ message: "User created" })
})

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body
  const users = loadUsers()
  const user = users.find(u => u.username === username)
  if (!user) return res.status(400).json({ error: "User not found" })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).json({ error: "Wrong password" })

  res.json({ message: "Login success" })
})

// SPUŠTĚNÍ SERVERU
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`
  console.log(`Server running on port ${PORT}`)
  console.log(`Klikni pro otevření: ${url}`)
  open(url)
})