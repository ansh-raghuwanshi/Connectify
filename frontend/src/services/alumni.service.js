import request from './api'

export const getAlumni = async () => {
  return request('/alumni')
}

export const getAlumniById = async (id) => {
  return request(`/alumni/${id}`)
}