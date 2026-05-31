const express = require("express");

const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log(req.body);
  //console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("rodando");
});
