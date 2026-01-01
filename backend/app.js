const express = require("express");
const Controller = require("./controllers/controller");
const Authentication = require("./middleware/authentication");
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
