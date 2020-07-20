CREATE TABLE manager_api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL UNIQUE,
  passkey TEXT NOT NULL
);

INSERT INTO manager_api_keys(domain, passkey) VALUES ('%domain%', '%passkey%');
