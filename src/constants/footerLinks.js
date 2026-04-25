const baseUrl = import.meta.env.BASE_URL;
const path = `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}`;

export const SOCIALS = [
  { icon: "𝕏", link: "https://x.com/?lang=vi" },
  { icon: "Z", link: "https://zalo.me/pc" },
  { icon: "f", link: "https://www.facebook.com/?locale=vi_VN" },
  { icon: "ig", link: "https://www.instagram.com/" },
  { icon: "i", link: path + "ref.html" },
];

export const FOOTER_LINKS = {
  "Về chúng tôi": [
    { content: "Giới thiệu", link: path + "about.html" },
    { content: "Góp ý", link: "#" },
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
};
