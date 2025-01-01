document.getElementById("icsForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const start = new Date(document.getElementById("start").value).toISOString().replace(/-|:|\\.\\d+/g, "");
    const end = new Date(document.getElementById("end").value).toISOString().replace(/-|:|\\.\\d+/g, "");
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;
    const recurrence = document.getElementById("recurrence").value;

    if (new Date(document.getElementById("end").value) <= new Date(document.getElementById("start").value)) {
        alert("Die Endzeit muss später als die Startzeit sein.");
        return;
    }

    let recurrenceRule = "";
    if (recurrence !== "none") {
        recurrenceRule = `RRULE:FREQ=${recurrence.toUpperCase()}`;
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${Date.now()}@example.com
DTSTAMP:${new Date().toISOString().replace(/-|:|\\.\\d+/g, "")}
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
${recurrenceRule}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.getElementById("downloadLink");
    downloadLink.href = url;
    downloadLink.download = `${title.replace(/\\s+/g, "_")}.ics`;
    downloadLink.style.display = "block";
    downloadLink.textContent = "ICS-Datei herunterladen";

    const shareButton = document.getElementById("shareButton");
    shareButton.style.display = "block";
    shareButton.onclick = async function () {
        if (navigator.share) {
            const file = new File([icsContent], `${title.replace(/\\s+/g, "_")}.ics`, { type: "text/calendar" });
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
