-- addManagerApiLog
INSERT INTO manager_api_logs(
    logHash,
    path,
    remoteAddr,
    parameters,
    responseStatusCode,
    domain,
    banned
  )
VALUES (
    $logHash,
    $path,
    $remoteAddr,
    $parameters,
    $responseStatusCode,
    $domain,
    $responseStatusCode != "200" AND
    $path == "POST /api/auth/verify" AND (
      SELECT count(*) > 10
      FROM manager_api_logs WHERE remoteAddr = $remoteAddr
      AND path = $path
      AND createdAt >= Datetime('now', '-5 minutes', 'localtime')
    )
  );

-- getManagerApiLog
SELECT *
FROM manager_api_logs
ORDER BY createdAt desc;

-- checkIsRemoteAddrBanned
SELECT count(*) AS count
FROM manager_api_logs
WHERE remoteAddr = $remoteAddr
  AND banned = 1
  AND Cast (
    (JulianDay('now') - JulianDay(createdAt)) * 24 * 60 As Integer
  ) <= 30;

-- clearOldLogs
DELETE FROM manager_api_logs WHERE createdAt <= Datetime('now', '-7 days', 'localtime')
