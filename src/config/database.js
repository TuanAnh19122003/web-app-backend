const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,       // Tên database
    process.env.DB_USER,       // User
    process.env.DB_PASS,       // Password
    {
        host: process.env.DB_HOST,      // Host do Render cấp
        port: process.env.DB_PORT || 5432,  // Port PostgreSQL (mặc định 5432)
        dialect: 'postgres',
        logging: false,
        timezone: '+07:00',
        dialectOptions: {
            ssl: {
                require: true,               // Bắt buộc SSL trên Render
                rejectUnauthorized: false,   // Không kiểm tra chứng chỉ (Render dùng self-signed)
            },
        },
    }
);

module.exports = sequelize;
