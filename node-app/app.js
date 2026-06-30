const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "frontend/html")));

//faz com que o html apareça
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/html/main.html"));
});


//endpoint pra inserir dados na allowlist.json
app.post("/insert", async (req,res) => {
 
  try{
    //console.log("oi")
    const content = await fs.readFile("allowlist.json", "utf8");
    const allowlist = JSON.parse(content)
    const data = req.body


    const allowed = allowlist.allowedNumbers
    //console.log(content)
    //console.log(data)
    //console.log(allowlist.allowedNumbers)

    //o corpo do json desse POST deve ser "num" : "000000000000"
    allowed.push(data.num);
    //console.log(data)

    await fs.writeFile(
      'allowlist.json',
      JSON.stringify(allowlist, null, 2)
    );
      
    res.json({ sucesso: true });

  } catch (err) {
    res.status(500).json({ erro: err.message });
  }

})

//webhook endpoint
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