import React from "react";

function Options({ nextThursdays }) {
  function formatDate(date) {
    // ...
    const day = date.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  return (
    <select className="expiry" id="callstrike">
      {nextThursdays.map((thursday) => (
        <option key={thursday.toISOString()} value={thursday.toISOString()}>
          {formatDate(thursday)}
        </option>
      ))}
    </select>
  );
}

export default Options;
