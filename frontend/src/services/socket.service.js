import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    if (socket) {
      socket.disconnect()
      socket = null
    }
    return null
  }

  if (socket) {
    if (socket.connected) {
      return socket
    }
    socket.auth = { token }
    if (!socket.active) {
      socket.connect()
    }
    return socket
  }

  const apiBase =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
  const serverUrl =
    import.meta.env.VITE_SOCKET_URL || apiBase.replace(/\/api\/v1\/?$/, '')

  socket = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  })

  socket.on('connect', () => {
    console.log('[Socket.io] Connected to server at', serverUrl)
  })

  socket.on('connect_error', (err) => {
    console.warn('[Socket.io] Connection warning:', err.message)
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket.io] Disconnected:', reason)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
