# WhatsApp Bot MQTT

Bot para captura e processamento de mensagens do WhatsApp utilizando **Evolution API**, **Baileys**, **MQTT** e **Node.js**.

## O que é este projeto?

Este projeto utiliza a Evolution API para receber eventos do WhatsApp através de webhooks e processá-los em uma aplicação Node.js.

No estágio atual do desenvolvimento, o bot:

- Recebe mensagens privadas enviadas para uma instância do WhatsApp.
- Filtra mensagens através de uma allowlist de números autorizados.
- Exibe as mensagens recebidas no terminal.
- Pode ser expandido para publicar eventos em um broker MQTT ou executar outras automações.

---

# Pré-requisitos

Antes de começar, certifique-se de possuir:

- Docker instalado no Windows ou Linux.
- Docker Compose funcionando corretamente.
- Node.js instalado.
- Ngrok instalado (para testes locais com webhooks).

> Se estiver utilizando WSL, recomenda-se executar o Docker através dela para uma experiência mais estável.

---

# Configurando a Evolution API

## 1. Configurar o arquivo `.env`

Dentro da pasta da Evolution API existe um arquivo:

```bash
.env-example
```

Copie-o e renomeie para:

```bash
.env
```

Preencha as seguintes variáveis:

```env
AUTHENTICATION_API_KEY=sua_senha_aqui

POSTGRES_DB=evolution
POSTGRES_USER=postgres
POSTGRES_PASSWORD=senha_postgres
```

### Explicação das variáveis

| Variável | Descrição |
|-----------|-----------|
| AUTHENTICATION_API_KEY | Senha de acesso à plataforma Evolution API |
| POSTGRES_DB | Nome do banco PostgreSQL |
| POSTGRES_USER | Usuário do PostgreSQL |
| POSTGRES_PASSWORD | Senha do PostgreSQL |

---

## 2. Subir os containers

Execute:

```bash
docker-compose up -d
```

A stack irá iniciar:

- Evolution API
- PostgreSQL
- Redis

Aguarde todos os containers ficarem saudáveis.

---

# Acessando o Manager

Após a inicialização, acesse:

```text
http://localhost:8000/manager/login
```

Faça login utilizando as credenciais configuradas.

---

# Criando uma instância WhatsApp

Para este exemplo estamos utilizando:

- Evolution API
- Baileys

Após criar sua instância:

1. Gere o QR Code.
2. Escaneie com o WhatsApp.
3. Aguarde a conexão ser concluída.

Quando a instância estiver conectada, podemos configurar a aplicação Node.js.

---

# Configurando a aplicação Node.js

Entre na pasta:

```bash
node-app
```

Instale as dependências:

```bash
npm install
```

---

# Configurando a Allowlist

Existe um arquivo de exemplo:

```bash
allowlist-example.txt
```

Transforme-o em:

```bash
allowlist.json
```

Exemplo:

```json
[
  "5511999999999",
  "5581999999999"
]
```

## Formato dos números

Utilize apenas números, sem símbolos ou espaços.

Exemplo:

```text
+55 (11) 99999-9999
```

Deve ser convertido para:

```text
5511999999999
```

---

# Executando a aplicação

Após configurar a allowlist:

```bash
node app.js
```

Neste estágio do projeto, a aplicação apenas exibirá no terminal as mensagens recebidas dos números autorizados.

---

# Configurando Webhook com Ngrok

Para que a Evolution API consiga enviar eventos para sua aplicação local, é necessário expor sua porta utilizando o Ngrok.

Dentro da pasta `node-app`, execute:

```bash
ngrok http 3000
```

Você receberá uma URL semelhante a:

```text
https://abcd1234.ngrok-free.app
```

---

# Configurando o Webhook na Evolution API

No painel da Evolution API:

1. Abra o menu lateral.
2. Acesse a seção **Webhook**.
3. Cole a URL fornecida pelo Ngrok.
4. Adicione `/webhook` ao final.

Exemplo:

```text
https://abcd1234.ngrok-free.app/webhook
```

5. Marque todas as opções de eventos.
6. Clique em **Salvar**.

---

# Fluxo de funcionamento

```text
WhatsApp
    ↓
Evolution API
    ↓
Webhook (Ngrok)
    ↓
Node.js (app.js)
    ↓
Filtro Allowlist
    ↓
Terminal
```

---

---

## Licença

Este projeto é fornecido para fins de estudo, testes e desenvolvimento de integrações com WhatsApp utilizando Evolution API.
