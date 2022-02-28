var typingTimer;
var doneTypingInterval = 2000;

document.addEventListener("DOMContentLoaded", () => {
    // document.getElementById("search").addEventListener("input", search); // needs to much resources
    // document.getElementById("search").addEventListener("input", () => { document.getElementById("search_results").style.visibility = "hidden" }); // clear search results while typing
    document.getElementById("search").addEventListener("keyup", () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(search, doneTypingInterval);
    });
    document.getElementById("search").addEventListener("keydown", () => {
        clearTimeout(typingTimer);
    });
    document.getElementsByClassName("search__form")[0].addEventListener("submit", (event) => {
        event.preventDefault();
        search();
    });
});

async function search() {
    var query = document.getElementById("search").value;
    if (!query == "") {
        var response = await fetch(`/search?q=${query}`)
        var results = await response.json()
    } else {
        var results = []
    }
    if (!results.length == 0) {
        document.getElementById("search_results").style.visibility = "visible";
        document.getElementById("search_results").innerHTML = "";
        results.forEach((element) => {
            document.getElementById("search_results").innerHTML += `
            <li>
              <a href="/items/${element.simple_name}">
                <picture><img src="${element.image}" alt=""></picture>
                <span>
                  <div>${element.name}</div>
                  <div><span>${element.id}</span><span>${element.numerical_id}</span></div>
                </span>
              </a>
            </li>
        `
        });
    } else {
        document.getElementById("search_results").style.visibility = "hidden";
    }
};