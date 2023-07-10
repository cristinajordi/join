let form = document.getElementById("form");
let task;
let selectedUsers = [];
let editTaskId;

async function initBacklog() {
    await init();
    document.getElementById("nav-Backlog").classList.remove("brd-left-inactive");
    document.getElementById("nav-Backlog").classList.add("brd-left-active");
    renderBacklog();
    renderUser();
}

function cutString(descr, amount) {
    if (descr.length > amount) {
        descr = descr.slice(0, amount);
        let dots = "...";
        descr = descr.concat(dots);
    }
    return descr;
}

async function deleteTask(i) {
    backendTasks.splice(i, 1);
    await backend.setItem("tasks", JSON.stringify(backendTasks));
    renderBacklog();
    renderBacklogAlert('Deleted');
}

function renderBacklog() {
    let loadTasks = document.getElementById("backlogContent");
    loadTasks.innerHTML = "";
    let backlogTasks = backendTasks.filter(t => t['status'] == 'Backlog');
    if (backlogTasks.length > 0) {
        renderBacklogTasks(loadTasks);
    } else if (backlogTasks.length == 0) {
        loadTasks.innerHTML = renderAddTaskMessage();
    }
}

function renderBacklogTasks(loadTasks) {
    for (let i = 0; i < backendTasks.length; i++) {
        const task = backendTasks[i];
        if (task.status == 'Backlog') {
            loadTasks.innerHTML += renderBacklogHTML(i, task);
        }
    }
}

function renderBacklogHTML(i, task) {
    return `
    <div class="bg ${task["urgency"]} ${task["category"]}">
        <div class="contentAvatar">
            <div><img src="${backendUsers[task["creator"] - 1]["src"]}" class="avatarBacklog"></div>
            <div class="mailContainer">
            <div>
                <p><b>${backendUsers[task["creator"] - 1]["firstName"]} ${backendUsers[task["creator"] - 1]["lastName"]}</b></p>
                <p class="mail">${backendUsers[task["creator"] - 1]["email"].toLowerCase()}</p></div></div>
            </div>
        <div class="contentCategory"><p class="contentTextCategory ${task["category"]}"><b>${task["category"]}</b></p></div>
        <div class="contentDescription">
            <div><p><b>${task["title"]} / Ticket-ID: ${i + 1}</b></p></div>
            <div><p class="text">${cutString(task["description"], 80)}</p></div>
        </div>
        <div class="contentEdit">
            <div><a  onclick="deleteTask(${i})"><img src="../img/delete.png" title="delete" class="iconBacklog"></a></div>
            <div><a  onclick="editTask(${i})"><img src="../img/edit.png" title="edit" class="iconBacklog"></a></div>
            <div id="pushtoBoardbtn${i}"><a onclick="pushToBoard(${i})"><img src="../img/addToBoard.png" title="push to board" class="iconBacklog"></a></div>
        </div>
    </div>
        `;
}

function renderAddTaskMessage() {
    return `
    <a href="../html/addTask.html" class="add-message">Currently, there is no task in backlog. You can add a task in the "Add Task" section.</p>
    `;
}

