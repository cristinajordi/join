const loginForm = document.getElementById("login");
const createAccountForm = document.querySelector("#register");
let selectedNewUser = "userNew-1";
let currentUser = [];
let newUser;
let logUsername = document.getElementById("log-username");
let logPassword = document.getElementById("log-password");


async function initLogin() {
    setURL("https://gruppe-302.developerakademie.net/smallest_backend_ever");
    await downloadFromServer();
    await getUsersFromServer();
}

function sumbit() {
    loginForm.classList.remove("form_hidden");
    createAccountForm.classList.add("form_hidden");
}

function createAcc() {
    loginForm.classList.add("form_hidden");
    createAccountForm.classList.remove("form_hidden");
}

loginForm.addEventListener(
    "submit",
    function(event) {
        checkUsername();
        checkPassword();
        if (!loginForm.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        loginForm.classList.add("was-validated");
    },
    false
);

function checkUsername() {
    for (let i = 0; i < backendUsers.length; i++) {
        if (document.getElementById("loginUserName").value == backendUsers[i].userName) {
            logUsername.removeAttribute("required");
            return;
        }
    }
    logUsername.setAttribute("required", "");
}

function checkPassword() {
    for (let i = 0; i < backendUsers.length; i++) {
        if (document.getElementById("loginPassword").value == backendUsers[i].password) {
            logPassword.removeAttribute("required");
            return;
        }
    }
    logPassword.setAttribute("required", "");
}

async function login() {
    var username = document.getElementById("loginUserName").value;
    var password = document.getElementById("loginPassword").value;
    for (let i = 0; i < backendUsers.length; i++) {
        if (username == backendUsers[i].userName && password == backendUsers[i].password) {
            await backend.setItem("currentUser", JSON.stringify(backendUsers[i].id));
            return (location.href = "html/addTask.html");
        }
    }
}

createAccountForm.addEventListener(
    "submit",
    function(event) {
        if (!createAccountForm.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        createAccountForm.classList.add("was-validated");
    },
    false
);

async function registerUsers() {
    if (createAccountForm.checkValidity()) {
        setNewUser();
        await backendUsers.push(newUser);
        await backend.setItem("users", JSON.stringify(backendUsers));
        await backend.setItem("currentUser", JSON.stringify(newUser.id));
        location.href = "html/addTask.html";
    }
}

function setNewUser() {
    newUser = {
        id: backendUsers.length + 1,
        userName: document.getElementById("signupUsername").value,
        password: document.getElementById("signUpPassword").value,
        firstName: document.getElementById("signupfirstname").value,
        lastName: document.getElementById("signuplastname").value,
        email: document.getElementById("userEmail").value,
        src: "../img/" + document.getElementById(selectedNewUser).src.split("/img/")[1],
    };
}

function selectNewUser(i) {
    let user = document.getElementById("userNew-" + i);
    if (i != 1) user.classList.toggle("avatar-selected");
    if (isSelectedUserDeselected(i))
        setDefaultUser();
    else
        setSelectedUser(i);
}

function isSelectedUserDeselected(i) {
    return selectedNewUser.includes("userNew-" + i);
}

function setDefaultUser() {
    selectedNewUser = "userNew-1";
    document.getElementById("userNew-1").classList.add("avatar-selected");
}

function setSelectedUser(i) {
    selectedNewUser = "userNew-" + i;
    if (i == 1)
        document.getElementById("userNew-1").classList.add("avatar-selected");
    for (let j = 1; j < 4; j++) {
        if (j == i) continue;
        document.getElementById("userNew-" + j).classList.remove("avatar-selected");
    }
}

async function loginAsGuest() {
    await backend.setItem("currentUser", JSON.stringify(5));
    return (location.href = "html/addTask.html");
}

loginUserName.addEventListener('keyup', function(event) {
    checkUsername();
});

loginPassword.addEventListener('keyup', function(event) {
    checkPassword();
});