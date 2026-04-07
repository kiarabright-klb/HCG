const express = require('express');
const router = express.Router();
const db = require('../db');

const parseTrip = (trip) => {
  if (!trip) return null;
  const stops = db.prepare('SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY order_index ASC').all(trip.id);
  const budget = db.prepare('SELECT * FROM budget_items WHERE trip_id = ?').all(trip.id);
  const totalEstimated = budget.reduce((s, b) => s + (b.estimated || 0), 0);
  const totalActual = budget.reduce((s, b) => s + (b.actual || 0), 0);
  return { ...trip, stops, budget, totalEstimated, totalActual };
};

router.get('/', (req, res) => {
  const trips = db.prepare('SELECT * FROM trips ORDER BY start_date DESC').all();
  res.json(trips.map(t => {
    const stops = db.prepare('SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY order_index ASC').all(t.id);
    const budget = db.prepare('SELECT * FROM budget_items WHERE trip_id = ?').all(t.id);
    return {
      ...t,
      stops,
      totalEstimated: budget.reduce((s, b) => s + (b.estimated || 0), 0),
      totalActual: budget.reduce((s, b) => s + (b.actual || 0), 0),
    };
  }));
});

router.get('/:id', (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Not found' });
  res.json(parseTrip(trip));
});

router.post('/', (req, res) => {
  const { name, start_date, end_date, status = 'planned', notes, stops = [] } = req.body;
  const result = db.prepare(
    'INSERT INTO trips (name, start_date, end_date, status, notes) VALUES (?,?,?,?,?)'
  ).run(name, start_date, end_date, status, notes);
  const tripId = result.lastInsertRowid;
  stops.forEach((stop, i) => {
    db.prepare(`INSERT INTO trip_stops (trip_id, destination_id, destination_name, country, start_date, end_date, order_index, notes)
      VALUES (?,?,?,?,?,?,?,?)`)
      .run(tripId, stop.destination_id || null, stop.destination_name, stop.country, stop.start_date, stop.end_date, i, stop.notes);
  });
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);
  res.status(201).json(parseTrip(trip));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const { name, start_date, end_date, status, notes, stops } = req.body;
  db.prepare(`UPDATE trips SET name=?, start_date=?, end_date=?, status=?, notes=?, updated_at=datetime('now') WHERE id=?`)
    .run(name ?? existing.name, start_date ?? existing.start_date, end_date ?? existing.end_date,
         status ?? existing.status, notes ?? existing.notes, req.params.id);
  if (stops !== undefined) {
    db.prepare('DELETE FROM trip_stops WHERE trip_id = ?').run(req.params.id);
    stops.forEach((stop, i) => {
      db.prepare(`INSERT INTO trip_stops (trip_id, destination_id, destination_name, country, start_date, end_date, order_index, notes)
        VALUES (?,?,?,?,?,?,?,?)`)
        .run(req.params.id, stop.destination_id || null, stop.destination_name, stop.country, stop.start_date, stop.end_date, i, stop.notes);
    });
  }
  res.json(parseTrip(db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id)));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM trips WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
