import React from "react";

function Quantity() {
  function renderQtyOptions() {
    return [1, 2, 3, 4, 5, 6].map((qty) => (
      <option key={qty} value={qty}>
        {qty}
      </option>
    ));
  }

  return (
    <select className="qty" id="qty">
      {renderQtyOptions()}
    </select>
  );
}

export default Quantity;
