document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        let array = document.getElementsByClassName("bar");
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            element.style.width = element.dataset.percentage + "%";
        }
    }, 1000);
});