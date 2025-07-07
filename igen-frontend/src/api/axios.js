import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// Attach the access token to every request if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh the token automatically if a 401 error occurs
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      const refreshToken = localStorage.getItem('refresh');

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            'http://127.0.0.1:8000/api/users/token/refresh/',
            { refresh: refreshToken }
          );
          const newAccessToken = refreshResponse.data.access;

          localStorage.setItem('access', newAccessToken);

          // Update the original request with the new access token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios.request(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/';
        }
      } else {
        localStorage.clear();
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default API;
