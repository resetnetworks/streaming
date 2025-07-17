# -------------------------------
# 1. Use a lightweight Node.js base image
# -------------------------------
FROM node:18-alpine

# -------------------------------
# 2. Set working directory inside container
# -------------------------------
WORKDIR /app

# -------------------------------
# 3. Copy only package.json & package-lock.json first (better caching)
# -------------------------------
COPY package*.json ./

# -------------------------------
# 4. Install dependencies
# -------------------------------
RUN npm install --production

# -------------------------------
# 5. Copy all other files
# -------------------------------
COPY . .

# -------------------------------
# 6. Expose the app port (adjust if your server runs on a different port)
# -------------------------------
EXPOSE 4000

# -------------------------------
# 7. Start the app
# -------------------------------
CMD ["npm", "start"]
