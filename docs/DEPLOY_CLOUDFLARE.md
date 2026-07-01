# Deploy — Cloudflare Pages

O app é estático (React + Vite, sem backend). Publicado no **Cloudflare Pages**.

- **Projeto:** `checklist-de-medicao`
- **URL de produção:** https://checklist-de-medicao.pages.dev
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 20 (ver `.nvmrc`)
- **Variáveis de ambiente (app):** nenhuma
- **Functions / D1 / KV / R2:** nenhum

O `public/_headers` define cabeçalhos de segurança (X-Frame-Options, nosniff,
Referrer-Policy, Permissions-Policy) e cache longo para os assets com hash.

## Opção A — Integração com Git (**ATIVA** desde 0.6.x)

A integração está conectada: **cada push na `main` publica automaticamente** e PRs
ganham preview deployments. Configuração no painel do Cloudflare Pages
(repositório `gpgamoeda/CHECKLIST-DE-MEDICAO`):

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Environment variable (build): `NODE_VERSION = 20`

A cada push na `main`, o Pages builda e publica automaticamente; PRs ganham
preview deployments.

## Opção B — Deploy manual via Wrangler (upload direto)

Requer um **API Token** do Cloudflare com permissão *Cloudflare Pages: Edit* e o
**Account ID**. **Nunca** comite o token — passe por variável de ambiente.

```bash
export CLOUDFLARE_API_TOKEN=***      # token com permissão Pages: Edit
export CLOUDFLARE_ACCOUNT_ID=***     # id da conta

npm run deploy   # = npm run build && wrangler pages deploy dist --project-name=checklist-de-medicao --branch=main
```

Primeira vez (criar o projeto), se ainda não existir:

```bash
npx wrangler pages project create checklist-de-medicao --production-branch=main
```

### Registro do deploy inicial (Sprint 0.5.0)

- Comando: `wrangler pages deploy dist --project-name=checklist-de-medicao --branch=main` (token via env).
- Resultado: `✨ Deployment complete!` — produção em https://checklist-de-medicao.pages.dev
- Smoke: HTTP 200, cabeçalhos do `_headers` aplicados, `#root` + bundle React servidos.

## Segurança

- Não comitar tokens/credenciais. Se um token for exposto, **rotacione-o** no
  painel do Cloudflare.
- Domínio customizado/DNS: configurar manualmente no painel, se desejado (fora do
  escopo desta etapa).
