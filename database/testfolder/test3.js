const Fs = require("fs");
const Path = require("path");
const Axios = require("axios");
const keys = require("../../secrets.js");
require("isomorphic-fetch");

async function test() {
  const url = "http://192.168.1.190:8080?action=snapshot";
  const path = Path.resolve("res.jpg");
  const writer = Fs.createWriteStream(path);

  const response = await Axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  await response.data.pipe(writer);

  await writer.on("finish", () => {
    console.log("write done");
    //dropboxsendoff(writer);
  });

  var stream;
  var chunk;
  stream = await Fs.createReadStream("./res.jpg");

  await stream.on("data", function(data) {
    chunk += data;
  });
  await stream.on(
    "end",

    () => {
      dropboxsendoff(chunk);
    }
  );
}

test();

const { dropboxToken } = keys;

var Dropbox = require("dropbox").Dropbox;

var dbx = new Dropbox({ accessToken: dropboxToken });
const path1 = Path.resolve("pic.jpg");
function dropboxsendoff(file) {
  dbx
    .filesUpload({
      path: "/testfolder/" + "pic" + Date.now() + ".jpg",
      contents: file
    })
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.error(error);
    });
}
