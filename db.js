const { Pool } = require('pg');

// Apne database ki details yahan likhein
const pool = new Pool({
  user: 'postgres',         // Default user yahan 'postgres' hi hota hai
  host: 'localhost',
  database: 'postgres',     // Agar aap ne database ka naam badla tha toh wo likhein
  password: '81961', // Jo password aap ne install karte waqt rakha tha
  port: 5432,
});

module.exports = pool;