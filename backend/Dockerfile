# Dockerfile for Strapi
FROM node:18-alpine3.18

# Installing libvips-dev for sharp compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git

# Set environment variable for Node environment
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /opt/
# Copy package.json and package-lock.json
COPY package.json package-lock.json ./
# Install node-gyp globally and install dependencies
RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install

# Update PATH to include local node_modules
ENV PATH=/opt/node_modules/.bin:$PATH

# Set working directory for the app
WORKDIR /opt/app
# Copy the rest of the application code
COPY . .  
# Switch to non-root user
USER node
# Expose the application port
EXPOSE 1337
# Start the application
CMD ["npm", "run", "develop"]
