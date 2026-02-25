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
      owner_id INTEGER
    );
  `);

  try {
    db.execSync(`ALTER TABLE games ADD COLUMN owner_id INTEGER;`);
  } catch (e) {}

  const countResult = db.getFirstSync("SELECT COUNT(*) as count FROM games");
  if (countResult.count === 0) {
    db.runSync(
      "INSERT INTO games (title, studio, rating, image, owner_id) VALUES (?, ?, ?, ?, ?)",
      [
        "The Witcher 3",
        "CD Projekt RED",
        9.8,
        "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp",
        null,
      ],
    );
  }
};

export const registerUser = (username, password) => {
  return db.runSync("INSERT INTO users (username, password) VALUES (?, ?)", [
    username,
    password,
  ]);
};

export const loginUser = (username, password) => {
  return db.getFirstSync(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
  );
};

export const updateUserPassword = (id, newPassword) => {
  return db.runSync("UPDATE users SET password = ? WHERE id = ?", [
    newPassword,
    id,
  ]);
};

export const addGame = (title, studio, rating, image, owner_id) => {
  return db.runSync(
    "INSERT INTO games (title, studio, rating, image, owner_id) VALUES (?, ?, ?, ?, ?)",
    [title, studio, rating, image, owner_id],
  );
};

export const updateGame = (id, title, studio, rating, image) => {
  db.runSync(
    "UPDATE games SET title = ?, studio = ?, rating = ?, image = ? WHERE id = ?",
    [title, studio, rating, image, id],
  );
};

export const getGames = () => db.getAllSync("SELECT * FROM games");
export const deleteGame = (id) =>
  db.runSync("DELETE FROM games WHERE id = ?", [id]);
export const getStudiosSummary = () =>
  db.getAllSync(`
    SELECT studio as name, COUNT(*) as gamesCount, ROUND(AVG(rating), 1) as avgRating 
    FROM games GROUP BY studio ORDER BY avgRating DESC
`);
