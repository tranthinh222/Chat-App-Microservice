import pg from 'pg'
import Pool from 'pg'
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL error:', error)
})

// export async function (){
//     const client = await pool.connect();
//     try {
//         await client.query('Select 1')
//     } catch {

//     }
// }
