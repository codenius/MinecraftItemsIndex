function not_found() {
    var notificationBox = document.createElement("div");
    notificationBox.classList.add("notificationBox");
    notificationBox.classList.add("active")
    
    var content = document.createElement("div");
    content.innerHTML = "… one moment please … no, sorry, what you are looking for isn't here.";
    content.classList.add("notificationContent")
    notificationBox.append(content);

    var closeButton = document.createElement("div");
    closeButton.role = "button";
    closeButton.innerHTML = "&#x2715";
    closeButton.classList.add("closeButton");
    closeButton.addEventListener("click", () => {
        notificationBox.classList.remove("active");
    })
    notificationBox.append(closeButton)

    document.querySelector("header").prepend(notificationBox)
}