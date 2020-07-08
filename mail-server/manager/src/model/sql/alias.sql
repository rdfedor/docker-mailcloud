-- getAliases
SELECT source, destination, permitted_senders FROM aliases;

-- getAliasBySource
SELECT source,
  destination,
  permitted_senders
FROM aliases
WHERE source = $source;

-- updateAliasBySource
UPDATE aliases
SET destination = $destination
AND permitted_senders = $permittedSenders
WHERE source = $source;

-- addAlias
INSERT INTO aliases(source, destination, permitted_senders)
VALUES ($source, $destination, $permittedSenders);
