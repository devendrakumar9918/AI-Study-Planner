document.addEventListener("DOMContentLoaded", loadCalendar);

async function loadCalendar() {

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const res = await fetch(
        "https://ai-study-planner-idkt.onrender.com/subjects?email=" + user.email
    );

    const subjects = await res.json();

    const events = subjects
    .filter(item => item.date)
    .map(item => ({

        id: item._id,

        title: item.subject,

        start: item.date,

        extendedProps: {
            difficulty: item.level,
            completed: item.completed
        },

        color:
            item.completed ? "#27ae60" :
            item.level === "Easy" ? "#2ecc71" :
            item.level === "Medium" ? "#f39c12" :
            "#e74c3c"
    }));

    console.log(events);

    const calendarEl = document.getElementById("calendar");

    const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "auto",
    events: events,

    eventClick: function(info) {

        selectedEvent = info.event;

    document.getElementById("eventModal").style.display = "flex";

    document.getElementById("modalTitle").innerText =
        info.event.title;

    document.getElementById("modalDifficulty").innerText =
        info.event.extendedProps.difficulty;

    document.getElementById("modalCompleted").innerText =
        info.event.extendedProps.completed ? "Yes" : "No";

        const btn = document.getElementById("completeBtn");

        if (info.event.extendedProps.completed) {
           btn.innerText = "✅ Already Completed";
           btn.disabled = true;
           btn.style.background = "#555";
           btn.style.cursor = "not-allowed";
        } else {
           btn.innerText = "✔ Mark Complete";
           btn.disabled = false;
           btn.style.background = "#27ae60";
           btn.style.cursor = "pointer";
        }

    document.getElementById("modalDate").innerText =
        info.event.start.toLocaleDateString();

    }    

    });

    

    calendar.render();

    document.getElementById("completeBtn").onclick = async function () {
        console.log("Complete button clicked");

    if (!selectedEvent) return;

    if (selectedEvent.extendedProps.completed) return;

    const res = await fetch(
        "https://ai-study-planner-idkt.onrender.com/subjects/" + selectedEvent.id,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                completed: true
            })
        }
    );

    const data = await res.json();

   showToast("success", data.message);

    location.reload();
    };

    document.getElementById("closeModal").onclick=function(){

    document.getElementById("eventModal").style.display="none";

    };

    window.onclick=function(e){

        if(e.target.id==="eventModal"){
 
            document.getElementById("eventModal").style.display="none";

        }

    };
}