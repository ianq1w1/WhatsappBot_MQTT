const express = require("express");
const ollama = require("ollama").default;
const fs = require("fs/promises");
const path = require("path");

const env = require("dotenv").config({ path : ".env-app"})

const aiService_url = process.env.AI_SERVICE_IP;
const port = process.env.PORT;

const SmartCampus = process.env.SMART_CAMPUS_IP;
const portSC = process.env.PORT_SC;

console.log(aiService_url);

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, "frontend/html")));

//faz com que o html apareça
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/html/main.html"));
});

//enviar mensagem via HTTP
async function enviarMensagem(numero, texto) {
  //esse ultimo no final é o nome da instancia
  const response = await fetch(`http://${aiService_url}:${port}/message/sendText/testeV3`, {
    method: 'POST',
    //a apikey deve estar no .env-app, ele é gerado junto com a instância
    headers: {
      'Content-Type': 'application/json',
      'apikey': ''
    },
    body: JSON.stringify({
      number: numero,
      text: texto
    })
  })

  if (!response.ok) {
    throw new Error(`Erro ao enviar mensagem: ${response.status}`)
  }

  const data = await response.json()
  return data
}


//funcao para enviar texto pro endpoint da IA para retornar comandos em formato Json
async function IAsend(texto){

  //endpoint do norberto
  const response = await fetch(`http://${aiService_url}:${port}/norberto_embedding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      texto: texto
    })
  })

  if (!response.ok) {
    throw new Error(`Erro ao enviar para IA: ${response.status}`)
  }

  const data = await response.json()
  return data
}

//funcao com proposito de converter o comando em json do microsserviço para um indice
//este indice é o que a API do smartcampus espera (nao é a melhor maneira mas tudo bem)
//it works at least
function ComandoToIndice(data){
  const comando = data?.[0]?.comando;
  console.log(comando)
  console.log("chegou em toIndice")
  switch(comando){
    case "ligar_ar":
      return numero = 0;
      
    case "desligar_ar":
      return numero = 1;
      
    default:
      console.log("comando indisponivel");
  }
}

async function SmartCampusSend(numero){
  console.log("chegou em SMARTcampus")
  const response = await fetch(`http://${SmartCampus}:${portSC}/smartcampus/comandos/LABF04/retransmitir`, {
    method: 'POST',
    
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      indice: numero
    })
  })
  

  if (!response.ok) {
    throw new Error(`Erro ao enviar mensagem: ${response.status}`)
  }

  const data = await response.json()
  return data

}



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

app.post("/delete", async (req, res) => {
  try {
    const content = await fs.readFile("allowlist.json", "utf8");
    const allowlist = JSON.parse(content);

    const data = req.body;
    const numToRemove = data.num;

    let allowed = allowlist.allowedNumbers;

    // verifica se o número existe
    if (!allowed.includes(numToRemove)) {
      return res.status(404).json({ erro: "Número não encontrado na allowlist" });
    }

    // remove o número
    allowed = allowed.filter(num => num !== numToRemove);

    // atualiza o objeto
    allowlist.allowedNumbers = allowed;

    await fs.writeFile(
      "allowlist.json",
      JSON.stringify(allowlist, null, 2)
    );

    res.json({ sucesso: true });

  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

//webhook endpoint
app.post("/webhook", async (req, res) => {
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
    return res.sendStatus(200);
  }

  let allowlist;

  try {
    const content = await fs.readFile("allowlist.json", "utf8");
    allowlist = JSON.parse(content);
  } catch (err) {
    console.error("Erro ao ler allowlist:", err);
    return res.sendStatus(500);
  }

  const allowedNumbers = allowlist.allowedNumbers;

  if (!allowedNumbers.includes(numero)) {
    console.log(`Número não permitido: ${numero}`);
    return res.sendStatus(200);
  }

  //mostra a mensagem mais recente enviada em até 60 segundos em relação ao tempo atual
  message = data.message?.conversation 
if (ageSeconds < 60 && message) {
  console.log({
    numero,
    texto: message
  });

  console.log("Mensagem enviada para a IA");

  try {
    const resposta = await IAsend(message);

    console.log("Resposta da IA");
    console.log(resposta);
    //envia o comando para esta função para retornar um numero do indice
    let indice = ComandoToIndice(resposta);
    //indice é enviado para o endpoint da API smartcampus
    SmartCampusSend(indice);
    
  } catch (error) {
    console.error("Erro ao enviar mensagem para a IA:", error);
  }
}

return res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("rodando");
});