import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const sequelize = new Sequelize(process.env.DB_URL as string, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // This will enforce SSL connection
      rejectUnauthorized: false // You can set this to true if you want to strictly validate the SSL certificate
    }
  },
  logging: false,
});

export default sequelize