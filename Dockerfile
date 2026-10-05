# ==========================================
# Stage 1: Build Frontend (React + Vite)
# ==========================================
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build Backend (NestJS)
# ==========================================
FROM node:20-bookworm-slim AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
ENV YOUTUBE_DL_SKIP_DOWNLOAD=1
RUN npm ci

COPY backend/ ./
RUN npm run build

# ==========================================
# Stage 3: Production Runtime (All-in-One)
# ==========================================
FROM node:20-bookworm-slim AS runner

# Cài đặt ffmpeg, python3, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt binary yt-dlp mới nhất trực tiếp từ release chính thức
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Cài đặt production dependencies cho backend
COPY backend/package*.json ./
ENV YOUTUBE_DL_SKIP_DOWNLOAD=1
RUN npm ci --omit=dev

# Copy mã nguồn backend đã biên dịch
COPY --from=backend-builder /app/backend/dist ./dist

# Copy giao diện frontend đã biên dịch
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Cấu hình biến môi trường
ENV NODE_ENV=production
ENV PORT=3100
ENV YOUTUBE_DL_DIR=/usr/local/bin
ENV YOUTUBE_DL_FILENAME=yt-dlp
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV FRONTEND_PATH=/app/frontend/dist

EXPOSE 3100

CMD ["node", "dist/main.js"]
