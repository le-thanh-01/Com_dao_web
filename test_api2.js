let register_request = {
  fullname: "ABCDEFGH",
  username: "abcdefgh",
  email: "abcdefgh@ijklmnop.com",
  password: "1234567890",
};
let token = "ygjyj";
let BASE_URL = "https://8dbe-116-96-47-151.ngrok-free.app";

// let response = await fetch(BASE_URL + "/api/v1/product", {
//   method: "GET",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization:
//       "Bearer eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhYmNkZWZnaCIsImlhdCI6MTc3OTc2Mzk4MywiZXhwIjoxNzc5NzY3NTgzfQ.fQ1JW_0BEjFed2KEcKdi_l7PhxszkE3PJyHdocd0JVxXHWlXG7HwCc4F3_lR2MYO",
//   },
// });
// console.log(await response.json());

export async function fetchProducts() {
  const res = await fetch(BASE_URL + "/api/v1/product/view?page=0&size=4", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    const errorText = await res.json();
    console.log(errorText);
    return fail(`Lỗi Server [${res.status}]: ${errorText}`);
  }
  const data = await res.json();
  console.log(data);
  if (!data) return fail("not find data");
  return { data, error: null };
}

export async function fetchCategories() {
  const res = await fetch(BASE_URL + "/api/v1/category/view/all", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) {
    const errorText = await res.json();
    return fail(`Lỗi Server [${res.status}]: ${errorText}`);
  }
  const data = await res.json();
  console.log(data);
  if (!data) return fail("not find data");
  return { data, error: null };
}

export async function fetchLoginState() {
  const res = await fetch(BASE_URL + "/api/v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ token: token }),
  });
  if (!res.ok) {
    const errorText = await res.json();
    return fail(`Lỗi Server [${res.status}]: ${errorText}`);
  }
  const data = await res.json();
  if (!data) return fail("not find data");
  console.log(data);
  return { data, error: null };
}

// fetchProducts();
fetchCategories();
// fetchLoginState();
