import 'dotenv/config'
import express from 'express'

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(express.json())
app.get('/health', (_request, response) =>
  response.json({
    service: 'auth-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  }),
)
app.post('/login', (_request, response) =>
  response
    .status(501)
    .json({ message: 'Login has not been implemented yet' }),
)
app.listen(port, () => console.log(`Auth Service: http://localhost:${port}`))
