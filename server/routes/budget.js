const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/trip/:tripId', (req, res) => {
  const items = db.prepare('SELECT * FROM budget_items WHERE trip_id = ? ORDER BY category, created_at ASC').all(req.params.tripId);
  res.json(items);
});

router.post('/trip/:tripId', (req, res) => {
  const { category, description, estimated = 0, actual = 0, currency = 'USD', notes, item_date } = req.body;
  const result = db.prepare(`
    INSERT INTO budget_items (trip_id, category, description, estimated, actual, currency, notes, item_date)
    VALUES (?,?,?,?,?,?,?,?)
  `).run(req.params.tripId, category, description, estimated, actual, currency, notes, item_date);
  res.status(201).json(db.prepare('SELECT * FROM budget_items WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM budget_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const { category, description, estimated, actual, currency, notes, item_date } = req.body;
  db.prepare(`UPDATE budget_items SET category=?, description=?, estimated=?, actual=?, currency=?, notes=?, item_date=? WHERE id=?`)
    .run(category ?? existing.category, description ?? existing.description,
         estimated ?? existing.estimated, actual ?? existing.actual,
         currency ?? existing.currency, notes ?? existing.notes,
         item_date ?? existing.item_date, req.params.id);
  res.json(db.prepare('SELECT * FROM budget_items WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM budget_items WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// Annual fund
router.get('/annual', (req, res) => {
  res.json(db.prepare('SELECT * FROM annual_fund ORDER BY year DESC').all());
});

router.post('/annual', (req, res) => {
  const { year, amount, currency = 'USD', notes } = req.body;
  db.prepare('INSERT OR REPLACE INTO annual_fund (year, amount, currency, notes) VALUES (?,?,?,?)')
    .run(year, amount, currency, notes);
  res.json(db.prepare('SELECT * FROM annual_fund WHERE year = ?').get(year));
});

// Annual stats
router.get('/stats/annual/:year', (req, res) => {
  const year = req.params.year;
  const trips = db.prepare(`
    SELECT t.*,
      (SELECT SUM(actual) FROM budget_items WHERE trip_id = t.id) as spent
    FROM trips t
    WHERE strftime('%Y', t.start_date) = ? OR strftime('%Y', t.end_date) = ?
  `).all(year, year);
  const totalSpent = trips.reduce((s, t) => s + (t.spent || 0), 0);
  const fund = db.prepare('SELECT * FROM annual_fund WHERE year = ?').get(Number(year));
  res.json({ year, trips, totalSpent, fund: fund || null });
});

module.exports = router;
