const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
//  

/**
 * Get auth token from storage
 */
// const getAuthToken = () => {
//   // Adjust based on your auth implementation
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
//   }
//   return null;
// };

export const uploadContactAttachment = async (contactId, file, category, description, id) => { 
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  if (description) {
    formData.append('description', description);
  }
  formData.append('id', id);

//   const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/api/attachments/contact/${contactId}/upload`,
    {
      method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   },
      body: formData
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Upload failed');
  }

  return await response.json();
};

export const uploadMultipleContactAttachments = async (contactId, files, category, description, id) => {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  formData.append('category', category);
  if (description) {
    formData.append('description', description);
  }
formData.append('id', id);


//   const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/api/attachments/contact/${contactId}/upload-multiple`,
    {
      method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   },
      body: formData
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Upload failed');
  }

  return await response.json();
};

export const getContactAttachments = async (contactId) => {
//   const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/api/attachments/contact/${contactId}`,
    {
      method: 'GET',
      headers: {
        // 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to fetch attachments');
  }

  return await response.json();
};

export const getAttachmentDownloadUrl = async (contactId, attachmentId, expiresIn = 3600) => {
//   const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/api/attachments/contact/${contactId}/attachment/${attachmentId}/download?expiresIn=${expiresIn}`,
    {
      method: 'GET',
      headers: {
        // 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to get download URL');
  }

  return await response.json();
};

export const deleteContactAttachment = async (contactId, attachmentId) => {
//   const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/api/attachments/contact/${contactId}/attachment/${attachmentId}`,
    {
      method: 'DELETE',
      headers: {
        // 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to delete attachment');
  }

  return await response.json();
};

export const updateAttachmentMetadata = async (contactId, attachmentId, updates) => {
//   const token = getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/api/attachments/contact/${contactId}/attachment/${attachmentId}`,
    {
      method: 'PATCH',
      headers: {
        // 'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to update attachment');
  }

  return await response.json();
};