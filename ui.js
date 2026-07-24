// ======================================
// ui.js
// Affichage et interface utilisateur
// ======================================

// Afficher toutes les tâches
function displayTasks() {

    const taskList = document.getElementById("taskList");
    const search = getSearchText();

    taskList.innerHTML = "";

    sortTasks();

    let filteredTasks = tasks.filter(task => {

        // Recherche
        if (!task.text.toLowerCase().includes(search))
            return false;

        // Filtres
        switch (currentFilter) {

            case "done":
                return task.completed;

            case "notDone":
                return !task.completed;

            case "daily":
                return task.repeat === "daily";

            case "monthly":
                return task.repeat === "monthly";

            case "yearly":
                return task.repeat === "yearly";

            case "today":

                if (!task.dueDate) return false;

                return task.dueDate ===
                    new Date().toISOString().split("T")[0];

            default:
                return true;
        }

    });

    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="alert alert-info text-center">
                📭 Aucune tâche trouvée.
            </div>
        `;

        updateStats();

        return;

    }

    filteredTasks.forEach(task => {

        const card = document.createElement("div");

        card.className =
            `task ${task.repeat} ${task.completed ? "completed" : ""}`;

        card.innerHTML = `

            <div class="flex-grow-1">

                <div class="task-text">

                    <input
                        type="checkbox"
                        class="form-check-input me-2"
                        ${task.completed ? "checked" : ""}
                        onchange="toggleTask(${task.id})">

                    ${escapeHtml(task.text)}

                </div>

                <div class="task-info">

                    📅 ${task.dueDate || "-"}

                    &nbsp;&nbsp;

                    ⏰ ${task.reminderTime || "--:--"}

                    &nbsp;&nbsp;

                    🔁 ${repeatLabel(task.repeat)}

                </div>

            </div>

            <div class="task-buttons">

                <button
                    class="btn btn-warning btn-sm"
                    onclick="editTask(${task.id})">

                    ✏️

                </button>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="deleteTask(${task.id})">

                    🗑️

                </button>

            </div>

        `;

        taskList.appendChild(card);

    });

    updateStats();

}

// ======================================
// Nettoyer le HTML
// ======================================

function escapeHtml(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// ======================================
// Actualiser l'affichage
// ======================================

function refreshUI() {

    displayTasks();

    updateStats();

}

// ======================================
// Trier par nom
// ======================================

function sortByName() {

    tasks.sort((a, b) => a.text.localeCompare(b.text));

    refreshUI();

}

// ======================================
// Trier par date
// ======================================

function sortByDate() {

    tasks.sort((a, b) => {

        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return new Date(a.dueDate) - new Date(b.dueDate);

    });

    refreshUI();

}

// ======================================
// Trier par répétition
// ======================================

function sortByRepeat() {

    tasks.sort((a, b) =>
        a.repeat.localeCompare(b.repeat)
    );

    refreshUI();

}

// ======================================
// Afficher/Masquer le calendrier
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    const repeat = document.getElementById("repeatSelect");
    const dateInput = document.getElementById("dateInput");

    function updateDateVisibility() {

        if (repeat.value === "daily") {

            dateInput.disabled = true;
            dateInput.value = "";

        } else {

            dateInput.disabled = false;

        }

    }

    repeat.addEventListener("change", updateDateVisibility);

    updateDateVisibility();

});
