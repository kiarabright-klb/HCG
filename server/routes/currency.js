const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

router.get('/:base', async (req, res) => {
  const base = req.params.base.toUpperCase();
  const cacheKey = base;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return res.json(cached.data);
  }
  try {
    const url = `https://open.er-api.com/v6/latest/${base}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.result !== 'success') throw new Error('API error');
    const result = { base, rates: data.rates, updated: data.time_last_update_utc };
    cache.set(cacheKey, { data: result, ts: Date.now() });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch rates', message: err.message });
  }
});

module.exports = router;
