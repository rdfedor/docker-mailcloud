export const MissingParameterError = class MissingParameterError extends Error {
  status = 400
}
export const AccessDeniedError = class AccessDeniedError extends Error {
  status = 403
}
export const NotFoundError = class NotFoundError extends Error {
  status = 404
}
export const ConflictError = class ConflictError extends Error {
  status = 409
}
