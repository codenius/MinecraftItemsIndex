document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("select_order").addEventListener("input", (event) => {
        window.location.href = `/items?order=${event.target.value}`;
    });
});