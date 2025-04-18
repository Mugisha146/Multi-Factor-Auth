import app from './index'
import dotenv from 'dotenv'
import sequelize from './database'

dotenv.config()

const PORT = process.env.PORT || 5000


const startServer = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })
    console.log('Database connected and synchronized')

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

startServer()