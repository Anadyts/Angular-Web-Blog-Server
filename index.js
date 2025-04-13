require('dotenv').config()
const express = require('express')
const cors = require('cors')
const {pool} = require('./pool')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())
app.use(cors())

const SECRET_KEY = process.env.JWT_SECRET_KEY

app.post('/api/login', async (req, res) => {
    const {username, password} = req.body
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);

    if(result.rows.length > 0){
        const user = result.rows[0]
        const token = jwt.sign({
            user_id: user.user_id,
            username: user.username,
        }, SECRET_KEY, {expiresIn: '1h'})

        if(user.password === password){
            res.status(200).json({
                username:user.username,
                user_id: user.user_id,
                token: token,
                message: 'Login Success'
            })
        }else{
            res.status(401).json({
                message: 'Login Failed'
            })
        }
    }else{
        res.status(401).json({
            message: 'Login Failed'
        })
    }
})

app.post('/api/auth', (req, res) => {
    const {token} = req.body
    if(token){
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if(err){
                res.status(401).json({
                    message: 'Unauthorized'
                })
            }else{
                res.status(200).json({
                    message: 'Authorized',
                    user: decoded
                })
            }
        })
    }
})

app.post('/api/create-blog', async (req, res) => {
    const {title, content, user_id} = req.body
    if(title.trim() && content.trim()){
        const query = "INSERT INTO articles(title, content, author_id) VALUES($1, $2, $3)"
        const values = [title, content, user_id]
        const result = await pool.query(query, values)

        if(result.rowCount > 0){
            res.status(201).json({
                message: 'Create Blog Success'
            })
        }else{
            console.log('Create Blog Failed')
            res.status(400).json({
                message: 'Create Blog Failed'
            })
        }
        
    }else{
        res.status(400).json({
            message: 'Create Blog Failed'
        })
    }
})

app.get('/api/blog', async (req, res) => {
    const limit = parseInt(req.query.limit) || 8
    const search = req.query.search || ''
    let query = ''
    let values = []
    if(search === ''){
        query = "SELECT * FROM articles ORDER BY created_at DESC LIMIT $1"
        values =  [limit]
    }else{
        query = "SELECT * FROM articles WHERE title ILIKE $1 ORDER BY created_at DESC"
        values = [`%${search}%`]
    }
    
    const result = await pool.query(query, values)
    if(result.rows.length > 0){
        const articles = result.rows
        res.status(200).json({
            message: 'Get Blog success',
            articles: articles
        })
    }else{res.status(401).json({
        message: 'Get Blog Failed'
    })
    }
})

app.post('/api/article', async (req, res) => {
    const {article_id} = req.body
    const query = "SELECT * FROM articles WHERE article_id = $1"
    const result = await pool.query(query, [article_id])

    if(result.rows.length !== 0){
        const article = result.rows[0]
        
        const queryUser = "SELECT * FROM users WHERE user_id = $1"
        const resultUser = await pool.query(queryUser, [article.author_id])
        if(resultUser.rows[0] !== 0){
            const user = resultUser.rows[0]

            res.status(200).json({
                message: 'Get Article success',
                article: article,
                author: user.username
            })
        }
        
        
    }else{
        res.status(400).json({
            message: 'Get Article failed',
        })
    }
})

app.get('/api/comment', async (req, res) => {
    const articleId = parseInt(req.query.article_id)
    const limit = parseInt(req.query.limit) || 5

    const query = `
        SELECT c.*, u.username 
        FROM comments c
        INNER JOIN users u ON c.user_id = u.user_id
        WHERE c.article_id = $1
        ORDER BY c.created_at ASC
        LIMIT $2 
    `

    try {
        const values = [articleId, limit]
        const result = await pool.query(query, values)

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM comments
            WHERE article_id = $1
        `
        const countResult = await pool.query(countQuery, [articleId])
        const totalComments = parseInt(countResult.rows[0].total)
        const totalPage = Math.ceil(totalComments / limit)

        res.status(200).json({
            comments: result.rows,
            totalPage
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    }
})

app.post('/api/new-comment', async (req, res) => {
    const { comment, user_id, article_id } = req.body;
    const insertQuery = `
        INSERT INTO comments(content, user_id, article_id)
        VALUES($1, $2, $3)
        RETURNING *
    `;
    const insertValues = [comment, user_id, article_id];

    try {
        const result = await pool.query(insertQuery, insertValues);

        if (result.rowCount > 0) {
            const newComment = result.rows[0];

            // ดึง username จาก users
            const userQuery = "SELECT username FROM users WHERE user_id = $1";
            const userResult = await pool.query(userQuery, [user_id]);
            const username = userResult.rows[0]?.username || 'Unknown';

            res.status(200).json({
                message: 'New comment success',
                comment: {
                    ...newComment,
                    username: username
                }
            });
        } else {
            res.status(400).json({
                message: 'New comment failed'
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log("Server is running on port", PORT)
})