import 'dotenv/config'
import express from 'express'

const app = express()
const port = Number(process.env.PORT) || 3002

app.use(express.json())
app.get('/health', (_request, response) =>
  response.json({
    service: 'place-service',
    status: 'ok',
    timestamp: new Date().toISOString(),
  }),
)
app.get('/', (_request, response) => response.json({ data: [] }))
app.listen(port, () => console.log(`Place Service: http://localhost:${port}`))
