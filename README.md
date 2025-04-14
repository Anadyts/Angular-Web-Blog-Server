# Blog API Backend

## Overview

This is a backend API built with Express.js for managing blog-related operations such as user authentication, blog creation, comments, likes, and article retrieval. It uses secure password hashing with Argon2, JWT for authentication, and PostgreSQL as the database. The API is designed to be scalable, secure, and easy to integrate with frontend applications.

## Technologies Used

### Programming Languages
- **JavaScript**: Used for server-side logic with Node.js.

### Frameworks & Libraries
- **Express.js**: Web framework for building the RESTful API.
- **Node.js**: Runtime environment for executing JavaScript on the server.
- **Argon2**: Library for secure password hashing to protect user passwords.
- **JWT (JSON Web Tokens)**: Used for authentication and authorization.
- **Cors**: Middleware to enable Cross-Origin Resource Sharing for API requests.

### Databases
- **PostgreSQL**: Relational database for storing users, articles, comments, and likes.

### Tools & Technologies
- **Dotenv**: For managing environment variables securely.
- **pg (Node.js PostgreSQL driver)**: For connecting to and querying the PostgreSQL database.

## Features

- **User Authentication**:
  - Register new users with unique usernames and securely hashed passwords.
  - Login with JWT token generation for authenticated sessions.

- **Blog Management**:
  - Create new blog articles.
  - Retrieve articles (all or by user/author).
  - Search articles by title.

- **Comments System**:
  - Add new comments to articles.
  - Retrieve comments with pagination and user information.

- **Likes System**:
  - Like and unlike articles.
  - Check if a user has liked an article.

- **API Security**:
  - Passwords are hashed using Argon2.
  - JWT-based authentication for protected routes.

## Installation

### Prerequisites
- Node.js (v14 or later)
- PostgreSQL (set up with a database named `your_database`)
- npm or yarn

### Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   JWT_SECRET_KEY=your-secure-jwt-secret-key
   DATABASE_URL=postgres://your_user:your_password@localhost:5432/your_database
   ```

4. **Initialize the database**:
   Ensure your PostgreSQL database is running and create the necessary tables. You can use the following SQL to set up the schema (adjust as needed):

   ```sql
   CREATE TABLE users (
       user_id SERIAL PRIMARY KEY,
       username VARCHAR(255) UNIQUE NOT NULL,
       password TEXT NOT NULL,
       create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE articles (
       article_id SERIAL PRIMARY KEY,
       title TEXT NOT NULL,
       content TEXT NOT NULL,
       author_id INTEGER REFERENCES users(user_id),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE comments (
       comment_id SERIAL PRIMARY KEY,
       content TEXT NOT NULL,
       user_id INTEGER REFERENCES users(user_id),
       article_id INTEGER REFERENCES articles(article_id),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE article_likes (
       user_id INTEGER REFERENCES users(user_id),
       article_id INTEGER REFERENCES articles(article_id),
       PRIMARY KEY (user_id, article_id)
   );
   ```

5. **Run the server**:
   ```bash
   npm start
   ```

   The server will start on the port specified in your `.env` file 

## API Endpoints

| Method | Endpoint           | Description                          |
|--------|--------------------|--------------------------------------|
| POST   | `/api/register`    | Register a new user.                |
| POST   | `/api/login`       | Login and get a JWT token.          |
| POST   | `/api/auth`        | Verify JWT token.                   |
| POST   | `/api/create-blog` | Create a new blog article.          |
| GET    | `/api/blog`        | Get all blogs with optional search. |
| POST   | `/api/article`     | Get a specific article by ID.       |
| GET    | `/api/comment`     | Get comments for an article.        |
| POST   | `/api/new-comment` | Add a new comment to an article.    |
| GET    | `/api/like`        | Check if a user liked an article.   |
| POST   | `/api/like`        | Like an article.                    |
| DELETE | `/api/unlike`      | Unlike an article.                  |
| GET    | `/api/article`     | Get articles by user/author.        |



