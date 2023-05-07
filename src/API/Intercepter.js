import axios from "axios";
import router from "@/router";

//const baseURL = "https://www.platform.osboha180.com/api/api/v1";

const baseURL = "http://127.0.0.1:8000/api/v1";
const api = axios.create({
  baseURL: baseURL,
});

function handelErrors(error) {
  if (error == 403) {
    router.push({
      name: "NotAuthorized",
    });
  }
}

export { api, baseURL, handelErrors };
