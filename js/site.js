document.addEventListener("DOMContentLoaded", initialise);

let currentRequestsPage = 1;
let currentJobPage = 1;
let jobsPerPage = 10;
let currentStatus = "Open"

function initialise() {
    verifyUserLogin();
    updateNavigation();
    setupLogout();
    setupITSupportLink();
    setActiveNavigation();

    // Login page
    const loginForm = document.getElementById("loginForm");

    if(loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            initiateLogin(
                document.getElementById("username").value,
                document.getElementById("password").value
            );
		});
	}

    // Report Issues page
    const reportForm = document.getElementById("reportIssueForm");

    if(reportForm) {
        reportForm.addEventListener("submit", handleIssueSubmission);
	}

    // View Requests page
    const requestsContainer = document.getElementById("requestsContainer");

    if(requestsContainer) {
        renderRequestsLog();

        const searchBar = document.getElementById("searchBar");
        const statusFilter = document.getElementById("statusFilter");
        const itemsPerPage = document.getElementById("itemsPerPageSelect");

        searchBar.addEventListener("input", () => {
            currentRequestsPage = 1;
            renderRequestsLog();
		});

        statusFilter.addEventListener("change", () => {
            currentRequestsPage = 1;
            renderRequestsLog();
		});

        itemsPerPage.addEventListener("change", () => {
            currentRequestsPage = 1;
            renderRequestsLog();
		});

        document.getElementById("prevPageBtn")
            .addEventListener("click", previousPage);

        document.getElementById("nextPageBtn")
            .addEventListener("click", nextPage);
	}  

    if(document.getElementById("jobsContainer")){
        document
            .getElementById("jobSearch")
            .addEventListener("input",renderJobs);

        document
            .getElementById("incompleteTab")
            .addEventListener("change",renderJobs);
            
            document
            .getElementById("completedTab")
            .addEventListener("change",renderJobs);

        document
            .getElementById("jobsPerPage")
            .addEventListener("change",()=>{
                currentJobPage = 1;
                renderJobs();
			});

		renderJobs();
	}
}

/* ==========================================================
   LOGIN PAGE
========================================================== */
function initiateLogin(username, password) {
    let user = null;

    if(username === "" || password === "") {
        alert("Please enter both username and password.");
        return;
	}

    if(username === "staffmember" && password === "letmein!123") {
        user = new User(
            2,
            "Katy",
            "Johnson",
            "katy.johnson@wearviewacademy.ac.uk",
            "Teacher"
        );
	} else if(username === "admin" && password === "heretohelp!456") {
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

    if(!accountIcon || !loggedInUser || !userGreeting) {
        return;
	}

    if(user) {
        if(accountIcon) accountIcon.style.display = "none";
        if(loggedInUser) loggedInUser.style.display = "flex";
        if(userGreeting) userGreeting.textContent = `Hello ${user.firstName} ${user.lastName}`;
	}
    else {
        if(accountIcon) accountIcon.style.display = "inline-block";
        if(loggedInUser) loggedInUser.style.display = "none";
        if(userGreeting) userGreeting.textContent = "";
	}
}

function setupLogout() {
    const logoutLink = document.getElementById("logoutLink");
    if(!logoutLink) {
        return;
	} 

    logoutLink.onclick = function(e) {
        e.preventDefault();
        logout();
	};
}

function updateNavigation() {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));

    const reportIssue = document.getElementById("reportIssueLink");
    const viewRequests = document.getElementById("viewRequestsLink");
    const viewJobs = document.getElementById("viewJobsLink");

    // Hide everything safely first(checking elements exist to avoid reference errors)
    if(reportIssue) reportIssue.style.display = "none";
    if(viewRequests) viewRequests.style.display = "none";
    if(viewJobs) viewJobs.style.display = "none";

    // FIXED: Safely exit early if no user session is active before checking .role
    if(!user || !user.role) {
        return;
	}

    switch(user.role) {
        case "Administrator":
            if(reportIssue) reportIssue.style.display = "block";
            if(viewJobs) viewJobs.style.display = "block";
            break;

        case "Teacher":
            if(reportIssue) reportIssue.style.display = "block";
            if(viewRequests) viewRequests.style.display = "block";
            break;
	}
}

function logout(){
    sessionStorage.clear();
    window.location.href = "index.html";
}

/* ==========================================================
   NAVIGATION
========================================================== */
function setupITSupportLink() {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const link = document.querySelector("#itSupportLink a");

    if(!link) {
        return;
	}

    link.href = user ? "itsupport.html" : link.href = "login.html";
}

function setActiveNavigation() {
    const currentPage = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll("nav ul li a");

    links.forEach(link => {
        link.parentElement.classList.remove("active");
        const linkPage = link.getAttribute("href");

        if(linkPage === currentPage) {
            link.parentElement.classList.add("active");
		}
	});
}

