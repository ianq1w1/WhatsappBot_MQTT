# Imagem base
FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install --production

# Copia o restante da aplicação
COPY . .

# Expõe a porta usada pelo Express
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "app.js"]