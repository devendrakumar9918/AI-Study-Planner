function showToast(icon, title) {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: icon,
        title: title,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
    });
}

function openModule(moduleName) {

    if (moduleName === "subjects") {
        document.getElementById("subject-form").style.display = "block";
    }

    else if (moduleName === "schedule") {
        generateStudyPlan(); // 👈 ADD THIS
    }

    else {
        alert(moduleName + " module opened");
    }
}

let user = JSON.parse(localStorage.getItem("user"));

let subjects = JSON.parse(
localStorage.getItem("subjects_" + user.email)
) || [];

function deleteSubject(index) {
    subjects.splice(index, 1); // remove item

    localStorage.setItem("subjects", JSON.stringify(subjects));

    displaySubjects(); // refresh UI
}

window.onload = function () {
    let saved = JSON.parse(localStorage.getItem("subjects"));

    if (saved) {
        subjects = saved;
        displaySubjects();
    }
};

function displaySubjects() {
    let container = document.getElementById("subject-list");

    container.innerHTML = "";

   if (subjects.length === 0) {
       container.innerHTML = "<p>No subjects added yet</p>";
       return;
   }

subjects.forEach((sub, index) => {
 let card = document.createElement("div");
 card.className = "subject-item";

 card.innerHTML = `
<div class="subject-card">
    <h3>📘 ${sub.subject}</h3>
    <p>📅 Deadline: ${sub.deadline}</p>
    <p>⭐ Difficulty: ${sub.difficulty}</p>

    <button class="delete-btn" onclick="deleteSubject(${index})">
        🗑 Delete
    </button>
</div>
`;

container.appendChild(card);
    });
}

function generateStudyPlan() {
    let container = document.getElementById("study-plan");

    if (subjects.length === 0) {
        container.innerHTML = "<p>No subjects added!</p>";
        return;
    }

    // 🔥 sort by deadline
    let sorted = [...subjects].sort((a, b) => 
        new Date(a.deadline) - new Date(b.deadline)
    );

    container.innerHTML = "<h3>Your Study Plan</h3>";

    sorted.forEach((sub) => {
        let hours = sub.difficulty === "Hard" ? 3 :
                    sub.difficulty === "Medium" ? 2 : 1;

        let card = document.createElement("div");
        card.className = "plan-card";

        card.innerHTML = `
            <h4>${sub.subject}</h4>
            <p>📅 ${sub.deadline}</p>
            <p>⏱ ${hours} hrs/day</p>
        `;

        container.appendChild(card);
    });
}

function updateClock(){

const clock = document.getElementById("clock");

if(clock){

const now = new Date();

clock.innerText = now.toLocaleTimeString();

}

}

setInterval(updateClock,1000);

updateClock();

const quotes = [
"Success starts with discipline.",
"Small progress is still progress.",
"Consistency beats motivation.",
"Focus today, shine tomorrow.",
"Dream big, work daily.",
"Study now, enjoy later."
];

const quoteBox = document.getElementById("quote");

if(quoteBox){
let random = Math.floor(Math.random() * quotes.length);
quoteBox.innerText = quotes[random];
}

const text = "Stay Consistent. Study Smart. Win Daily.";
const typingBox = document.getElementById("typing-text");

if(typingBox){

let i = 0;

function typeText(){
if(i < text.length){
typingBox.innerHTML += text.charAt(i);
i++;
setTimeout(typeText,60);
}
}

typeText();

}

async function updateHomeProgress(){

const text = document.getElementById("progress-text");

if(!text) return;

try{

let user = JSON.parse(localStorage.getItem("user"));

let res = await fetch(
`http://localhost:5000/subjects?email=${user.email}`
);

let subjects = await res.json();

let completed = subjects.filter(sub => sub.completed).length;

let percent = subjects.length === 0
    ? 0
    : Math.round((completed / subjects.length) * 100);

text.innerText = percent + "% Completed";

let fill = document.querySelector(".fill");

if(fill){
    fill.style.width = percent + "%";
}

}catch(err){
console.log(err);
}
}

updateHomeProgress();

function updateStudyStreak() {

    let streakText = document.getElementById("streak-count");

    if(!streakText) return;

    let streak = localStorage.getItem("studyStreak") || 0;

    streakText.innerText = streak + " Days";
}

