import express from 'express'

const app = express()
app.use(express.json())

app.get('/health/live', (req, res) => {
  res.status(200).json({
    service: 'user-service',
    status: 'UP',
  })
})

// app.get('health/ready', async (req, res) => {
//   const databaseReady = await checkDatabaseConnection()
//   res.status(databaseReady ? 200 : 503).json({
//     status: databaseReady ? 'ready' : 'not_ready',
//   })
// })
export default app
