const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const visited = db.prepare("SELECT * FROM destinations WHERE status = 'visited'").all();
  const wishlist = db.prepare("SELECT * FROM destinations WHERE status = 'wishlist'").all();
  const excluded = db.prepare("SELECT * FROM destinations WHERE status = 'excluded'").all();
  const trips = db.prepare("SELECT * FROM trips").all();

  const countriesVisited = [...new Set(visited.map(d => d.country))];
  const continentsVisited = [...new Set(visited.map(d => d.continent).filter(Boolean))];

  const completedTrips = trips.filter(t => t.status === 'completed');
  const upcomingTrips = trips.filter(t => t.status === 'planned' && t.start_date > new Date().toISOString().split('T')[0]);

  res.json({
    totalVisited: visited.length,
    totalWishlist: wishlist.length,
    totalExcluded: excluded.length,
    countriesVisited: countriesVisited.length,
    continentsVisited: continentsVisited.length,
    totalTrips: trips.length,
    completedTrips: completedTrips.length,
    upcomingTrips: upcomingTrips.length,
    continentsList: continentsVisited,
    countriesList: countriesVisited,
    recentVisited: visited.slice(-5).reverse(),
  });
});

module.exports = router;
