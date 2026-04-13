import { FOOTER_LINKS } from "../../constants/footerLinks.js";
import "./Footer.css";

const SOCIALS = [
  { icon: "𝕏", link: "https://x.com/?lang=vi" },
  { icon: "Z", link: "https://zalo.me/pc" },
  { icon: "f", link: "https://www.facebook.com/?locale=vi_VN" },
  { icon: "ig", link: "https://www.instagram.com/" },
  { icon: "i", link: "/ref.html" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        {/* Logo column */}
        <div className="footer__logo-col">
          <div className="footer__logo">𝔽++</div>
          <div className="footer__tagline">
            Ẩm thực Việt — tinh tế trong từng món ăn.
          </div>
          <div className="footer__socials">
            {SOCIALS.map((s) => (
              <a
                key={s.icon}
                href={s.link}
                className="footer__social-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title} className="footer__col">
            <h4>{title}</h4>
            <ul>
              {links.map((link) => (
                <li key={link.content}>
                  <a href={link.link} target="_blank" rel="noopener noreferrer">
                    {link.content}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__bottom">
        <span className="footer__copy">4S - Cơm đảo Bách Khoa</span>
        <span className="footer__copy">
          <strong>12 Ngõ 30/18/3 Tạ Quang Bửu, P. Bạch Mai, Hà Nội</strong>
          <br />
          <strong>SĐT: 0987654321</strong>
        </span>
      </div>
    </footer>
  );
}
