"use strict";

const Fs = require("fs");
const Path = require("path");
const Axios = require("axios");
const keys = require("../secrets.js");
require("isomorphic-fetch");

const { dropboxToken } = keys;

var Dropbox = require("dropbox").Dropbox;

var dbx = new Dropbox({ accessToken: dropboxToken });

//view content of dropbox
// dbx
//   .filesListFolder({ path: "/images/" })
//   .then(function(response) {
//     console.log(response.entries);
//   })
//   .catch(function(error) {
//     console.log(error);
//   });

// File is smaller than 150 Mb - use filesUpload API

function dropboxsendoff(file) {
  dbx
    .filesUpload({ path: "/testfolder/" + "code.jpg", contents: file })
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.error(error);
    });
}

async function downloadImage() {
  const place = "";
  const url = "http://192.168.1.190:8080?action=snapshot";
  const path = Path.resolve("code.jpg");
  const writer = Fs.createWriteStream(path);
  const reader = Fs.createReadStream(place);

  const response = await Axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  await response.data.pipe(writer).pipe(reader);

  await writer.on("finish", () => {
    console.log("things", reader);
    //dropboxsendoff(writer);
  });

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

downloadImage();

// const file = new Date.now();
