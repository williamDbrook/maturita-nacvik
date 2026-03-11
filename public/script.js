let notes = []
let showOnlyImportant = false

function addNote(){

    const text = document.getElementById("noteInput").value

    if(text.trim() === "") return

    const note = {
        text: text,
        important: false,
        date: Date.now()
    }

    notes.push(note)

    document.getElementById("noteInput").value = ""

    renderNotes()
}

function deleteNote(index){
    notes.splice(index,1)
    renderNotes()
}

function toggleImportant(index){
    notes[index].important = !notes[index].important
    renderNotes()
}

function toggleImportantFilter(){
    showOnlyImportant = !showOnlyImportant
    renderNotes()
}

function renderNotes(){

    const container = document.getElementById("notes")
    container.innerHTML = ""

    let displayNotes = [...notes]

    // filtr
    if(showOnlyImportant){
        displayNotes = displayNotes.filter(note => note.important)
    }

    // chronologické řazení
    displayNotes.sort((a,b) => b.date - a.date)

    displayNotes.forEach((note,index)=>{

        const div = document.createElement("div")
        div.className = "note"

        if(note.important){
            div.classList.add("important")
        }

        div.innerHTML = `
            <p>${note.text}</p>
            <button onclick="toggleImportant(${notes.indexOf(note)})">
                ${note.important ? "Odebrat důležité" : "Označit důležité"}
            </button>
            <button onclick="deleteNote(${notes.indexOf(note)})">Smazat</button>
        `

        container.appendChild(div)

    })

}