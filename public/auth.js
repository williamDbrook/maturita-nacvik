// Přepínání mezi login a registrací
const loginForm = document.getElementById("login-form")
const registerForm = document.getElementById("register-form")
const showLoginBtn = document.getElementById("show-login")
const showRegisterBtn = document.getElementById("show-register")

showLoginBtn.addEventListener("click", () => {
    loginForm.style.display = "block"
    registerForm.style.display = "none"
})

showRegisterBtn.addEventListener("click", () => {
    loginForm.style.display = "none"
    registerForm.style.display = "block"
})

// LOGIN
document.getElementById("login-btn").addEventListener("click", async () => {
    const username = document.getElementById("login-username").value.trim()
    const password = document.getElementById("login-password").value.trim()
    if(!username || !password) return alert("Vyplň všechny údaje!")

    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ username, password })
        })
        const data = await res.json()
        if(data.message){
            localStorage.setItem("username", username)
            window.location.href = "/notes"
        } else alert(data.error)
    } catch(e){
        alert("Chyba serveru")
    }
})

// REGISTER
document.getElementById("register-btn").addEventListener("click", async () => {
    const username = document.getElementById("register-username").value.trim()
    const password = document.getElementById("register-password").value.trim()
    if(!username || !password) return alert("Vyplň všechny údaje!")

    try {
        const res = await fetch("/register", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ username, password })
        })
        const data = await res.json()
        if(data.message){
            alert("Uživatel vytvořen, nyní se přihlaste")
            loginForm.style.display = "block"
            registerForm.style.display = "none"
        } else alert(data.error)
    } catch(e){
        alert("Chyba serveru")
    }
})