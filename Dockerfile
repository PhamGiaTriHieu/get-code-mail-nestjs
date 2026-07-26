# Use the official Node.js image as the base image
FROM node:18-alpine 

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Install dependencies with legacy peer deps flag to bypass peer conflict
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Check the contents of the dist directory
RUN ls -la dist || echo "dist directory not found"

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]