updateStudyStreak();

async function loadAchievements() {

    let badges = document.getElementById("badges");

    if (!badges) return;

    let achievements = [];

    let user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    let res = await fetch(
        "http://localhost:5000/subjects?email=" + user.email
    );

    let subjects = await res.json();

    let totalSubjects = subjects.length;
    let completedSubjects = subjects.filter(s => s.completed).length;

// Abhi ke liye streak = completed subjects
let streak = completedSubjects;

    // Streak Achievements
    if (completedSubjects >= 1) {
        achievements.push("🥇 First Subject Completed");
    }

    if (streak >= 7) {
        achievements.push("🔥 7 Day Streak");
    }

    if (streak >= 30) {
        achievements.push("👑 30 Day Streak");
    }

    // Subject Achievements
    if (totalSubjects >= 5) {
        achievements.push("📚 5 Subjects Added");
    }

    if (totalSubjects >= 10) {
        achievements.push("🚀 10 Subjects Added");
    }

    if (achievements.length === 0) {
        badges.innerHTML = "<p>No achievements yet</p>";
    } else {
        badges.innerHTML = achievements
            .map(item => `<p>${item}</p>`)
            .join("");
    }
}

loadAchievements();

async function loadDeadlineAlerts() {

    let container = document.getElementById("deadline-list");
    if (!container) return;

    let user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    let res = await fetch(
        "http://localhost:5000/subjects?email=" + user.email
    );

    let subjects = await res.json();

    let today = new Date();

    let upcoming = subjects.filter(sub => {
        if (!sub.deadline || sub.completed) return false;

        let deadline = new Date(sub.deadline);
        let diffDays = Math.ceil(
            (deadline - today) / (1000 * 60 * 60 * 24)
        );

        return diffDays >= 0 && diffDays <= 3;
    });

    if (upcoming.length === 0) {
        container.innerHTML = "<p>🎉 No urgent deadlines</p>";
        return;
    }

    container.innerHTML = "";

    upcoming.forEach(sub => {
        container.innerHTML += `
            <p>⚠️ ${sub.subject}</p>
        `;
    });
}

loadDeadlineAlerts();

