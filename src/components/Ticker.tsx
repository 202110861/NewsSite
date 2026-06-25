import { useEffect, useState } from "react";
import { TICKER_ITEMS } from "../data/newsData";

export default function Ticker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TICKER_ITEMS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex border border-gray-300 my-3 sm:my-4 h-10 sm:h-11">
      <div className="bg-blue-700 text-white text-xs sm:text-[13px] font-medium flex items-center justify-center w-16 sm:w-[90px] flex-shrink-0">
        단신
      </div>
      <div className="flex-1 flex items-center px-2.5 sm:px-3.5 overflow-hidden bg-gray-50 min-w-0">
        <a
          href="#article"
          className="text-[13px] sm:text-sm text-gray-700 no-underline whitespace-nowrap overflow-hidden text-ellipsis block w-full"
        >
          {TICKER_ITEMS[index].text}
        </a>
      </div>
    </div>
  );
}
