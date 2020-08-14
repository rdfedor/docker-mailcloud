import { get, prepare, all } from '../database'
import models from '../model'
import { ConflictError, NotFoundError, MissingParameterError, InvalidParameterError } from '../error'
import { isEmail } from '../util/validator'

const {
  getAliasBySourceDestination: getAliasBySourceDestinationSql,
  updateAliasBySource: updateAliasBySourceSql,
  addAlias: addAliasSql,
  getAliases: getAliasesSql,
  deleteAlias: deleteAliasSql,
} = models

export const ALIAS_DESTINATION_SEPARATOR = ','
export const ALIAS_PERMITTED_SENDERS_SEPARATOR = ','

export const softUpdateAlias = async (source, destination) => {
  const alias = await getAliasBySourceDestination(source, destination)

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

const formatAliasReturnObject = (alias) => {
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

export const getAliasBySourceDestination = async ($source, $destination) => {
  const alias = await get(getAliasBySourceDestinationSql, { $source, $destination })
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

export const deleteAliasBySource = async ($source) => {
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

  if (!isEmail(source)) {
    throw new InvalidParameterError('Invalid source address')
  }

  const alias = await getAliasBySourceDestination(source, destination)

  if (!alias) {
    throw new NotFoundError('Source and destination not found')
  }

  if (!destination && !permittedSenders) {
    await deleteAliasBySource(source)
    return
  }

  if (permittedSenders) {
    if (
      (permittedSenders instanceof Array && permittedSenders.filter((sender) => !isEmail(sender)).length > 0) ||
      (permittedSenders instanceof String && !isEmail(permittedSenders))
    ) {
      throw new InvalidParameterError('Invalid permittedSenders address')
    }

    if (
      (permittedSenders instanceof Array &&
        permittedSenders.filter(sender => alias.permittedSenders.indexOf(sender) === -1).length > 0) ||
      (permittedSenders instanceof String && alias.permittedSenders.indexOf(permittedSenders) === -1)
    ) {
      throw new NotFoundError(
        `An alias was not found going from ${source} to ${destination} with ${permittedSenders} as a permitted sender.`,
      )
    }

    const updatedPermittedSenders = alias.permittedSenders.filter(
      (aliasPermittedSender) => aliasPermittedSender !== permittedSenders,
    )

    await updateAliasBySource(source, alias.destination, updatedPermittedSenders)
  } else {
    if (!isEmail(destination)) {
      throw new InvalidParameterError('Invalid destination address')
    }

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

  if (!isEmail(source)) {
    throw new InvalidParameterError('Invalid source address')
  }

  const alias = await getAliasBySourceDestination(source, destination)

  if (alias) {
    throw new ConflictError('Alias by that source already exists')
  }

  if (!isEmail(destination)) {
    throw new InvalidParameterError('Invalid destination address')
  }

  if (
    (permittedSenders instanceof Array && permittedSenders.filter((sender) => !isEmail(sender)).length > 0) ||
    (permittedSenders instanceof String && !isEmail(permittedSenders))
  ) {
    throw new InvalidParameterError('Invalid permittedSenders address')
  }

  await addAlias(source, destination, permittedSenders)
}

export const processUpdateAlias = async (source, destination, permittedSender) => {
  if (!source || !destination) {
    throw new MissingParameterError('Missing source and/or destination attributes')
  }

  if (!isEmail(source)) {
    throw new InvalidParameterError('Invalid source address')
  }

  const alias = await getAliasBySourceDestination(source, destination)

  if (!alias) {
    throw new NotFoundError('Source not found')
  }

  if (destination && !isEmail(destination)) {
    throw new InvalidParameterError('Invalid source address')
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
