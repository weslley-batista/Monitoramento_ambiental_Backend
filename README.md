# Sistema de Monitoramento Ambiental em Tempo Real

Sistema completo de monitoramento ambiental com dashboard em tempo real, mapas interativos, sistema de alertas e simulação de sensores IoT.

## 🚀 Funcionalidades

- **Painel em tempo real**: Atualização via WebSockets
- **Mapa interativo**: Visualização de estações de monitoramento com Leaflet/Mapbox
- **Gráficos e indicadores**: Visualização de dados com Recharts
- **Sistema de alertas**: Notificações quando parâmetros ultrapassam limites
- **Histórico e relatórios**: Armazenamento e visualização de dados históricos
- **Autenticação**: Controle de acesso com diferentes níveis (técnico, pesquisador, gestor)
- **Simulação IoT**: Script para simular sensores enviando dados

## 🏗️ Arquitetura

```
monitoramento-ambiental/
├── backend/          # NestJS + Prisma + PostgreSQL
├── frontend/         # Next.js 14 (App Router)
├── simulator/        # Simulador de sensores IoT
└── docker-compose.yml
```

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (ou usar Docker)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd Monitoramento_ambiental
```

2. Instale as dependências:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../simulator && npm install
```

3. Configure as variáveis de ambiente:
```bash
# Backend
cp backend/.env.example backend/.env
# Edite backend/.env com suas configurações

# Frontend
cp frontend/.env.example frontend/.env.local
```

4. Inicie os serviços com Docker:
```bash
npm run docker:up
```

5. Execute as migrações do banco de dados:
```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

6. Inicie o desenvolvimento:
```bash
npm run dev
```

## 🐳 Docker

Para iniciar todos os serviços (PostgreSQL, Redis):
```bash
docker-compose up -d
```

Para parar:
```bash
docker-compose down
```

## 📝 Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/monitoramento"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
REDIS_URL="redis://localhost:6379"
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

## 🎯 Uso

1. Acesse o frontend: http://localhost:3000
2. Faça login com as credenciais padrão (ver backend/prisma/seed.ts)
3. Visualize os dados em tempo real no dashboard
4. Configure alertas e limites no painel administrativo

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia backend e frontend em modo desenvolvimento
- `npm run build` - Build de produção
- `npm run docker:up` - Inicia serviços Docker
- `npm run docker:down` - Para serviços Docker

## 📚 Tecnologias

- **Backend**: NestJS, Prisma, PostgreSQL, WebSocket, Redis
- **Frontend**: Next.js 14, React Query, Tailwind CSS, Recharts, Leaflet
- **Auth**: JWT, bcrypt
- **Infra**: Docker, Docker Compose

## 📄 Licença

MIT

