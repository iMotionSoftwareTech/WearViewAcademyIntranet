document.addEventListener("DOMContentLoaded", initialise);

function initialise() {
    verifyUserLogin();
    updateNavigation();
    setupITSupportLink();
    setupLogout();
    setActiveNavigation();

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (e) {

            e.preventDefault();

            initiateLogin(
                document.getElementById("username").value,
                document.getElementById("password").value
            );
        });
    }
}

function initiateLogin(username, password) {

    let user = null;

    if (username === "" || password === "") {
        alert("Please enter both username and password.");
        return;
    }

    if (username === "staffmember" && password === "letmein!123") {

        user = new User(
            2,
            "Katy",
            "Johnson",
            "katy.johnson@wearviewacademy.ac.uk",
            "Teacher"
        );

    } else if (username === "admin" && password === "heretohelp!456") {

        user = new User(
            1,
            "David",
            "Smith",
            "david.smith@wearviewacademy.ac.uk",
            "Administrator"
        );

    } else {

        alert("Invalid username or password.");
        return;

    }

    sessionStorage.setItem(
        "currentUser",
        JSON.stringify(user)
    );

    window.location.href = "index.html";
}

function verifyUserLogin(){
    const user = JSON.parse(sessionStorage.getItem("currentUser"));

    const accountIcon = document.getElementById("accountIcon");
    const loggedInUser = document.getElementById("loggedInUser");
    const userGreeting = document.getElementById("userGreeting");

    if (user) {
        accountIcon.style.display = "none";
        loggedInUser.style.display = "flex";
        userGreeting.textContent = `Hello ${user.firstName} ${user.lastName}`;
    }
    else {
        accountIcon.style.display = "inline-block";
        loggedInUser.style.display = "none";
        userGreeting.textContent = "";
    }
}

function setupLogout() {
    const logoutLink = document.getElementById("logoutLink");

    if (!logoutLink) {
        return;
    }

    logoutLink.onclick = function (e) {

        e.preventDefault();
        logout();

    };
}

function updateNavigation() {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));

    const reportIssue = document.getElementById("reportIssueLink");
    const viewRequests = document.getElementById("viewRequestsLink");
    const viewJobs = document.getElementById("viewJobsLink");

    // Hide everything first
    reportIssue.style.display = "none";
    viewRequests.style.display = "none";
    viewJobs.style.display = "none";

    if (!user) {
        return;
    }

    switch (user.role) {
        case "Administrator":
            reportIssue.style.display = "block";
            viewJobs.style.display = "block";
            break;

        case "Teacher":
            reportIssue.style.display = "block";
            viewRequests.style.display = "block";
            break;
    }
}

function logout(){
    sessionStorage.clear();
    window.location.href = "index.html";
}

function setupITSupportLink() {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const link = document.querySelector("#itSupportLink a");

    if (user) {
        link.href = "itsupport.html";
    } else {
        link.href = "login.html";
    }
}

function setActiveNavigation() {
    const currentPage = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll("nav ul li a");

    links.forEach(link => {
        link.parentElement.classList.remove("active");
        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.parentElement.classList.add("active");
        }
    });
}