const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/currency', require('./routes/currency'));
app.use('/api/stats', require('./routes/stats'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Travel API running on http://localhost:${PORT}`);
});
