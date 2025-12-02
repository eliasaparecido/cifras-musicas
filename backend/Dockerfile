# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependências do sistema necessárias incluindo OpenSSL
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    openssl \
    openssl-dev

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Expor porta
EXPOSE 3002

# Comando padrão (será sobrescrito no docker-compose)
CMD ["npm", "run", "dev"]
