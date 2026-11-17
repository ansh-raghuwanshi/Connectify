const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  let data
  try {
    data = await response.json()
  } catch (err) {
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`)
    }
    return null
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

export default request
