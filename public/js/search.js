var typingTimer;
var doneTypingInterval = 1000;

document.addEventListener("DOMContentLoaded", () => {
    // document.getElementById("search").addEventListener("input", search); // needs to much resources
    // document.getElementById("search").addEventListener("input", () => { document.getElementById("search_results").classList.remove("active") }); // clear search results while typing
    document.getElementById("search").addEventListener("keyup", () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(search, doneTypingInterval);
    });
    document.getElementById("search").addEventListener("keydown", () => {
        clearTimeout(typingTimer);
    });
    document.getElementsByClassName("search__form")[0].addEventListener("submit", (event) => {
        event.preventDefault();
        var highlightedElement = document.querySelector("#search_results .highlight a");
        if (highlightedElement) {
            highlightedElement.click()
        } else {
            search();
        }
    });
});

function keyboardListNavigation() {
    // Get all the <li> elements into a collection
    var listItems = document.querySelectorAll('#search_results > *');

    // Set up a counter to keep track of which <li> is selected
    var currentLI = 0;

    // Initialize first li as the selected (focused) one:
    listItems[currentLI].classList.add("highlight");

    // Set up a key event handler for the document
    document.addEventListener("keydown", function (event) {
        // Check for up/down key presses
        switch (event.key) {
            case "ArrowUp": // Up arrow    
                // Remove the highlighting from the previous element
                listItems[currentLI].classList.remove("highlight");

                currentLI = currentLI > 0 ? --currentLI : 0; // Decrease the counter      
                listItems[currentLI].classList.add("highlight"); // Highlight the new element
                break;
            case "ArrowDown": // Down arrow
                // Remove the highlighting from the previous element
                listItems[currentLI].classList.remove("highlight");

                currentLI = currentLI < listItems.length - 1 ? ++currentLI : listItems.length - 1; // Increase counter 
                listItems[currentLI].classList.add("highlight"); // Highlight the new element
                break;
        }

        listItems[currentLI].scrollIntoViewIfNeeded() /* doesn't work in Firefox */
    
    });
}

async function search() {
    var query = document.getElementById("search").value;
    if (!query == "") {
        var response = await fetch(`/search?q=${query}`)
        var results = await response.json()
    } else {
        var results = []
    }
    if (!results.length == 0) {
        document.getElementById("search_results").innerHTML = "";
        let search_results = ""
        results.forEach((element) => {
            search_results += `
            <li>
              <a href="/items/${element.simple_name}">
                <picture><img src="${element.image != "N/A" ? element.image : "/img/barrier.png"}" alt=""></picture>
                <span>
                  <div>${element.name}</div>
                  <div><span>${element.id}</span><span>${element.numerical_id}</span></div>
                </span>
              </a>
            </li>
        `
        });
        document.getElementById("search_results").innerHTML = search_results
        document.getElementById("search_results").classList.add("active");
        keyboardListNavigation()
    } else {
        document.getElementById("search_results").classList.remove("active");
    }
};