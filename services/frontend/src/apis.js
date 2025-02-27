import axios from "axios";

export const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080/apis"
    : `${process.env.REACT_APP_API_URL}/apis`;

const apis = axios.create({
  baseURL,
  withCredentials: true,
});

export default apis;
