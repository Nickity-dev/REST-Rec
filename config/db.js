const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'helpdesk_api',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function testConnection() {
  try {
    const connection = await Promise.race([
      pool.getConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao conectar no MySQL.')), 3000))
    ]);

    console.log('[DB] Conexão com MySQL estabelecida com sucesso.');
    connection.release();
    return true;
  } catch (error) {
    console.error('[DB] Erro ao conectar ao MySQL:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
