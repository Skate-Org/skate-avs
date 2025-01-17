FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# Copy both package.json and package-lock.json to leverage caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the necessary port
EXPOSE 4003

# Build the application and start it
RUN npm run build
CMD ["npm", "run", "start"]
