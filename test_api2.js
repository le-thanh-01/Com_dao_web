let register_request = {
  fullname: "ABCDEFGH",
  username: "abcdefgh",
  email: "abcdefgh@ijklmnop.com",
  password: "1234567890",
};

let BASE_URL = "http://10.245.107.123:8080";

let response = await fetch(BASE_URL + "/api/v1/user/tier", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhYmNkZWZnaCIsImlhdCI6MTc3OTc2Mzk4MywiZXhwIjoxNzc5NzY3NTgzfQ.fQ1JW_0BEjFed2KEcKdi_l7PhxszkE3PJyHdocd0JVxXHWlXG7HwCc4F3_lR2MYO",
  },
  //   body: JSON.stringify(register_request),
});
// response
//   .then((res) => {
//     if (res.ok) return res.json();
//     // else throw new Error("Ngu");
//   })
//   .then((data) => console.log(data))
//   .catch((ex) => console.log(ex));
console.log(await response.json());
