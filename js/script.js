let backendTasks;
let currentUserId;
let backendUsers;

async function init() {
  setURL("https://cristina-jordi.developerakademie.net/smallest_backend_ever");
  await includeHTML();
  await downloadFromServer();
  await getUsersFromServer();
  await getTasksFromServer();
  document.getElementById("profil-logo").src = backendUsers[currentUserId - 1].src;
  document.getElementById("profil-name").innerHTML = backendUsers[currentUserId - 1].firstName;
}

async function getUsersFromServer() {
  backendUsers = (await JSON.parse(backend.getItem("users"))) || [];
  currentUserId = (await JSON.parse(backend.getItem("currentUser"))) || 5;
}

async function getTasksFromServer() {
  backendTasks = await JSON.parse(backend.getItem("tasks"));
}

async function includeHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute("w3-include-html"); // "includes/header.html"
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = "Page not found";
    }
  }
}