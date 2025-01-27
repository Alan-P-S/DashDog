const express = require('express');
const path = require('path');
const http = require('http')
const routes = require('./routes');
const { Server } =  require('socket.io')
const session = require('express-session')
const db = require('./config/database');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const flash = require('connect-flash');

// Middleware to handle flash messages


// Middleware to make flash messages available globally in templates


app.use(
    session({
        secret: 'your-secret-key', // A strong secret key
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false } // Set to true for HTTPS
    })
);

// Automatic cleanup of expired OTPs every minute
setInterval(() => {
    const currentTime = new Date();
    
    db.query('DELETE FROM users WHERE otp_expiry < ?', [currentTime], (err) => {
        if (err) {
            console.error('Error cleaning up expired OTPs:', err);
        } else {
            console.log('Expired OTPs deleted successfully');
        }
    });
}, 1800 * 1000);  // Runs every minute (adjust interval as needed)

//handle connections

io.on('connection',(socket)=>{
    console.log("A user is connected: ",socket.id);

    socket.on('scoreUpdate',(score)=>{
        io.emit('updateScore', score);
    });

    socket.on('disconnect',()=>{
        console.log("A user is disconnected",socket.id);
    });
});



// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (JavaScript, CSS, images) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the main route to render the game
app.use('/', routes);



/*app.post('/submit-score', (req, res) => {
    const { score } = req.body;
    console.log('Received score from client:', score);

    // Example: Save the score to a database or perform logic
    // For now, just send a response back to the client
    res.json({ status: 'success', receivedScore: score });
});*/

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

