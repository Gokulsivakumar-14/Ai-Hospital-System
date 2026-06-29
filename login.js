const API_BASE = window.location.protocol === "file:" ? "http://localhost:5000" : "";

// AUTO LOGIN IF REMEMBERED
let saved = localStorage.getItem("loggedIn");
if(saved==="staff") window.location.href="index.html";
if(saved==="admin") window.location.href="admin.html";

// PASSWORD SHOW/HIDE
function togglePassword(){
 let pwd = document.getElementById("pwd");
 pwd.type = pwd.type === "password" ? "text" : "password";
}

// LOGIN FUNCTION
async function login(){
 let role = document.getElementById("role").value;
 let id = document.getElementById("uid").value;
 let pwd = document.getElementById("pwd").value;
 let remember = document.getElementById("remember").checked;
 let msg = document.getElementById("msg");

 if(!role || !id || !pwd){
  msg.innerText = "⚠️ Fill all fields";
  return;
 }

 try {
  const res = await fetch(API_BASE + "/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, password: pwd, role })
  });
  const data = await res.json();
  if (data.success) {
    if(remember) localStorage.setItem("loggedIn", role);
    if(role==="staff") {
      window.location.href="index.html";
    } else {
      window.location.href="admin.html";
    }
  } else {
    msg.innerText = "❌ " + data.message;
  }
 } catch (err) {
  console.error("Login failed:", err);
  msg.innerText = "❌ Server connection error";
 }
}
