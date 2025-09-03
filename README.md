# Front-end - Projeto MVP de Back-End Avançado

Este repositório contém a **interface** do projeto para o MVP do curso de Back-End Avançado na PUC-RIO, desenvolvido em **React**, responsável pela interface do usuário e comunicação com a API back-end (em Python).

## Tecnologias Utilizadas

- **React** - Biblioteca principal para construção da interface.
- **Axios** - Para chamadas HTTP à API.
- **Framer Motion** - Para animações.
- **Tailwind CSS** - Para estilização rápida e responsiva.
- **React Toastify** - Para notificações.

## Estrutura do Projeto

```text
src/
├─ API/                  # Funções para comunicação com a API
├─ components/           # Componentes reutilizáveis
│  ├─ common/            # Navbar, modais, etc.
│  ├─ games/             # Componentes de listagem dos itens e afins.
│  ├─ gb/                # Componentes específicos do catálogo de jogos
│  ├─ ui/                # Botões, inputs, rating stars, etc.
│  └─ icons/             # Icones usados no projeto.
├─ hooks/                # Hooks usados no projeto
├─ pages/                # Páginas principais (Dashboard, About, Login, etc.)
├─ App.jsx               # Componente principal
└─ index.jsx             # Ponto de entrada da aplicação
```
# Instalação
## Clone do repositório
git clone <URL_DO_REPOSITORIO_FRONTEND>
cd <PASTA_DO_FRONTEND>

## Instalação de dependencias
npm install
 ou
yarn install

## Configuração
Crie um arquivo .env na raiz do front-end com as seguintes variáveis:

REACT_APP_API_URL=http://localhost:8000/api
