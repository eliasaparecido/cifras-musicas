#!/bin/bash

# Script de inicialização do projeto Cifras Musicais
# Autor: Dev Senior
# Data: 2024

set -e

echo "🎵 Cifras Musicais - Setup"
echo "========================="
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    echo "   Instale o Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado!"
    echo "   Instale o Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker instalado"
echo "✅ Docker Compose instalado"
echo ""

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down 2>/dev/null || true

# Construir imagens
echo ""
echo "🔨 Construindo imagens Docker..."
docker-compose build

# Iniciar containers
echo ""
echo "🚀 Iniciando containers..."
docker-compose up -d

# Aguardar backend iniciar
echo ""
echo "⏳ Aguardando backend inicializar..."
sleep 10

# Executar migrations
echo ""
echo "💾 Executando migrations do banco de dados..."
docker-compose exec -T backend npx prisma migrate dev --name init

# Gerar Prisma Client
echo ""
echo "🔧 Gerando Prisma Client..."
docker-compose exec -T backend npx prisma generate

# Popular banco com dados de exemplo (opcional)
read -p "Deseja popular o banco com dados de exemplo? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🌱 Populando banco com dados de exemplo..."
    docker-compose exec -T backend npm run seed
fi

echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "📱 Aplicação disponível em:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3002"
echo "   API Docs:  Veja API.md"
echo ""
echo "🔧 Comandos úteis:"
echo "   make logs      - Ver logs em tempo real"
echo "   make studio    - Abrir Prisma Studio (DB admin)"
echo "   make down      - Parar containers"
echo "   make restart   - Reiniciar containers"
echo ""
echo "📚 Documentação:"
echo "   README.md       - Visão geral e instalação"
echo "   API.md          - Documentação da API"
echo "   DEVELOPMENT.md  - Guia de desenvolvimento"
echo ""
echo "🎉 Bom desenvolvimento!"
