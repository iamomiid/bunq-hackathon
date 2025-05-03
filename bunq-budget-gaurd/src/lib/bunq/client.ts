import axios from "axios";

export const bunqClient = axios.create({
  baseURL: "https://public-api.sandbox.bunq.com",
  headers: {
    "User-Agent": "bunq-budget-guard",
  },
});

console.log("env in client", process.env.DATABASE_URL);

bunqClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => Promise.reject(error.response.data),
);
