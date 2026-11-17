import request from './api'

export const getPosts = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return request(`/posts${query ? `?${query}` : ''}`)
}

export const getPostById = async (id) => {
  return request(`/posts/${id}`)
}

export const createPost = async (postData) => {
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  })
}

export const toggleLikePost = async (id) => {
  return request(`/posts/${id}/like`, {
    method: 'POST',
  })
}

export const addComment = async (postId, text) => {
  return request(`/posts/${postId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}

export const deleteComment = async (postId, commentId) => {
  return request(`/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  })
}

export const deletePost = async (id) => {
  return request(`/posts/${id}`, {
    method: 'DELETE',
  })
}
