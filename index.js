import express from "express";
import Expo from "expo-server-sdk";
const { User, Ring, db } = require("./database/db");

const Fs = require("fs");
const Path = require("path");
const Axios = require("axios");
const shell = require("shelljs"); //allows bash script to fire
const grabSnapShoturl = require("./pic2sharedlink");

const app = express();
const expo = new Expo();

let savedPushTokens = [];
const PORT_NUMBER = 3000;

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

app.use("/api", require("./api"));

app.get("/", (req, res) => {
  res.send("Push Notification Server Running");
});

app.post("/test", (req, res) => {
  console.log("hit here");
  User.create({
    email: "this@email.com",
    password: "homer",
    googleId: "donnyboy"
  }).then(res.send("successfully added"));
});

app.post("/token", (req, res) => {
  saveToken(req.body.token.value);
  console.log(`Received push token, ${req.body.token.value}`);
  res.send(`Received push token, ${req.body.token.value}`);
});

app.post("/message", async (req, res) => {
  const linkFix = url => {
    url = url.split("");
    url[url.length - 1] = 1;
    url = url.join("");
    return url;
  };

  const timeStampFromCam = req.body.message.toString();

  //const url = "http://192.168.1.202:8080?action=snapshot";

  const url = "http://crucio.serveo.net/?action=snapshot";

  //grab picture from camera and save to db HERE *****
  let DropURL = await grabSnapShoturl(url, timeStampFromCam);
  DropURL = linkFix(DropURL);
  console.log(DropURL);

  try {
    await Ring.create({
      eventTime: timeStampFromCam,
      imageUrl: DropURL
    });
    console.log("db added");
  } catch (error) {
    console.log(error);
  }

  await handlePushTokens(req.body.message);
  console.log(`console Received message, ${req.body.message}`);

  res.send(`sent Received message, ${req.body.message}`);
});

db.sync().then(() => {
  console.log("The database is synced!");
  app.listen(process.env.PORT || PORT_NUMBER, () => {
    console.log(`Server Online on Port ${PORT_NUMBER}`);
  });
});
