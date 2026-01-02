const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

const routes = require("./routes/index");

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", routes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
