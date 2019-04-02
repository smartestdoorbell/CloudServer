"use strict";

const Fs = require("fs");
const Path = require("path");
const Axios = require("axios");
const keys = require("../../secrets.js");
require("isomorphic-fetch");

async function downloadImage() {
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

//downloadImage();

const { dropboxToken } = keys;

var Dropbox = require("dropbox").Dropbox;

var dbx = new Dropbox({ accessToken: dropboxToken });
const path1 = Path.resolve("homer123.txt");
function dropboxsendoff(file) {
  dbx
    .filesUpload({ path: "/testfolder/" + "newfile1.txt", contents: file })
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.error(error);
    });
}

dropboxsendoff(path1);
