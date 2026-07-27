# Caminho Seguro

MVP de uma rede comunitária de proteção infantil para hackathon. O produto registra eventos importantes de segurança, sem rastrear continuamente a criança.

A criança usa uma identificação física com QR Code e, no MVP, uma camada BLE simulada. Responsáveis, escola, transporte, rede de proteção e administração acessam painéis diferentes. O cidadão acessa apenas a página pública do QR, sem login e sem dados pessoais da criança.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL/Neon
- Zod
- Lucide React
- GSAP para animações de interface

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Configure `.env.local` com uma URL PostgreSQL compatível com Prisma:

```bash
POSTGRES_PRISMA_URL="postgresql://..."
```

3. Rode migration e seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

4. Inicie o servidor:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Rotas principais

- `/` - apresentação do produto e módulos.
- `/login` - seleção de perfil de demonstração.
- `/demo` - roteiro guiado para apresentação.
- `/responsavel` - painel do responsável.
- `/escola` - painel institucional da escola e simulação BLE.
- `/transporte` - embarque/desembarque assistido.
- `/rede` - coordenação da rede, mapa agregado e alertas autorizados.
- `/admin` - cadastro do piloto e gestão de identificadores.
- `/ajuda/demo` - redireciona para o QR fictício.
- `/ajuda/[token]` - página pública do QR.

## Perfis de demonstração

A autenticação real com Auth.js ainda não foi conectada. Para a banca, existe uma sessão demo por cookie em `/login`, com perfis separados:

- Responsável
- Escola
- Transporte
- Rede de proteção
- Admin

As áreas privadas e APIs sensíveis verificam esse perfil antes de permitir ações.

## Fluxos implementados

### QR público

`POST /api/public/help`

- Valida token QR ativo.
- Não exibe dados pessoais ao cidadão.
- Permite escolher situação de ajuda.
- Aceita localização opcional do aparelho de quem escaneia.
- Cria `ProtectionEvent` e `Alert` em transação.
- Cria registros de notificação para dashboard e navegador.

### Responsável

- Mostra status atual, histórico e alertas.
- Atualiza automaticamente com `router.refresh()`.
- Permite confirmar recebimento e resolver alerta.
- Pode ativar notificação local do navegador para novos alertas.

Endpoints:

- `PATCH /api/guardian/alerts/[publicId]/acknowledge`
- `PATCH /api/guardian/alerts/[publicId]/resolve`

### Escola

- Mostra crianças esperadas, detectadas, pendentes e alertas.
- Simula chegada BLE com evento real no banco.
- Cria auditoria e registro blockchain pendente.

Endpoints:

- `POST /api/institution/ble/detect`
- `POST /api/institution/ble/reset`

### Transporte

- Mostra criança vinculada à rota.
- Registra embarque e desembarque assistidos.
- Bloqueia repetição do mesmo tipo de evento no mesmo dia.

Endpoint:

- `POST /api/transport/events`

### Rede de proteção

- Lista instituições ativas.
- Mostra alertas autorizados.
- Mostra eventos recentes.
- Exibe mapa agregado com pontos de instituições e alertas com coordenada.
- Não exibe rota contínua nem localização em tempo real.

### Administração

- Cadastra instituição do piloto.
- Cadastra criança fictícia com responsável, vínculo institucional e identificador inicial.
- Emite identificador adicional para a criança principal da demo.
- Revoga identificadores ativos.

Endpoints:

- `POST /api/admin/institutions`
- `POST /api/admin/children`
- `POST /api/admin/identifiers`
- `PATCH /api/admin/identifiers/[publicToken]/revoke`

## Segurança e privacidade no MVP

- O QR usa token público opaco.
- A página pública não revela nome, endereço, telefone, escola ou responsável.
- Localização é opcional e vem do aparelho de quem registra o evento.
- Eventos são pontuais; o sistema não rastreia a criança continuamente.
- Ações sensíveis criam `AuditLog`.
- Identificadores podem ser revogados.

## Limites atuais

- Auth.js real ainda não está instalado/conectado; o MVP usa sessão demo por cookie.
- Solana real não está implementada nesta versão. O banco possui `BlockchainRecord` pendente para preservar o contrato de integração.
- E-mail e Telegram reais ainda dependem de credenciais/provedores externos. O MVP registra notificações no banco e demonstra notificação do navegador no painel do responsável.
- O mapa da rede é operacional e usa coordenadas do banco, mas ainda não usa MapLibre/mapcn.dev.
- Não há dados reais de crianças. Use apenas dados fictícios.

## Validação

Comandos usados para checar o projeto:

```bash
npm run lint
npm run typecheck
npm run build
```
