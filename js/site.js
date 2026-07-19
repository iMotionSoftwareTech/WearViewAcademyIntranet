document.addEventListener("DOMContentLoaded", initialise);

function initialise() {
    verifyUserLogin();
    updateNavigation();
    setupITSupportLink();
    setupLogout();
    setActiveNavigation();

    // 1. Setup Login form if present
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

    // 2. Setup Issue form if present (Removed duplicate event bindings)
    const issueForm = document.getElementById('reportIssueForm');
    if (issueForm) {
        issueForm.addEventListener('submit', handleIssueSubmission);
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

    sessionStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "index.html";
}

function verifyUserLogin(){
    const user = JSON.parse(sessionStorage.getItem("currentUser"));

    const accountIcon = document.getElementById("accountIcon");
    const loggedInUser = document.getElementById("loggedInUser");
    const userGreeting = document.getElementById("userGreeting");

    if (user) {
        if (accountIcon) accountIcon.style.display = "none";
        if (loggedInUser) loggedInUser.style.display = "flex";
        if (userGreeting) userGreeting.textContent = `Hello ${user.firstName} ${user.lastName}`;
    }
    else {
        if (accountIcon) accountIcon.style.display = "inline-block";
        if (loggedInUser) loggedInUser.style.display = "none";
        if (userGreeting) userGreeting.textContent = "";
    }
}

function setupLogout() {
    const logoutLink = document.getElementById("logoutLink");
    if (!logoutLink) return;

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

    // Hide everything safely first (checking elements exist to avoid reference errors)
    if (reportIssue) reportIssue.style.display = "none";
    if (viewRequests) viewRequests.style.display = "none";
    if (viewJobs) viewJobs.style.display = "none";

    // FIXED: Safely exit early if no user session is active before checking .role
    if (!user || !user.role) {
        return;
    }

    switch (user.role) {
        case "Administrator":
            if (reportIssue) reportIssue.style.display = "block";
            if (viewJobs) viewJobs.style.display = "block";
            break;

        case "Teacher":
            if (reportIssue) reportIssue.style.display = "block";
            if (viewRequests) viewRequests.style.display = "block";
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

    if (!link) return;

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

function validateIssueForm() {
    const name = document.getElementById('yourName').value.trim();
    const email = document.getElementById('emailAddress').value.trim();
    const location = document.getElementById('faultLocation').value.trim();
    const faultType = document.getElementById('faultType').value;
    const description = document.getElementById('issueDescription').value.trim();

    if (!name || !email || !location || !faultType || !description) {
        alert("Please complete all fields before submitting.");
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    if (description.length < 15) {
        alert("Please provide a more detailed description (at least 15 characters).");
        return false;
    }

    return true; 
}

function handleIssueSubmission(event) {
    event.preventDefault();

    if (!validateIssueForm()) {
        return; 
    }

    const formData = {
        name: document.getElementById('yourName').value.trim(),
        email: document.getElementById('emailAddress').value.trim(),
        location: document.getElementById('faultLocation').value.trim(),
        faultType: document.getElementById('faultType').value,
        description: document.getElementById('issueDescription').value.trim(),
        timestamp: new Date().toISOString()
    };

    try {
        let localIssuesList = JSON.parse(sessionStorage.getItem('reportedITIssues')) || [];
        localIssuesList.push(formData);
        sessionStorage.setItem('reportedITIssues', JSON.stringify(localIssuesList));

        alert('Thank you! Your IT Support ticket has been successfully validated and saved.');
        
        document.getElementById('reportIssueForm').reset();
    } catch (storageError) {
        console.error('Critical session storage system fault context:', storageError);
        alert('An error occurred while saving your data. Please try again.');
    }
}