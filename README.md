# local-chat
A minimal chat application built using React, Express, and PostgreSQL.

## Installation

### Clone The Project
1. `git clone https://github.com/sarthakgaur/local-chat`

### Database Setup
1. Install PostgreSQL
2. Start the PostgreSQL server
3. Execute all the SQL commands in `local-chat/backend/db/database.sql`

### Backend Setup
1. `cd local-chat/backend`
2. `npm install`
3. `touch .env`
4. Enter the following content in the `.env` file:

        DB_USER=user
        DB_PASSWORD=password
        DB_HOST=localhost
        DB_PORT=5432
        DB_DATABASE=local_chat

### Frontend Setup
1. `cd local-chat/frontend`
2. `npm install`

### Running in Development Mode
1. `cd local-chat/backend`
2. `node app.js`
3. `cd local-chat/frontend`
4. `REACT_APP_SERVER_URL=http://localhost:3001 npm start`
5. Open `localhost:3000` in your browser

### Running in Production Mode
1. `cd local-chat/frontend`
2. `npm run build`
3. `mv build ../backend`
4. `cd local-chat/backend`
5. `node app.js`
6. Open `localhost:3001` in your browser

## Features
1. Chat with multiple people.
2. Share any type of file with the group.
3. Shared images will be displayed within the client.
4. Uploaded files are stored on the server and can be accessed any time.
5. URLs contained in the message body are converted into links.
6. Shows the list of people who are currently using the application.
7. Users can choose their username.

## Image
![Screen Shot](/backend/public/images/client.png)
