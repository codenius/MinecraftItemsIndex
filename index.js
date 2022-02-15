const cheerio = require("cheerio");
const express = require("express");
const fs = require("fs");
const rp = require("request-promise");
const lunr = require("lunr")

// change working directory to directory of this file for correct paths
process.chdir(__dirname);

// getItemsGenerics()
setInterval(getItemsGenerics, 1000 * 60 * 60 * 1);

require("dotenv").config();
const port = process.env.port || 3000;

const app = express();

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});

app.engine('.html', require('ejs').__express)
app.set('view engine', 'ejs')
app.set('views', './views/pages')
// use assets
app.use('/', express.static('./public'))

var cache = JSON.parse(fs.readFileSync("cache.json"));

var index = lunr(function () {
  this.ref("simple_name");
  this.field("name");
  this.field("id");
  this.field("numerical_id");

  cache.items.forEach((item) => {
    this.add(item)
  }, this)
})

app.get("/", (req, res) => {
  res.render("index.html", {
    user: "ksdagh"
  })
})

app.get("/update", async (req, res) => {
  getItemsGenerics();
  res.send("Fetching...")
})

app.get("/items", (req, res) => {
  res.render("items.html", {
    items: cache.items.sort((a, b) => (a.name > b.name ? 1 : -1))
  })
})

app.get("/items/:name", async (req, res) => {
  let itemName = req.params.name
  if (cache.items.find((element) => (element.simple_name == itemName))) {
    let infos = await getItemDetails("https://minecraftitemids.com/item/" + itemName);
    res.json(infos);
  } else {
    error404(res)
  }
});

app.get("/search", (req, res) => {
  res.json(index.search(req.query.search))
})

app.use((req, res, next) => {
  error404(res);
});

function error404(res) {
  res.status(404).send('Sorry, cant find that!');
}

async function getItemDetails(endpoint) {
  let html = await rp(endpoint);
  let dom = await cheerio.load(html);

  let description = dom(".card-body.item-card-body > :nth-child(1) > p").text().trim();

  var properties = {};
  for (let element of dom(".container.container-ads > .row > .col-lg-6 > :nth-child(2) > .card-body.item-card-body > table[class=table] > tbody > tr")) {
    let key = dom(element).find("> th").text().trim().toLowerCase().split(" ").join("_");
    let value = dom(element).find("> td").text().trim();
    properties[key] = value;
  }

  return {
    description,
    properties
  };
}

async function getItemsGenerics() {
  let page = 1;
  let exists = true;

  let items = [];

  do {
    let html = await rp(`https://minecraftitemids.com/${page > 1 ? page : ""}`);
    let dom = await cheerio.load(html);

    let title = dom("title").text();

    if (title.split(" ")[0] == "Page" || page == 1) {
      console.log(`Fetching page ${page}...`)
      let names = dom(".rd-table > tbody > tr")
        .find("> :nth-child(2) > a")
        .map((index, element) => {
          return dom(element).text().trim();
        })
        .get();

      let images = dom(".rd-table > tbody > tr > :nth-child(1)")
        .map((index, element) => {
          if (dom(element).find("> a > img").attr("src") == undefined) {
            var image = "";
          } else {
            var image = "https://minecraftitemids.com" + dom(element).find("> a > img").attr("src");
          };
          return image;
        })
        .get();

      let simple_names = dom(".rd-table > tbody > tr")
        .find("> :nth-child(2) > a")
        .map((index, element) => {
          return dom(element).attr("href").split("/")[dom(element).attr("href").split("/").length - 1];
        })
        .get();

      let urls = dom(".rd-table > tbody > tr")
        .find("> :nth-child(2) > a")
        .map((index, element) => {
          return `https://minecraftitemids.com${dom(element).attr("href")}`;
        })
        .get();

      let ids = dom(".rd-table > tbody > tr")
        .find("> :nth-child(3)")
        .map((index, element) => {
          return dom(element).text().trim();
        })
        .get();

      let legacy_ids = dom(".rd-table > tbody > tr")
        .find("> :nth-child(4)")
        .map((index, element) => {
          return dom(element).text().trim();
        })
        .get();

      let numerical_ids = dom(".rd-table > tbody > tr")
        .find("> :nth-child(5)")
        .map((index, element) => {
          return dom(element).text().trim();
        })
        .get();

      for (let i = 0; i < names.length; i++) {
        let simple_name = simple_names[i];
        if (simple_name == "") simple_name = "N/A";

        let name = names[i];
        if (name == "") name = "N/A";

        let image = images[i];
        if (image == "") image = "N/A";

        let url = urls[i];
        if (url == "") url = "N/A";

        let id = ids[i];
        if (id == "") id = "N/A";

        let legacy_id = legacy_ids[i];
        if (legacy_id == "") legacy_id = "N/A";

        let numerical_id = numerical_ids[i];
        if (numerical_id == "") numerical_id = "N/A";

        items.push({
          simple_name,
          name,
          image,
          url,
          id,
          legacy_id,
          numerical_id,
        });
      }

      page++;
    } else {
      exists = false;
    }
  } while (exists);

  let cache = {
    last_update: Date.now(),
    items,
  };

  let data = JSON.stringify(cache);
  fs.writeFileSync("cache.json", data);
  cache = JSON.parse(fs.readFileSync("cache.json"));

  console.log("Done.")
}