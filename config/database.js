const mysql = require("mysql2");
const db = mysql.createConnection({
    host: 'bzkd1sqpm1dxwpmqz4jw-mysql.services.clever-cloud.com',
    user:'uba35zmofo1pfxkc',
    password: 'bcGMzeIOLfNErJYDDd8F',
    database: 'bzkd1sqpm1dxwpmqz4jw'
});
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});

module.exports = db;