import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Configure your local MySQL Workbench connection credentials here
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',         // <-- Replace with your MySQL username if different
  password: 'SetPass@1234', // <-- Replace with your actual MySQL password
  database: 'guardian_system'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection Error: ', err);
  } else {
    console.log('Successfully connected to local MySQL Workbench!');
  }
});

// Endpoint to receive telemetry data from React
app.post('/api/telemetry', (req, res) => {
  const {
    energyInput, ethicalEmergency, regulatorySpeed, trafficDensity,
    weather, roadCondition, battery, currentSpeed, guardianScore, approved
  } = req.body;

  const sqlQuery = `
    INSERT INTO telemetry_logs 
    (energy_input, ethical_emergency, regulatory_speed, traffic_density, weather, road_condition, battery_status, current_speed, guardian_score, approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    energyInput, ethicalEmergency, regulatorySpeed, trafficDensity,
    weather, roadCondition, battery, currentSpeed, guardianScore, approved ? 1 : 0
  ];

  db.query(sqlQuery, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database writing failure' });
    }
    res.status(200).json({ message: 'Telemetry successfully logged to MySQL Workbench!' });
  });
});

app.listen(3001, () => {
  console.log('Guardian Bridge Server running on http://localhost:3001');
});