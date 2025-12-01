import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://improved-memory-xjpqw5rr799fvw5x-5000.app.github.dev/api", 
  withCredentials: true,
});

export default axiosClient;