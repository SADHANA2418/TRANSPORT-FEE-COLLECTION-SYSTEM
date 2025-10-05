# Use node image
FROM node:20

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Run the app
CMD ["node", "src/server.js"]
