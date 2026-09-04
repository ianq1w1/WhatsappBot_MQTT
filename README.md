# WhatsApp Bot - Middleware de IA

Middleware para captura, processamento e encaminhamento de mensagens do WhatsApp utilizando **Evolution API**, **Baileys**, **Node.js** e **Ollama**.

## O que é este projeto?

Este projeto funciona como um **middleware entre o WhatsApp, a Evolution API e um serviço de Inteligência Artificial**.

A Evolution API é responsável pela comunicação com o WhatsApp. O middleware Node.js recebe as mensagens através de um webhook, realiza as validações necessárias e encaminha o conteúdo para o serviço de IA. Após o processamento, a resposta pode ser enviada novamente ao usuário através da Evolution API.

O fluxo principal da aplicação é:

```text
WhatsApp
    ↓
Evolution API
    ↓
Middleware Node.js
    ↓
Serviço de IA / Ollama
    ↓
Middleware Node.js
    ↓
Evolution API
    ↓
WhatsApp
```

No estágio atual do desenvolvimento, o middleware:

* Recebe mensagens privadas enviadas para uma instância do WhatsApp.
* Recebe eventos da Evolution API através de webhook.
* Filtra mensagens através de uma allowlist de números autorizados.
* Ignora mensagens enviadas pelo próprio usuário.
* Valida o tipo de evento recebido.
* Pode encaminhar mensagens para um serviço de IA utilizando Ollama.
* Pode enviar respostas geradas pela IA de volta para o usuário através da Evolution API.
* Possui um endpoint HTTP para adicionar números à allowlist.
* Pode ser utilizado como base para outras automações e integrações.

---

# Arquitetura

A aplicação é composta principalmente por três partes:

### WhatsApp

É o meio utilizado pelo usuário para enviar e receber mensagens.

### Evolution API

A Evolution API funciona como a camada responsável pela comunicação com o WhatsApp utilizando Baileys.

Ela recebe as mensagens do WhatsApp e envia os eventos para o middleware através do webhook.

Também permite que o middleware envie mensagens de volta para o usuário.

### Middleware Node.js

O `node-app` funciona como uma ponte entre a Evolution API e o serviço de IA.

Sua responsabilidade é:

1. Receber a mensagem da Evolution API.
2. Validar o evento recebido.
3. Identificar o número do remetente.
4. Verificar se o remetente está autorizado.
5. Encaminhar a mensagem para o serviço de IA.
6. Receber a resposta do serviço de IA.
7. Enviar a resposta através da Evolution API.

---

# Pré-requisitos

Antes de começar, certifique-se de possuir:

* Docker instalado no Windows ou Linux.
* Docker Compose funcionando corretamente.
* Node.js instalado.
* Ollama instalado e configurado, caso utilize IA localmente.

> Se estiver utilizando WSL, recomenda-se executar o Docker através dela para uma experiência mais estável.

---

# Configurando a rede Docker

Após baixar ou clonar o projeto, é necessário criar a rede Docker utilizada pelos containers da aplicação.

Execute:

```bash
docker network create app-network
```

Essa rede permite que os containers da aplicação se comuniquem entre si utilizando seus respectivos nomes, sem a necessidade de utilizar endereços IP.

Verifique se a rede foi criada corretamente:

```bash
docker network ls
```

Você deverá encontrar:

```text
app-network
```

> **Importante:** A rede `app-network` deve ser criada antes de iniciar os containers que fazem parte da aplicação.

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

| Variável                 | Descrição                                          |
| ------------------------ | -------------------------------------------------- |
| `AUTHENTICATION_API_KEY` | Chave utilizada para autenticação na Evolution API |
| `POSTGRES_DB`            | Nome do banco PostgreSQL                           |
| `POSTGRES_USER`          | Usuário do PostgreSQL                              |
| `POSTGRES_PASSWORD`      | Senha do PostgreSQL                                |

---

## 2. Subir os containers

Execute:

```bash
docker-compose up -d
```

A stack irá iniciar:

* Evolution API
* PostgreSQL
* Redis

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

Para este projeto estamos utilizando:

* Evolution API
* Baileys

Após criar sua instância:

1. Gere o QR Code.
2. Escaneie com o WhatsApp.
3. Aguarde a conexão ser concluída.

