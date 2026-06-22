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
    {
      id: 2,
      name: "Set mix ngẫu nhiên",
      price: "33.000đ",
      cats: ["best-seller", "set"],
      url: "/img/tu-mix.jpg",
      badge: "hot",
    },
    {
      id: 3,
      name: "Set rong biển",
      price: "33.000đ",
      cats: ["best-seller", "set"],
      url: "/img/set-rong-bien.jpg",
      badge: "new",
    },

    {
      id: 4,
      name: "Cơm mắm tép chưng thịt",
      price: "33.000đ",
      cats: ["set"],
      url: "/img/com-mam-tep-chung-thit.webp",
    },

    {
      id: 7,
      name: "Cơm trứng tráng thịt bằm",
      price: "33.000đ",
      cats: ["set"],
      url: "/img/com-trung-trang-thit-bam.jfif",
    },
    {
      id: 8,
      name: "Cơm đùi gà sốt mắm",
      price: "33.000đ",
      cats: ["set"],
      url: "/img/com-dui-ga-sot-mam.jfif",
    },
    {
      id: 9,
      name: "Spaghetti",
      price: "40.000đ",
      cats: ["best-seller", "set"],
      url: "/img/spaghetti.jpg",
    },
    {
      id: 10,
      name: "Bún trộn đặc biệt",
      price: "40.000đ",
      cats: ["best-seller", "set"],
      url: "/img/bun-tron-dac-biet.jpg",
    },

    //Cơm
    {
      id: 21,
      name: "Cơm đảo",
      price: "33.000đ",
      cats: ["bed"],
      url: "/img/Com-dao.jpg",
    },
    {
      id: 22,
      name: "Cơm trắng",
      price: "33.000đ",
      cats: ["bed"],
      url: "/img/Com-trang.jpg",
    },
    {
      id: 23,
      name: "Cơm đảo (mang về)",
      price: "33.000đ",
      cats: ["bed"],
      url: "/img/Com-dao.jpg",
    },
    {
      id: 24,
      name: "Cơm trắng (mang về)",
      price: "33.000đ",
      cats: ["bed"],
      url: "/img/Com-trang.jpg",
    },
    {
      id: 25,
      name: "Cơm thêm (cho suất mang về)",
      price: "10.000đ",
      cats: ["bed"],
      url: "/img/Com-dao.jpg",
    },

    //Topping
    {
      id: 55,
      name: "Lạp xưởng",
      cats: ["topping"],
      url: "/img/lap-xuong.jpg",
    },
    {
      id: 56,
      name: "Thịt bò",
      cats: ["topping"],
      url: "/img/thit-bo.jpg",
    },
    {
      id: 57,
      name: "Gà xiên",
      cats: ["topping"],
      url: "/img/ga-xien.jpg",
    },
    {
      id: 58,
      name: "Đùi gà",
      cats: ["topping"],
      url: "/img/dui-ga.jpg",
    },
    {
      id: 59,
      name: "Chả cá",
      cats: ["topping"],
      url: "/img/cha-ca.jpg",
    },
    {
      id: 60,
      name: "Thịt băm",
      cats: ["topping"],
      url: "/img/thit-bam.jfif",
    },
    {
      id: 61,
      name: "Thịt luộc",
      cats: ["topping"],
      url: "/img/thit-luoc.jfif",
    },
    {
      id: 62,
      name: "Thịt kho tàu",
      cats: ["topping"],
      url: "/img/thit-kho-tau.jpg",
    },
    {
      id: 63,
      name: "Thịt nướng",
      cats: ["topping"],
      url: "/img/thit-nuong.jpg",
    },
    {
      id: 64,
      name: "Trứng ốp la",
      cats: ["topping"],
      url: "/img/trung-op-la.webp",
    },
    {
      id: 65,
      name: "Mọc",
      cats: ["topping"],
      url: "/img/moc.jfif",
    },
    {
      id: 66,
      name: "Chả nem",
      cats: ["topping"],
      url: "/img/cha-nem.jpg",
    },
    {
      id: 67,
      name: "Lườn ngỗng",
      cats: ["topping"],
      url: "/img/luon-ngong.jfif",
    },
    {
      id: 68,
      name: "Chả lá lốt",
      cats: ["topping"],
      url: "/img/cha-la-lot.jfif",
    },
    {
      id: 69,
      name: "Nem nướng",
      cats: ["topping"],
      url: "/img/nem-nuong.jpg",
    },
    {
      id: 70,
      name: "Thịt heo xào mộc nhĩ nấm hương",
      cats: ["topping"],
      url: "/img/thit-heo-xao-moc-nhi-nam-huong.jpg",
    },
    {
      id: 71,
      name: "Đậu rán",
      cats: ["topping"],
      url: "/img/dau-ran.jpg",
    },
    {
      id: 101,
      name: "Trà đá",
      price: "Miễn phí",
      cats: ["drink"],
      url: "/img/tra-da.webp",
      badge: "hot",
      free: true,
    },
    {
      id: 102,
      name: "Coca",
      price: "10.000đ",
      cats: ["drink"],
      url: "/img/coca.jpg",
    },
  ],

  categories: [
    { id: "best-seller", label: "Best seller" },
    { id: "set", label: "Set" },
    { id: "bed", label: "Cơm" },
    { id: "topping", label: "Topping" },
    { id: "drink", label: "Đồ uống" },
  ],

  user: {
    id: "u-001",
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    dob: "",
    tier: "Khách thân thiết",
  },

  loginState: false,

  settings: {
    notif: true,
    sms: false,
    promo: true,
    darkMode: true,
    twoFA: false,
  },

  orders: [
    // {
    //   id: "#DH-20240401",
    //   date: "01/04/2024",
    //   status: "pending",
    //   items: [
    //     { name: "Bún trộn đặc biệt", qty: 1, price: "70.000đ", emoji: "🍜" },
    //   ],
    //   total: "70.000đ",
    // },
    // {
    //   id: "#DH-20240315",
    //   date: "15/03/2024",
    //   status: "delivered",
    //   items: [
    //     { name: "Lẩu xương + bữ + đậu", qty: 1, price: "31.000đ", emoji: "🍲" },
    //     { name: "Set nem nướng", qty: 2, price: "70.000đ", emoji: "🥩" },
    //   ],
    //   total: "171.000đ",
    // },
    // {
    //   id: "#DH-20240228",
    //   date: "28/02/2024",
    //   status: "delivered",
    //   items: [
    //     { name: "Trà sữa trân châu", qty: 2, price: "35.000đ", emoji: "🧋" },
    //     { name: "Bánh flan trứng", qty: 3, price: "25.000đ", emoji: "🍮" },
    //   ],
    //   total: "145.000đ",
    // },
    // {
    //   id: "#DH-20240210",
    //   date: "10/02/2024",
    //   status: "cancelled",
    //   items: [{ name: "Set rong biển", qty: 1, price: "33.000đ", emoji: "🍱" }],
    //   total: "33.000đ",
    // },
  ],

  notices: [
    {
      id: 1,
      type: "promo",
      read: false,
      title: "Khuyến mãi tháng 4 — Giảm 20% toàn bộ Set",
      date: "2024-04-05",
      summary: "Trong suốt tháng 4, tất cả các Set món được giảm 20%.",
      content:
        "Chào mừng bạn đến với chương trình khuyến mãi tháng 4!\n\nTừ ngày 01/04 đến 30/04/2024, toàn bộ các Set món trong thực đơn được giảm 20% so với giá niêm yết.\n\n📌 Điều kiện áp dụng:\n• Áp dụng cho tất cả khách hàng, không giới hạn số lần sử dụng\n• Có thể kết hợp cùng topping và đồ uống miễn phí kèm set\n• Không áp dụng đồng thời với các mã giảm giá khác\n\nHãy nhanh tay đặt món để tận hưởng ưu đãi hấp dẫn này nhé!",
    },
    {
      id: 2,
      type: "system",
      read: false,
      title: "Cập nhật chính sách đặt bàn trước",
      date: "2024-04-02",
      summary: "Thời gian đặt tối thiểu nay là 2 giờ trước khi đến.",
      content:
        "Kính gửi Quý khách hàng,\n\nChúng tôi xin thông báo một số thay đổi trong chính sách đặt bàn trước có hiệu lực từ ngày 01/04/2024:\n\n🕐 Thời gian đặt bàn:\n• Tối thiểu: 2 giờ trước giờ đến\n• Tối đa: 7 ngày trước\n\n❌ Chính sách huỷ bàn:\n• Huỷ trước 2 giờ: Miễn phí hoàn toàn\n• Huỷ trong vòng 2 giờ: Tính phí giữ chỗ 20.000đ/bàn",
    },
    {
      id: 3,
      type: "order",
      read: true,
      title: "Đơn hàng #DH-20240315 đã được giao thành công",
      date: "2024-03-15",
      summary: "Đơn hàng của bạn đã được giao thành công.",
      content:
        "Xin chào Nguyễn Văn Hùng,\n\nĐơn hàng #DH-20240315 của bạn đã được giao thành công vào lúc 12:35 ngày 15/03/2024.\n\n🛍 Chi tiết đơn hàng:\n• Lẩu xương + bữ + đậu × 1 — 31.000đ\n• Set nem nướng × 2 — 140.000đ\n• Tổng cộng: 171.000đ\n\nCảm ơn bạn đã chọn Food. Hẹn gặp lại! 🍜",
    },
    {
      id: 4,
      type: "promo",
      read: true,
      title: "Mã FOOD10 — Giảm 10% cho lần đặt hàng tiếp theo",
      date: "2024-03-10",
      summary: "Bạn nhận được mã giảm giá FOOD10. Hạn dùng đến 31/03/2024.",
      content:
        "Cảm ơn bạn đã là khách hàng thân thiết!\n\n🎁 Mã giảm giá: FOOD10\n💰 Mức giảm: 10% trên tổng hoá đơn\n📅 Hạn sử dụng: 31/03/2024\n\n📌 Lưu ý:\n• Áp dụng cho đơn hàng từ 50.000đ trở lên\n• Mỗi tài khoản chỉ dùng được 1 lần",
    },
    {
      id: 5,
      type: "system",
      read: true,
      title: "Thực đơn tháng 3 — Ra mắt món mới",
      date: "2024-03-01",
      summary: "Chúng tôi vừa cập nhật thực đơn tháng 3 với 3 món mới.",
      content:
        "Thực đơn tháng 3 đã chính thức ra mắt!\n\n🍮 Bánh flan trứng — 25.000đ\n🧋 Trà sữa trân châu — 35.000đ\n🍜 Bún trộn đặc biệt — 70.000đ\n\nĐặt hàng ngay để trải nghiệm những hương vị mới nhất!",
    },
    {
      id: 6,
      type: "order",
      read: true,
      title: "Đơn hàng #DH-20240228 đã được xác nhận",
      date: "2024-02-28",
      summary: "Đơn hàng đang được chuẩn bị. Dự kiến phục vụ trong 15-20 phút.",
      content:
        "Xin chào Nguyễn Văn Hùng,\n\nĐơn hàng #DH-20240228 của bạn đã được xác nhận!\n\n⏱ Thời gian dự kiến: 15–20 phút\n📍 Bàn số: 2\n\n🛍 Tổng cộng: 145.000đ\n• Thanh toán: Tiền mặt",
    },
  ],

  cart: {},
};
