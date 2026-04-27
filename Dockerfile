# Base image
FROM node:20-alpine AS development

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

ARG PORT=7777
ENV PORT=${PORT}

# Build the application
RUN npm run build


CMD ["npm", "run", "dev"]

# Production image
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=7777
ENV PORT=${PORT}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma ./prisma
COPY --from=development /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 7777

# Start the application
CMD ["node", "dist/main"]
