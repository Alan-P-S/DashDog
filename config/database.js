const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'bzkd1sqpm1dxwpmqz4jw-mysql.services.clever-cloud.com',       // Clever Cloud MySQL host
    user: process.env.DB_USER || 'uba35zmofo1pfxkc',       // Clever Cloud MySQL user
    password: process.env.DB_PASSWORD || 'bcGMzeIOLfNErJYDDd8F', // Password from Clever Cloud
    database: process.env.DB_NAME || 'bzkd1sqpm1dxwpmqz4jw',   // Database name
    waitForConnections: true,        // Wait if all connections are busy
    connectionLimit: 10,             // Maximum number of connections in the pool
    queueLimit: 0,                   // No limit to request queue
  });

module.exports = pool;