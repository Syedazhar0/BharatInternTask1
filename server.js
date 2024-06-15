const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config(); // load the evnvironment from the file .env

const app = express();
const port = process.env.PORT || 3000;

// creating connection with mysql database you can use mongodb currently it is not present in my machine 
// i dont have knowledge on mongodb so im using the mysql database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

//check the connection 
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});

app.use(bodyParser.urlencoded({ extended: true }));

// used for root dyrectory at server side like static pages html css etc...............
app.use(express.static(__dirname));

// provide the routing url which you want to display when the nodejs server start html page will be displayed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'BharatRegistrationsForm.html'));
});

//  CSS file
app.get('/BharatIntern.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'BharatIntern.css'));
});

// to post the data to database
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    
    // check if the email already exists
    const CHECK_EMAIL_QUERY = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
    connection.query(CHECK_EMAIL_QUERY, [email], (error, results) => {
        if (error) {
            console.error('Error checking email uniqueness: ' + error.stack);
            return res.status(500).send('Error checking email uniqueness');
        }
        
        // the count value will be greater than 0 if the email already exist
        if (results[0].count > 0) {
            // send error response
            return res.status(400).send('Email already exists');
        } else {
            // email is unique proceed with user registration
            const INSERT_USER_QUERY = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            connection.query(INSERT_USER_QUERY, [username, email, password], (error, results) => {
                if (error) {
                    console.error('Error registering user: ' + error.stack);
                    return res.status(500).send('Error registering user');
                }
                console.log('User registered successfully');
                res.status(200).send('User registered successfully');
            });
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
