import request from './api'

export const registerUser = async (userData) => {
  return request('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

export const loginUser = async (credentials) => {
  const result = await request('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  if (result?.data?.accessToken) {
    localStorage.setItem('token', result.data.accessToken)
  }
  return result
}

export const getCurrentUser = async () => {
  return request('/users/me')
}

export const updateProfile = async (profileData) => {
  return request('/users/me', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  })
}

export const verifyEmail = async (token) => {
  return request(`/users/verify-email/${token}`)
}

export const resendVerificationEmail = async (email) => {
  return request('/users/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export const logoutUser = async () => {
  try {
    await request('/users/logout', { method: 'POST' })
  } finally {
    localStorage.removeItem('token')
  }
}

export const forgotPassword = async (email) => {
  return request('/users/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export const resetPassword = async (token, newPassword) => {
  return request('/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  })
}