async function loadWeakAreas() {

    let container = document.getElementById("weak-container");

    if (!container) return;

    try {

        let user = JSON.parse(localStorage.getItem("user"));

        let res = await fetch(
            `http://localhost:5000/subjects?email=${user.email}`
        );

        let subjects = await res.json();

        if (subjects.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <h3>No Subjects Added</h3>
                    <p>Add subjects first to see weak areas.</p>
                </div>
            `;
            return;
        }

        let weakSubjects = subjects.filter(sub => !sub.completed);

        if (weakSubjects.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <h3>🎉 Great Job!</h3>
                    <p>All subjects are completed.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = "";

        weakSubjects.forEach(sub => {

            container.innerHTML += `
                <div class="card">
                    <h3>📚 ${sub.subject}</h3>
                    <p>Status: Needs Attention</p>
                </div>
            `;
        });

    } catch (err) {
        console.log(err);
    }
}

loadWeakAreas();

function checkLogin(){

let user = JSON.parse(localStorage.getItem("user"));

let page = window.location.pathname;

if(page.includes("index.html")){

if(!user){
window.location.href = "login.html";
}

}

}

checkLogin();

function showUserName(){

let user = JSON.parse(localStorage.getItem("user"));

let welcome = document.getElementById("welcome-user");

if(user && welcome){
welcome.innerText = "Welcome " + user.name + " 👋";
}

}

showUserName();

function logoutUser(){

localStorage.removeItem("user");

alert("Logged Out Successfully");

window.location.href = "login.html";

}

function updateRealProgress(){

let total = subjects.length;

let totalText = document.getElementById("total-subjects");
let percentText = document.getElementById("progress-percent");
let fill = document.querySelector(".fill");

if(totalText){
totalText.innerText = total + " Subjects";
}

let percent = total * 20;

if(percent > 100){
percent = 100;
}

if(percentText){
percentText.innerText = percent + "% Complete";
}

if(fill){
fill.style.width = percent + "%";
}

}

updateRealProgress();

async function addSubject() {

    let user = JSON.parse(localStorage.getItem("user"));

    let subject = document.getElementById("subject-name").value;
    let deadline = document.getElementById("deadline").value;
    let difficulty = document.getElementById("difficulty").value;

    if (!subject) {
        showToast("warning", "Please enter subject name");
        return;
    }

    console.log({
    email: user.email,
    subject: subject,
    date: deadline,
    level: difficulty
});

    let res = await fetch("http://localhost:5000/add-subject", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: user.email,
            subject: subject,
            date: deadline,
            level: difficulty
        })
    });

    let data = await res.json();

    showToast("success", data.message);

    console.log("Reached reset");
console.log(document.getElementById("subject-name").value);
console.log(document.getElementById("deadline").value);

    let totalSubjects = parseInt(localStorage.getItem("totalSubjects")) || 0;
    localStorage.setItem("totalSubjects", totalSubjects + 1);

    // Reset Form
    document.getElementById("subject-name").value = "";
    document.getElementById("deadline").value = "";
    document.getElementById("difficulty").selectedIndex = 0;

    loadSubjects();
}

async function loadSubjects(){

let user = JSON.parse(localStorage.getItem("user"));

let res = await fetch("http://localhost:5000/subjects?email=" + user.email);

let subjects = await res.json();

let list = document.getElementById("subject-list");

if(list){

list.innerHTML = "";

let search = document.getElementById("search-subject");

if (search) {
    subjects = subjects.filter(item =>
        item.subject.toLowerCase().includes(search.value.toLowerCase())
    );
}

let difficulty = document.getElementById("filter-difficulty");

if (difficulty && difficulty.value !== "All") {

    subjects = subjects.filter(item =>
        (item.level || "Easy") === difficulty.value
    );

}

subjects.forEach((item) => {

    console.log(item);
console.log("Level =", item.level);

list.innerHTML += `
<div class="subject-card">
<h3>📘 ${item.subject}</h3>

<p>🗓 Deadline: ${item.date || "Not Set"}</p>

<p>⭐ Difficulty: ${item.level || "Easy"}</p>

${item.completed
? `<button class="completed-badge" disabled>✅ Completed</button>`
: `<button class="complete-btn" onclick="completeSubject('${item._id}')">✔ Mark Complete</button>`
}

<button class="delete-btn" onclick="deleteMongoSubject('${item._id}')">
🗑 Delete
</button>

</div>
`;

});

}

}

function searchSubjects() {
    loadSubjects();
}

async function deleteMongoSubject(id){

await fetch("http://localhost:5000/delete-subject/" + id,{
method:"DELETE"
});

loadSubjects();

}
async function completeSubject(id){

    await fetch("http://localhost:5000/complete-subject/" + id,{
        method:"PUT"
    });

    let today = new Date().toDateString();

    let lastDate = localStorage.getItem("lastStudyDate");

    let streak = parseInt(localStorage.getItem("studyStreak")) || 0;

    if(lastDate !== today){
       streak++;
       localStorage.setItem("studyStreak", streak);
       localStorage.setItem("lastStudyDate", today);
    }

    loadSubjects();
}

loadSubjects();

async function loadProgress(){

let user = JSON.parse(localStorage.getItem("user"));

if(!user) return;

let res = await fetch("http://localhost:5000/subjects?email=" + user.email);

let subjects = await res.json();

let total = subjects.length;
let completed = subjects.filter(item => item.completed === true).length;
let pending = total - completed;

let percent = total === 0 ? 0 : Math.round((completed / total) * 100);

const ctx = document.getElementById("progressChart");

if(ctx){
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Completed", "Pending"],
            datasets: [{
                data: [completed, pending]
            }]
        }
    });
}

if(document.getElementById("totalSubjects")){
    document.getElementById("totalSubjects").innerText = total;
    document.getElementById("completedSubjects").innerText = completed;
    document.getElementById("pendingSubjects").innerText = pending;
    document.getElementById("progressPercent").innerText = percent + "%";

    let message = "";

    if (percent == 100) {
        message = "🏆 Excellent!";
    }
    else if (percent >= 75) {
        message = "🔥 Great Going!";
    }
    else if (percent >= 50) {
        message = "💪 Keep Going!";
    }
    else {
        message = "🚀 Start Studying!";
    }

    document.getElementById("progressMessage").innerText = message;
}

}

loadProgress();

function saveReminder() {

let title = document.getElementById("reminder-title").value;
let time = document.getElementById("reminder-time").value;

if(title === "" || time === ""){
alert("Fill all fields");
return;
}

let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

reminders.push({
title,
time
});

localStorage.setItem("reminders", JSON.stringify(reminders));

document.getElementById("reminder-title").value = "";
document.getElementById("reminder-time").value = "";

loadReminders();
}

function loadReminders(){

let list = document.getElementById("reminder-list");

if(!list) return;

let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

list.innerHTML = "";

if(reminders.length === 0){
list.innerHTML = "<p>No reminder added yet.</p>";
return;
}

reminders.forEach((item,index)=>{

list.innerHTML += `
<div class="subject-card">
<h3>⏰ ${item.title}</h3>
<p>Time: ${item.time}</p>
<button onclick="deleteReminder(${index})">🗑 Delete</button>
</div>
`;

});
}

function deleteReminder(index){

let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

reminders.splice(index,1);

localStorage.setItem("reminders", JSON.stringify(reminders));

loadReminders();
}

loadReminders();

setInterval(checkReminder, 1000);

function checkReminder(){

let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

let now = new Date();

let currentTime =
String(now.getHours()).padStart(2,"0") +
":" +
String(now.getMinutes()).padStart(2,"0");

reminders.forEach((item)=>{

if(item.time === currentTime && !item.done){

alert("⏰ Reminder: " + item.title);

let audio = new Audio("https://www.soundjay.com/buttons/beep-07.mp3");
audio.play();

item.done = true;

}

});

localStorage.setItem("reminders", JSON.stringify(reminders));
}

window.generatePlan = async function () {

    try{
    document.getElementById("study-plan").innerHTML =
"<p>⏳ Generating study plan...</p>";

const btn = document.getElementById("generateBtn");
btn.disabled = true;
btn.innerText = "Generating...";

    let user =
    JSON.parse(localStorage.getItem("loggedInUser")) ||
    JSON.parse(localStorage.getItem("user"));

    let res = await fetch(
        "http://localhost:5000/subjects?email=" + user.email
    );

    let subjects = await res.json();

    let subjectNames = subjects.map(sub => sub.subject);

    let aiRes = await fetch(
        "http://localhost:5000/generate-plan",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                subjects: subjectNames.join(", ")
            })
        }
    );

    let data = await aiRes.json();

document.getElementById("study-plan").innerHTML = `
<div class="plan-card">
    ${marked.parse(data.plan)}
</div>`;

showToast("success", "Study Plan Generated Successfully!");

btn.disabled = false;
btn.innerText = "Generate Plan";

}
catch(err){
   console.log("PLAN ERROR:", err);
   document.getElementById("study-plan").innerHTML =
   "<p>Error generating plan</p>";

   showToast("error", "Failed to generate study plan!");

   btn.disabled = false;
   btn.innerText = "Generate Plan";
}
}

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}

async function exportPDF() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    let plan = document.getElementById("study-plan");
    let content = plan.innerText;

    content = content
    .replace(/•/g, "-")
    .replace(/✓/g, "[Done]")
    .replace(/→/g, "->")
    .replace(/—/g, "-");

    doc.setFontSize(20);
    doc.text("AI Study Planner", 20, 20);

    doc.setFontSize(14);
    doc.text("Generated Study Plan", 20, 35);

    let lines = doc.splitTextToSize(content, 170);

    let y = 50;

    lines.forEach(line => {

        if(y > 280){
            doc.addPage();
            y = 20;
        }

        doc.text(line, 20, y);
        y += 8;
    });

    doc.save("AI_Study_Plan.pdf");
}

// ================= Dashboard Statistics =================

async function loadDashboardStats() {

    let total = document.getElementById("total-subjects");

    if (!total) return;

    let completed = document.getElementById("completed-subjects");
    let pending = document.getElementById("pending-subjects");

    let user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    let res = await fetch(
        "http://localhost:5000/subjects?email=" + user.email
    );

    let subjects = await res.json();

    let totalCount = subjects.length;

    let completedCount =
        subjects.filter(s => s.completed).length;

    let pendingCount =
        totalCount - completedCount;

    total.innerText = totalCount;
    completed.innerText = completedCount;
    pending.innerText = pendingCount;

}

loadDashboardStats();
