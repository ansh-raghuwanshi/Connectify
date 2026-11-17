import request from './api'

export const getEvents = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return request(`/events${query ? `?${query}` : ''}`)
}

export const getEventById = async (id) => {
  return request(`/events/${id}`)
}

export const createEvent = async (eventData) => {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  })
}

export const registerForEvent = async (id) => {
  return request(`/events/${id}/register`, {
    method: 'POST',
  })
}
