// ======================================
// reminders.js
// Gestion des rappels
// ======================================

// Vérifie tous les rappels
function checkReminders() {

    const now = new Date();

    const today =
        now.toISOString().split("T")[0];

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    tasks.forEach(async task => {

        if (task.completed) return;

        if (!task.reminderTime) return;

        const [hour, minute] =
            task.reminderTime.split(":").map(Number);

        if (hour !== currentHour) return;

        if (minute !== currentMinute) return;

        let show = false;

        switch (task.repeat) {

            // Une seule fois
            case "day":

                if (!task.dueDate) return;

                show = task.dueDate === today;

                break;

            // Tous les jours
            case "daily":

                show = true;

                break;

            // Tous les mois
            case "monthly":

                if (!task.dueDate) return;

                const monthlyDate =
                    new Date(task.dueDate);

                show =
                    monthlyDate.getDate() ===
                    now.getDate();

                break;

            // Tous les ans
            case "yearly":

                if (!task.dueDate) return;

                const yearlyDate =
                    new Date(task.dueDate);

                show =
                    yearlyDate.getDate() === now.getDate() &&
                    yearlyDate.getMonth() === now.getMonth();

                break;

        }

        if (!show) return;

        // Empêcher plusieurs notifications
        const reminderId =
            today +
            "_" +
            currentHour +
            "_" +
            currentMinute;

        if (task.lastReminder === reminderId)
            return;

        notify(
            "📋 Rappel",
            task.text
        );

        task.lastReminder = reminderId;

        await saveAll();

    });

}

// ======================================
// Notification navigateur
// ======================================

function notify(title, message) {

    if (!("Notification" in window))
        return;

    if (Notification.permission !== "granted")
        return;

    new Notification(title, {

        body: message,

        icon: "icons/icon-192.png",

        badge: "icons/icon-192.png",

        vibrate: [200, 100, 200],

        tag: "todo"

    });

}

// ======================================
// Demander la permission
// ======================================

function requestNotificationPermission() {

    if (!("Notification" in window))
        return;

    if (Notification.permission === "default") {

        Notification.requestPermission();

    }

}

// ======================================
// Vérification automatique
// ======================================

requestNotificationPermission();

// Vérifie immédiatement
checkReminders();

// Puis chaque minute
setInterval(checkReminders, 60000);
