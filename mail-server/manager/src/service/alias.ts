import { get, prepare, all } from '../database'
import models from '../model'
import { ConflictError, NotFoundError, MissingParameterError } from '../error'

const {
  getAliasBySource: getAliasBySourceSql,
  updateAliasBySource: updateAliasBySourceSql,
  addAlias: addAliasSql,
  getAliases: getAliasesSql,
  deleteAlias: deleteAliasSql,
} = models

export const ALIAS_DESTINATION_SEPARATOR = ','
export const ALIAS_PERMITTED_SENDERS_SEPARATOR = ','

export const softUpdateAlias = async (source, destination) => {
  const alias = await getAliasBySource(source)

  if (alias && alias.source && destination != destination) {
    console.log(`Update Alias ${JSON.stringify({ domain, destination })} [dms-sync]`)
    return await updateAliasBySource(source, destination)
  }

  if (!alias || !alias.source) {
    console.log(`Adding Alias ${JSON.stringify({ domain, destination })} [dms-sync]`)
    return await addAlias(source, destination)
  }
  if (alias.destination !== destination) {
    console.log(`Update Alias ${JSON.stringify({ domain, destination })} [dms-sync]`)
    return await updateAliasBySource(source, destination)
  }

}

const formatAliasReturnObject = alias => {
  if (alias) {
    const newAlias = { ...alias }
true
    newAlias.destination = newAlias && newAlias.destination && newAlias.destination.split(ALIAS_DESTINATION_SEPARATOR)

    if (newAlias.destination instanceof String) {
      newAlias.destination = [alias.destination]
    }

    if (!newAlias.permittedSenders) {
      newAlias.permittedSenders = []
    }

    if (!Array.isArray(newAlias.permittedSenders)) {
      newAlias.permittedSenders = alias.permittedSenders.split(ALIAS_PERMITTED_SENDERS_SEPARATOR)
    }

    return newAlias
  }
  return alias
}

export const getAliases = async () => {
  const aliases = await all(getAliasesSql)

  return aliases.map((alias) => formatAliasReturnObject(alias))
}

export const getAliasBySource = async $source => {
  const alias = await get(getAliasBySourceSql, { $source })
  return formatAliasReturnObject(alias)
}

export const updateAliasBySource = async ($source, $destination, $permittedSenders) => {
  if (!($destination instanceof Array)) {
    $destination = [$destination]
  }

  if (!($permittedSenders instanceof Array)) {
    $permittedSenders = [$permittedSenders]
  }

  console.log({
    $source,
    $destination: $destination.join(ALIAS_DESTINATION_SEPARATOR),
    $permittedSenders: $permittedSenders.join(ALIAS_PERMITTED_SENDERS_SEPARATOR),
  })

  return await prepare(updateAliasBySourceSql, {
    $source,
    $destination: $destination.join(ALIAS_DESTINATION_SEPARATOR),
    $permittedSenders: $permittedSenders.join(ALIAS_PERMITTED_SENDERS_SEPARATOR),
  })
}

export const addAlias = async ($source, $destination, $permittedSenders) => {
  if (!($destination instanceof Array)) {
    $destination = [$destination]
  }

  if (!($permittedSenders instanceof Array)) {
    $permittedSenders = [$permittedSenders]
  }

  return await prepare(addAliasSql, {
    $source,
    $destination: $destination.join(ALIAS_DESTINATION_SEPARATOR),
    $permittedSenders: $permittedSenders.join(ALIAS_PERMITTED_SENDERS_SEPARATOR),
  })
}

export const deleteAliasBySource = async $source => {
  return await prepare(deleteAliasSql, { $source })
}

/**
 * Removes a forwarding email address
 * @param {String} source Email address of the forwarding email to remove
 * @param {String} destination Destination email to remove
 */
export const processRemoveAlias = async (source, destination = '', permittedSenders = '') => {
  if (!source) {
    throw new MissingParameterError('Missing source attribute')
  }

  const alias = await getAliasBySource(source)

  if (!alias) {
    throw new NotFoundError('Source not found')
  }

  if (!destination && !permittedSenders) {
    await deleteAliasBySource(source)
    return
  }

  if (permittedSenders) {
    if (alias.permittedSenders.indexOf(permittedSenders) == -1) {
      throw new NotFoundError(`An alias was not found going from ${source} to ${destination} with ${permittedSenders} as a permitted sender.`)
    }

    const updatedPermittedSenders = alias.permittedSenders.filter(
      (aliasPermittedSender) => aliasPermittedSender !== permittedSenders,
    )

    await updateAliasBySource(source, alias.destination, updatedPermittedSenders)
  } else {
    if (alias.destination.indexOf(destination) == -1) {
      throw new NotFoundError(`An alias was not found going from ${source} to ${destination}`)
    }

    const updatedDestinations = alias.destination.filter((aliasDestination) => aliasDestination !== destination)

    if (!updatedDestinations.length) {
      await deleteAliasBySource(source)
      return
    }

    await updateAliasBySource(source, updatedDestinations, alias.permittedSenders)
  }
}

export const processAddAlias = async (source, destination, permittedSenders) => {
  if (!source || !destination) {
    throw new MissingParameterError('Missing source and/or destination attributes')
  }

  const alias = await getAliasBySource(source)

  if (alias) {
    throw new ConflictError('Alias by that source already exists')
  }

  await addAlias(source, destination, permittedSenders)
}

export const processUpdateAlias = async (source, destination, permittedSender) => {
  if (!source || !destination) {
    throw new MissingParameterError('Missing source and/or destination attributes')
  }

  const alias = await getAliasBySource(source)

  if (!alias) {
    throw new NotFoundError('Source not found')
  }

  const destinations = alias.destination

  if (destination && destinations.indexOf(destination) === -1) {
    destinations.push(destination)
  }

  const permittedSenders = alias.permittedSenders

  if (permittedSender && permittedSenders.indexOf(permittedSender) === -1) {
    permittedSenders.push(permittedSender)
  }

  await updateAliasBySource(source, destinations, permittedSenders)
}
