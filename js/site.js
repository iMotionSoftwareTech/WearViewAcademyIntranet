function initiateLogin(username, password) {
    if (username === "" || password === "") {
        alert("Please enter both username and password.");
        return;
    }

    if (username === "staffmember " && password === "letmein!123"
        || username === "admin" && password === "heretohelp!456"
    ) {
        window.location.href = "itsupport.html";
    }
}