Quando a instância estiver conectada, podemos configurar o middleware Node.js.

---

# Configurando a aplicação Node.js

Entre na pasta:

```bash
cd node-app
```

Instale as dependências:

```bash
npm install
```

---

# Configurando o `.env` da aplicação

A aplicação Node.js possui seu próprio arquivo `.env`.

Crie o arquivo:

```bash
.env
```

Configure as seguintes variáveis:

```env
INSTANCE_API_KEY=
OLLAMA_IP=
```

## `INSTANCE_API_KEY`

A `INSTANCE_API_KEY` corresponde à API Key utilizada pela instância do WhatsApp na Evolution API.

Essa chave é necessária para que o middleware possa realizar requisições autenticadas à Evolution API, principalmente para enviar mensagens de volta ao usuário.

Exemplo:

```env
INSTANCE_API_KEY=sua_api_key
```

> **Importante:** Não publique essa chave no Git ou compartilhe seu valor publicamente.

---

## `OLLAMA_IP`

A variável `OLLAMA_IP` define o endereço onde o serviço Ollama está disponível.

Caso o Ollama esteja executando na mesma máquina que o Node.js:

```env
OLLAMA_IP=localhost
```

Caso esteja executando em outro computador:

```env
OLLAMA_IP=192.168.1.100
```

O endereço deve ser aquele em que o serviço Ollama pode ser acessado pela aplicação Node.js.

Exemplo completo:

```env
INSTANCE_API_KEY=sua_api_key
OLLAMA_IP=localhost
```

> **Importante:** O `.env` da aplicação Node.js é separado do `.env` da Evolution API. Cada aplicação possui suas próprias configurações.

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

A estrutura esperada é:

```json
{
  "allowedNumbers": [
    "5511999999999",
    "5581999999999"
  ]
}
```

A aplicação utiliza o campo `allowedNumbers` para determinar quais números estão autorizados a utilizar o serviço.

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

# Testar Localmente e Desenvolvimento

Durante o desenvolvimento, é **recomendável executar a aplicação Node.js diretamente na sua máquina**, em vez de colocá-la dentro de um container Docker.

Isso facilita:

* Desenvolvimento do código.
* Testes.
* Visualização dos logs.
* Depuração.
* Alterações rápidas no código.

Entre na pasta:

```bash
cd node-app
```

Instale as dependências:

```bash
npm install
```

Depois execute:

```bash
node app.js
```

A aplicação ficará disponível na porta:

```text
3000
```

---

## Configurando o Webhook para desenvolvimento

Durante o desenvolvimento, a Evolution API estará executando dentro do Docker enquanto o Node.js estará executando diretamente na máquina.

```text
Evolution API → Docker
Node.js       → Máquina local
```

Para que um container Docker consiga acessar um serviço executando na máquina host, utilizamos:

```text
host.docker.internal
```

Portanto, configure o webhook da Evolution API para:

```text
http://host.docker.internal:3000/webhook
```

### Fluxo durante o desenvolvimento

```text
WhatsApp
    ↓
Evolution API (Docker)
    ↓
host.docker.internal:3000/webhook
    ↓
Node.js (máquina local)
    ↓
Allowlist
    ↓
Serviço de IA / Ollama
    ↓
Node.js
    ↓
Evolution API
    ↓
WhatsApp
```

> **Recomendação:** Durante o desenvolvimento, mantenha o `node-app` executando diretamente na sua máquina. Dessa forma, você não precisa reconstruir o container a cada alteração no código.

---

# Configurando o Webhook na Evolution API

No painel da Evolution API:

1. Abra o menu lateral.
2. Acesse a seção **Webhook**.
3. Configure a URL de acordo com o ambiente.

## Desenvolvimento local

Quando o Node.js estiver executando diretamente na máquina:

```text
http://host.docker.internal:3000/webhook
```

## Produção

Quando o Node.js estiver executando dentro da infraestrutura Docker e o acesso for realizado através do Nginx:

```text
http://nginx_container:80/webhook
```

Nesse cenário, `nginx_container` corresponde ao nome do container do Nginx dentro da rede Docker.

A Evolution API e o Nginx precisam estar conectados à mesma rede:

```text
app-network
```

---

# Executando a aplicação

