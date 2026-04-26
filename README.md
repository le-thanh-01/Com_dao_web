# 4S - Cơm đảo Bách Khoa

## Phần mềm đặt cơm đảo trực tuyến, xây dựng bằng **React + Vite**.

## Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt và chạy trang](#cài-đặt-và-chạy-trang)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Kiến trúc dữ liệu](#kiến-trúc-dữ-liệu)
- [Logic giỏ hàng & Quota](#logic-giỏ-hàng--quota)
- [Danh sách trang](#danh-sách-trang)
- [CSS & Theme](#css--theme)
- [API mock](#api-mock)
- [Hướng dẫn mở rộng](#hướng-dẫn-mở-rộng)

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
| ------- | ------------------- |
| Node.js | 18.x                |
| npm     | 9.x                 |

---

## Cài đặt và chạy trang

```bash
#clone dự án về máy
git clone https://github.com/le-thanh-01/Com_dao_web

cd Com_dao_web

# Cài đặt dependencies
npm install

# Chạy môi trường development
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Push code mới lên gh-page
npm run deploy
```

Ứng dụng chạy mặc định tại `http://localhost:5173`.

---

## Cấu trúc thư mục

```
Com_dao_web/
├── public/
    ├── ico/                          # Lưu trữ các icon của web
    ├── img/                          # Các ảnh sử dụng trong trang web
    └── pages/
        ├── ref.html                  # Nguồn tham khảo
        ├── help.html                 # CSKH
        └── about.html                # Thông tin đội ngũ
├── system/
        └── api.js                    # Mock API — toàn bộ dữ liệu & endpoint giả lập
├── index.html
├── package.json              # Cấu hình thư viện và lệnh
├── src/
    ├── App.jsx                       # Router đơn giản theo page state
    ├── App.css                       # Layout .app, .app__body, .app__main
    ├── main.jsx                      # Entry point — AppProvider > App
    ├── context/
        ├── DataContext.jsx           # Server data provider + tất cả public hook
        ├── CartContext.jsx           # Giỏ hàng local + quota logic + sync server
        └── AppContext.jsx            # Gom các Provider vào thành 1 và tạo cầu nối giữa chúng (Bridge)
    ├── constants/
        └── footerLinks.js            # Nội dung và link điều hướng của Footer Component
    ├── styles/
        ├── variables.css             # CSS custom properties (màu, font, radius, transition)
        └── global.css                # Reset, scrollbar, @keyframes fadeUp
    └── components/
        ├── Skeleton/
            ├── Skeleton.jsx          # ProductCardSkeleton, NoticeRowSkeleton, Spinner, ...
            └── Skeleton.css
        ├── Navbar/
            ├── Navbar.jsx
            └── Navbar.css
        ├── Sidebar/
            ├── Sidebar.jsx
            └── Sidebar.css
        ├── FilterBar/
            ├── FilterBar.jsx
            └── FilterBar.css
        ├── ProductCard/
            ├── ProductCard.jsx       # ProductCard + ProductGrid + QuotaBanner
            └── ProductCard.css
        ├── Footer/
            ├── Footer.jsx
            └── Footer.css
        ├── UserMenu/
            ├── UserMenu.jsx
            └── UserMenu.css
        ├── Login/
            ├── Login.jsx             # Form đăng nhập + ẩn/hiện mật khẩu
            └── Login.css
        ├── Register/
            ├── Register.jsx          # Form đăng ký + validation
            └── Register.css
        ├── Account/
            ├── Account.jsx           # 4 panel: Profile, Settings, Orders, History
            └── Account.css
        ├── Notice/
            ├── Notice.jsx            # Trang thông báo + modal chi tiết
            └── Notice.css
        └── Checkout/
            ├── Checkout.jsx          # Đặt hàng: giỏ hàng, đặt bàn, thanh toán, hoá đơn
            └── Checkout.css
├── README.md
```

---

## Kiến trúc dữ liệu

### Luồng dữ liệu tổng quan

```
api.js (DB object)
   │
   ▼
DataProvider (DataContext.jsx)
   │  useResource(fetcher) — mỗi resource có { data, loading, error, refetch }
   │
   ├── useProducts()      → products[]
   ├── useCategories()    → categories[]
   ├── useFooterLinks()   → footerLinks{}
   ├── useUserProfile()   → user, updateProfile()
   ├── useUserSettings()  → settings, saveSettings()
   ├── useNotices()       → notices[], markRead(), markAllRead()
   ├── useOrders()        → orders[], cancelOrder(), confirmDelivery()
   └── useUserCart()      → userCart{}, updateUserCart()
          │
          ▼
       CartBridge (main.jsx)
          │  truyền products + initialCart + onCartChange
          ▼
       CartProvider (CartContext.jsx)
          │  debounce 600ms → onCartChange(cart) → updateUserCart → api.js
          │
          └── useCart() → cart, quota, getStatus(), handleIncrement(),
                          handleDecrement(), handleBedDecrement(), ...
```

### DataContext — pattern `useResource`

```js
const useResource = (fetcher) => {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  useEffect(() => { fetcher().then(({ data, error }) => setState(...)); }, []);
  return { ...state, refetch };
};
```

Mọi resource server đều tuân theo pattern này. Khi cần thay API thật, chỉ cần sửa hàm fetcher trong `api.js` — interface của hook không đổi.

---

## Logic giỏ hàng & Quota

### Quy tắc quota

| Suất cơm trong giỏ | Topping được phép | Đồ uống được phép |
| :----------------: | :---------------: | :---------------: |
|         0          |         0         |         0         |
|         1          |         2         |         1         |
|         2          |         4         |         2         |
|         n          |       n × 2       |       n × 1       |

> **Ngoại lệ:** Suất cơm thêm (có `id = 25`) không được tính vào maxTopping và maxDrink.
> Để thêm ngoại lệ khác, bổ sung id vào `QUOTA_EXCLUDED_BED_IDS` trong `CartContext.jsx`.

### `evaluateProductQuota` — pure function

```
Input:  productId, targetCart (snapshot), productsList
Output: { isBlocked, isTopping, isDrink, qty }
```

Được tái sử dụng ở hai nơi:

- `getStatus(id)` — đọc từ `cart` (state hiện tại) để render UI
- `handleIncrement` — đọc từ `prevCart` bên trong `setCart(prev => ...)` để đảm bảo đúng thứ tự batch update

### Debounce sync lên server

```
User bấm tăng/giảm nhanh liên tục
    → mỗi thay đổi reset timer 600ms
    → chỉ gọi updateUserCart(cart) sau 600ms yên tĩnh cuối cùng
```

> **Lưu ý:** quá trình sync và lấy thông tin cart chỉ được thực hiện sau khi đăng nhập

---

## Danh sách trang

### Component pages

| Route (page state) | Component      | Mô tả                                           |
| ------------------ | -------------- | ----------------------------------------------- |
| `"home"`           | `App.jsx`      | Trang chủ — danh mục + lưới sản phẩm            |
| `"login"`          | `Login.jsx`    | Đăng nhập — SĐT + mật khẩu (ẩn/hiện)            |
| `"register"`       | `Register.jsx` | Đăng ký — form 2 cột + validation               |
| `"account"`        | `Account.jsx`  | Tài khoản — profile, cài đặt, đơn hàng, lịch sử |
| `"notices"`        | `Notice.jsx`   | Thông báo — lọc theo loại + modal chi tiết      |
| `"checkout"`       | `Checkout.jsx` | Thanh toán — đặt bàn, thanh toán, hoá đơn VAT   |

Điều hướng qua prop `onNavigate(page)` — không dùng React Router.

### HTML pages

| Tên        | Nơi chứa đường dẫn | Mô tả                                   |
| ---------- | ------------------ | --------------------------------------- |
| index.html | Com_dao_web/       | main page                               |
| help.html  | Navbar.jsx         | Thông tin chăm sóc khách hàng           |
| about.html | footerLinks.js     | Thông tin về quán/đội ngũ nhân viên/dev |
| ref.html   | footerLinks.js     | Tài liệu tham khảo                      |

> **Lưu ý:** có 1 số link điều hướng được đưa vào trong footerLinks.js

---

## CSS & Theme

Toàn bộ token màu sắc nằm trong `src/styles/variables.css`:

```css
:root {
  --bg: #111110; /* Nền toàn trang */
  --surface: #1a1a18; /* Card, navbar, sidebar */
  --surface2: #222220; /* Input, hover row */
  --surface3: #252523; /* Filter button */
  --border: #2e2e2c; /* Viền card, input */
  --text: #e8e6e1; /* Chữ chính */
  --text-muted: #7a7872; /* Chữ phụ, label */
  --text-dim: #4a4a48; /* Chữ mờ, hint */
  --accent: #c8a96e; /* Màu nhấn vàng */
  --accent-soft: rgba(200, 169, 110, 0.1);
  --accent-hover: #d4b87a;
  --red: #d64f3c; /* Cảnh báo, xoá */
}
```

### Chuyển đổi Light Mode

```js
// Bật light mode
document.documentElement.classList.add("light");

// Tắt (về dark)
document.documentElement.classList.remove("light");
```

Được điều khiển bởi toggle **"Giao diện tối"** trong `Account > PanelSettings`, lưu qua `api.updateUserSettings({ darkMode })`.

---

## API mock

File `src/api.js` mô phỏng toàn bộ server với độ trễ ngẫu nhiên (200–1300ms).

| Hàm                          | Method | Endpoint giả lập             |
| ---------------------------- | ------ | ---------------------------- |
| `fetchProducts()`            | GET    | /products                    |
| `fetchCategories()`          | GET    | /categories                  |
| `fetchFooterLinks()`         | GET    | /footer-links                |
| `fetchUserProfile()`         | GET    | /user/profile                |
| `updateUserProfile(fields)`  | PUT    | /user/profile                |
| `fetchUserSettings()`        | GET    | /user/settings               |
| `updateUserSettings(patch)`  | PUT    | /user/settings               |
| `fetchUserCart()`            | GET    | /cart                        |
| `updateUserCart(cartData)`   | PUT    | /cart                        |
| `fetchOrders()`              | GET    | /orders                      |
| `placeOrder(payload)`        | POST   | /orders                      |
| `cancelOrder(id)`            | PATCH  | /orders/:id/cancel           |
| `confirmDelivery(id)`        | PATCH  | /orders/:id/confirm-delivery |
| `fetchNotices()`             | GET    | /notices                     |
| `markNoticeRead(id)`         | PATCH  | /notices/:id/read            |
| `markAllNoticesRead()`       | PATCH  | /notices/read-all            |
| `validatePromo(code)`        | POST   | /promo/validate              |
| `login({ phone, password })` | POST   | /auth/login                  |
| `register(fields)`           | POST   | /auth/register               |

Mọi hàm trả về `{ data, error }` — không bao giờ throw, caller luôn xử lý được.

---

## Hướng dẫn mở rộng

### Thay API thật vào

```js
// api.js — thay delay + DB bằng fetch thật
export async function fetchProducts() {
  const res = await fetch("/api/products", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return { data, error: null };
}
```

Interface `{ data, error }` không thay đổi → DataContext và các hook không cần sửa.

### Thêm trang mới

```js
// App.jsx
if (page === "newpage") return <NewPage onNavigate={setPage} />;
```

```jsx
// Navbar.jsx — thêm vào NAV_LINKS và onClick handler
const NAV_LINKS = ["Trang chủ", "Thông báo", "CSKH", "NAV_LINK mới"];

<ul className="navbar__links">
  {NAV_LINKS.map((link) => (
    <li key={link}>
      <a
        href="#"
        className={
          (link === "Trang chủ" && currentPage === "home") ||
          (link === "Thông báo" && currentPage === "notices") ||
          link === "NAV_LINK mới"
            ? "active"
            : ""
        }
        onClick={(e) => {
          e.preventDefault();
          if (link === "Trang chủ") onNavigate?.("home");
          if (link === "Thông báo") onNavigate?.("notices");
          if (link === "NAV_LINK mới") onNavigate?.("newpage");
          if (link === "CSKH") {
            // Trả về '/' hoặc '/ten-repo/'
            const baseUrl = import.meta.env.BASE_URL;
            const path = `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}pages/help.html`;
            window.open(path, "_blank");
          }
          //hoặc dùng window.open mở tab mới
          if (link === "NAV_LINK mới") {
            // Trả về '/' hoặc '/ten-repo/'
            const baseUrl = import.meta.env.BASE_URL;
            const path = `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}pages/newpage.html`;
            window.open(path, "_blank");
          }
        }}
      >
        {link === "Thông báo" ? (
          <span className="notice-trigger">
            {link}
            {unreadCount > 0 && <span className="notice-trigger__dot" />}
          </span>
        ) : (
          link
        )}
      </a>
    </li>
  ))}
</ul>;
```

```js
//footerLinks.js
export const SOCIALS = [
  { icon: "𝕏", link: "https://x.com/?lang=vi" },
  { icon: "Z", link: "https://zalo.me/pc" },
  { icon: "f", link: "https://www.facebook.com/?locale=vi_VN" },
  { icon: "ig", link: "https://www.instagram.com/" },
  { icon: "i", link: path + "ref.html" },
  //{ icon: "nội dung icon mới (có thể là html String)", link: "đường dẫn mới" }
];

export const FOOTER_LINKS = {
  "Về chúng tôi": [
    { content: "Giới thiệu", link: path + "about.html" },
    { content: "Góp ý", link: "#" }, //thay # bằng đường dẫn thật
    { content: "Báo lỗi", link: "#" },
  ],
  "Khám phá": [
    { content: "Chính sách bảo mật", link: "#" },
    { content: "Điều khoản dịch vụ", link: "#" },
    {
      content: "Chính sách hợp tác",
      link: "https://le-thanh-01.github.io/game_of_life/",
    },
  ],
  /*
  "Mục mới": [
  {content: "Nội dung mới", link: "đường link mới"},
  ],
*/
};
```

### Thêm skeleton mới

```jsx
// Skeleton.jsx
export function MyFeatureSkeleton() {
  return (
    <div className="my-skeleton">
      <Skeleton height="14px" width="60%" />
      <Skeleton height="38px" radius="8px" />
    </div>
  );
}
```

### Thêm sản phẩm mới

#### Chỉnh sửa trực tiếp trong database hoặc DB mô phỏng tại api.js:

```js
//api.js
const DB = {
  products: [
    //set
    {
      id: 1,
      name: "Lạp xưởng + bò + đậu",
      price: "33.000đ",
      cats: ["best-seller", "set"],
      url: "/img/lap-xuong-bo-dau.jpg",
      badge: "hot",
    },
    ...{
      id: 102,
      name: "Coca",
      price: "10.000đ",
      cats: ["drink"],
      url: "/img/coca.jpg",
    },
    {
      id: 3004,
      name: "Chả giò",
      price: "10.000đ",
      cats: ["topping"],
      url: "/img/cha-gio.jpg",
    },
  ],
};
```

**Lưu ý:** mục cats của product phải tồn tại trong category, badge có thể thiết lập là **"hot"** hoặc **"new"**

#### Có thể thêm category mới:

```js
//api.js
  categories: [
    { id: "best-seller", label: "Best seller" },
    { id: "set", label: "Set" },
    { id: "bed", label: "Cơm" },
    { id: "topping", label: "Topping" },
    { id: "drink", label: "Đồ uống" },
    { id: "bootleg",label:"đè tem"}
  ],
```

Các trường khác có thể bổ sung theo cách tương tự

#### Thay đổi logic tính toán

Các ràng buộc về product được cấu hình trong context/CartContext.jsx:

```jsx
//CartContext.jsx

//Bổ sung suất cơm ngoại lệ (suất cơm sẽ không được sử dụng để mở thêm số topping và drink được phép)
const QUOTA_EXCLUDED_BED_IDS = new Set([25, 36]);

//Thay đổi ràng buộc giới hạn topping và drink trong evaluateProductQuota và quota
const evaluateProductQuota = (productId, targetCart, productsList) => {
  ...
  const maxToppings = totalBeds * 3;
  ...
  const maxDrinks = totalBeds * 2;
}
...
const quota = useMemo(() => {
...
const maxToppings = totalBeds * 3;
const maxDrinks = totalBeds * 2;
...
})
//Lưu ý: giá trị của maxToppings và maxDrinks trong cả 2 hàm phải giống nhau

//Xử lý khi xung đột giữa số lượng suất cơm và số toppings/drinks đã chọn
const clearExtrasAfterBedDecrement = (updatedCart, productsList) => {

  const countableBeds = getCountableBeds(productsList);
  const remainingBeds = countableBeds.reduce(
    (s, p) => s + (updatedCart[p.id] || 0),
    0,
  );

  if (remainingBeds > 0) return updatedCart;

  const result = { ...updatedCart };
  productsList.forEach((p) => {
    if (p.cats?.includes("topping") || p.cats?.includes("drink")) {
      delete result[p.id];
    }
  });
  return result;
};
```
