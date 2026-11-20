import request from './api'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dcotrqj9b'
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '964236131985279'
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || '-xekcS6CQHMyQUixRQeAJFgSGwE'
const FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || 'PrintIt'

async function sha1(str) {
  const enc = new TextEncoder()
  const buf = await window.crypto.subtle.digest('SHA-1', enc.encode(str))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function uploadToCloudinary(file, type = 'profile') {
  try {
    let filePayload = file
    if (file instanceof File) {
      filePayload = await fileToBase64(file)
    }

    const res = await request('/users/upload-image', {
      method: 'POST',
      body: JSON.stringify({ file: filePayload, type }),
    })

    if (res?.data?.url) {
      return res.data.url
    }
  } catch (err) {
    console.warn('Backend upload route failed or offline, falling back to direct Cloudinary signed upload:', err)
  }

  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = `folder=${FOLDER}&timestamp=${timestamp}${API_SECRET}`
  const signature = await sha1(paramsToSign)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', API_KEY)
  formData.append('timestamp', timestamp.toString())
  formData.append('folder', FOLDER)
  formData.append('signature', signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Failed to upload image to Cloudinary')
  }

  return data.secure_url
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
  })
}
