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
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log("Server is running on port", PORT)
})