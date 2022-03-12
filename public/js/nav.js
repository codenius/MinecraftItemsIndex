document.addEventListener("DOMContentLoaded", () => {

  let hamburger = document.querySelector(".hamburger-icon-container");
  let navToggle = document.querySelector(".nav__toggle");
  let navWrapper = document.querySelector(".nav__wrapper");
  let searchToggle = document.querySelector(".search__toggle");
  let searchForm = document.querySelector(".search__form");

  navToggle.addEventListener("click", () => {
    searchForm.classList.remove("active");
    navWrapper.classList.toggle("active");
  });

  searchToggle.addEventListener("click", () => {
    navWrapper.classList.remove("active");
    hamburger.classList.remove("hamburger-active");
    searchForm.classList.toggle("active");
  })

})