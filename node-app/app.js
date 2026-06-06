const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());

const allowlist = JSON.parse(
  fs.readFileSync("./allowlist.json", "utf8")
);


app.post("/webhook", (req, res) => {
  
  if (req.body.event !== "messages.upsert") {
    return res.sendStatus(200);
  }

  const data = req.body.data;
  const ageSeconds =
  (Date.now() - data.messageTimestamp * 1000) / 1000;

  const jid = data.key?.remoteJid;

  if (!jid) {
    return res.sendStatus(200);
  }

  const [numero, dominio] = jid.split("@");

  if (dominio !== "s.whatsapp.net") {
    return res.sendStatus(200);
  }

  if(ageSeconds < 60){
    console.log({
      numero,
      texto: data.message?.conversation
    });
  }

  return res.sendStatus(200);

/*  if(dominio != "s.whatsapp.net" && eventoMsg == false || dominio != "s.whatsapp.net" && eventoMsg == true){
    res.sendStatus(200)
    console.log("nao é msg do pv")
  }else{
    console.log("oi")
  }*/

   //console.log(data)

  //return res.sendStatus(200);

});

app.listen(3000, () => {
  console.log("rodando");
});