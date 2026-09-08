# ─── Stage 1: Build do Frontend ──────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copia manifests e instala dependências
COPY package*.json ./
RUN npm ci

# Copia o restante do código e gera o build de produção
COPY . .
RUN npm run build

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Instala apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o servidor Express
COPY server/ ./server/

# Copia o build do frontend (será servido pelo Express em produção)
COPY --from=builder /app/dist ./dist

# Diretório persistente para o banco SQLite
RUN mkdir -p /app/data

# Variáveis de ambiente com valores padrão
ENV PORT=3001
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/wedding.db

EXPOSE 3001

CMD ["node", "server/index.js"]
