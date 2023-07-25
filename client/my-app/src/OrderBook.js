import Sidebar from "./component/sidebar";
import "./OrderBook.scss";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderBook = () => {
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");

  const fetchData = async () => {
    // Make the HTTP request to fetch symbol and qty
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/order_book/");
      const { symbol, qty } = response.data;
      setSymbol(symbol);
      setQty(qty);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <p>Symbol: {symbol}</p>
      <p>Quantity: {qty}</p>
      <button onClick={fetchData}>Fetch Data</button>
      {/* Rest of your component */}
    </div>
  );
};

export default OrderBook;
/* export default function OrderBook() {
  return (
    <div>
      <h1>Hello OrderBook</h1>
      <div className="order-book-table-container">
        <table className="order-book-table">
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Symbol</th>
              <th>Executed Price</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>ABC</td>
              <td>10.50</td>
              <td>100</td>
              <td>Filled</td>
            </tr>
            
          </tbody>
        </table>
      </div>
      <Sidebar />
    </div>
  );
}
 */
