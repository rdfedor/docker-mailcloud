-- getUsers
SELECT email,
  extra,
  password,
  privileges,
  quota
FROM users;

-- getUserByEmail
SELECT email,
  extra,
  password,
  privileges,
  quota
FROM users
WHERE email = $email;

-- updateUserPassword
UPDATE users
SET password = $password
WHERE email = $email

-- addUserPassword
INSERT INTO users(email, password)
VALUES ($email, $password);

-- updateUserQuota
UPDATE users
SET quota = $quota
WHERE email = $email
