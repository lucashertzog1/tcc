=========================================================
🧭 GUIA DE USO - SITE LOCAL (Next.js + TypeScript)
=========================================================

📦 SOBRE O PROJETO
Este projeto é um site desenvolvido com **Next.js** e **TypeScript**, que realiza autenticação e conexão com banco de dados **MySQL**.  
Ele roda localmente utilizando **Node.js** e o gerenciador de pacotes **npm**.

=========================================================

🚀 COMO RODAR LOCALMENTE

### 1️⃣ Verifique se o Node.js está instalado
Versão recomendada: **Node 18 ou superior**

Para verificar:
```bash
node -v
```

### 2️⃣ Baixe ou clone este repositório
```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 3️⃣ Instale as dependências do projeto
```bash
npm install
```

Além das dependências padrão, este projeto usa **bcryptjs** (para criptografia de senhas)  
e **mysql2** (para conectar ao banco de dados MySQL).  
Certifique-se de instalá-las também:

```bash
npm install bcryptjs mysql2
npm install -D @types/bcryptjs
```

### 4️⃣ Rode o projeto em modo de desenvolvimento
```bash
npm run dev
```

### 5️⃣ Acesse no navegador
```
http://localhost:3000
```

=========================================================

🧩 DEPENDÊNCIAS PRINCIPAIS
As principais dependências utilizadas neste projeto são:

- **next** ......................... Framework React para SSR e rotas  
- **react** ........................ Biblioteca base para interfaces  
- **react-dom** .................... Renderizador React para web  
- **typescript** ................... Suporte ao TypeScript  
- **@types/react** ................. Tipos do React para TypeScript  
- **@types/node** .................. Tipos do Node.js  
- **bcryptjs** ..................... Criptografia de senhas para autenticação  
- **mysql2** ....................... Conexão e queries com banco de dados MySQL  

Para instalá-las manualmente, use:
```bash
npm install next react react-dom typescript @types/react @types/node bcryptjs mysql2
```

=========================================================

🛠️ OUTROS COMANDOS ÚTEIS
```bash
npm run build   # Cria a versão de produção do projeto
npm start       # Inicia o servidor em modo de produção
npm run lint    # Executa verificação de código (lint)
```

=========================================================

💡 DICAS
- Sempre rode `npm install` após baixar o projeto pela primeira vez.  
- Para atualizar dependências, use `npm update`.  
- Se ocorrerem erros de tipos, rode `npm run build` para recompilar.  
- Certifique-se de configurar corretamente o **MySQL** e as variáveis de ambiente `.env`.

=========================================================

👨‍💻 AUTORES
Projeto desenvolvido por Lucas Hertzog e João Bonotto.

