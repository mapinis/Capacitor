import dotenv from "dotenv";
dotenv.config();

const prefix = process.env.REACT_APP_DEV ? "http://localhost:8080" : "";

export default async function callAPI(url, options = {}) {
  if (process.env.REACT_APP_DEV) {
    options.credentials = "include";
  }

  return await fetch(prefix + "/api/" + url, options);
}

export async function callAPIJSON(url, options = {}) {
  return callAPI(url, options).then((res) => {
    return res.json();
  });
}
