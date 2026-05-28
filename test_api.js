let register_request = {
  fullname: "ABCDEFGH",
  username: "abcdefgh",
  email: "abcdefgh@ijklmnop.com",
  password: "1234567890",
};

let BASE_URL = "http://10.245.107.123:8080";
let response = await fetch(BASE_URL + "/api/v1/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(register_request),
});
// response
//   .then((res) => {
//     if (res.ok) return res.json();
//     // else throw new Error("Ngu");
//   })
//   .then((data) => console.log(data))
//   .catch((ex) => console.log(ex));
console.log(await response.json());
