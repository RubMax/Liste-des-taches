// ======================================
// app.js
// Initialisation de l'application
// ======================================

// Liste des tâches
let tasks = [];

// Filtre actuel
let currentFilter = "all";

// URL Google Apps Script
const GOOGLE_SCRIPT_URL = "VOTRE_URL_APPS_SCRIPT";

// Chargement au démarrage
window.addEventListener("load", async () => {

    // Demander la permission des notifications
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Charger les tâches
    await loadTasks();

    // Afficher
    displayTasks();

    // Vérifier les rappels toutes les minutes
    setInterval(checkReminders, 60000);

});

// ======================================
// Sauvegarde
// ======================================

async function saveAll() {

    saveLocal();

    try{
        await saveToGoogleDrive();
    }catch(e){
        console.log("Google Drive indisponible");
    }

    updateStats();

}

// ======================================
// Statistiques
// ======================================

function updateStats(){

    document.getElementById("totalTasks").textContent =
        tasks.length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(t=>t.completed).length;

    document.getElementById("pendingTasks").textContent =
        tasks.filter(t=>!t.completed).length;

}

// ======================================
// Changer le filtre
// ======================================

function setFilter(filter){

    currentFilter = filter;

    displayTasks();

}

// ======================================
// Recherche
// ======================================

function getSearchText(){

    return document
            .getElementById("searchInput")
            .value
            .toLowerCase();

}

// ======================================
// Notification
// ======================================

function notify(title,message){

    if(Notification.permission==="granted"){

        new Notification(title,{

            body:message,

            icon:"icons/icon-192.png"

        });

    }

}

// ======================================
// Format date
// ======================================

function formatDate(date){

    if(!date) return "";

    const d=new Date(date);

    return d.toLocaleDateString();

}

// ======================================
// Format répétition
// ======================================

function repeatLabel(type){

    switch(type){

        case "day":
            return "Jour";

        case "daily":
            return "Journalier";

        case "monthly":
            return "Mensuel";

        case "yearly":
            return "Annuel";

        default:
            return "";

    }

}
