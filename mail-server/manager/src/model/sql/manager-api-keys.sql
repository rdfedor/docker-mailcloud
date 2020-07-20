-- getManagerApiKeyByDomain
SELECT
  domain
  , passkey
FROM manager_api_keys
WHERE domain = $domain;

-- addManagerApiKey
INSERT INTO manager_api_keys(domain, passkey) VALUES ($domain, $passkey)

-- delManagerApiKey
DELETE FROM manager_api_keys WHERE domain = $domain;

-- getManagerApiKeys
SELECT domain FROM manager_api_keys;
