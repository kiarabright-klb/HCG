const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'travel.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS destinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT,
    country TEXT NOT NULL,
    country_code TEXT,
    region TEXT,
    continent TEXT,
    lat REAL,
    lng REAL,
    status TEXT NOT NULL DEFAULT 'wishlist',
    want_to_return INTEGER DEFAULT 0,
    rating INTEGER,
    visit_date TEXT,
    notes TEXT,
    wishlist_priority INTEGER DEFAULT 3,
    excluded_note TEXT,
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'planned',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trip_stops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    destination_id INTEGER,
    destination_name TEXT NOT NULL,
    country TEXT,
    start_date TEXT,
    end_date TEXT,
    order_index INTEGER DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS budget_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    estimated REAL DEFAULT 0,
    actual REAL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    notes TEXT,
    item_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS annual_fund (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL UNIQUE,
    amount REAL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    notes TEXT
  );
`);

module.exports = db;
