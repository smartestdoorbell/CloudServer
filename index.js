import express from "express";
import Expo from "expo-server-sdk";
const { User, Ring } = require("./database/db");
const Fs = require("fs");
const Path = require("path");
const Axios = require("axios");

const app = express();
const expo = new Expo();

let savedPushTokens = [];
const PORT_NUMBER = 3000;

async function downloadImage(url) {
  const place = "";

  const path = Path.resolve(`${Date.now()}.jpg`);
  const writer = Fs.createWriteStream(path);

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

const handlePushTokens = message => {
  // Create the messages that you want to send to clents
  let notifications = [];
  for (let pushToken of savedPushTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
    notifications.push({
      to: pushToken,
      sound: "default",
      title: "Message received!",
      body: message,
      data: { message }
    });
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  let chunks = expo.chunkPushNotifications(notifications);

  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

const saveToken = token => {
  if (savedPushTokens.indexOf(token === -1)) {
    savedPushTokens.push(token);
  }
};

// setInterval(() => {
//   console.log("fire away");
//   handlePushTokens("wallaby wallaby");
// }, 3000);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Push Notification Server Running");
});

app.post("/token", (req, res) => {
  saveToken(req.body.token.value);
  console.log(`Received push token, ${req.body.token.value}`);
  res.send(`Received push token, ${req.body.token.value}`);
});

app.post("/message", async (req, res) => {
  await Ring.create({
    eventTime: Date.now(),
    imageUrl: req.data.imageUrl
  });
  console.log("db added");
  await handlePushTokens(req.body.message);
  console.log(`console Received message, ${req.body.message}`);
  //grab picture from camera and save to db HERE *****

  let url = "http://crucio.serveo.net/?action=stream";

  //await downloadImage(url);
  res.send(`sent Received message, ${req.body.message}`);
});

app.listen(process.env.PORT || PORT_NUMBER, () => {
  console.log(`Server Online on Port ${PORT_NUMBER}`);
});
