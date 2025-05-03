import axios from "axios";

export const bunqClient = axios.create({
  baseURL: "https://public-api.sandbox.bunq.com",
  headers: {
    "User-Agent": "bunq-budget-guard",
  },
});

bunqClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error.response.data);
    return error.response.data;
  },
);
