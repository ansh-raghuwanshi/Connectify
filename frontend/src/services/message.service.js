import request from './api'

export const getConversationsList = async () => {
  return request('/messages')
}

export const getConversation = async (userId, params = {}) => {
  const query = new URLSearchParams(params).toString()
  return request(`/messages/${userId}${query ? `?${query}` : ''}`)
}

export const sendMessage = async (recipientId, content) => {
  return request('/messages', {
    method: 'POST',
    body: JSON.stringify({ recipientId, content }),
  })
}
