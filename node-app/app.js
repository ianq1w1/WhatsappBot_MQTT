const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());

const allowlist = JSON.parse(
  fs.readFileSync("./allowlist.json", "utf8")
);


app.post("/webhook", (req, res) => {
  
  //verifica se é o evento de envio de mensagem
  if (req.body.event !== "messages.upsert") {
    return res.sendStatus(200);
  }

  const data = req.body.data;

  //isto é uma variável q conta 60 segundos após a mensagem enviada
  const ageSeconds =
  (Date.now() - data.messageTimestamp * 1000) / 1000;

  const jid = data.key?.remoteJid;
  
  //verifica se tem número presente
  if (!jid) {
    return res.sendStatus(200);
  }

  //divisão entre o número e o domínio
  const [numero, dominio] = jid.split("@");
  
  //verificação se o domínio corresponde ao número de alguem do qual enviou a mensagem no privado
  if (dominio !== "s.whatsapp.net") {
    return res.sendStatus(200);
  }

  //verifica se a mensagem foi enviada pelo próprio usuário 
  if(data.key.fromMe == true){
    return res.sendStatus(200)
  }

  //mostra a mensagem mais recente enviada em até 60 segundos em relação ao tempo atual 
  if(ageSeconds < 60){
    console.log({
      numero,
      texto: data.message?.conversation
    });
  }

  return res.sendStatus(200);

});

app.listen(3000, () => {
  console.log("rodando");
});