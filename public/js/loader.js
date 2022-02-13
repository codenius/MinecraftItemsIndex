fetch("http://localhost:3000/api/items").then((res) => {
    var json = res.json()})
.then((json) => {
    var array = json.data
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        document.getElementsByTagName("ul")[0].innerHTML += `<li><img src="${element.image}" alt="">${element.name}</li>`

}})