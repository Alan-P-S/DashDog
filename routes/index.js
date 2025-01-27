const express = require('express');
const session = require('express-session')
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');



router.get('/',(req,res)=>{
    res.render('signup');
});

router.get('/signup',(req,res)=>{
    res.render('signup');
});

router.get('/login',(req,res)=>{
    res.render('login');
});

router.get('/store',(req,res)=>{
    res.render('store');
})

router.get('/inventory',(req,res)=>{
    res.render('inventory');
})

router.post('/submit-score', async (req, res) => {
    try {
        const { score } = req.body;
        const { username } = req.session.user;

        if (!username || typeof score !== 'number' || score < 0) {
            return res.status(400).send('Invalid input');
        }

        const [results] = await db.promise().query('SELECT * FROM gameinfo WHERE username = ?', [username]);

        if (results.length > 0) {
            await db.promise().query('UPDATE gameinfo SET score=score+? WHERE username=?', [score, username]);
            console.log('Score updated');
        } else {
            await db.promise().query('INSERT INTO gameinfo (username, score) VALUES (?, ?)', [username, score]);
            console.log('Score inserted');
        }

        if (score > 50) {
            await db.promise().query('UPDATE gameinfo SET win = win + 1 WHERE username = ?', [username]);
            console.log('Win updated');
        }
        if (score < 50) {
            await db.promise().query('UPDATE gameinfo SET lose = lose + 1 WHERE username = ?', [username]);
            console.log('lose updated');
        }

        res.status(200).send('Score processed successfully');
    } catch (err) {
        console.error('Error processing score:', err);
        res.status(500).send('Server error');
    }
});

router.get('/livescore',(req,res)=>{
    res.render('scoredisplay');
});

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'alanps3699@gmail.com',
        pass: 'aoiajsfvmqfuyctr' // Generated app password
    }
});

router.post('/signup', async (req, res) => {
    const { email } = req.body;

    // Check if the email exists in the database
<<<<<<< HEAD
     db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err){
            console.log(err);
            return res.status(500).send('Database error');
        } 
=======
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Database error');
        }
>>>>>>> 4ebfbe5d0f9e7333e6ba94fa8ba8d3628dacd5ff
        if (results.length > 0) {
            //email already exist
            return res.redirect('error1');
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        // Save OTP and expiry time in the database
        db.query('INSERT INTO users (email, otp, otp_expiry) VALUES (?, ?, ?)',
            [email, otp, otpExpiry],(err) => { 
                
                if (err) return res.status(500).send(err);
                // Send OTP via email
                const mailOptions = {
                    from: 'alanps',
                    to: email,
                    subject: 'Your OTP for Signup',
                    text: `Your OTP is: ${otp}`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return res.status(500).send('Error sending OTP');
                    }

                    // Redirect to OTP verification page
                    res.redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
                });
            }
        );
    });
    
});

router.get('/verify-otp', (req, res) => {
    const { email } = req.query; // Get email from query string
    if (!email) {
        return res.status(400).send('Email is required for OTP verification');
    }

    // Render OTP form, passing the email to the template for future use
    res.render('otp-form', { email }); // In case you're using a templating engine like EJS
});


router.post('/verify-otp', async (req, res) => {
    const { email, otp, username, password } = req.body;

    // Check if the email exists and the OTP is valid
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).send('Database error');
        
        if (results.length === 0) {
            return res.status(400).send('Email not found');
        }

        const user = results[0];

        // Validate OTP and its expiration
        if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
            return res.redirect('error1');;
        }

        // Hash the password
        try {
            const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
            // Update username and hashed password for the email
            db.query(
                'UPDATE users SET username = ?, password = ?, otp = NULL, otp_expiry = NULL WHERE email = ?',
                [username, hashedPassword, email],
                (err) => {
                    if (err) return res.status(500).send('Error saving user data');
                    res.redirect('regsucess');
                }
            );
        } catch (hashError) {
            console.error('Error hashing password:', hashError);
            res.status(500).send('Error processing password');
        }
    });
});

/*
router.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Check if username already exists
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Error checking for existing user:', err);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            return res.send('Username already exists');
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Insert the new user into the database
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).send('Server error');
            }

            res.send('User registered successfully');
        });
    });
});
*/
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists in the database
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.log('Error during login query:', err);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            const user = results[0];
            
            // Compare the provided password with the hashed password in the database
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).send('Server error');
                }

                if (isMatch) {
                    // Store user info in session
                    
                    req.session.user = user;
                    return res.redirect('/dashboard');
                } else {
                    return res.redirect('/error1');
                }
            });
        } else {

            return res.redirect('/error1');
        }
    });
});

router.get('/error1',(req,res)=>{
    res.render('error1');
})

router.get('/regsucess',(req,res)=>{
    res.render('regsucess');
})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error during logout');
        }
        res.redirect('/login');
    });
});

router.get('/leaderboard', (req, res) => {
    const query = 'SELECT id, username, score, win, lose FROM gameinfo ORDER BY score DESC';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results); // Send data as JSON to the frontend
    });
});

router.get('/rank',(req,res)=>{
    res.render('leaderboard');
})

router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
   
    res.render('dashboard', { user: req.session.user });
});




router.get('/index', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('index', { user: req.session.user });
});


module.exports = router;
