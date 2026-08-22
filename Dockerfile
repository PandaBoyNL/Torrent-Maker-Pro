# Gebruik de ultra-lichte Alpine Linux versie van Node.js
FROM node:18-alpine

# Maak de werkmap aan
WORKDIR /app

# Kopieer de pakketjeslijst en installeer de benodigdheden
COPY package.json ./
RUN npm install

# Kopieer de rest van je app
COPY . .

# Poort 8080 openzetten voor de browser interface
EXPOSE 8080

# Start de nieuwe, razendsnelle webserver
CMD ["node", "server.js"]