const express = require('express');
const router = express.Router();
const db = require('../db');

const parse = row => ({
  ...row,
  tags: JSON.parse(row.tags || '[]'),
  want_to_return: Boolean(row.want_to_return),
});

router.get('/', (req, res) => {
  const { status, continent, tag } = req.query;
  let query = 'SELECT * FROM destinations WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (continent) { query += ' AND continent = ?'; params.push(continent); }
  const rows = db.prepare(query + ' ORDER BY name ASC').all(...params);
  let result = rows.map(parse);
  if (tag) result = result.filter(d => d.tags.includes(tag));
  res.json(result);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM destinations WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(parse(row));
});

router.post('/', (req, res) => {
  const {
    name, city, country, country_code, region, continent, lat, lng,
    status = 'wishlist', want_to_return = 0, rating, visit_date,
    notes, wishlist_priority = 3, excluded_note, tags = [],
  } = req.body;
  const result = db.prepare(`
    INSERT INTO destinations
      (name, city, country, country_code, region, continent, lat, lng,
       status, want_to_return, rating, visit_date, notes,
       wishlist_priority, excluded_note, tags)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    name, city, country, country_code, region, continent, lat, lng,
    status, want_to_return ? 1 : 0, rating, visit_date,
    notes, wishlist_priority, excluded_note, JSON.stringify(tags),
  );
  const row = db.prepare('SELECT * FROM destinations WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(parse(row));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM destinations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const fields = [
    'name','city','country','country_code','region','continent','lat','lng',
    'status','want_to_return','rating','visit_date','notes',
    'wishlist_priority','excluded_note','tags',
  ];
  const updates = {};
  fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (updates.tags) updates.tags = JSON.stringify(updates.tags);
  if (updates.want_to_return !== undefined) updates.want_to_return = updates.want_to_return ? 1 : 0;
  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);
  db.prepare(`UPDATE destinations SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`)
    .run(...values, req.params.id);
  const row = db.prepare('SELECT * FROM destinations WHERE id = ?').get(req.params.id);
  res.json(parse(row));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM destinations WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

module.exports = router;
