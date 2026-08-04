import mysql from 'mysql2/promise';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || '63.141.255.202',
      port: parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_NAME || 'hlumisapropertiesdb',
      user: process.env.DB_USER || 'zola',
      password: process.env.DB_PASSWORD || 'Zola123!',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async getConnection() {
    return await this.pool.getConnection();
  }

  async query(sql: string, params?: any[]) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }

  async close() {
    await this.pool.end();
  }
}