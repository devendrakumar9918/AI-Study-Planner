async function signupUser(){

let name = document.getElementById("signup-name").value;
let email = document.getElementById("signup-email").value;
let password = document.getElementById("signup-password").value;

let res = await fetch("https://ai-study-planner-idkt.onrender.com/signup",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({name,email,password})
});

let data = await res.json();

alert(data.message);

if(data.message === "Signup Successful"){
window.location.href="login.html";
}

}



async function loginUser(){

let email = document.getElementById("login-email").value;
let password = document.getElementById("login-password").value;

let res = await fetch("https://ai-study-planner-idkt.onrender.com/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({email,password})
});

let data = await res.json();
localStorage.setItem("token", data.token);

alert(data.message);

if(data.message === "Login Successful"){

localStorage.setItem("user", JSON.stringify({
name:data.name,
email:data.email
}));

window.location.href="index.html";

}

}