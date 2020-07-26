function parameterize(obj) {
  let out = "?";
  for (let key in obj) {
    out += key + "=" + obj[key] + "&";
  }
  return out;
}

export default parameterize;
