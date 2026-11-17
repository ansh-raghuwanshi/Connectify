import request from './api'

export const getAlumni = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return request(`/alumni${query ? `?${query}` : ''}`)
}

export const getAlumniById = async (id) => {
  return request(`/alumni/${id}`)
}

export const updateAlumniProfile = async (profileData) => {
  return request('/alumni/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  })
}
