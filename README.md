# 🍞 Receitas Pro - Sistema de Gestão para Panificação

Sistema completo de gestão para panificadoras e cozinhas industriais, desenvolvido com tecnologias modernas e interface elegante.

## ✨ **Características**

### 🎨 **Interface Modernizada**
- Design elegante com tons de cinza sofisticados
- Interface responsiva e intuitiva
- Componentes modernos com animações suaves
- Dashboard com métricas em tempo real

### 🔧 **Funcionalidades Principais**
- **Gestão de Insumos**: Cadastro completo com controle de estoque
- **Fichas Técnicas**: Receitas com cálculo automático de custos
- **Controle de Produção**: Registro e acompanhamento
- **Gestão de Vendas**: Controle de vendas e canais
- **Relatórios**: Analytics e relatórios detalhados
- **Cálculo de Preços**: Precificação automática

### 🛠️ **Tecnologias**
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: PostgreSQL (Supabase)
- **Autenticação**: Supabase Auth
- **Deploy**: Vercel

## 🚀 **Deploy Rápido**

### **1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/receitas-pro.git
cd receitas-pro
```

### **2. Instale as dependências**
```bash
npm install
```

### **3. Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações
```

### **4. Execute as migrações**
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### **5. Inicie o servidor**
```bash
npm run dev
```

## 📋 **Variáveis de Ambiente**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Database
DATABASE_URL=sua_url_database
DIRECT_URL=sua_url_direct

# Auth
JWT_SECRET=sua_chave_jwt
NEXTAUTH_SECRET=sua_chave_nextauth
NEXTAUTH_URL=http://localhost:3000
```

## 🎯 **Deploy no Vercel**

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático!

Consulte o arquivo `GUIA-DEPLOY-VERCEL.md` para instruções detalhadas.

## 📊 **Estrutura do Projeto**

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API Routes
│   ├── (pages)/           # Páginas da aplicação
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── layout/           # Componentes de layout
│   └── ui/               # Componentes de UI
├── lib/                  # Utilitários e configurações
└── contexts/             # Contextos React
```

## 🔐 **Autenticação**

O sistema utiliza Supabase Auth com:
- Login/Registro por email
- Sessões persistentes
- Proteção de rotas
- Sincronização automática de usuários

## 📱 **Páginas Disponíveis**

- **Dashboard**: Visão geral e métricas
- **Insumos**: Gestão de ingredientes
- **Produtos**: Catálogo de produtos
- **Fichas Técnicas**: Receitas e custos
- **Produção**: Controle de produção
- **Vendas**: Gestão de vendas
- **Estoque**: Controle de estoque
- **Relatórios**: Analytics e relatórios

## 🎨 **Design System**

- Paleta de cinzas sofisticada
- Componentes consistentes
- Animações suaves
- Interface responsiva
- Acessibilidade

## 📄 **Licença**

Este projeto está sob a licença MIT.

## 🤝 **Contribuição**

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

---

**Desenvolvido com ❤️ para a indústria de panificação**

