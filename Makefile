.PHONY: help build up down logs restart clean migrate studio

help: ## Mostra esta ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Constrói as imagens Docker
	docker compose build

up: ## Inicia os containers
	docker compose up

upd: ## Inicia os containers em background
	docker compose up -d

down: ## Para os containers
	docker compose down

logs: ## Mostra os logs
	docker compose logs -f

restart: ## Reinicia os containers
	docker compose restart

clean: ## Remove containers, volumes e imagens
	docker compose down -v
	docker system prune -f

migrate: ## Executa as migrations do Prisma
	docker compose exec backend npx prisma migrate dev

studio: ## Abre o Prisma Studio
	docker compose exec backend npx prisma studio

seed: ## Adiciona dados de exemplo no banco
	docker compose exec backend npx prisma db seed

migrate-lyrics: ## Migra letras antigas para o novo formato (preserva espaços)
	docker compose exec backend npm run build
	docker compose exec backend node migrate-lyrics.js

setup: build upd migrate ## Setup completo do projeto
	@echo "✅ Projeto configurado com sucesso!"
	@echo "📱 Frontend: http://localhost:5173"
	@echo "🔧 Backend: http://localhost:3002"
	@echo "💾 Prisma Studio: Execute 'make studio' e acesse http://localhost:5555"
