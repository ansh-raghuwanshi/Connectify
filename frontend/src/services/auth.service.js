import request from './api'

export const registerUser = async (userData) => {
  return request('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

export const loginUser = async (credentials) => {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export const getCurrentUser = async () => {
  return request('/users/me')
}