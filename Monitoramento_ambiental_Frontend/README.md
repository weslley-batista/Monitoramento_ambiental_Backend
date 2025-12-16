# Frontend - Monitoramento Ambiental

Este é o frontend da aplicação de Monitoramento Ambiental em Tempo Real, desenvolvido com **Next.js 14**, **TypeScript**, **Tailwind CSS** e **React Query**.

## 🚀 Tecnologias Utilizadas

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript
- **UI Framework**: React 18
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Gerenciamento de Estado**: [Zustand](https://zustand-demo.pmnd.rs/) + [React Query](https://tanstack.com/query)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Notificações**: [React Hot Toast](https://react-hot-toast.com/)
- **Utilitários**: [date-fns](https://date-fns.org/), [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastil/tailwind-merge)

## 📁 Estrutura do Projeto

```
frontend/
├── app/                    # Páginas (App Router)
│   ├── alerts/            # Página de alertas
│   ├── dashboard/         # Dashboard principal
│   ├── login/             # Página de login
│   ├── readings/          # Página de leituras
│   ├── sensors/           # Página de sensores
│   ├── stations/          # Página de estações
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
├── components/            # Componentes reutilizáveis
│   ├── AlertsPanel.tsx    # Painel de alertas
│   ├── DashboardLayout.tsx # Layout do dashboard
│   ├── LatestReadings.tsx # Leituras mais recentes
│   ├── QueryProvider.tsx  # Provider do React Query
│   ├── StationsMap.tsx    # Mapa das estações
│   ├── StatsCards.tsx     # Cards de estatísticas
│   └── Toaster.tsx        # Componente de toast
├── lib/                   # Utilitários
│   ├── api.ts             # Configuração do Axios
│   └── auth.ts            # Funções de autenticação
├── store/                 # Estado global
│   └── authStore.ts       # Store de autenticação
├── node_modules/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## 🛠️ Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Backend da aplicação rodando (porta 3000)

## 🚀 Instalação e Configuração

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do frontend:

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3000

# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### 3. Executar a Aplicação

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm run start
```

A aplicação estará disponível em `http://localhost:3000`

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                # Iniciar servidor de desenvolvimento

# Build
npm run build              # Build para produção

# Produção
npm run start              # Iniciar servidor de produção

# Qualidade de Código
npm run lint               # Executar ESLint
```

## 🎨 Funcionalidades

### 📊 Dashboard
- **Visão Geral**: Métricas principais do sistema
- **Mapa Interativo**: Localização das estações de monitoramento
- **Leituras em Tempo Real**: Últimas medições dos sensores
- **Alertas Ativos**: Notificações de problemas no sistema

### 🔐 Autenticação
- **Login Seguro**: Autenticação baseada em JWT
- **Proteção de Rotas**: Guards para rotas autenticadas
- **Gerenciamento de Sessão**: Persistência do estado de login

### 📍 Estaçoes
- **Visualização**: Lista todas as estações cadastradas
- **Mapa Integrado**: Localização geográfica das estações
- **Detalhes**: Informações completas de cada estação

### 📡 Sensores
- **Gerenciamento**: CRUD completo de sensores
- **Associação**: Vinculação de sensores às estações
- **Monitoramento**: Status e configurações dos sensores

### 📈 Leituras
- **Histórico**: Visualização histórica das medições
- **Gráficos**: Representação visual dos dados
- **Filtros**: Busca por período, sensor ou estação

### 🚨 Alertas
- **Monitoramento**: Sistema de alertas em tempo real
- **Categorização**: Alertas por severidade e tipo
- **Resolução**: Marcação de alertas como resolvidos

## 🔧 Arquitetura

### Gerenciamento de Estado

#### Zustand (Autenticação)
```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}
```

#### React Query (Dados da API)
```typescript
// Busca de estações
const { data: stations } = useQuery({
  queryKey: ['stations'],
  queryFn: api.getStations,
});

// Busca de leituras em tempo real
const { data: readings } = useQuery({
  queryKey: ['readings', filters],
  queryFn: () => api.getReadings(filters),
});
```

### Estrutura de Componentes

#### Layout Responsivo
- **DashboardLayout**: Layout principal com navegação lateral
- **Responsive Design**: Adaptação para mobile e desktop
- **Tema Consistente**: Paleta de cores e tipografia padronizada

#### Componentes Reutilizáveis
- **StatsCards**: Cards de métricas com ícones
- **StationsMap**: Mapa interativo com marcadores
- **AlertsPanel**: Lista de alertas com filtros
- **LatestReadings**: Tabela de leituras recentes

## 🌐 Integração com Backend

### API Client (Axios)
```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para JWT
api.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### WebSocket
```typescript
// Conexão em tempo real
useEffect(() => {
  const socket = io(process.env.NEXT_PUBLIC_WS_URL);

  socket.on('reading', (data) => {
    // Atualizar leituras em tempo real
    queryClient.invalidateQueries(['readings']);
  });

  socket.on('alert', (data) => {
    // Mostrar notificação de alerta
    toast.error(`Novo alerta: ${data.message}`);
  });

  return () => socket.disconnect();
}, []);
```

## 🎨 Design System

### Tailwind CSS
- **Utility-First**: Classes utilitárias para estilização rápida
- **Responsive**: Breakpoints configurados (sm, md, lg, xl)
- **Dark Mode**: Suporte para tema escuro (futuro)

### Paleta de Cores
```css
/* Cores principais */
--primary: #2563eb;      /* Azul */
--secondary: #64748b;    /* Cinza */
--success: #10b981;      /* Verde */
--warning: #f59e0b;      /* Amarelo */
--error: #ef4444;        /* Vermelho */

/* Backgrounds */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-tertiary: #f1f5f9;
```

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Componentes Adaptativos
- **Grid Layout**: Sistema de grid responsivo
- **Navigation**: Menu hambúrguer em mobile
- **Tables**: Tabelas roláveis horizontalmente
- **Charts**: Gráficos adaptáveis ao tamanho da tela

## 🧪 Testes

```bash
# Ainda não implementado - estrutura preparada para:
# - Jest para testes unitários
# - React Testing Library para componentes
# - Cypress para testes E2E
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Produção
vercel --prod
```

### Build Manual
```bash
# Build
npm run build

# Servir arquivos estáticos
npm run start
```

## 🔧 Desenvolvimento

### Padrões de Código

#### Componentes React
```typescript
// Uso de hooks customizados
const useStations = () => {
  return useQuery({
    queryKey: ['stations'],
    queryFn: api.getStations,
  });
};

// Componente funcional com TypeScript
const StationsPage: React.FC = () => {
  const { data: stations, isLoading } = useStations();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stations?.map((station) => (
        <StationCard key={station.id} station={station} />
      ))}
    </div>
  );
};
```

#### Tailwind CSS Classes
```typescript
// Utilitários para classes dinâmicas
const buttonClasses = clsx(
  'px-4 py-2 rounded-md font-medium transition-colors',
  {
    'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
    'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
    'opacity-50 cursor-not-allowed': disabled,
  }
);
```

### Estrutura de Pastas
- **app/**: Páginas do Next.js (App Router)
- **components/**: Componentes reutilizáveis
- **lib/**: Utilitários e configurações
- **store/**: Estado global (Zustand)

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
