const express = require('express');
const cors = require('cors');
const { hospitals, ngos, bloodBanks } = require('./dummyData'); 

const app = express();

app.use(cors());
app.use(express.json());

// POST endpoint to verify
app.post('/api/verify', (req, res) => {
  const { type, name, licenseNumber } = req.body;
  let list = [];

  if (type === 'hospital') list = hospitals;
  if (type === 'ngo') list = ngos;
  if (type === 'blood-bank') list = bloodBanks;

  const found = list.find(i => i.name === name && i.licenseNumber === licenseNumber);

  res.json({ verified: !!found });
});

app.listen(4000, () => console.log('Government API running on port 4000'));
