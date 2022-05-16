document.addEventListener("DOMContentLoaded", () => {

  let hamburger = document.querySelector(".hamburger-icon-container");
  let navToggle = document.querySelector(".nav__toggle");
  let navWrapper = document.querySelector(".nav__wrapper");
  let searchToggle = document.querySelector(".search__toggle");
  let searchForm = document.querySelector(".search__form");
  let search = document.querySelector("#search")
  let search_results = document.querySelector("#search_results")
  let search_form = document.querySelector(".search__form")

  navToggle.addEventListener("click", () => {
    searchForm.classList.remove("active");
    navWrapper.classList.toggle("active");
  });

  searchToggle.addEventListener("click", () => {
    navWrapper.classList.remove("active");
    hamburger.classList.remove("hamburger-active");
    searchForm.classList.toggle("active");
    searchForm.classList.contains("active") ? search.focus() : search.blur()
  });

  search.addEventListener("blur", async () => {
    await setTimeout(() => {
      search_results.style.visibility = "hidden";
    }, 200)
  });

  search.addEventListener("focus", () => {
    if (search_results.innerHTML.trim()) {
      search_results.style.visibility = "visible";
    }
  });

  search.addEventListener("search", () => {
    search_results.innerHTML = "";
    search_results.style.visibility = "hidden";
  });
})