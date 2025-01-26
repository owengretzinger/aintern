# Explicitly use amd64 platform
FROM --platform=linux/amd64 node:18

# Install unzip and ffmpeg
RUN apt-get update && apt-get install -y unzip ffmpeg

WORKDIR /app

# Copy package files and scripts first
COPY package*.json ./
COPY scripts ./scripts

# Install dependencies
RUN npm install

# Copy source files
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Create temp directory
RUN mkdir -p temp

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV TYPE=module

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]