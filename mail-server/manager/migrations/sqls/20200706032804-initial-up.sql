CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    extra,
    privileges TEXT NOT NULL DEFAULT '',
    quota TEXT NOT NULL DEFAULT '0'
);
CREATE TABLE aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL UNIQUE,
    destination TEXT NOT NULL,
    permitted_senders TEXT
);