//This file contains function that grabs image from server
//and directs it to Clarifai server for processing
//need to refine model usage

const fs = require("fs");
const axios = require("axios");
const apiKey = require("./supersecret.js");
const Clarifai = require("clarifai");

// initialize with your api key. This will also work in your browser via http://browserify.org/
const app = new Clarifai.App({
  apiKey: apiKey
});

//Code to grab image and save to localstorage
// GET request for remote image
// axios({
//   method: "get",
//   url: url,
//   responseType: "stream"
// }).then(function(response) {
//   response.data.pipe(fs.createWriteStream("img.jpg"));
// });

let url = "http://192.168.1.190:8080/?action=snapshot";

function getBase64(url) {
  //grabs image and converts to base64
  return axios
    .get(url, {
      responseType: "arraybuffer"
    })
    .then(response => {
      console.log(response);
      return new Buffer.from(response.data, "binary").toString("base64");
    })
    .then(x => {
      console.log(x);
      //sends image data to clarifai
      app.models.predict(Clarifai.GENERAL_MODEL, { base64: x }).then(
        function(response) {
          // do something with response
          console.log(
            "response is here",
            response["outputs"][0]["data"]["concepts"]
          );
        },
        function(err) {
          // there was an error
          console.log(err);
        }
      );
    });
}
getBase64(url);
