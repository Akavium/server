FROM node:18-alpine
WORKDIR /app
COPY package*.json /app/

RUN echo \
    && npm install \
    && rm -f .npmrc
COPY ./ /app/
RUN npm run build
CMD ["npm", "run", "start"]