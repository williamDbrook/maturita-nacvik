let username = localStorage.getItem("username")
if(!username){
    alert("Nejprve se přihlašte")
    window.location.href="register-login.html"
}

let notes=[], showOnlyImportant=false

async function loadNotes(){
    if(!username) return
    try{
        const res = await fetch("/get-notes",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({username})
        })
        if(!res.ok){
            const errData = await res.json().catch(()=>({error:"Neznámá chyba"}))
            alert("Chyba serveru: "+errData.error)
            return
        }
        const data = await res.json()
        notes = data.notes || []
        renderNotes()
    } catch(e){
        alert("Chyba s připojením k serveru")
    }
}

async function addNote(){
    if(!username) return
    const text = document.getElementById("noteInput").value
    if(!text.trim()) return
    try{
        const res = await fetch("/add-note",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({username,text})
        })
        if(!res.ok){
            const errData = await res.json().catch(()=>({error:"Neznámá chyba"}))
            alert("Chyba: "+errData.error)
            return
        }
        const data = await res.json()
        if(data.message){
            document.getElementById("noteInput").value=""
            await loadNotes()
        } else alert(data.error)
    } catch(e){
        alert("Chyba s připojením k serveru")
    }
}

async function deleteNote(index){
    if(!username) return
    try{
        const res = await fetch("/delete-note",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({username,noteIndex:index})
        })
        if(!res.ok){
            const errData = await res.json().catch(()=>({error:"Neznámá chyba"}))
            alert("Chyba: "+errData.error)
            return
        }
        const data = await res.json()
        if(data.message) await loadNotes()
        else alert(data.error)
    } catch(e){
        alert("Chyba s připojením k serveru")
    }
}

async function toggleImportant(index){
    if(!username) return
    try{
        const res = await fetch("/toggle-important",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({username,noteIndex:index})
        })
        if(!res.ok){
            const errData = await res.json().catch(()=>({error:"Neznámá chyba"}))
            alert("Chyba: "+errData.error)
            return
        }
        const data = await res.json()
        if(data.message) await loadNotes()
        else alert(data.error)
    } catch(e){
        alert("Chyba s připojením k serveru")
    }
}

function toggleImportantFilter(){
    showOnlyImportant = !showOnlyImportant
    renderNotes()
}

function renderNotes(){
    const container = document.getElementById("notes")
    container.innerHTML=""
    let displayNotes = [...notes]
    if(showOnlyImportant) displayNotes = displayNotes.filter(n=>n.important)
    displayNotes.sort((a,b)=>b.date-a.date)
    displayNotes.forEach((note,index)=>{
        const div = document.createElement("div")
        div.className="note"
        if(note.important) div.classList.add("important")
        div.innerHTML=`
            <p>${note.text}</p>
            <button onclick="toggleImportant(${index})">${note.important?"Odebrat důležité":"Označit důležité"}</button>
            <button onclick="deleteNote(${index})">Smazat</button>
        `
        container.appendChild(div)
    })
}

async function deleteAccount(){
    if(!username) return
    const password = prompt("Pro potvrzení zadejte své heslo:")
    if(!password || !password.trim()){
        alert("Účet nebyl smazán, heslo je povinné.")
        return
    }
    try{
        const res = await fetch("/delete-account",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({username,password})
        })
        if(!res.ok){
            const errData = await res.json().catch(()=>({error:"Neznámá chyba"}))
            alert("Chyba: "+errData.error)
            return
        }
        const data = await res.json()
        if(data.message){
            alert("Účet smazán. Budete přesměrováni na registraci.")
            localStorage.removeItem("username")
            window.location.href="register-login.html"
        } else alert(data.error)
    } catch(e){
        alert("Chyba s připojením k serveru")
    }
}

loadNotes()