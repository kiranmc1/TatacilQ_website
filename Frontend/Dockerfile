From node:22

WORKDIR /Frontend

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g serve

EXPOSE 5173

CMD ["serve","-s","build","-l","5173"]

