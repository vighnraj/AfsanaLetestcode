import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"; // Add this line

const GlobalTableScrollbar = () => {
  const scrollbarRef = useRef();
  const location = useLocation(); // Add this line

  useEffect(() => {
    const mainTable = document.getElementById("mainTableScroll");
    const scrollbar = scrollbarRef.current;

    if (mainTable && scrollbar) {
      scrollbar.firstChild.style.width = mainTable.scrollWidth + "px";

      const syncScroll = () => {
        scrollbar.scrollLeft = mainTable.scrollLeft;
      };
      const syncTable = () => {
        mainTable.scrollLeft = scrollbar.scrollLeft;
      };

      mainTable.addEventListener("scroll", syncScroll);
      scrollbar.addEventListener("scroll", syncTable);

      return () => {
        mainTable.removeEventListener("scroll", syncScroll);
        scrollbar.removeEventListener("scroll", syncTable);
      };
    }
  }, [location]); // Add location as dependency

  return (
    <div
      ref={scrollbarRef}
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100vw",
        height: "20px",
        overflowX: "auto",
        background: "#f8f9fa",
        borderTop: "1px solid #dee2e6",
        zIndex: 9999,
      }}
    >
      <div style={{ height: "1px" }}></div>
    </div>
  );
};

export default GlobalTableScrollbar;