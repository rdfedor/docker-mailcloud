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

export const getAliases = async () => {
  const aliases = await all(getAliasesSql)
  return aliases.map(alias => {
    const newAlias = {...alias}
    newAlias.destination = newAlias.destination.split(',')

    if (newAlias.destination instanceof String) {
      newAlias.destination = [alias.destination]
    }

    return newAlias
  })
}

export const getAliasBySource = async $source => {
  const alias = await get(getAliasBySourceSql, { $source })
  if (alias.destination) {
    alias.destination = alias.destination.split(',')
  }
  if (alias.destination instanceof String) {
    alias.destination = [alias.destination]
  }
  return alias
}

export const updateAliasBySource = ($source, $destination = [], $permittedSenders = '') => {
  return prepare(updateAliasBySourceSql, { $source, $destination: $destination.join(','), $permittedSenders })
}

export const addAlias = ($source, $destination, $permittedSenders = '') => {
  return prepare(addAliasSql, { $source, $destination: $destination.join(','), $permittedSenders })
}

export const deleteAliasBySource = $source => {
  return prepare(deleteAliasSql, { $source })
}

/**
 * Removes a forwarding email address
 * @param {String} source Email address of the forwarding email to remove
 * @param {String} destination Destination email to remove
 */
export const processRemoveAlias = async (source, destination = '') => {
  if (!source) {
    throw new MissingParameterError('Missing source attribute')
  }

  const alias = await getAliasBySource(source)

  if (!alias) {
    throw new NotFoundError('Source not found')
  }

  if (!destination) {
    await deleteAliasBySource(source)
    return
  }

  if (alias.destination.indexOf(destination) == -1) {
    throw new NotFoundError(`An alias was not found going from ${source} to ${destination}`)
  }

  const updatedDestinations = alias.destination.filter((aliasDestination) => aliasDestination !== destination)

  if (!updatedDestinations.length) {
    await deleteAliasBySource(source)
    return
  }

  await updateAliasBySource(source, updatedDestinations)
}

export const processAddAlias = async (source, destination) => {
  if (!source || !destination) {
    throw new MissingParameterError('Missing source and/or destination attributes')
  }

  const alias = await getAliasBySource(source)

  if (alias) {
    throw new ConflictError('Alias by that source already exists')
  }

  await addAlias(source, [destination])
}

export const processUpdateAlias = async (source, destination) => {
  if (!source || !destination) {
    throw new MissingParameterError('Missing source and/or destination attributes')
  }

  const alias = await getAliasBySource(source)

  if (!alias) {
    throw new NotFoundError('Source not found')
  }

  if (alias.destination.indexOf(destination) > -1) {
    throw new ConflictError(`An alias already exists going from ${source} to ${destination}`)
  }

  const destinations = alias.destination

  destinations.push(destination)

  await updateAliasBySource(source, destinations)
}
