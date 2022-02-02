const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();

require("dotenv").config();

const limiter = rateLimit({
  windowMs: 1000 * 60 * 60,
  max: 1000,
  message: "Limit reached of 1000 requests per hour.",
});

const updateLimiter = rateLimit({
  windowMs: 1000 * 60 * 60,
  max: 1,
  message: "Limit reached of 1 request per hour.",
});

const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});

const cheerio = require("cheerio");
const rp = require("request-promise");
const fs = require("fs");

app.get("/api/items", limiter, (req, res) => {
  fs.readFile("cache.json", (err, data) => {
    if (err) throw err;
    let cache = JSON.parse(data);
    res.json(cache);
  });
});

app.get("/api/items/:name", limiter, async (req, res) => {
  let itemName = req.params.name;

  let infos = await getItemDetails(("https://minecraftitemids.com/item/" + itemName.toLowerCase()).replace(" ", "-"));

  res.json(infos);
});

app.get("/api/update", updateLimiter, async (req, res) => {
  let items = await getItemsGenerics();

  let cache = {
    last_update: Date.now(),
    data: items,
  };

  let data = JSON.stringify(cache);
  fs.writeFileSync("cache.json", data);

  res.send("ok");
});

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
  console.log("Done.")
  return items;
}