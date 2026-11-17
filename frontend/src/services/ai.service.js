import request from './api'

export const queryAi = async (query, intent = 'alumni_search', context = {}) => {
  return request('/ai/query', {
    method: 'POST',
    body: JSON.stringify({ query, intent, context }),
  })
}

export const summarizeProfile = async (userId = null) => {
  return request('/ai/summarize-profile', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
}
