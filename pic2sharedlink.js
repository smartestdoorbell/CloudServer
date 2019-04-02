"use strict";

const Axios = require("axios");

const Path = require("path");

const dropboxToken = process.env.dropboxToken;

// const keys = require("./secrets.js");
// const { dropboxToken } = keys;

require("isomorphic-fetch");
const Dropbox = require("dropbox").Dropbox;
const fs = require("fs");
const shell = require("shelljs"); //allows bash script to fire

const dbx = new Dropbox({ accessToken: dropboxToken });

const getSharedLink = async name => {
  let link = await dbx
    .sharingCreateSharedLink({
      path: `/testfolder/${name}.jpg`
    })
    .then(function(linkresponse) {
      return linkresponse.url;
    })
    .catch(function(error) {
      console.error(error);
    });
  return link;
};

async function dropboxsendoff(file, name) {
  await dbx
    .filesUpload({
      path: "/testfolder/" + name + ".jpg",
      contents: file
    })
    .then(function(response) {
      console.log("dropbox successfully received file", response);
    })
    .catch(function(error) {
      console.error(error);
    });
}

function sendToServ() {
  return new Promise((resolve, reject) => {
    fs.readFile("res.jpg", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

const removeFile = () => {
  fs.unlink("res.jpg", err => {
    if (err) throw err;
    console.log("res.jpg, was deleted");
  });
};

async function downloadImage(url, name) {
  const path = Path.resolve("res.jpg");
  const writer = fs.createWriteStream(path);

  const response = await Axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  await response.data.pipe(writer);
  writer.on("finish", () => {
    console.log("all done - downloadImage");
  });
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

const mainThread = async (url, name) => {
  await downloadImage(url, name);
  let file = await sendToServ(name);
  console.log("file", file);
  await dropboxsendoff(file, name);
  let sharedlink = await getSharedLink(name);
  return sharedlink;
};

//mainThread(url, name);

module.exports = mainThread;
