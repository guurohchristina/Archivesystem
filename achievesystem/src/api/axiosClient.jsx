import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://archivesystembackend.onrender.com/api", 
  withCredentials: true,
});

export default axiosClient;