// import axios from "axios";

// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default api;


// import axios from "axios";

// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // 🔐 Attach token automatically
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token"); // or whatever key you use

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 ADD THIS INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // SAME key as AuthContext
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

