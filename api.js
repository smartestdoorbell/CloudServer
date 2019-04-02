const router = require("express").Router();
const { User, Ring, db } = require("./database/db");
const shell = require("shelljs");

module.exports = router;

router.get("/picurls", async (req, res, next) => {
  let picurls = await Ring.findAll();
  console.log("pic urls here", picurls);
  res.send(picurls);
});
