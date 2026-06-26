import { useCart } from "../../../context/CartContext";
import "./Quota.css";
/* ═══════════════════════════════════════════
   QuotaBanner
   ═══════════════════════════════════════════ */
export function QuotaBanner({ type, quota }) {
  const {
    hasBed,
    totalBeds,
    maxToppings,
    maxDrinks,
    usedToppings,
    usedDrinks,
    toppingFull,
    drinkFull,
  } = quota;

  // if (type === "topping") {
  //   if (!hasBed) {
  //     return (
  //       <div className="quota-banner quota-banner--none">
  //         <span className="quota-banner__icon">
  //           <svg
  //             width="14"
  //             height="14"
  //             viewBox="0 0 24 24"
  //             fill="none"
  //             stroke="currentColor"
  //             strokeWidth="2"
  //           >
  //             <circle cx="12" cy="12" r="10" />
  //             <line x1="12" y1="8" x2="12" y2="12" />
  //             <line x1="12" y1="16" x2="12.01" y2="16" />
  //           </svg>
  //         </span>
  //         {/* <div className="quota-banner__text">
  //           Chưa có Cơm trong giỏ hàng. Mỗi <strong>Suất</strong> được kèm{" "}
  //           <strong>2 topping</strong>
  //           {" (mỗi loại 1 phần)"}.
  //         </div> */}
  //       </div>
  //     );
  //   }
  //   const variant = toppingFull ? "full" : "info";
  //   const pct = Math.min(100, Math.round((usedToppings / maxToppings) * 100));
  //   return (
  //     <div className={`quota-banner quota-banner--${variant}`}>
  //       <span className="quota-banner__icon">
  //         {toppingFull ? (
  //           <svg
  //             width="14"
  //             height="14"
  //             viewBox="0 0 24 24"
  //             fill="none"
  //             stroke="#ff7c6e"
  //             strokeWidth="2"
  //           >
  //             <circle cx="12" cy="12" r="10" />
  //             <line x1="15" y1="9" x2="9" y2="15" />
  //             <line x1="9" y1="9" x2="15" y2="15" />
  //           </svg>
  //         ) : (
  //           <svg
  //             width="14"
  //             height="14"
  //             viewBox="0 0 24 24"
  //             fill="none"
  //             stroke="var(--accent)"
  //             strokeWidth="2"
  //           >
  //             <polyline points="20 6 9 17 4 12" />
  //           </svg>
  //         )}
  //       </span>
  //       <div className="quota-banner__text">
  //         {toppingFull ? (
  //           <>
  //             Đã dùng hết topping. Bạn có <strong>{totalBeds} Suất cơm</strong>{" "}
  //             → tối đa <strong>{maxToppings} topping</strong>.
  //           </>
  //         ) : (
  //           <>
  //             Bạn có <strong>{totalBeds} Suất cơm</strong> → được chọn thêm{" "}
  //             <strong>{maxToppings - usedToppings} topping</strong>
  //             (còn {maxToppings - usedToppings}/{maxToppings}).
  //             <br />
  //             <span style={{ fontSize: "0.9em", opacity: 0.8 }}>
  //               *Lưu ý: Tối đa <strong>{totalBeds} phần</strong> cho mỗi loại
  //               topping.
  //             </span>
  //           </>
  //         )}
  //         <div className="quota-banner__bar">
  //           <div className="quota-bar">
  //             <div
  //               className={`quota-bar__fill ${toppingFull ? "quota-bar__fill--full" : ""}`}
  //               style={{ width: `${pct}%` }}
  //             />
  //           </div>
  //           <span className="quota-bar__label">
  //             {usedToppings}/{maxToppings}
  //           </span>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (type === "drink") {
    if (!hasBed) {
      return (
        <div className="quota-banner quota-banner--none">
          <span className="quota-banner__icon">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
          <div className="quota-banner__text">
            Chưa có Cơm/Set trong giỏ hàng. Mỗi <strong>Suất</strong> được kèm{" "}
            <strong>1 đồ uống</strong>.
          </div>
        </div>
      );
    }
    const variant = drinkFull ? "full" : "info";
    // useEffect(() => {
    //   console.log("drinkfull: ", drinkFull);
    // }, [drinkFull]);
    const pct = Math.min(100, Math.round((usedDrinks / maxDrinks) * 100));
    return (
      <div className={`quota-banner quota-banner--${variant}`}>
        <span className="quota-banner__icon">
          {drinkFull ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff7c6e"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <div className="quota-banner__text">
          {drinkFull ? (
            <>
              Đã dùng hết đồ uống. Bạn có <strong>{totalBeds} Cơm/Set</strong> →
              tối đa <strong>{maxDrinks} đồ uống</strong>.
            </>
          ) : (
            <>
              Bạn có <strong>{totalBeds} Cơm/Set </strong> → được chọn thêm{" "}
              <strong>{maxDrinks - usedDrinks} đồ uống</strong> (còn{" "}
              {maxDrinks - usedDrinks}/{maxDrinks}).
            </>
          )}
          <div className="quota-banner__bar">
            <div className="quota-bar">
              <div
                className={`quota-bar__fill ${drinkFull ? "quota-bar__fill--full" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="quota-bar__label">
              {usedDrinks}/{maxDrinks}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════
   Wrapper helpers
   ═══════════════════════════════════════════ */
export function QuotaBannerWrapper({ type }) {
  const { quota } = useCart();
  return <QuotaBanner type={type} quota={quota} />;
}
