let username = localStorage.getItem("username")

// Pokud není přihlášen → redirect na login
if(!username){
    console.log("Neplatná session, redirect na login")
    localStorage.removeItem("username")
    window.location.href = "/"
}

let notes = []
let showOnlyImportant = false

async function loadNotes(){
    try {
        const res = await fetch("/get-notes",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ username })
        })
        const data = await res.json()
        if(data.notes){
            notes = data.notes
            renderNotes()
        } else {
            console.log("Neplatná session nebo uživatel nenalezen")
            localStorage.removeItem("username")
            window.location.href = "/"
        }
    } catch(e){
        console.log("Chyba při načítání poznámek", e)
    }
}

async function addNote(){
    const text = document.getElementById("noteInput").value
    if(!text.trim()) return
    await fetch("/add-note",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ username, text })
    })
    document.getElementById("noteInput").value=""
    loadNotes()
}

async function deleteNote(index){
    await fetch("/delete-note",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ username, noteIndex:index })
    })
    loadNotes()
}

async function toggleImportant(index){
    await fetch("/toggle-important",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ username, noteIndex:index })
    })
    loadNotes()
}

function toggleImportantFilter(){
    showOnlyImportant = !showOnlyImportant
    renderNotes()
}

function renderNotes(){
    const container = document.getElementById("notes")
    container.innerHTML = ""

    let display = notes.map((note, originalIndex) => ({ note, originalIndex }))
    if(showOnlyImportant) display = display.filter(item=>item.note.important)
    display.sort((a,b)=>b.note.date-a.note.date)

    display.forEach((item)=>{
        const note = item.note
        const originalIndex = item.originalIndex
        const div = document.createElement("div")
        div.className = "note"
        if(note.important) div.classList.add("important")

        div.innerHTML = `
        <p>${note.text}</p>
        <button onclick="toggleImportant(${originalIndex})">
        ${note.important ? "Odebrat důležité" : "Označit důležité"}
        </button>
        <button onclick="deleteNote(${originalIndex})">Smazat</button>
        `
        container.appendChild(div)
    })
}

// Delete account a redirect na login
async function deleteAccount(){
    const password = prompt("Zadejte heslo pro smazání účtu")
    if(!password) return

    try{
        const res = await fetch("/delete-account",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ username, password })
        })
        const data = await res.json()
        if(data.message){
            alert("Účet smazán")
            localStorage.removeItem("username")
            window.location.href="/"
        }else{
            alert(data.error)
        }
    }catch(e){
        alert("Chyba serveru")
    }
}

// Logout tlačítko
function logout(){
    localStorage.removeItem("username")
    window.location.href="/"
}

// Načti poznámky při startu
loadNotes()