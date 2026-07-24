// ======================================
// tasks.js
// Gestion des tâches
// ======================================

// Ajouter une tâche
async function addTask() {

    const text = document.getElementById("taskInput").value.trim();
    const repeat = document.getElementById("repeatSelect").value;
    const dueDate = document.getElementById("dateInput").value;
    const reminderTime = document.getElementById("timeInput").value;

    if (text === "") {
        alert("Veuillez saisir une tâche.");
        return;
    }

    if (repeat !== "daily" && dueDate === "") {
        alert("Veuillez choisir une date.");
        return;
    }

    if (reminderTime === "") {
        alert("Veuillez choisir une heure.");
        return;
    }

    const task = {

        id: Date.now(),

        text: text,

        repeat: repeat,

        dueDate: dueDate,

        reminderTime: reminderTime,

        completed: false,

        createdAt: new Date().toISOString(),

        lastReminder: null

    };

    tasks.push(task);

    clearForm();

    await saveAll();

    displayTasks();

}

// ======================================
// Modifier
// ======================================

async function editTask(id){

    const task = tasks.find(t => t.id === id);

    if(!task) return;

    const text = prompt("Modifier la tâche :", task.text);

    if(text === null) return;

    if(text.trim() === "") return;

    task.text = text.trim();

    await saveAll();

    displayTasks();

}

// ======================================
// Supprimer
// ======================================

async function deleteTask(id){

    if(!confirm("Supprimer cette tâche ?")) return;

    tasks = tasks.filter(t => t.id !== id);

    await saveAll();

    displayTasks();

}

// ======================================
// Terminée / non terminée
// ======================================

async function toggleTask(id){

    const task = tasks.find(t => t.id === id);

    if(!task) return;

    task.completed = !task.completed;

    await saveAll();

    displayTasks();

}

// ======================================
// Réinitialiser le formulaire
// ======================================

function clearForm(){

    document.getElementById("taskInput").value = "";

    document.getElementById("dateInput").value = "";

    document.getElementById("timeInput").value = "";

    document.getElementById("repeatSelect").value = "day";

}

// ======================================
// Trier les tâches
// ======================================

function sortTasks(){

    tasks.sort((a,b)=>{

        if(a.completed !== b.completed){

            return a.completed - b.completed;

        }

        return new Date(a.createdAt) - new Date(b.createdAt);

    });

}

// ======================================
// Obtenir une tâche
// ======================================

function getTask(id){

    return tasks.find(t=>t.id===id);

}

// ======================================
// Compter les tâches
// ======================================

function countCompleted(){

    return tasks.filter(t=>t.completed).length;

}

function countPending(){

    return tasks.filter(t=>!t.completed).length;

}

// ======================================
// Tout supprimer
// ======================================

async function clearAllTasks(){

    if(!confirm("Supprimer toutes les tâches ?")) return;

    tasks = [];

    await saveAll();

    displayTasks();

}
