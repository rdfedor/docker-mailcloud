-- checkHealth
SELECT true FROM (
  SELECT true FROM accounts
  UNION
  SELECT true FROM aliases
  UNION
  SELECT true FROM manager_api_keys
)
