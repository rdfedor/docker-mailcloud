-- getAliases
SELECT source, destination, permitted_senders as permittedSenders FROM aliases;

-- getAliasBySource
SELECT source,
  destination,
  permitted_senders as permittedSenders
FROM aliases
WHERE source = $source;

-- updateAliasBySource
UPDATE aliases
SET destination = $destination, permitted_senders = $permittedSenders
WHERE source = $source;

-- addAlias
INSERT INTO aliases(source, destination, permitted_senders)
VALUES ($source, $destination, $permittedSenders);

-- deleteAlias
DELETE FROM aliases WHERE source = $source
