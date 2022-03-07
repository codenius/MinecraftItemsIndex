const cheerio = require("cheerio");
const express = require("express");
const fs = require("fs");
const rp = require("request-promise");
const lunr = require("lunr");
const path = require("path");
const cliProgress = require("cli-progress");

// change working directory to directory of this file for correct paths
process.chdir(__dirname);

require("dotenv").config();
const port = process.env.port || 3000;
const dataDirectory = process.env.dataDirectory || "./data";
const lunrEscapedCharacters = [":", "+", "-", "^", "~"];
const args = process.argv.slice(2);

const app = express();

(async () => {
  if (!fs.existsSync(path.join(dataDirectory, "items.json")) || (args.includes("update") && args.includes("items"))) {
    await getItemsGenerics();
  } else {
    items = JSON.parse(fs.readFileSync(path.join(dataDirectory, "items.json")));
  };
  indexItems();
  if (!fs.existsSync(path.join(dataDirectory, "itemsDetails.json")) || (args.includes("update") && args.includes("itemsDetails"))) {
    await getItemsDetails()
  } else {
    itemsDetails = JSON.parse(fs.readFileSync(path.join(dataDirectory, "itemsDetails.json")));
  }
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
})()

app.engine('.html', require('ejs').__express)
app.set('view engine', 'ejs')
app.set('views', './views/pages')
app.use('/', express.static('./public')) // serve css, js and images

// *** Routes ***

app.get("/", (req, res) => {
  res.render("index.html", {
    user: "ksdagh"
  })
})

app.get("/items", (req, res) => {
  let rawItems = items.slice()
  let sortedItems
  let order
  if (req.query.order == "alphabetic") {
    sortedItems = rawItems.sort((a, b) => (a.name > b.name ? 1 : -1));
    order = "alphabetic"
  } else {
    sortedItems = rawItems;
    order = "numeric"
  }
  res.render("items.html", {
    items: sortedItems,
    order: order
  })
})

app.get("/items/:name", async (req, res) => {
  let itemName = req.params.name
  if (items.find((element) => (element.simple_name == itemName))) {
    let infos = itemsDetails.find((element) => (element.simple_name == itemName))
    res.render("item.html", {
      item: infos
    })
  } else {
    error404(res)
  }
});

app.get("/search", (req, res) => {
  let query = req.query.q;
  lunrEscapedCharacters.forEach((element) => {
    query = query.replace(element, "\\" + element)
  });
  let search = index.search(query);
  let results = search.map((element) => {
    return items.find(item => item.simple_name == element.ref)
  });
  res.json(results)
})

// Error route
app.use((req, res, next) => {
  error404(res);
});

// *** Functions ***

function indexItems() {
  index = lunr(function () {
    // this.metadataWhitelist = ['position'];
    this.ref("simple_name");
    this.field("name");
    this.field("id");
    this.field("numerical_id");

    items.forEach((item) => {
      this.add(item)
    }, this)
  })
}

function error404(res) {
  res.status(404).send('Sorry, cant find that!');
}

async function getItemDetails(endpoint) {
  let html = await rp(endpoint);
  let dom = await cheerio.load(html);

  let simple_name = endpoint.split("/")[endpoint.split("/").length - 1];
  let name = dom(".breadcrumb-item.active").text().trim();
  let image = dom(".item-infobox > img").attr("src") || "";
  image = image.replace("64", "128");
  image = `https://minecraftitemids.com${image}`

  let description = dom(".card-body.item-card-body > :nth-child(1) > p").text().trim();

  var properties = {};
  for (let element of dom(".container.container-ads > .row > .col-lg-6 > :nth-child(2) > .card-body.item-card-body > table[class=table] > tbody > tr")) {
    let key = dom(element).find("> th").text().trim().toLowerCase().split(" ").join("_");
    let value = dom(element).find("> td").text().trim();
    properties[key] = value;
  }

  return {
    simple_name,
    name,
    image,
    description,
    properties
  };
}

async function getItemsDetails() {
  var bar = new cliProgress.SingleBar({
    clearOnComplete: true,
    format: 'Fetching Items Details [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'
  }, cliProgress.Presets.legacy);
  bar.start(items.length, 0)

  itemsDetails = []
  for (let index = 0; index < items.length; index++) {
    const element = items[index];
    let item = await getItemDetails(element.url)
    itemsDetails.push(item)
    bar.update(index + 1)
  }

  fs.existsSync(dataDirectory) || fs.mkdirSync(dataDirectory, {
    recursive: true
  });
  fs.writeFileSync(path.join(dataDirectory, "itemsDetails.json"), JSON.stringify(itemsDetails));

  bar.stop()
}

async function getItemsGenerics() {
  let page = 1;
  let exists = true;
  let data = [];

  var bar = new cliProgress.SingleBar({
    clearOnComplete: true,
    format: 'Fetching Items [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'
  }, cliProgress.Presets.legacy);

  do {
    let html = await rp(`https://minecraftitemids.com/${page > 1 ? page : ""}`);
    let dom = await cheerio.load(html);

    if (page == 1) {
      var pages = dom(".rd-pagination > .rd-pagination__list > .rd-pagination__item:nth-last-child(2) > a").text()
      bar.start(pages, 0)
    }

    let title = dom("title").text();

    if (title.split(" ")[0] == "Page" || page == 1) {
      bar.update(page)
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

        data.push({
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

  fs.existsSync(dataDirectory) || fs.mkdirSync(dataDirectory, {
    recursive: true
  });
  fs.writeFileSync(path.join(dataDirectory, "items.json"), JSON.stringify(data));
  items = data;
  indexItems();

  bar.stop()
}