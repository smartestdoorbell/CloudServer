"use strict";

const Fs = require("fs");
const Path = require("path");
const axios = require("axios");

async function getd() {
  let histdata = await axios.get(
    "https://pidoorbellserver.herokuapp.com/api/picurls"
  );
  console.log(histdata.data);
}

getd();
