
import axios from "axios";

const apiAxios: any = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL}/api/`,
});


export default apiAxios;