FROM node:18

# Install unzip
RUN apt-get update && apt-get install -y unzip

WORKDIR /app
COPY . .

RUN npm install
CMD npm start 