/* ==========================================================
   REPORT ISSUE PAGE
========================================================== */
function validateIssueForm() {
    const name = document.getElementById('yourName').value.trim();
    const email = document.getElementById('emailAddress').value.trim();
    const location = document.getElementById('faultLocation').value.trim();
    const faultType = document.getElementById('faultType').value;
    const issueTitle = document.getElementById('issueTitle').value.trim();
    const description = document.getElementById('issueDescription').value.trim();

    if(!name || !email || !location || !faultType || !description) {
        alert("Please complete all fields before submitting.");
        return false;
	}

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return false;
	}

    if(description.length < 15) {
        alert("Please provide a more detailed description (at least 15 characters).");
        return false;
	}

    return true; 
}

function handleIssueSubmission(event) {
    event.preventDefault();

    if(!validateIssueForm()) {
        return; 
	}

    const formData = {
        name: document.getElementById('yourName').value.trim(),
        email: document.getElementById('emailAddress').value.trim(),
        location: document.getElementById('faultLocation').value.trim(),
        faultType: document.getElementById('faultType').value,
        issueTitle: document.getElementById('issueTitle').value.trim(),
        description: document.getElementById('issueDescription').value.trim(),
        timestamp: new Date().toISOString(),
        status: "Open"
	};

    try {
        let localIssuesList = JSON.parse(sessionStorage.getItem('reportedITIssues')) || [];
        localIssuesList.push(formData);
        sessionStorage.setItem('reportedITIssues', JSON.stringify(localIssuesList));

        alert('Thank you! Your IT Support ticket has been successfully validated and saved.');
        
        document.getElementById('reportIssueForm').reset();
        // renderRequestsLog();
	} catch(storageError) {
			console.error('Critical session storage system fault context:', storageError);
			alert('An error occurred while saving your data. Please try again.');
	}
}

