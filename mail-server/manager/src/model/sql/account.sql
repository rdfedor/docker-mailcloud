-- getAccounts
SELECT email,
  extra,
  password,
  privileges,
  quota
FROM accounts;

-- getAccountByEmail
SELECT email,
  extra,
  password,
  privileges,
  quota
FROM accounts
WHERE email = $email;

-- updateAccountPassword
UPDATE accounts
SET password = $password
WHERE email = $email

-- addAccountPassword
INSERT INTO accounts(email, password)
VALUES ($email, $password);

-- updateAccountQuota
UPDATE accounts
SET quota = $quota
WHERE email = $email

-- addAccount
INSERT INTO accounts(email, password, quota, privileges, extra)
VALUES ($email, $password, $quota, $privileges, $extra);

-- updateAccount
UPDATE accounts
SET password = $password, quota = $quota, extra = $extra, privileges = $privileges
WHERE email = $email

-- deleteAccount
DELETE FROM accounts WHERE email = $email;
