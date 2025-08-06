# server/Dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ─── build TypeScript → dist/ ─────────────────────────
RUN npm run build          # <- compiles src to /app/dist

EXPOSE 3000
CMD ["npm", "start"]
