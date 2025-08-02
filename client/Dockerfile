# Stage 1: Build the React app
FROM node:23 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build && ls -l dist

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Remove default Nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy React build to Nginx web directory
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
