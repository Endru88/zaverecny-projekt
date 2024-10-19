# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /opt/app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the application port
EXPOSE 1337

# Start the application
CMD ["npm", "run", "develop"]
