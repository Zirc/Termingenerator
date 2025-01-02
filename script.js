document.getElementById("icsForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const startDate = document.getElementById("startDate").value;
    const startTime = document.getElementById("startTime").value;
    const endDate = document.getElementById("endDate").value;
    const endTime = document.getElementById("endTime").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;
    const recurrenceCount = document.getElementById("recurrenceCount").value;
    const recurrenceUnit = document.getElementById("recurrenceUnit").value;
    const reminders = Array.from(document.getElementById("reminders").selectedOptions).map(option => option.value);

    if (new Date(endDate) < new Date(startDate)) {
        alert("Das Enddatum darf nicht vor dem Startdatum liegen.");
        return;
    }

    let startDateTime = startDate;
    let endDateTime = endDate;
    let allDay = false;

    if (!startTime && !endTime) {
        allDay = confirm("Keine Uhrzeiten angegeben. Soll das Ereignis den ganzen Tag gelten?");
        if (!allDay) return;

        startDateTime = startDate.replace(/-/g, "") + "T000000";
        endDateTime = endDate.replace(/-/g, "") + "T235959";
    } else {
        if (startTime) {
            startDateTime = startDate.replace(/-/g, "") + "T" + startTime.replace(":", "") + "00";
        } else {
            alert("Bitte eine Startzeit eingeben.");
            return;
        }

        if (endTime) {
            endDateTime = endDate.replace(/-/g, "") + "T" + endTime.replace(":", "") + "00";
        } else {
            alert("Bitte eine Endzeit eingeben.");
            return;
        }
    }

    let recurrenceRule = "";
    if (recurrenceCount && recurrenceUnit) {
        recurrenceRule = `RRULE:FREQ=${recurrenceUnit};INTERVAL=${recurrenceCount}`;
    }

    let alarms = reminders
        .map(reminder => `BEGIN:VALARM
TRIGGER:${reminder}
ACTION:DISPLAY
DESCRIPTION:Erinnerung
END:VALARM`)
        .join("\n");

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${Date.now()}@example.com
DTSTAMP:${new Date().toISOString().replace(/-|:|\\.\\d+/g, "")}
DTSTART:${startDateTime}
DTEND:${endDateTime}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
${recurrenceRule}
${alarms}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.getElementById("downloadLink");
    downloadLink.href = url;
    downloadLink.download = `${title.replace(/\s+/g, "_")}.ics`;
    downloadLink.style.display = "block";
    downloadLink.textContent = "ICS-Datei herunterladen";

    const shareButton = document.getElementById("shareButton");
    shareButton.style.display = "block";
    shareButton.onclick = async function () {
        if (navigator.share) {
            const file = new File([icsContent], `${title.replace(/\s+/g, "_")}.ics`, { type: "text/calendar" });
            try {
                await navigator.share({
                    title: "ICS-Datei teilen",
                    text: "Hier ist eine ICS-Datei für deinen Kalender.",
                    files: [file]
                });
                alert("Datei erfolgreich geteilt!");
            } catch (error) {
                console.error("Teilen fehlgeschlagen:", error);
            }
        } else {
            alert("Teilen wird von deinem Browser nicht unterstützt.");
        }
    };

    const newEventButton = document.getElementById("newEventButton");
    newEventButton.style.display = "block";
    newEventButton.onclick = function () {
        document.getElementById("icsForm").reset();
        downloadLink.style.display = "none";
        shareButton.style.display = "none";
        newEventButton.style.display = "none";
    };
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service Worker registriert'))
        .catch(error => console.error('Service Worker Fehler:', error));
}
