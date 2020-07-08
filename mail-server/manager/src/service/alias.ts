import { get, prepare } from '../database'
import models from '../model'

const {
  getAliasBySource: getAliasBySourceSql,
  updateAliasBySource: updateAliasBySourceSql,
  addAlias: addAliasSql,
} = models

export const softUpdateAlias = async (source, destination) => {
  const alias = await getAliasBySource(source)

  if (alias && alias.source && destination != destination) {
    return await updateAliasBySource(source, destination)
  }

  if (!alias || !alias.source) {
    return await addAlias(source, destination)
  }
  if (alias.destination !== destination) {
    return await updateAliasBySource(source, destination)
  }

}

export const getAliasBySource = ($source) => {
  return get(getAliasBySourceSql, { $source })
}

export const updateAliasBySource = ($source, $destination, $permittedSenders = '') => {
  console.log(`Updating alias for ${$source} -> ${$destination}`)
  return prepare(updateAliasBySourceSql, { $source, $destination, $permittedSenders })
}

export const addAlias = ($source, $destination, $permittedSenders = '') => {
  console.log(`Adding alias for ${$source} -> ${$destination}`)
  return prepare(addAliasSql, { $source, $destination, $permittedSenders })
}
