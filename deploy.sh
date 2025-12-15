#!/bin/bash

# Script de Deploy - Cifras Músicas
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deploy do Cifras Músicas..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Parar containers
echo ""
print_status "Parando containers..."
docker-compose down -v

# 2. Limpar volumes antigos (opcional, comentado por segurança)
# print_warning "Limpando volumes antigos..."
# docker volume prune -f

# 3. Rebuild das imagens
echo ""
print_status "Rebuilding imagens Docker (isso pode levar alguns minutos)..."
docker-compose build --no-cache

# 4. Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    print_status "Build concluído com sucesso!"
else
    print_error "Erro no build. Verifique os logs acima."
    exit 1
fi

# 5. Subir containers
echo ""
print_status "Iniciando containers..."
docker-compose up -d

# 6. Aguardar containers iniciarem
echo ""
print_status "Aguardando containers iniciarem..."
sleep 10

# 7. Verificar status
echo ""
print_status "Verificando status dos containers..."
docker-compose ps

# 8. Verificar dependências do frontend
echo ""
print_status "Verificando dependências do Tiptap..."
if docker-compose exec -T frontend sh -c "ls node_modules/@tiptap/react > /dev/null 2>&1"; then
    print_status "Dependências do Tiptap instaladas corretamente!"
else
    print_warning "Dependências do Tiptap não encontradas. Instalando..."
    docker-compose exec -T frontend npm install
    docker-compose restart frontend
    sleep 5
fi

# 9. Verificar se os serviços estão respondendo
echo ""
print_status "Verificando serviços..."

# Backend
if curl -f -s http://localhost:3002/health > /dev/null 2>&1; then
    print_status "Backend está respondendo!"
else
    print_warning "Backend não está respondendo. Verifique os logs."
fi

# Frontend
if curl -f -s http://localhost:5173 > /dev/null 2>&1; then
    print_status "Frontend está respondendo!"
else
    print_warning "Frontend não está respondendo. Verifique os logs."
fi

# 10. Mostrar informações finais
echo ""
echo "================================================================"
print_status "Deploy concluído!"
echo "================================================================"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3002"
echo ""
echo "Para ver os logs:"
echo "  docker-compose logs -f"
echo ""
echo "Para ver logs específicos:"
echo "  docker-compose logs -f frontend"
echo "  docker-compose logs -f backend"
echo ""
print_warning "Aguarde alguns segundos para os serviços inicializarem completamente."
echo ""