/* ==========================================================
   VIEW REQUESTS PAGE
========================================================== */
function renderRequestsLog() {
    // Read the selected value from the HTML dropdown(default to 3 if missing)
    const itemsPerPageSelect = document.getElementById("itemsPerPageSelect");
    const itemsPerRequestsPage = itemsPerPageSelect ? parseInt(itemsPerPageSelect.value, 10) : 3;
    const container = document.getElementById("requestsContainer");
    
    // Fetch user items from local state memory or fall back to standard mocking array if empty
    let issuesList = JSON.parse(sessionStorage.getItem('reportedITIssues')) || [
        { name: "J. Hargreaves", location: "Room 9", faultType: "projector", description: "Projector not displaying", timestamp: new Date(2026, 6, 16).toISOString(), status: "Open" },
        { name: "M. Chen", location: "Wi-Fi", faultType: "wifi", description: "Staff laptop won't connect to Wi-Fi", timestamp: new Date(2026, 6, 15).toISOString(), status: "In Progress" },
        { name: "S. Patel", location: "Main Office", faultType: "printer", description: "Printer jam", timestamp: new Date(2026, 6, 14).toISOString(), status: "Resolved" }
    ];

    // 1. AUTOMATIC SORTING: Sort by timestamp descending(Newest first)
    issuesList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // 2. SEARCH & FILTER DYNAMICS
    const searchQuery = document.getElementById("searchBar") ? document.getElementById("searchBar").value.toLowerCase().trim() : "";
    const selectedStatus = document.getElementById("statusFilter") ? document.getElementById("statusFilter").value : "All";

    let filteredIssues = issuesList.filter(issue => {
        const matchesSearch = issue.description.toLowerCase().includes(searchQuery) || 
                              issue.name.toLowerCase().includes(searchQuery) || 
                              (issue.location && issue.location.toLowerCase().includes(searchQuery));
        
        const matchesStatus = (selectedStatus === "All" || issue.status === selectedStatus);

        return matchesSearch && matchesStatus;
	});

    const totalItems = filteredIssues.length;
    const totalPages = Math.ceil(totalItems / itemsPerRequestsPage) || 1;

    // Constrain safety bounds for bounds indexes
    if(currentRequestsPage > totalPages) currentRequestsPage = totalPages;
    if(currentRequestsPage < 1) currentRequestsPage = 1;

    // Calculate slicing indices pointers based on filtered collection
    const startIndex = (currentRequestsPage - 1) * itemsPerRequestsPage;
    const endIndex = startIndex + itemsPerRequestsPage;
    const itemsToDisplay = filteredIssues.slice(startIndex, endIndex);

    // Clear previous view contents prior to dynamic re-draw
    container.innerHTML = "";

    if(itemsToDisplay.length === 0) {
        container.innerHTML = `<div class="request-card"><p class = "request-card-subtext">No matching logs found.</p></div>`;
	} else {
        itemsToDisplay.forEach(issue => {
            let statusClass = "open";
            let borderClass = "border-open";
            
            if(issue.status === "In Progress") {
                statusClass = "progress";
                borderClass = "border-progress";
			} else if(issue.status === "Resolved") {
				statusClass = "resolved";
				borderClass = "border-resolved";
			}

				const displayTitle = issue.location ? `${issue.issueTitle} — ${issue.location}` : issue.description;
				const formattedDate = new Date(issue.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

				const cardHTML = `
					<div class = "request-card ${borderClass}">
						<div class = "request-card-info">
							<h3>${displayTitle}</h3>
							<div class = "request-card-subtext">Reported ${formattedDate} by ${issue.name}</div>
						</div>
						<div class = "status-badge ${statusClass}">${issue.status}</div>
					</div>
				`;
				container.insertAdjacentHTML("beforeend", cardHTML);
		});
	}
}

/* ==========================================================
   VIEW JOBS PAGE
========================================================== */
function renderJobs(){
    const jobs = JSON.parse(sessionStorage.getItem("reportedITIssues")) || [];

    const search = document.getElementById("jobSearch").value.toLowerCase();

    const status = currentStatus;

    jobsPerPage = parseInt(document.getElementById("jobsPerPage").value);

    let filtered = jobs.filter(job=>{
        let matchesSearch = (job.issueTitle || "").toLowerCase().includes(search) ||

            (job.faultLocation || "").toLowerCase().includes(search) ||

            (job.faultType || "").toLowerCase().includes(search) ||

            (job.yourName || "").toLowerCase().includes(search) ||

            (job.emailAddress || "").toLowerCase().includes(search);

        let matchesStatus = status==="all" || job.status===status;

        return matchesSearch && matchesStatus;
	});

    let start = (currentJobPage-1)*jobsPerPage;
    let end = start+jobsPerPage;

    displayJobs(filtered.slice(start,end));
    createPagination(filtered.length);
}

function displayJobs(jobs){
    let container = document.getElementById("jobsContainer");
    container.innerHTML = "";

    if(jobs.length === 0){
        container.innerHTML = "<p>No jobs found.</p>";

        return;
	}

    jobs.forEach(job =>{
        let statusClass = "status-open";

        if(job.status==="In Progress")
            statusClass = "status-progress";

        if(job.status==="Completed")
            statusClass = "status-completed";

        container.innerHTML += `
        <div class = "job-row">

            <div class = "job-info">

                <h3>${job.location}</h3>

                <p>${job.issueTitle}</p>

                <small>
                    ${job.name}
                    •
                    ${job.timestamp}
                </small>

            </div>

            <div class = "job-action">

                ${
                    job.status === "Completed"

                    ?

                    `<span class = "completed-badge">
                        Completed ✓
                    </span>`

                    :

                    `<button
                        class = "complete-btn"
                        onclick = "markComplete('${job.id}')">

                        Mark Complete

                    </button>`
				}

            </div>

        </div>
        `;
	});
}

function showIncomplete() {
    currentStatus = "Open";
    currentJobPage = 1;
    renderJobs();
}

function showCompleted() {
    currentStatus = "Completed";
    currentJobPage = 1;
    renderJobs();
}

function createPagination(totalItems){
    let pages = Math.ceil(totalItems/jobsPerPage);

    let container = document.getElementById("jobsPagination");
    container.innerHTML = "";

    for(let i = 1;i<=pages;i++){
        container.innerHTML+=`

        <button
            class = "${i===currentJobPage?'active':''}"
            onclick = "goToJobPage(${i})">

            ${i}

        </button>

        `;
	}
}

function goToJobPage(page){
    currentJobPage = page;
    renderJobs();
}

function cycleStatus(id){
    let jobs = JSON.parse(sessionStorage.getItem("reportedITIssues")) || [];

    let job = jobs.find(x=>x.id==id);

    if(!job) return;

    switch(job.status){
        case "Open":
            job.status = "In Progress";
            break;
        case "In Progress":
            job.status = "Completed";
            break;
        default:
            job.status = "Open";
	}

    sessionStorage.setItem(
        "reportedITIssues",
        JSON.stringify(jobs)
    );

    renderJobs();
}

function markComplete(jobId) {
    let jobs = JSON.parse(sessionStorage.getItem("reportedITIssues")) || [];

    const job = jobs.find(j => String(j.id) === String(jobId));

    if(!job) {
        alert("Job not found.");
        return;
	}

    job.status = "Completed";

    sessionStorage.setItem(
        "reportedITIssues",
        JSON.stringify(jobs)
    );

    renderJobs();
}