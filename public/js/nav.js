document.addEventListener("DOMContentLoaded", () => {

  let hamburger = document.querySelector(".hamburger-icon-container");
  let navToggle = document.querySelector(".nav__toggle");
  let navWrapper = document.querySelector(".nav__wrapper");
  let searchToggle = document.querySelector(".search__toggle");
  let searchForm = document.querySelector(".search__form");
  let searchInput = document.querySelector("#search")
  let searchResults = document.querySelector("#search_results")

  navToggle.addEventListener("click", () => {
    searchForm.classList.remove("active");
    navWrapper.classList.toggle("active");
  });

  searchToggle.addEventListener("click", () => {
    navWrapper.classList.remove("active");
    hamburger.classList.remove("hamburger-active");
    searchForm.classList.toggle("active");
    searchForm.classList.contains("active") ? searchInput.focus() : searchInput.blur()
  });

  searchForm.addEventListener("focusout", (event) => {
    if (!searchForm.contains(event.relatedTarget)) {
      searchResults.style.visibility = "hidden";
    }
  });

  searchInput.addEventListener("focus", () => {
    if (searchResults.innerHTML.trim()) {
      searchResults.style.visibility = "visible";
    }
  });

  searchInput.addEventListener("search", () => {
    searchResults.innerHTML = "";
    searchResults.style.visibility = "hidden";
  });
})