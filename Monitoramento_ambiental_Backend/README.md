# Backend - Monitoramento Ambiental

Este é o backend da aplicação de Monitoramento Ambiental em Tempo Real, desenvolvido com **NestJS**, **TypeScript**, **Prisma** e **PostgreSQL**.

## 🚀 Tecnologias Utilizadas

- **Framework**: [NestJS](https://nestjs.com/)
- **Linguagem**: TypeScript
- **ORM**: [Prisma](https://www.prisma.io/)
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis
- **Autenticação**: JWT (JSON Web Tokens)
- **WebSocket**: Socket.IO para comunicação em tempo real
- **Validação**: class-validator e class-transformer

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── alerts/          # Módulo de alertas
│   ├── auth/            # Módulo de autenticação
│   ├── prisma/          # Serviço do Prisma
│   ├── readings/        # Módulo de leituras
│   ├── sensors/         # Módulo de sensores
│   ├── stations/        # Módulo de estações
│   ├── users/           # Módulo de usuários
│   ├── websocket/       # Gateway WebSocket
│   ├── app.module.ts    # Módulo principal
│   └── main.ts          # Arquivo de entrada
├── prisma/
│   ├── schema.prisma    # Esquema do banco de dados
│   ├── seed.ts          # Dados de exemplo
│   └── migrations/      # Migrações do banco
├── dist/                # Build compilado
└── package.json
```

## 🛠️ Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Docker e Docker Compose (para banco de dados)
- PostgreSQL e Redis (via Docker)

## 🚀 Instalação e Configuração

### 1. Clonagem e Instalação

```bash
# Instalar dependências
npm install
```

### 2. Configuração do Banco de Dados

```bash
# Iniciar serviços do Docker (PostgreSQL e Redis)
cd ..
npm run docker:up

# Ou diretamente com docker-compose
docker-compose up -d
```

### 3. Configuração do Prisma

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# Popular banco com dados de exemplo
npm run prisma:seed
```

### 4. Executar a Aplicação

```bash
# Modo desenvolvimento
npm run start:dev

# Build para produção
npm run build

# Executar em produção
npm run start:prod
```

A API estará disponível em `http://localhost:3000`

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Iniciar em modo watch
npm run start:debug        # Iniciar com debug

# Build
npm run build              # Compilar TypeScript

# Produção
npm run start:prod         # Executar build compilado

# Banco de Dados
npm run prisma:generate    # Gerar cliente Prisma
npm run prisma:migrate     # Executar migrações
npm run prisma:seed        # Popular banco
npm run prisma:studio      # Abrir Prisma Studio

# Qualidade de Código
npm run lint               # Executar ESLint
npm run format             # Formatar código com Prettier

# Testes
npm run test               # Executar testes
npm run test:watch         # Testes em modo watch
npm run test:cov           # Testes com cobertura
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend:

```env
# Banco de Dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/monitoramento"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Aplicação
PORT=3000
NODE_ENV=development
```

### Prisma Schema

O esquema do banco de dados está definido em `prisma/schema.prisma`. Principais entidades:

- **User**: Usuários do sistema
- **Station**: Estações de monitoramento
- **Sensor**: Sensores instalados
- **Reading**: Leituras dos sensores
- **Alert**: Alertas gerados

## 🔐 Autenticação

A API utiliza autenticação baseada em JWT:

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

### Uso do Token

Inclua o token JWT no header `Authorization`:

```
Authorization: Bearer <your-jwt-token>
```

## 🌐 WebSocket

A aplicação utiliza WebSocket para atualizações em tempo real:

```javascript
// Conectar ao WebSocket
const socket = io('http://localhost:3000');

// Escutar eventos de leituras
socket.on('reading', (data) => {
  console.log('Nova leitura:', data);
});

// Escutar alertas
socket.on('alert', (data) => {
  console.log('Novo alerta:', data);
});
```

## 📚 API Endpoints

### Autenticação
- `POST /auth/login` - Login de usuário

### Usuários
- `GET /users` - Listar usuários
- `POST /users` - Criar usuário
- `GET /users/:id` - Buscar usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Remover usuário

### Estações
- `GET /stations` - Listar estações
- `POST /stations` - Criar estação
- `GET /stations/:id` - Buscar estação
- `PUT /stations/:id` - Atualizar estação
- `DELETE /stations/:id` - Remover estação

### Sensores
- `GET /sensors` - Listar sensores
- `POST /sensors` - Criar sensor
- `GET /sensors/:id` - Buscar sensor
- `PUT /sensors/:id` - Atualizar sensor
- `DELETE /sensors/:id` - Remover sensor

### Leituras
- `GET /readings` - Listar leituras
- `POST /readings` - Criar leitura

### Alertas
- `GET /alerts` - Listar alertas
- `PUT /alerts/:id/resolve` - Resolver alerta

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Testes com cobertura
npm run test:cov

# Testes em modo watch
npm run test:watch
```

## 📝 Desenvolvimento

### Estrutura de Módulos

Cada módulo segue a arquitetura padrão do NestJS:

```
module/
├── dto/           # Data Transfer Objects
├── module.ts      # Definição do módulo
├── controller.ts  # Controladores REST
└── service.ts     # Lógica de negócio
```

### Padrões Utilizados

- **SOLID Principles**: Princípios de design orientado a objetos
- **Dependency Injection**: Injeção de dependências do NestJS
- **DTOs**: Validação e transformação de dados
- **Guards**: Proteção de rotas
- **Interceptors**: Manipulação de requisições/respostas

## 🚀 Deploy

### Docker

```bash
# Build da imagem
docker build -t monitoramento-backend .

# Executar container
docker run -p 3000:3000 monitoramento-backend
```

### Ambiente de Produção

1. Configure as variáveis de ambiente
2. Execute as migrações do banco
3. Faça o build da aplicação
4. Inicie o servidor

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
