CREATE TABLE manager_api_logs (
  logHash VARCHAR(32) PRIMARY KEY,
  path TEXT NOT NULL,
  remoteAddr VARCHAR(16) NOT NULL,
  parameters TEXT NOT NULL,
  responseStatusCode VARCHAR(3),
  domain TEXT,
  banned TINYINT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