formbl.addEventListener(
    "submit",
    function(event) {
        if (!formbl.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        formbl.classList.add("was-validated");
    },
    false
);

function closeDialog() {
    renderUser();
    document.getElementById("dialogEditTask").classList.add("d-none");
}

function editTask(id) {
    document.getElementById("dialogEditTask").classList.remove("d-none");
    setEditTask(id);
    editTaskId = id;
    let event = document.getElementById('formbl');
}

function setEditTask(id) {
    let editTasks = backendTasks[id];
    setEditSingleElements(editTasks);
    setEditUrgencies(editTasks);
    setEditAssignedUsers(editTasks);
    checkSelectUser();
}

function setEditSingleElements(editTasks) {
    formbl.elements["tasktitle"].value = editTasks["title"];
    formbl.elements["category"].value = editTasks["category"];
    formbl.elements["dueDate"].value = editTasks["duedate"];
    formbl.elements["curDate"].value = editTasks["currentdate"];
    formbl.elements["desc"].value = editTasks["description"];
}

function setEditUrgencies(editTasks) {
    let urgencys = document.getElementsByName("choice");
    for (i = 0; i < urgencys.length; i++) {
        if (urgencys[i].value == editTasks["urgency"]) urgencys[i].checked = "checked";
    }
}

function setEditAssignedUsers(editTasks) {
    editTasks["assignedTo"].forEach((element) => {
        document.getElementById("user-" + element).classList.add('avatar-selected');
    });
    selectedUsers = editTasks["assignedTo"];
}


async function saveEditTask() {
    if (formbl.checkValidity()) {
        setTask();
        backendTasks[editTaskId] = task;
        await backend.setItem("tasks", JSON.stringify(backendTasks));
        closeDialog();
        selectedUsers = [];
        renderBacklog();
        formbl.classList.remove("was-validated");
        renderBacklogAlert('Edited')
    }
}

function setTask() {
    task = {
        title: formbl.elements["tasktitle"].value,
        urgency: getUrgency(),
        category: formbl.elements["category"].value,
        duedate: formbl.elements["dueDate"].value,
        currentdate: formbl.elements["curDate"].value,
        description: formbl.elements["desc"].value,
        assignedTo: selectedUsers,
        creator: backendTasks[editTaskId]["creator"],
        status: backendTasks[editTaskId]["status"],
    };
}

function getUrgency() {
    let urgencys = document.getElementsByName("choice");
    for (i = 0; i < urgencys.length; i++) {
        if (urgencys[i].checked) return urgencys[i].value;
    }
}

function renderUser() {
    let avatarPicker = document.getElementById("avatars");
    avatarPicker.innerHTML = ``;
    for (let i = 0; i < backendUsers.length; i++) {
        const user = backendUsers[i];
        avatarPicker.innerHTML += `<img title="${user["firstName"]} ${user["lastName"]}" id='user-${i}' onclick='selectUser(${i})' src="${user["src"]}" class="avatar ">`;
    }
}

function selectUser(i) {
    let user = document.getElementById("user-" + i);
    user.classList.toggle("avatar-selected");
    if (selectedUsers.includes(i)) {
        selectedUsers = selectedUsers.filter((a) => a != i);
    } else {
        selectedUsers.push(i);
    }
    checkSelectUser();
}

function checkSelectUser() {
    if (selectedUsers.length == 0) {
        document.getElementById("users").setAttribute("required", "");
    } else {
        document.getElementById("users").removeAttribute("required");
    }
}

function renderUrg() {
    removeColor(4);
    document.getElementById("sort-4").classList.add("color-blue");
    backendTasks.sort(function(x, y) {
        let a = x.urgency,
            b = y.urgency;
        a = a == "low" ? 2 : a == "medium" ? 1 : 0;
        b = b == "low" ? 2 : b == "medium" ? 1 : 0;
        return a == b ? 0 : a > b ? 1 : -1;
    });
    renderBacklog();
}

function renderCat() {
    removeColor(2);
    document.getElementById("sort-2").classList.add("color-blue");
    backendTasks.sort((a, b) => a["category"].localeCompare(b["category"]));
    renderBacklog();
}

function renderNam() {
    removeColor(1);
    document.getElementById("sort-1").classList.add("color-blue");
    backendTasks.sort((a, b) => a["creator"] - b["creator"]);
    renderBacklog();
}

function renderTit() {
    removeColor(3);
    document.getElementById("sort-3").classList.add("color-blue");
    backendTasks.sort((a, b) => a["title"].localeCompare(b["title"]));
    renderBacklog();
}

function removeColor(i) {
    for (let index = 1; index < 5; index++) {
        if (index == i) continue;
        document.getElementById("sort-" + index).classList.remove("color-blue");
    }
}

async function pushToBoard(i) {
    backendTasks[i].status = 'ToDo';
    await backend.setItem("tasks", JSON.stringify(backendTasks));
    await initBacklog();
    renderBacklogAlert('PushedToBoard');
}

function renderBacklogAlert(event) {
    let backlogAlert = document.getElementById('backlogalert');
    backlogAlert.innerHTML = '';
    alertCases(backlogAlert, event);
    setTimeout(() => {
        backlogAlert.innerHTML = '';
    }, 3000);
}

function alertCases(backlogAlert, event) {
    switch (event) {
        case 'PushedToBoard':
            backlogAlert.innerHTML = templateAlertMessage();
            break;
        case 'Deleted':
            backlogAlert.innerHTML = templateAlertMessage2();
            break;
        case 'Edited':
            backlogAlert.innerHTML = templateAlertMessage3();
            break;
    }
}

function templateAlertMessage() {
    return `
    <div class="card-alert slide-in"><p>Task has been pushed to the board</p></div>
    `;
}

function templateAlertMessage2() {
    return `
    <div class="card-alert slide-in"><p>Task has been deleted</p></div>
    `;
}

function templateAlertMessage3() {
    return `
    <div class="card-alert slide-in"><p>Task has been successfully edited</p></div>
    `;
}

formbl.addEventListener('click', function(event) {
    event.stopPropagation();
});

fullscreen.addEventListener('click', function(event) {
    closeDialog();
});