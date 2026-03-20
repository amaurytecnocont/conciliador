# ConciliaERP - Mini ERP de Conciliação Contábil

Sistema completo para controle de conciliação contábil, fiscal e DP, desenvolvido com **React** no frontend e **Node.js (Express)** no backend, utilizando **SQLite** para armazenamento local e em rede.

## 🚀 Funcionalidades

- **Dashboard:** Visão geral de status por empresa e período.
- **Gestão de Empresas:** Cadastro com busca automática de CNPJ via API.
- **Responsáveis:** Vínculo de responsáveis técnicos por empresa.
- **Conciliação:** Controle mensal por departamento (Contábil, Fiscal, DP).
- **Importação:** Suporte a arquivos Excel (.xlsx) para carga de dados.
- **Relatórios:** Geração de relatórios em formato `.txt` (estilo DOS).
- **Multiusuário:** Acesso via rede local (IP do servidor).

## 🛠️ Tecnologias

- **Frontend:** React, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend:** Node.js, Express, Better-SQLite3.
- **Banco de Dados:** SQLite (arquivo local `erp.db`).

## 📦 Como Rodar (Localmente)

### Pré-requisitos
- [Node.js](https://nodejs.org/) (Versão 18 ou superior)

### Instalação e Execução (Windows)
1. Baixe ou clone este repositório.
2. Clique duas vezes no arquivo `instalar_tudo.bat`.
3. O script irá instalar as dependências, compilar o sistema e abrir o navegador em `http://localhost:3000`.

### Instalação Manual (Qualquer SO)
```bash
# Instalar dependências
npm install

# Compilar o frontend
npm run build

# Iniciar o servidor
npm start
```

## 🌐 Deploy (GitHub / Cloud)

Este projeto está pronto para ser hospedado em serviços como **Render**, **Railway** ou **Fly.io** diretamente do GitHub.

### Deploy via Docker
O projeto inclui um `Dockerfile` e um `render.yaml`. Basta conectar seu repositório GitHub a um serviço de nuvem que suporte Docker.

### GitHub Actions
O repositório inclui um workflow do GitHub Actions (`.github/workflows/ci.yml`) que valida automaticamente cada push e pull request, garantindo que o sistema esteja sempre funcional.

## 📄 Licença
Este projeto é licenciado sob a **Licença MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---
Desenvolvido para pequenos escritórios contábeis.
