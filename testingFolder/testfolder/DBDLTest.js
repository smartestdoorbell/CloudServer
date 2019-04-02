"use strict";

const Axios = require("axios");
const keys = require("../../secrets.js");
const Path = require("path");
const { dropboxToken } = keys;
require("isomorphic-fetch");
const Dropbox = require("dropbox").Dropbox;
const fs = require("fs");
const shell = require("shelljs"); //allows bash script to fire

const dbx = new Dropbox({ accessToken: dropboxToken });

let sharedlinkresponse = "";

const getSharedLink = name => {
  dbx
    .sharingCreateSharedLink({
      path: `/testfolder/${name}.jpg`
    })
    .then(function(linkresponse) {
      console.log("the link is here", linkresponse.url);
      sharedlinkresponse = linkresponse.url;
      return linkresponse.url;
    })
    .catch(function(error) {
      console.log("name variable is", name);
      console.error(error);
    });
};

async function dropboxsendoff(file, name) {
  await dbx
    .filesUpload({
      path: "/testfolder/" + name + ".jpg",
      contents: file
    })
    .then(function(response) {
      console.log(response);
    })
    .then(() => {
      return getSharedLink(name);
    })
    .catch(function(error) {
      console.error(error);
    });
}

const sendToServ = async name => {
  await fs.readFile("res.jpg", function(err, file) {
    if (err) throw err;
    return dropboxsendoff(file, name);
  });
  await fs.unlink("res.jpg", err => {
    if (err) throw err;
    console.log("res.jpg, was deleted");
  });
};

async function downloadImage(url, name) {
  console.log("beginningto run DownloadImage");
  const path = Path.resolve("res.jpg");
  const writer = fs.createWriteStream(path);

  const response = await Axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  await response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    console.log("finishing up");
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

module.exports = downloadImage;

let url = "http://192.168.1.202:8080?action=snapshot";
let name = Date.now();
downloadImage(url, name)
  .then(sendToServ(name))
  .then(console.log("sharedlinkresponse here", sharedlinkresponse));
