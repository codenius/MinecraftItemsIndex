# MinecraftItemsIndex
This project is a website where you can look up different properties of minecraft items, for example id, numerical id and stack size.
## Installation
*This project requires nodeJS and npm, so make sure they are installed.*
### with git:
```shell
git clone https://github.com/codenius/MinecraftItemsIndex
cd MinecraftItemsIndex
npm install
```
### with npm (note that you can't contribute this way)
```shell
npm install git+https://github.com/codenius/MinecraftItemsIndex
```
## Starting
Start the server while you are in projects root directory with
```shell
npm start
```
or
```shell
node index.js
```
Then enter the displayed URL in your browser.

## Update cached items data
*Execute the following commands in projects root directory.*

Use `node index.js update items` to update the items cache and `node index.js update itemsDetails` to update the details. 

To do both use `npm run update` or `node index.js update items itemsDetails`.

Using `node index.js update index` updates only the search index but is usally not requiered because it's automatically done after updating the items cache.

## Resources
- Item fetching (https://github.com/nicolo-rancan/minecraft-items-api, extended)
- Navigation bar (https://www.cssscript.com/demo/header-navbar-templates/header-3.html, modified)

## Libraries and technologies
- express as web application framework
- ejs as templating engine for express
- lunr to search items
- cheerio for webscrapping (get items data)