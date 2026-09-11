FROM node:24-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=5180 DATA_DIR=/app/data
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && mkdir -p /app/data && chown node:node /app/data
COPY --chown=node:node src ./src
COPY --chown=node:node public ./public
USER node
EXPOSE 5180
CMD ["node", "src/server.js"]
