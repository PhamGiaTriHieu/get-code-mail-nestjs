# Use the official Node.js image as the base image
FROM node:18-alpine 

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install -g @nestjs/cli

RUN npm install

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