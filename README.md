<div align="center">

# Caminho Seguro

### Uma rede digital de protecao infantil para conectar familias, escolas, transporte, poder publico e comunidade sem transformar seguranca em vigilancia.

**Eventos confiaveis. Resposta coordenada. Privacidade desde o primeiro contato.**

[Dominio proprio](https://caminho-seguro.rcg-tech.com.br) | Next.js 16 | React 19 | Prisma | PostgreSQL | Solana Devnet | shadcn/ui | PWA | SEO tecnico

</div>

---

## Resumo executivo

O **Caminho Seguro** e uma plataforma de protecao infantil baseada em rede. O produto conecta responsaveis, escolas, transporte escolar, orgaos publicos, pontos parceiros e comunidade para registrar eventos relevantes da rotina da crianca e acionar as pessoas certas quando algo exige resposta.

A proposta e deliberadamente diferente de um rastreador infantil tradicional:

- nao acompanha GPS continuo da crianca;
- nao expoe nome, telefone, endereco, escola ou responsavel no QR publico;
- nao exige que a crianca tenha celular;
- registra eventos pontuais e auditaveis: chegada, embarque, desembarque, pedido de ajuda, crianca encontrada, situacao de risco e check-ins institucionais;
- usa blockchain como camada de evidencia para provar integridade dos eventos sem publicar dados pessoais.

O resultado e um produto vendavel para operacoes reais de seguranca, educacao e assistencia social: uma infraestrutura de resposta e confianca para redes locais de protecao.

---

## O problema que o produto resolve

Familias, escolas, transporte escolar e orgaos de protecao trabalham com informacoes fragmentadas. Quando uma crianca se perde, pede ajuda, nao chega onde deveria ou precisa de atendimento, a resposta depende de telefone, sorte, planilhas, grupos de mensagem ou conhecimento informal da comunidade.

Ao mesmo tempo, solucoes de rastreamento continuo criam riscos de privacidade, dependencia de aparelho proprio e exposicao indevida de dados sensiveis.

O Caminho Seguro resolve esse equilibrio:

| Dor operacional                                | Como o Caminho Seguro responde                                                      |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| Crianca nao tem celular                        | Identidade fisica por QR, BLE e modelo preparado para NFC                           |
| QR publico costuma expor dados                 | Token opaco sem dados pessoais na tela publica                                      |
| Escola e transporte nao compartilham eventos   | Cada ator registra eventos dentro da sua interface                                  |
| Responsavel precisa saber o que aconteceu      | Tela do responsavel mostra alertas, historico e contexto permitido                  |
| Rede publica precisa coordenar resposta        | Tela da rede mostra instituicoes, alertas e uma visualizacao agregada demonstrativa |
| Eventos podem ser questionados                 | Hash do evento e registrado na Solana Devnet como evidencia                         |
| Produto precisa ser apresentavel e encontravel | Dominio proprio, SEO, Open Graph, sitemap, robots, Schema.org e PWA                 |

---

## Proposta de valor para empresas e instituicoes

O Caminho Seguro pode ser vendido como uma plataforma de infraestrutura social para:

- escolas privadas e redes municipais de ensino;
- empresas de transporte escolar;
- condominios e comunidades planejadas;
- prefeituras, CRAS, UBS, conselhos tutelares e secretarias;
- redes de comercio local certificadas como pontos seguros;
- ONGs e programas de protecao comunitaria.

### Beneficios diretos

- **Reducao do tempo de resposta:** eventos chegam a interface certa com status e contexto.
- **Menos exposicao juridica:** QR publico nao revela dados sensiveis da crianca.
- **Auditoria e rastreabilidade:** acoes sensiveis geram `AuditLog` e eventos possuem historico.
- **Confianca entre atores:** cada perfil acessa apenas o necessario para agir.
- **Integracao futura:** arquitetura ja separa APIs, banco, eventos, notificacoes e blockchain.
- **Imagem institucional:** dominio, SEO, PWA, Open Graph e branding tornam o produto apresentavel para clientes reais.

---

## Entregas ja realizadas

### Produto e experiencia

| Entrega                                      |    Status | Evidencia no codigo                                                |
| -------------------------------------------- | --------: | ------------------------------------------------------------------ |
| Home comercial com proposta de valor         | Concluido | `src/app/page.tsx`                                                 |
| Secao "Visao de futuro" com accordion shadcn | Concluido | `src/app/page.tsx`, `src/components/ui/accordion.tsx`              |
| Tela demonstrativa do responsavel            |   Parcial | `src/app/responsavel/page.tsx`, `src/features/guardian-dashboard/` |
| Tela demonstrativa da escola                 |   Parcial | `src/app/escola/page.tsx`, `src/features/school-dashboard/`        |
| Tela demonstrativa do transporte             |   Parcial | `src/app/transporte/page.tsx`, `src/features/transport-dashboard/` |
| Visualizacao demonstrativa da rede           |   Parcial | `src/app/rede/page.tsx`, `src/features/protection-network/`        |
| Admin de demonstracao/piloto                 |   Parcial | `src/app/admin/page.tsx`, `src/features/admin-dashboard/`          |
| Pagina publica do QR                         | Concluido | `src/app/ajuda/[token]/page.tsx`, `src/features/public-help/`      |
| Fluxo de demo guiada                         | Concluido | `src/app/demo/page.tsx`                                            |
| Animacoes de interface                       | Concluido | `GSAP`, `ViewTransition`, accordion animado                        |

### SEO, distribuicao e presenca digital

| Entrega                 |    Status | Finalidade                                                 |
| ----------------------- | --------: | ---------------------------------------------------------- |
| URL em dominio proprio  | Concluido | `https://caminho-seguro.rcg-tech.com.br`                   |
| SEO Metadata            | Concluido | Titulo, descricao, keywords e canonical                    |
| Open Graph              | Concluido | Preview rico em redes sociais e aplicativos                |
| Twitter Card            | Concluido | Preview de compartilhamento                                |
| Google Search Console   | Concluido | `verification.google` configurado                          |
| `robots.txt`            | Concluido | Permite paginas publicas e bloqueia areas sensiveis        |
| `sitemap.xml`           | Concluido | Lista home e demo para buscadores                          |
| Schema.org JSON-LD      | Concluido | WebSite, Organization e SoftwareApplication                |
| PWA Manifest            | Concluido | Instalacao como app standalone em dispositivos compativeis |
| Favicon e branding      | Concluido | Icones e logo em `public/` e `src/app/icon.png`            |
| Open Graph Image        | Concluido | `src/app/opengraph-image.tsx`                              |
| Lighthouse Optimization | Concluido | Registro de resultado: 96/100/100/100                      |

### Blockchain e confianca

| Entrega                           |                   Status | Observacao                                                    |
| --------------------------------- | -----------------------: | ------------------------------------------------------------- |
| Wallet Solana local               |                Concluido | `npm run setup:solana` gera carteira e configura `.env.local` |
| Registro on-chain de hashes       |                Concluido | `@solana/web3.js` + `@solana/spl-memo`                        |
| Rede alvo                         |                Concluido | `solana-devnet`                                               |
| Prova de integridade              |                Concluido | Hash SHA-256 do evento salvo em `BlockchainRecord`            |
| Verificacao de evento             |                Concluido | `GET /api/blockchain/verify/[eventId]`                        |
| Retry de eventos pendentes        |                Concluido | API e script `scripts/retry-pending.ts`                       |
| Reconciliacao banco/blockchain    |                Concluido | `POST /api/blockchain/reconcile`                              |
| Hardening de segredo admin        |                Concluido | `x-blockchain-admin-secret`                                   |
| Criacao de wallet por API publica | Desativado por seguranca | `POST /api/blockchain/wallet` retorna `410`                   |

Nota tecnica: o MVP usa a Solana Devnet e o SPL Memo Program como camada de prova on-chain. Nao ha smart contract proprio no repositorio. O "contrato" implementado na aplicacao e o contrato de evidencia: payload canonico -> hash SHA-256 -> transacao Solana -> `transactionHash`, `slot` e status persistidos no banco.

---

## Como o produto funciona

```mermaid
flowchart LR
  Citizen["Cidadao escaneia QR"] --> PublicHelp["Pagina publica /ajuda/[token]"]
  PublicHelp --> Event["ProtectionEvent"]
  Event --> Alert["Alert"]
  Alert --> Guardian["Tela do responsavel"]
  Alert --> Network["Tela da rede"]
  Event --> Hash["Hash SHA-256"]
  Hash --> Solana["Solana Devnet / Memo Program"]
  Solana --> Record["BlockchainRecord"]

  School["Escola / BLE simulado"] --> Event
  Transport["Transporte escolar"] --> Event
  Admin["Admin"] --> Identity["Crianca, vinculos e identificadores"]
  Identity --> PublicHelp
```

### Principio central

A plataforma nao tenta saber onde a crianca esta o tempo todo. Ela registra **eventos importantes** e permite que a rede aja com o menor volume possivel de dados.

Exemplos de eventos:

- chegada a escola;
- saida da escola;
- embarque no transporte;
- desembarque do transporte;
- pedido publico de ajuda;
- crianca encontrada;
- situacao de risco;
- check-in institucional.

---

## Fluxos principais

### 1. QR publico de ajuda

```text
Cidadao escaneia QR
-> /ajuda/[token]
-> PublicHelpForm coleta situacao, notas e localizacao opcional
-> POST /api/public/help
-> valida token ativo QR_CODE
-> cria ProtectionEvent
-> cria Alert
-> cria Notification para interface/browser
-> calcula hash do evento
-> tenta submeter hash para Solana Devnet
-> salva BlockchainRecord CONFIRMED ou PENDING
-> responsavel e rede visualizam o alerta
```

Arquivos principais:

- `src/app/ajuda/[token]/page.tsx`
- `src/features/public-help/public-help-form.tsx`
- `src/app/api/public/help/route.ts`
- `src/lib/notifications.ts`
- `src/features/blockchain/blockchain.service.ts`

### 2. Escola registra chegada BLE

```text
Operador da escola acessa /escola
-> SchoolDashboard mostra criancas esperadas
-> operador aciona simulacao BLE
-> POST /api/institution/ble/detect
-> valida perfil INSTITUTION_MEMBER ou ADMIN
-> encontra escola, gateway BLE e identificador BLE da crianca
-> bloqueia chegada duplicada no mesmo dia
-> cria ProtectionEvent SCHOOL_ARRIVAL
-> cria BlockchainRecord PENDING
-> atualiza lastSeenAt de gateway e identificador
-> cria AuditLog
-> interface atualiza via router.refresh
```

Arquivos principais:

- `src/app/escola/page.tsx`
- `src/features/school-dashboard/school-dashboard.tsx`
- `src/app/api/institution/ble/detect/route.ts`
- `src/app/api/institution/ble/reset/route.ts`

### 3. Transporte registra embarque e desembarque

```text
Monitor do transporte acessa /transporte
-> TransportDashboard lista criancas da rota
-> operador confirma embarque ou desembarque
-> POST /api/transport/events
-> valida perfil TRANSPORT_MEMBER ou ADMIN
-> valida vinculo da crianca com transporte
-> cria ProtectionEvent BUS_BOARDING ou DISEMBARKING_BUS
-> atualiza identificador BLE
-> cria AuditLog
-> interface exibe evento recente
```

Arquivos principais:

- `src/app/transporte/page.tsx`
- `src/features/transport-dashboard/transport-dashboard.tsx`
- `src/app/api/transport/events/route.ts`

### 4. Responsavel acompanha e resolve alertas

```text
Responsavel acessa /responsavel
-> pagina busca crianca principal, eventos e alertas
-> GuardianDashboard exibe historico e status blockchain
-> responsavel confirma recebimento
-> PATCH /api/guardian/alerts/[publicId]/acknowledge
-> responsavel resolve alerta
-> PATCH /api/guardian/alerts/[publicId]/resolve
```

Arquivos principais:

- `src/app/responsavel/page.tsx`
- `src/features/guardian-dashboard/guardian-dashboard.tsx`
- `src/features/guardian-dashboard/event-details-dialog.tsx`
- `src/app/api/guardian/alerts/[publicId]/acknowledge/route.ts`
- `src/app/api/guardian/alerts/[publicId]/resolve/route.ts`

### 5. Rede de protecao visualiza cobertura e alertas

```text
Agente autorizado acessa /rede
-> pagina valida perfil PUBLIC_AGENT ou ADMIN
-> consulta instituicoes ativas
-> consulta alertas e eventos recentes
-> interface monta visualizacao agregada com pontos conhecidos
-> mostra cobertura, alertas e eventos sem rota continua da crianca
```

Arquivos principais:

- `src/app/rede/page.tsx`
- `src/features/protection-network/protection-network-dashboard.tsx`
- `src/types/protection-network.ts`

### 6. Administracao configura o piloto

```text
Admin acessa /admin
-> cria instituicao
-> cria crianca ficticia + responsavel + vinculo institucional
-> emite identificadores QR/BLE/NFC
-> revoga identificadores ativos
-> APIs registram auditoria e protegem acoes sensiveis
```

Arquivos principais:

- `src/app/admin/page.tsx`
- `src/features/admin-dashboard/admin-dashboard.tsx`
- `src/app/api/admin/institutions/route.ts`
- `src/app/api/admin/children/route.ts`
- `src/app/api/admin/identifiers/route.ts`
- `src/app/api/admin/identifiers/[publicToken]/revoke/route.ts`

---

## Arquitetura

### Visao em camadas

```mermaid
flowchart TB
  UI["Next.js App Router / React UI"]
  Components["Components: shadcn/ui, telas, forms, GSAP"]
  API["Route Handlers /api"]
  Auth["Sessao demo, suporte JWT e perfil"]
  Services["Services: events, blockchain, institutions, notifications"]
  DB["PostgreSQL + Prisma"]
  Chain["Solana Devnet"]
  External["SMTP / Telegram / Google / SEO"]

  UI --> Components
  Components --> API
  API --> Auth
  API --> Services
  Services --> DB
  Services --> Chain
  Services --> External
```

### Stack principal

| Camada       | Tecnologia                                                                  |
| ------------ | --------------------------------------------------------------------------- |
| Framework    | Next.js 16 App Router                                                       |
| UI           | React 19, Tailwind CSS 4, shadcn/ui, Base UI, HeroUI styles                 |
| Animacao     | GSAP, View Transitions, accordion CSS animation                             |
| Linguagem    | TypeScript                                                                  |
| ORM          | Prisma 7                                                                    |
| Banco        | PostgreSQL via `@prisma/adapter-pg`                                         |
| Auth         | Sessao demo por cookie; JWT de suporte em APIs, nao como fluxo final do MVP |
| Validacao    | Zod                                                                         |
| Blockchain   | Solana Devnet, `@solana/web3.js`, `@solana/spl-memo`                        |
| Notificacoes | Interfaces da demo, browser, Telegram opcional, SMTP opcional               |
| SEO/PWA      | Metadata API, Open Graph Image, robots, sitemap, manifest, JSON-LD          |

### Estrutura de pastas

```text
src/app/                         Rotas, paginas, APIs, metadata, robots, sitemap, manifest
src/components/shared/           Navegacao, logo, animacoes e visual da rede
src/components/ui/               Componentes shadcn/ui locais
src/features/admin-dashboard/    Interface administrativa
src/features/auth/               Login demo, JWT de suporte e configuracao de auth
src/features/blockchain/         Hash, submissao e verificacao Solana
src/features/events/             Criacao/listagem de eventos e fallback blockchain
src/features/guardian-dashboard/ Tela demonstrativa do responsavel
src/features/institutions/       Service de instituicoes
src/features/protection-network/ Visualizacao demonstrativa da rede de protecao
src/features/public-help/        Formulario publico do QR
src/features/school-dashboard/   Tela demonstrativa da escola
src/features/transport-dashboard/Tela demonstrativa do transporte
src/lib/                         Prisma, sessao, notificacoes, auth fetch, tempo, utils
src/types/                       Contratos das interfaces
prisma/                          Schema, migration e seed de demonstracao
scripts/                         Setup Solana e retry de eventos PENDING
public/                          Logo e icones PWA
```

---

## Banco de dados

O modelo foi desenhado para separar identidade, relacoes, eventos, alertas, notificacoes, auditoria e prova blockchain.

Entidades centrais:

| Modelo                   | Responsabilidade                                                          |
| ------------------------ | ------------------------------------------------------------------------- |
| `User`                   | Usuarios internos: admin, responsavel, escola, transporte, agente publico |
| `Guardian`               | Perfil responsavel por criancas                                           |
| `Child`                  | Crianca protegida com `publicId` separado de dados pessoais               |
| `ChildGuardian`          | Vinculo entre crianca e responsavel                                       |
| `Institution`            | Escola, transporte, CRAS, UBS, ONG, ponto parceiro, orgao de protecao     |
| `InstitutionMember`      | Usuario vinculado a instituicao                                           |
| `ChildInstitution`       | Matricula/vinculo da crianca com instituicao                              |
| `ChildIdentifier`        | QR, BLE ou NFC da crianca                                                 |
| `GatewayIdentifier`      | Gateway/leitor institucional                                              |
| `TransportRoute`         | Rota de transporte escolar                                                |
| `ProtectionEvent`        | Evento pontual de protecao                                                |
| `Alert`                  | Alerta acionavel derivado de evento                                       |
| `Notification`           | Registro de entrega/falha de notificacao                                  |
| `NotificationPreference` | Preferencias do responsavel                                               |
| `BlockchainRecord`       | Hash, tx, slot e status da prova blockchain                               |
| `AuditLog`               | Auditoria de acoes sensiveis                                              |

---

## APIs principais

### Publicas ou semi-publicas

| Metodo | Rota                               | Finalidade                               |
| ------ | ---------------------------------- | ---------------------------------------- |
| `POST` | `/api/public/help`                 | Registrar pedido publico de ajuda via QR |
| `GET`  | `/api/institutions`                | Listar instituicoes com filtros          |
| `GET`  | `/api/health/database`             | Health check do banco                    |
| `GET`  | `/api/events`                      | Listar eventos com filtros               |
| `GET`  | `/api/events/[id]`                 | Detalhar evento                          |
| `GET`  | `/api/blockchain/status/[eventId]` | Consultar registro blockchain salvo      |
| `GET`  | `/api/blockchain/verify/[eventId]` | Verificar hash e transacao on-chain      |
| `GET`  | `/api/blockchain/balance`          | Consultar saldo da wallet configurada    |

### Autenticadas por perfil de demo/JWT de suporte

| Metodo  | Rota                                          | Perfil esperado        |
| ------- | --------------------------------------------- | ---------------------- |
| `POST`  | `/api/auth/login`                             | Login por email/senha  |
| `POST`  | `/api/auth/demo-login`                        | Sessao demo por perfil |
| `POST`  | `/api/auth/logout`                            | Encerrar sessao        |
| `POST`  | `/api/admin/institutions`                     | Admin                  |
| `POST`  | `/api/admin/children`                         | Admin                  |
| `POST`  | `/api/admin/identifiers`                      | Admin                  |
| `PATCH` | `/api/admin/identifiers/[publicToken]/revoke` | Admin                  |
| `POST`  | `/api/institution/ble/detect`                 | Escola/Admin           |
| `POST`  | `/api/institution/ble/reset`                  | Escola/Admin           |
| `POST`  | `/api/transport/events`                       | Transporte/Admin       |
| `PATCH` | `/api/guardian/alerts/[publicId]/acknowledge` | Responsavel/Admin      |
| `PATCH` | `/api/guardian/alerts/[publicId]/resolve`     | Responsavel/Admin      |

### Administrativas de blockchain

Essas rotas nao usam o JWT comum de suporte. Elas exigem header:

```http
x-blockchain-admin-secret: <BLOCKCHAIN_ADMIN_SECRET>
```

| Metodo | Rota                        | Finalidade                                      |
| ------ | --------------------------- | ----------------------------------------------- |
| `POST` | `/api/blockchain/submit`    | Submeter um evento especifico para Solana       |
| `POST` | `/api/blockchain/retry`     | Retentar todos os eventos `PENDING`             |
| `POST` | `/api/blockchain/reconcile` | Alinhar eventos confirmados com status validado |
| `POST` | `/api/blockchain/faucet`    | Solicitar SOL devnet para public key valida     |
| `POST` | `/api/blockchain/wallet`    | Desativado por seguranca; retorna `410`         |

---

## Seguranca e privacidade

O Caminho Seguro foi implementado com controles coerentes com o dominio sensivel do produto.

| Controle                      | Implementacao                                                               |
| ----------------------------- | --------------------------------------------------------------------------- |
| QR sem dados pessoais         | Token opaco em `ChildIdentifier.publicToken`                                |
| Pagina publica limitada       | `/ajuda/[token]` nao revela nome, telefone, escola, endereco ou responsavel |
| Eventos pontuais              | `ProtectionEvent` registra ocorrencias, nao rastreamento continuo           |
| Localizacao opcional          | A localizacao do QR vem do aparelho de quem reporta, se autorizada          |
| Perfis separados              | Responsavel, escola, transporte, rede e admin                               |
| Auditoria                     | `AuditLog` para criacao, revogacao e acoes sensiveis                        |
| Identificadores revogaveis    | `IdentifierStatus.REVOKED` bloqueia uso futuro                              |
| Blockchain sem dados pessoais | Hash on-chain, nao payload sensivel                                         |
| Secret admin blockchain       | `BLOCKCHAIN_ADMIN_SECRET` em rotas sensiveis                                |
| JWT de suporte em producao    | `JWT_SECRET` obrigatorio quando `VERCEL_ENV=production`                     |
| Wallet privada protegida      | Criacao via script local, nao via API publica                               |

---

## Blockchain: o que foi feito

A integracao blockchain foi implementada para provar que um evento existia e tinha um conteudo canonico no momento da submissao, sem publicar dados pessoais.

### Como funciona

```text
ProtectionEvent + Child.publicId
-> payload canonico
-> SHA-256 eventHash
-> Memo Program na Solana Devnet
-> transactionHash + slot
-> BlockchainRecord no PostgreSQL
-> verificacao posterior recalcula hash e busca transacao
```

### Arquivos envolvidos

- `src/features/blockchain/blockchain.service.ts`
- `src/features/blockchain/blockchain.config.ts`
- `src/features/blockchain/blockchain.types.ts`
- `src/app/api/blockchain/submit/route.ts`
- `src/app/api/blockchain/verify/[eventId]/route.ts`
- `src/app/api/blockchain/status/[eventId]/route.ts`
- `src/app/api/blockchain/retry/route.ts`
- `src/app/api/blockchain/reconcile/route.ts`
- `scripts/setup-solana.ts`
- `scripts/retry-pending.ts`

### O que significa "subir na blockchain" neste MVP

- A aplicacao assina uma transacao Solana com a wallet configurada.
- A transacao carrega um memo `guardian-network:<eventHash>`.
- O banco registra `transactionHash`, `slot`, `status`, `submittedAt` e `confirmedAt`.
- A verificacao recalcula o hash e consulta a transacao na rede.

### O que nao foi feito

- Nao ha smart contract proprio escrito/deployado neste repositorio.
- Nao ha programa Solana customizado com estado proprio.
- Nao ha uso de dados pessoais on-chain.

Essa escolha e adequada para o MVP: reduz custo, reduz superficie de risco e entrega prova publica de integridade sem expor criancas.

---

## SEO, PWA e marca

A camada publica foi preparada para parecer e operar como produto real.

| Item                  | Arquivo                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Dominio proprio       | `src/app/layout.tsx` usa `https://caminho-seguro.rcg-tech.com.br`                                |
| Metadata SEO          | `src/app/layout.tsx`                                                                             |
| Open Graph/Twitter    | `src/app/layout.tsx`                                                                             |
| Google Search Console | `metadata.verification.google`                                                                   |
| Schema.org JSON-LD    | Script `schema-org` em `src/app/layout.tsx`                                                      |
| Robots                | `src/app/robots.ts`                                                                              |
| Sitemap               | `src/app/sitemap.ts`                                                                             |
| PWA Manifest          | `src/app/manifest.ts`                                                                            |
| Open Graph Image      | `src/app/opengraph-image.tsx`                                                                    |
| Logo e icones         | `public/CaminhoSeguroLogo.png`, `public/icon-192.png`, `public/icon-512.png`, `src/app/icon.png` |

`robots.txt` permite a area publica e bloqueia rotas sensiveis como `/admin`, `/api`, `/responsavel`, `/escola`, `/transporte`, `/rede`, `/login` e `/ajuda/`.

---

## Planos de futuro

A home do produto apresenta cinco evolucoes priorizadas:

1. **IA para prevencao de riscos**
   - Detectar anomalias em eventos anonimizados.
   - Apoiar decisao humana sem substituir responsaveis e gestores.

2. **Mapa inteligente da rede**
   - Evoluir o mapa para heatmaps, cobertura por bairro, lacunas de atendimento e sugestoes de expansao.

3. **Pontos seguros certificados**
   - Criar rede de parceiros treinados com protocolo, cadastro, responsavel validado e selo Caminho Seguro.

4. **API publica para integracoes**
   - Abrir integracao segura para escolas, transporte, assistencia social e sistemas municipais.

5. **Integracao com wearables**
   - Ampliar identificacao fisica com pulseiras, crachas, relogios, mochilas inteligentes, BLE, NFC ou UWB.

---

## Como rodar localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variaveis de ambiente

Crie `.env.local` com uma conexao PostgreSQL:

```bash
POSTGRES_PRISMA_URL="postgresql://usuario:senha@host:5432/database"
JWT_SECRET="troque-este-segredo"
BLOCKCHAIN_IDENTITY_SALT="salt-local-para-hash-de-atores"
BLOCKCHAIN_ADMIN_SECRET="segredo-admin-blockchain"
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_NETWORK="solana-devnet"
SOLANA_PRIVATE_KEY="private-key-base58-gerada-pelo-script"
```

Variaveis opcionais:

```bash
SMTP_HOST="smtp.exemplo.com"
SMTP_PORT="587"
SMTP_USER="usuario"
SMTP_PASS="senha"
SMTP_FROM="alertas@exemplo.com"
GOVERNMENT_ALERT_EMAILS="orgao1@exemplo.com,orgao2@exemplo.com"
TELEGRAM_BOT_TOKEN="token"
TELEGRAM_ALERT_CHAT_ID="chat-id"
```

### 3. Gerar wallet Solana devnet

```bash
npm run setup:solana
```

O script cria uma wallet, grava `SOLANA_PRIVATE_KEY` no `.env.local` e pode solicitar airdrop na Devnet.

### 4. Rodar banco e seed

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Iniciar aplicacao

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
```

---

## Perfis de demonstracao

O seed cria dados ficticios para uma demonstracao ponta a ponta.

| Perfil           | Email                                    | Senha    | Rota           |
| ---------------- | ---------------------------------------- | -------- | -------------- |
| Responsavel      | `ana.responsavel@caminhoseguro.demo`     | `123456` | `/responsavel` |
| Escola           | `operador.escola@caminhoseguro.demo`     | `123456` | `/escola`      |
| Transporte       | `operador.transporte@caminhoseguro.demo` | `123456` | `/transporte`  |
| Rede de protecao | `rede.protecao@caminhoseguro.demo`       | `123456` | `/rede`        |
| Admin            | `admin@caminhoseguro.demo`               | `123456` | `/admin`       |

A rota `/login` tambem oferece selecao de perfis de demonstracao.

---

## Comandos uteis

| Comando                | Uso                                             |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Inicia ambiente local                           |
| `npm run build`        | Gera Prisma Client e build de producao          |
| `npm run start`        | Sobe build de producao                          |
| `npm run lint`         | Executa ESLint                                  |
| `npm run typecheck`    | Executa TypeScript sem emitir arquivos          |
| `npm run format`       | Formata com Prettier                            |
| `npm run format:check` | Verifica formatacao                             |
| `npm run setup:solana` | Cria wallet Solana Devnet                       |
| `npm run retry`        | Reprocessa eventos blockchain pendentes uma vez |
| `npm run retry:watch`  | Reprocessa eventos pendentes a cada 5 minutos   |

---

## Validacao executada

Durante a evolucao recente do projeto, os seguintes comandos foram executados com sucesso:

```bash
npm run typecheck
npm run lint
npm run build
```

Resultado confirmado:

- TypeScript passou sem erros.
- ESLint passou sem erros.
- Build Next.js 16 compilou e gerou as rotas.
- Prisma Client foi gerado durante o build.
- `git diff --check` passou na validacao anterior.

Observacao: nao existe script `npm test` configurado no `package.json`; portanto, nao ha suite automatizada de testes unitarios/e2e registrada no projeto neste momento. A validacao atual e composta por typecheck, lint, build e verificacoes manuais/funcionais do fluxo.

Aviso conhecido do build:

```text
The "middleware" file convention is deprecated. Please use "proxy" instead.
```

Esse aviso vem do Next.js 16 e indica uma evolucao futura recomendada: migrar `src/middleware.ts` para a convencao `proxy`.

---

## Por que esse produto e diferente

O Caminho Seguro nao tenta competir com rastreadores GPS. Ele ocupa outro espaco: **infraestrutura de confianca para redes de protecao infantil**.

A diferenca esta no limite tecnico e etico:

- protege sem expor;
- registra eventos sem vigiar continuamente;
- permite ajuda comunitaria sem revelar dados da crianca;
- permite auditoria sem publicar informacao sensivel;
- conecta atores que hoje trabalham isolados;
- prepara evolucao para IA, GIS, parceiros certificados, APIs e wearables.

Para uma empresa, isso significa um produto com narrativa forte, base tecnica real e caminho claro de comercializacao.

---
