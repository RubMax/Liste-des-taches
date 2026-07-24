// ======================================
// storage.js
// Sauvegarde locale + Google Drive
// ======================================

const STORAGE_KEY = "todo_tasks";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzUsXFGy0QNc9yzoLXMWxO2pK5UnQAjhCu83D_QgoWJXnkp_6oJKWRkU32VFpY8yVeBzQ/exec";

// ===============================
// Sauvegarde locale
// ===============================

function saveLocal() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );

}

// ===============================
// Chargement local
// ===============================

async function loadTasks() {

    try {

        const response = await fetch(GOOGLE_SCRIPT_URL);

        const result = await response.json();

        if(result.success){

            tasks = result.tasks || [];

            saveLocal();

            return;

        }

    } catch(e){

        console.log("Impossible de charger depuis Drive");

    }

    // Sinon localStorage

    const local = localStorage.getItem(STORAGE_KEY);

    if(local){

        tasks = JSON.parse(local);

    }else{

        tasks=[];

    }

}
// ===============================
// Sauvegarde Google Drive
// ===============================

async function saveToGoogleDrive() {

    try{

        const response = await fetch(GOOGLE_SCRIPT_URL,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(tasks)

        });

        return await response.json();

    }catch(e){

        console.error(e);

    }

}
// ===============================
// Export JSON
// ===============================

function backupTasks() {

    const blob = new Blob(

        [JSON.stringify(tasks, null, 2)],

        { type: "application/json" }

    );

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = "taches_backup.json";

    a.click();

    URL.revokeObjectURL(a.href);

}

// ===============================
// Import JSON
// ===============================

function importTasks() {

    const input = document.getElementById("fileInput");

    input.click();

    input.onchange = function () {

        const file = input.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = async function (e) {

            try {

                tasks = JSON.parse(e.target.result);

                await saveAll();

                displayTasks();

                alert("Import réussi.");

            } catch {

                alert("Fichier JSON invalide.");

            }

        };

        reader.readAsText(file);

    };

}

// ===============================
// Réinitialiser
// ===============================

async function resetStorage() {

    if (!confirm("Supprimer toutes les tâches ?")) return;

    tasks = [];

    localStorage.removeItem(STORAGE_KEY);

    await saveToGoogleDrive();

    displayTasks();

}

// ===============================
// Sauvegarde automatique
// ===============================

setInterval(() => {

    saveLocal();

}, 30000);
