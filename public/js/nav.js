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
    searchForm.classList.contains("active") ? focusAndOpenKeyboard(searchInput, 250) /* Workaround for iOS */ : searchInput.blur()
  });

  function focusAndOpenKeyboard(el, timeout = 100) {
    // Align temp input element approximately where the input element is
    // so the cursor doesn't jump around
    var __tempEl__ = document.createElement('input');
    __tempEl__.style.position = 'absolute';
    __tempEl__.style.top = getOffset(el).top + 'px';
    __tempEl__.style.left = getOffset(el).left + 'px';
    __tempEl__.style.height = 0
    __tempEl__.style.opacity = 0;
    // Put this temp element as a child of the page <body> and focus on it
    document.body.appendChild(__tempEl__);
    __tempEl__.focus();

    // The keyboard is open. Now do a delayed focus on the target element
    setTimeout(function () {
      el.focus();
      // Remove the temp element
      document.body.removeChild(__tempEl__);
    }, timeout);
  }

  function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
  }

  searchForm.addEventListener("focusout", (event) => {
    if (!searchForm.contains(event.relatedTarget)) {
      searchResults.classList.remove("active")
    }
  });

  searchInput.addEventListener("focus", () => {
    if (searchResults.innerHTML.trim()) {
      searchResults.classList.add("active")
    }
  });

  searchInput.addEventListener("search", () => {
    searchResults.classList.remove("active")
    searchResults.innerHTML = "";
  });
})