/**
 * @summary Extracts the most specific message returned by the API.
 * @param {unknown} error Error thrown by Axios or by the API adapter.
 * @param {string} fallbackMessage Message key used when the API does not return a readable message.
 * @returns {string}
 */
export function getApiErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data

  if (!responseData) return fallbackMessage
  if (typeof responseData === 'string' && responseData.trim()) return responseData.trim()

  const validationMessage = getFirstValidationMessage(responseData.errors)
  if (validationMessage) return validationMessage

  return responseData.message || responseData.detail || responseData.title || fallbackMessage
}

/**
 * @summary Checks whether an API error has one of the expected HTTP status codes.
 * @param {unknown} error Error thrown by Axios or by the API adapter.
 * @param {number[]} statuses HTTP status codes to match.
 * @returns {boolean}
 */
export function hasApiStatus(error, statuses) {
  return statuses.includes(Number(error?.response?.status ?? 0))
}

function getFirstValidationMessage(errors) {
  if (!errors || typeof errors !== 'object') return ''

  for (const value of Object.values(errors)) {
    if (Array.isArray(value)) {
      const message = value.find(item => String(item ?? '').trim())
      if (message) return String(message).trim()
    }

    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return ''
}
