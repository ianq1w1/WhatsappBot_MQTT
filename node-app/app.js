const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());

const allowlist = JSON.parse(
  fs.readFileSync("./allowlist.json", "utf8")
);

app.post("/webhook", (req, res) => {

  // só mensagens novas
  if (req.body.event !== "messages.upsert") {
    return res.sendStatus(200);
  }

  const data = req.body.data;

  // ignora mensagens enviadas por você
  if (data.key.fromMe) {
    return res.sendStatus(200);
  }

  const remoteJid = data.key.remoteJid;

  // ignora grupos
  if (remoteJid.endsWith("@g.us")) {
    return res.sendStatus(200);
  }

  const numero = remoteJid.split("@")[0];

  // verifica allowlist
  if (!allowlist.allowedNumbers.includes(numero)) {
    console.log(`Número não autorizado: ${numero}`);
    return res.sendStatus(200);
  }

  const texto = data.message?.conversation;

  console.log("Número autorizado:", numero);
  console.log("Mensagem:", texto);

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("rodando");
});