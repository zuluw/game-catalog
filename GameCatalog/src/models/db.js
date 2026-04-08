import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("games.db");

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      studio TEXT,
      rating REAL,
      image TEXT,
      owner_id INTEGER,
      firebase_id TEXT,
      image_id TEXT 
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS api_cache (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      rating REAL,
      image TEXT,
      released TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS notification_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      body TEXT,
      date TEXT,
      owner_id INTEGER
    );
  `);

  try {
    db.execSync(
      `ALTER TABLE notification_history ADD COLUMN owner_id INTEGER;`,
    );
  } catch (e) {}
  try {
    db.execSync(`ALTER TABLE games ADD COLUMN firebase_id TEXT;`);
  } catch (e) {}
  try {
    db.execSync(`ALTER TABLE games ADD COLUMN image_id TEXT;`);
  } catch (e) {}

  const countResult = db.getFirstSync("SELECT COUNT(*) as count FROM games");
  if (countResult.count === 0) {
    db.runSync(
      "INSERT INTO games (title, studio, rating, image, owner_id) VALUES (?, ?, ?, ?, ?)",
      [
        "The Witcher 3",
        "CD Projekt RED",
        4.9,
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp",
        null,
      ],
    );
  }
};

export const addGame = (
  title,
  studio,
  rating,
  image,
  owner_id,
  firebase_id = null,
  image_id = null,
) => {
  return db.runSync(
    "INSERT INTO games (title, studio, rating, image, owner_id, firebase_id, image_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, studio, rating, image, owner_id, firebase_id, image_id],
  );
};

export const updateGame = (
  id,
  title,
  studio,
  rating,
  image,
  firebase_id = null,
  image_id = null,
) => {
  db.runSync(
    "UPDATE games SET title = ?, studio = ?, rating = ?, image = ?, firebase_id = ?, image_id = ? WHERE id = ?",
    [title, studio, rating, image, firebase_id, image_id, id],
  );
};

export const syncCloudGamesToLocal = (cloudGames) => {
  cloudGames.forEach((game) => {
    const existing = db.getFirstSync(
      "SELECT id FROM games WHERE firebase_id = ?",
      [game.id],
    );

    if (!existing) {
      db.runSync(
        "INSERT INTO games (title, studio, rating, image, owner_id, firebase_id, image_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          game.title,
          game.studio,
          game.rating,
          game.image,
          game.owner_id,
          game.id,
          game.image_id || null,
        ],
      );
    }
  });
};

export const registerUser = (username, password) =>
  db.runSync("INSERT INTO users (username, password) VALUES (?, ?)", [
    username,
    password,
  ]);

export const loginUser = (username, password) =>
  db.getFirstSync("SELECT * FROM users WHERE username = ? AND password = ?", [
    username,
    password,
  ]);

export const updateUserPassword = (id, newPassword) =>
  db.runSync("UPDATE users SET password = ? WHERE id = ?", [newPassword, id]);

export const getGames = () => db.getAllSync("SELECT * FROM games");

export const deleteGame = (id) =>
  db.runSync("DELETE FROM games WHERE id = ?", [id]);

export const getStudiosSummary = () =>
  db.getAllSync(
    `SELECT studio as name, COUNT(*) as gamesCount, ROUND(AVG(rating), 1) as avgRating FROM games GROUP BY studio ORDER BY avgRating DESC`,
  );

export const saveApiCache = (games) => {
  db.runSync("DELETE FROM api_cache");
  games.forEach((game) => {
    db.runSync(
      "INSERT INTO api_cache (id, title, rating, image, released) VALUES (?, ?, ?, ?, ?)",
      [game.id, game.name, game.rating, game.background_image, game.released],
    );
  });
};

export const getApiCache = () => db.getAllSync("SELECT * FROM api_cache");

export const addNotificationRecord = (title, body, owner_id = null) => {
  const date = new Date().toLocaleString();
  return db.runSync(
    "INSERT INTO notification_history (title, body, date, owner_id) VALUES (?, ?, ?, ?)",
    [title, body, date, owner_id],
  );
};

export const getNotificationHistory = (owner_id = null) => {
  if (owner_id)
    return db.getAllSync(
      "SELECT * FROM notification_history WHERE owner_id = ? ORDER BY id DESC",
      [owner_id],
    );
  return db.getAllSync(
    "SELECT * FROM notification_history WHERE owner_id IS NULL ORDER BY id DESC",
  );
};
