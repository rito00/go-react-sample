const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: 'db',
  user: 'kabu',
  password: 'kabu',
  database: 'kabu_db'
});

app.get('/api/plants', (req, res) => {
  const sql = `
    SELECT p.plant_id, l.shelf, l.position, p.entry_date, ps.state_type
    FROM plants p
    JOIN locations l ON p.location_id = l.location_id
    LEFT JOIN plant_states ps ON p.plant_id = ps.plant_id
  `;
  
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(result);
    }
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
