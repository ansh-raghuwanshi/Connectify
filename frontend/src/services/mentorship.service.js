import request from './api'

export const requestMentorship = async (alumniId, topic, message) => {
  return request('/mentorship', {
    method: 'POST',
    body: JSON.stringify({ alumniId, topic, message }),
  })
}

export const getMyMentorshipRequests = async () => {
  return request('/mentorship')
}

export const updateMentorshipStatus = async (id, status, responseNote = '') => {
  return request(`/mentorship/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, responseNote }),
  })
}