## Desenvolvimento

Após configurar o `.env` e a allowlist:

```bash
node app.js
```

A aplicação estará aguardando os eventos enviados pela Evolution API através do endpoint:

```text
POST /webhook
```

---

# Produção

Em produção, a aplicação Node.js pode ser executada dentro de um container Docker e ficar atrás de um Nginx.

Nesse cenário, os serviços devem estar conectados à mesma rede:

```text
app-network
```

O fluxo será:

```text
Evolution API
       ↓
nginx_container:80
       ↓
Node.js
       ↓
Serviço de IA
```

O webhook configurado na Evolution API deverá ser:

```text
http://nginx_container:80/webhook
```

---

# Comunicação com o Ollama

O middleware utiliza a biblioteca `ollama` para realizar a comunicação com o serviço de Inteligência Artificial.

O modelo utilizado atualmente pode ser configurado no código da aplicação.

Exemplo:

```text
qwen3.5:2b
```

O fluxo esperado é:

```text
Mensagem do WhatsApp
        ↓
Evolution API
        ↓
/webhook
        ↓
Middleware Node.js
        ↓
Ollama
        ↓
Modelo de IA
        ↓
Resposta
        ↓
Middleware Node.js
        ↓
Evolution API
        ↓
WhatsApp
```

O endereço do serviço Ollama é configurado através da variável:

```env
OLLAMA_IP=
```

---

# Endpoints da aplicação

## `GET /`

Retorna a interface web da aplicação.

```text
GET /
```

---

## `POST /webhook`

Endpoint utilizado pela Evolution API para enviar eventos do WhatsApp.

```text
POST /webhook
```

O middleware realiza validações como:

* Tipo do evento.
* Número do remetente.
* Domínio do JID.
* Se a mensagem foi enviada pelo próprio usuário.
* Timestamp da mensagem.
* Conteúdo da mensagem.

Eventos diferentes de:

```text
messages.upsert
```

são ignorados.

---

## `POST /insert`

Endpoint utilizado para adicionar um número à allowlist.

```text
POST /insert
```

O corpo da requisição deve possuir o formato:

```json
{
  "num": "5511999999999"
}
```

O número será adicionado ao campo `allowedNumbers` do arquivo `allowlist.json`.

---

# Fluxo completo

O objetivo final do projeto é permitir que uma mensagem enviada pelo usuário seja processada automaticamente por um serviço de Inteligência Artificial e que a resposta seja devolvida ao próprio usuário.

```text
┌──────────────┐
│   WhatsApp   │
└──────┬───────┘
       │
       │ Mensagem
       ▼
┌──────────────────┐
│  Evolution API   │
│     Baileys      │
└────────┬─────────┘
         │
         │ Webhook
         ▼
┌──────────────────┐
│     Node.js      │
│    Middleware    │
└────────┬─────────┘
         │
         │ Mensagem
         ▼
┌──────────────────┐
│     Ollama       │
│   Serviço de IA  │
└────────┬─────────┘
         │
         │ Resposta
         ▼
┌──────────────────┐
│     Node.js      │
│    Middleware    │
└────────┬─────────┘
         │
         │ HTTP
         ▼
┌──────────────────┐
│  Evolution API   │
└────────┬─────────┘
         │
         │ Mensagem
         ▼
┌──────────────┐
│   WhatsApp   │
└──────────────┘
```

---

# Resumo dos ambientes

| Ambiente        | Onde roda o Node.js | Webhook da Evolution API                   |
| --------------- | ------------------- | ------------------------------------------ |
| Desenvolvimento | Máquina local       | `http://host.docker.internal:3000/webhook` |
| Produção        | Container Docker    | `http://nginx_container:80/webhook`        |

---

# Variáveis de ambiente

### Evolution API

```env
AUTHENTICATION_API_KEY=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
```

### Node.js

```env
INSTANCE_API_KEY=
OLLAMA_IP=
```

Não versione os valores reais dessas variáveis no Git.

Recomenda-se adicionar os arquivos `.env` ao `.gitignore`:

```gitignore
.env
.env.*
!.env.example
```

---

# Licença

Este projeto é fornecido para fins de estudo, testes e desenvolvimento de integrações com WhatsApp, Evolution API e serviços de Inteligência Artificial.
