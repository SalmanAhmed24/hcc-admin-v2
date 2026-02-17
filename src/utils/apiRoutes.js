
const API_BASE_URL =  "http://localhost:8080";
// "https://hcc-adam-backend.vercel.app" ||

export const apiPath = {
  prodPath: API_BASE_URL,
  prodPath3: API_BASE_URL,

  contacts: {
    list: `${API_BASE_URL}/api/contacts`,
    getById: (id) => `${API_BASE_URL}/api/contacts/${id}`,
    create: `${API_BASE_URL}/api/contacts`,
    update: (id) => `${API_BASE_URL}/api/contacts/${id}`,
    delete: (id) => `${API_BASE_URL}/api/contacts/${id}`,
    search: `${API_BASE_URL}/api/contacts/search`,
    bulkUpdate: `${API_BASE_URL}/api/contacts/bulk-update`,
    bulkDelete: `${API_BASE_URL}/api/contacts/bulk-delete`,

    activities: {
      list: (contactId) => `${API_BASE_URL}/api/contacts/${contactId}/activities`,
      create: (contactId) => `${API_BASE_URL}/api/contacts/${contactId}/activities`,
      update: (contactId, activityId) =>
        `${API_BASE_URL}/api/contacts/${contactId}/activities/${activityId}`,
      delete: (contactId, activityId) =>
        `${API_BASE_URL}/api/contacts/${contactId}/activities/${activityId}`,
    },

    deals: {
      list: (contactId) => `${API_BASE_URL}/api/contacts/${contactId}/deals`,
      create: (contactId) => `${API_BASE_URL}/api/contacts/${contactId}/deals`,
      update: (contactId, dealId) =>
        `${API_BASE_URL}/api/contacts/${contactId}/deals/${dealId}`,
      delete: (contactId, dealId) =>
        `${API_BASE_URL}/api/contacts/${contactId}/deals/${dealId}`,
    },

    tickets: {
      list: (contactId) => `${API_BASE_URL}/api/contacts/${contactId}/tickets`,
      create: (contactId) => `${API_BASE_URL}/api/contacts/${contactId}/tickets`,
      update: (contactId, ticketId) =>
        `${API_BASE_URL}/api/contacts/${contactId}/tickets/${ticketId}`,
      delete: (contactId, ticketId) =>
        `${API_BASE_URL}/api/contacts/${contactId}/tickets/${ticketId}`,
    },

    attachments: {
      list: (contactId) => `${API_BASE_URL}/api/contacts/${contactId}/attachments`,
      create: (contactId) => `${API_BASE_URL}/api/contacts/${contactId}/attachments`,
      delete: (contactId, attachmentId) =>
        `${API_BASE_URL}/api/contacts/${contactId}/attachments/${attachmentId}`,
    },

    intelligence: {
      get: (contactId) => `${API_BASE_URL}/api/contacts/${contactId}/intelligence`,
      recalculate: (contactId) =>
        `${API_BASE_URL}/api/contacts/${contactId}/intelligence/recalculate`,
    },
  },

  companies: {
    list: `${API_BASE_URL}/api/companies`,
    getById: (id) => `${API_BASE_URL}/api/companies/${id}`,
    create: `${API_BASE_URL}/api/companies`,
    update: (id) => `${API_BASE_URL}/api/companies/${id}`,
    delete: (id) => `${API_BASE_URL}/api/companies/${id}`,
  },

  users: {
    list: `${API_BASE_URL}/api/users`,
    getById: (id) => `${API_BASE_URL}/api/users/${id}`,
    me: `${API_BASE_URL}/api/users/me`,
  },

  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
  },

  upload: {
    file: `${API_BASE_URL}/api/upload`,
    multiple: `${API_BASE_URL}/api/upload/multiple`,
  },
};

export const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => queryParams.append(key, v));
      } else {
        queryParams.append(key, value);
      }
    }
  });

  return queryParams.toString();
};

export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API request failed");
    }

    return await response.json();
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};