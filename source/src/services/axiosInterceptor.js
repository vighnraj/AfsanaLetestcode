
// import axios from "axios";
// import BASE_URL from "../Config";


// const api = axios.create({
//   baseURL: BASE_URL,
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from "axios";
import BASE_URL from "../Config";

const TOKEN_KEY = "authToken";
const LAST_ACTIVE_KEY = "lastActiveAt";
const IDLE_LIMIT_MS = 10 * 60 * 1000; // ✅ 10 minutes

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor — token attach only
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — 401 handle
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      logoutUser();
    }
    return Promise.reject(error);
  }
);

// Logout helper
function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
  window.location.href = "/login"; // React Router ho to navigate("/login")
}

// Idle check
function checkIdle() {
  const last = Number(localStorage.getItem(LAST_ACTIVE_KEY) || 0);
  if (last && Date.now() - last >= IDLE_LIMIT_MS) {
    logoutUser();
  }
}

// Har 10 sec me check karo
setInterval(checkIdle, 10 * 1000);

// ✅ User activity pe lastActive update karo
["click", "keydown", "mousemove", "scroll", "touchstart"].forEach((evt) => {
  window.addEventListener(evt, () =>
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString())
  );
});

// ✅ Initial set jab user login kare
if (!localStorage.getItem(LAST_ACTIVE_KEY)) {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

export default api;
