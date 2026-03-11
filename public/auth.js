const toggleBtn = document.getElementById("toggleAuth")
const formTitle = document.getElementById("formTitle")
const submitBtn = document.getElementById("submitBtn")
const message = document.getElementById("message")

let isRegister = true

toggleBtn.addEventListener("click", () => {
    isRegister = !isRegister
    formTitle.innerText = isRegister ? "Registrace" : "Login"
    submitBtn.innerText = isRegister ? "Registrovat" : "Přihlásit se"
    toggleBtn.innerText = isRegister ? "Přejít na Login" : "Přejít na Registraci"
    message.innerText = ""
    message.style.color="red"
})

submitBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    if(!username || !password){
        message.innerText="Vyplňte všechny údaje"
        return
    }

    const endpoint = isRegister ? "/register" : "/login"
    try{
        const res = await fetch(endpoint,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({username,password})
        })
        const data = await res.json()
        if(data.message){
            if(isRegister){
                message.style.color="green"
                message.innerText="Registrace úspěšná! Přihlašte se."
                toggleBtn.click()
            } else {
                localStorage.setItem("username", username)
                window.location.href="index.html"
            }
        } else {
            message.style.color="red"
            message.innerText = data.error
        }
    } catch(e){
        message.style.color="red"
        message.innerText="Chyba s připojením k serveru"
    }
})