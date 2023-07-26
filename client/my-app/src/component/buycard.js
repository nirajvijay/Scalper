import React, { useState, useEffect } from "react";
import "./buycard.css";
import Quantity from "./Quantity";
import Options from "./Options";
import { formatDate } from "./helpers"; // Import formatDate function
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderBook from "../OrderBook";
import axios from "axios";

export default function Buycard({ lastTradedPrice, onPnlFromCeUpdate }) {
  /* 
  use state initialization */
  const [strikePrices, setStrikePrices] = useState([]);
  const [niftybuyprice, setNiftyBuyPrice] = useState(null);
  const [niftystoplossprice, setNiftyStoplossPrice] = useState(null);
  const [niftycestoplossprice, setNiftyCeStoplossPrice] = useState(null);
  const [stoplossChecked, setStoplossChecked] = useState(false);
  const [cestoplossChecked, setCeStoplossChecked] = useState(false);
  const [trailingcestoplossChecked, setTrailingCeStoplossChecked] =
    useState(false);
  const [stoplossValue, setStoplossValue] = useState("");
  const [TrailingNIftyCEstoplossvalue, setTrailingNIftyCEstoplossvalue] =
    useState("");
  const [cestoplossValue, setCeStoplossValue] = useState("");
  const [trailcestoplossValue, setTrailCeStoplossValue] = useState("");
  const [isClicked, setIsClicked] = useState(false);
  const [lasttradedpriceforce, setLastTradedPriceForCe] = useState(null);
  const [optionsbuyprice, setOptionsBuyPrice] = useState("");
  const [optionspnl, setOptionsPnl] = useState("0");
  const [selectedstrikeprice, setSelectedStrikePrice] = useState(null);
  const [initialpricefortrail, setInitialPriceForTrail] = useState("");
  const [selectedceqty, setSelectedCeQty] = useState("");
  const [symbolceselected, setSymbolCeSelected] = useState("");

  const [tradeProfits, setTradeProfits] = useState([]);
  const [accumulatedProfit, setAccumulatedProfit] = useState(0);
  const [isTradeCompleted, setIsTradeCompleted] = useState(false);

  /* Add a flag to indicate whether to start real-time PNL calculation */
  const [startRealTimePnlCalc, setStartRealTimePnlCalc] = useState(false);

  /* for OrderBook */

  /* getting the thursday dates */
  function getNextThursdays() {
    const today = new Date();
    const daysUntilNextThursday = (4 - today.getDay() + 7) % 7;
    const nextThursdays = [];

    for (let i = 0; i < 3; i++) {
      const nextThursday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + daysUntilNextThursday + i * 7
      );
      nextThursdays.push(nextThursday);
    }

    return nextThursdays;
  }

  function renderOptions() {
    const nextThursdays = getNextThursdays();
    const options = nextThursdays.map((thursday) => (
      <option key={thursday.toISOString()} value={thursday.toISOString()}>
        {formatDate(thursday)}
      </option>
    ));
    return options;
  }

  /* getting strike prices from django */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/getStrike/");
      const strikePrices = response.data;

      setStrikePrices(strikePrices);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStrikeChange = (event) => {
    const selectedStrikePrice = event.target.value;
    setSelectedStrikePrice(selectedStrikePrice);
  };

  //fetching strike price ltp from django

  const fetchLastTradedPriceForCe = async () => {
    const symbol = generateSymbol(selectedstrikeprice);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/last_traded_price_ce/",
        { selectedstrike: symbol } //please remember to put symbol variable here
      );
      setLastTradedPriceForCe(response.data.latest_price);
    } catch (error) {
      console.log(error);
    }
  };

  /* using the 1 second fetching from server usage of websocket */
  useEffect(() => {
    // Fetch initial last traded price from the backend
    fetchLastTradedPriceForCe();

    // Start polling at a specified interval (e.g., every 5 seconds)
    const intervalId = setInterval(fetchLastTradedPriceForCe, 1000);

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [selectedstrikeprice]);

  // Function to generate the symbol to contact the server for executing buy/sell based on the given format

  const isLastThursdayOfMonth = (date) => {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    const lastThursday = new Date(nextMonth);
    lastThursday.setDate(lastThursday.getDate() - 1);
    while (lastThursday.getDay() !== 4) {
      lastThursday.setDate(lastThursday.getDate() - 1);
    }
    return (
      date.getMonth() === lastThursday.getMonth() &&
      date.getDate() === lastThursday.getDate()
    );
  };

  const generateSymbol = (selectedstrikeprice) => {
    const selectedExpiryDate = new Date(
      document.getElementById("callstrike").value
    );
    const selectedstrikepricece = selectedstrikeprice;

    const year = selectedExpiryDate.getFullYear().toString().substr(-2);
    const monthMap = {
      Jan: "1",
      Feb: "2",
      Mar: "3",
      Apr: "4",
      May: "5",
      Jun: "6",
      Jul: "7",
      Aug: "8",
      Sep: "9",
      Oct: "O",
      Nov: "N",
      Dec: "D",
    };
    const month = isLastThursdayOfMonth(selectedExpiryDate)
      ? selectedExpiryDate
          .toLocaleString("default", { month: "short" })
          .toUpperCase()
      : monthMap[
          selectedExpiryDate.toLocaleString("default", { month: "short" })
        ];
    const day = selectedExpiryDate.getDate().toString().padStart(2, "0");

    const isLastThursday = isLastThursdayOfMonth(selectedExpiryDate);

    // Generate the symbol based on whether it's the last Thursday or not
    let symbol;
    if (isLastThursday) {
      const underlyingSymbol = "NSE:NIFTY"; // Replace with actual underlying symbol
      const strike = selectedstrikepricece;
      const optionType = "CE";
      symbol = `${underlyingSymbol}${year}${month}${strike}${optionType}`;
    } else {
      const underlyingSymbol = "NSE:NIFTY"; // Replace with actual underlying symbol
      symbol = `${underlyingSymbol}${year}${monthMap[month]}${day}${selectedstrikepricece}CE`;
    }

    return symbol;
  };
  /* calculating nifty50 stoploss price  */

  const calculateNiftyStoplossPrice = () => {
    if (niftybuyprice !== null && stoplossChecked) {
      const calculatedStoplossPrice = niftybuyprice - stoplossValue;
      setNiftyStoplossPrice(calculatedStoplossPrice);
    }
  };

  const handleStoplossChange = (event) => {
    setStoplossChecked(event.target.checked);
  };

  const handleStoplossValueChange = (event) => {
    setStoplossValue(event.target.value);
  };
  const handleClick = () => {
    calculateNiftyStoplossPrice();
  };

  useEffect(() => {
    if (
      stoplossChecked &&
      niftystoplossprice !== 0 &&
      niftystoplossprice !== null &&
      niftystoplossprice !== ""
    ) {
      toast.success("entered nifty stoploss");
      if (lastTradedPrice <= niftystoplossprice) {
        // Call your separate function here
        toast.success("successfull");
        handleSellBtClick();
        setNiftyStoplossPrice(null);
      }
    }
  }, [niftystoplossprice, lastTradedPrice, stoplossChecked]);

  /* calculating opyions ce stoploss price  */

  const calculateNiftyCEStoplossPrice = () => {
    if (
      optionsbuyprice !== null &&
      cestoplossChecked &&
      !trailingcestoplossChecked
    ) {
      const calculatedNiftyCEStoplossPrice = cestoplossValue;
      setNiftyCeStoplossPrice(calculatedNiftyCEStoplossPrice);
    }
  };
  useEffect(() => {
    if (
      cestoplossChecked &&
      niftycestoplossprice !== 0 &&
      niftycestoplossprice !== null &&
      niftycestoplossprice !== "" &&
      !trailingcestoplossChecked
    ) {
      if (lasttradedpriceforce <= niftycestoplossprice) {
        // Call your separate function here
        toast.success("SL-HIT");
        handleSellBtClick();
        setNiftyCeStoplossPrice(null);
      }
    }
  }, [niftycestoplossprice, lasttradedpriceforce, cestoplossChecked]);
  const handleCeStoplossChange = (event) => {
    setCeStoplossChecked(event.target.checked);
  };
  const handleCeStoplossValueChange = (event) => {
    setCeStoplossValue(event.target.value);
  };
  const handleClickCe = () => {
    calculateNiftyCEStoplossPrice();
  };

  /* realtime pnl calculation */

  const calculatePnl = (optionsbuyprice) => {
    if (
      optionsbuyprice !== null &&
      optionsbuyprice !== "" &&
      startRealTimePnlCalc
    ) {
      const calculatedPnlbeforerounding =
        (lasttradedpriceforce - optionsbuyprice) * selectedceqty - 40;
      const calculatedPnl = calculatedPnlbeforerounding.toFixed(2);

      setOptionsPnl(calculatedPnl);
    } else {
      setOptionsPnl("0");
    }
  };

  useEffect(() => {
    calculatePnl(optionsbuyprice);
  }, [lasttradedpriceforce]);

  /* placing buy order function  */

  async function handleBuyBtClick() {
    try {
      const symbolce = generateSymbol(selectedstrikeprice);
      setSymbolCeSelected(symbolce);

      const selectedQty = document.getElementById("qty").value;
      const qty = parseInt(selectedQty) * 50; // Multiply selected quantity by 50
      setSelectedCeQty(qty);
      // Update niftybuyprice with the current lastTradedPrice
      setNiftyBuyPrice(lastTradedPrice);
      setOptionsBuyPrice(lasttradedpriceforce);
      setInitialPriceForTrail(lasttradedpriceforce);
      const checkbox = document.getElementById("LIMIT");
      const type1 = checkbox.checked ? 1 : 2;
      const limitPrice = checkbox.checked
        ? parseFloat(document.getElementById("LIMITenter").value)
        : 0;
      const orderData = {
        symbol: symbolce,
        qty: 1,
        type: type1,
        side: 1,
        productType: "INTRADAY",
        limitPrice: limitPrice,
        stopPrice: 0,
        validity: "DAY",
        disclosedQty: 0,
        offlineOrder: "False",
      };
      console.log(orderData);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/placeOrder/",
        orderData
      );

      setStartRealTimePnlCalc(true);

      console.log(response.data);
      if (response.data.s === "ok") {
        toast.success(
          "Order Submitted Successfully. Your Order Ref. No. " +
            response.data.id
        );
        setStartRealTimePnlCalc(true);
      }

      calculatePnl(optionsbuyprice);
    } catch (error) {
      console.log(error);
    }
  }

  /* placing sell order function */

  async function handleSellBtClick() {
    try {
      // Check if the NIFTY PE stop loss is checked and niftystoplossprice is available
      const stopPrice =
        cestoplossChecked && niftycestoplossprice !== null
          ? parseFloat(niftycestoplossprice)
          : 0;
      const limitPrice =
        cestoplossChecked && niftycestoplossprice !== null
          ? parseFloat(niftycestoplossprice)
          : 0;
      const type = cestoplossChecked ? 4 : 2; // Set type to 4 when stoplossChecked is true, otherwise set it to 2
      const orderData = {
        symbol: symbolceselected,
        qty: selectedceqty,
        type: type,
        side: -1,
        productType: "INTRADAY",
        limitPrice: limitPrice,
        stopPrice: stopPrice,
        validity: "DAY",
        disclosedQty: 0,
        offlineOrder: "False",
      };
      console.log("Order Data:", orderData);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/sellOrder/",
        orderData
      );
      toast.success("Order SuccessFull:SELL ");

      // Calculate the profit for the current trade
      const currentTradeProfit = (
        (lasttradedpriceforce - optionsbuyprice) * selectedceqty -
        40
      ).toFixed(2);

      // Update the accumulated profit by adding the profit from the current trade
      setAccumulatedProfit(
        (prevProfit) => prevProfit + parseFloat(currentTradeProfit)
      );

      // Add the final profit of the current trade to the tradeProfits state
      setTradeProfits((prevProfits) => [
        ...prevProfits,
        parseFloat(currentTradeProfit),
      ]);

      setOptionsBuyPrice("");
      setStartRealTimePnlCalc(false);

      // Uncheck the stoploss checkbox
      setStoplossChecked(false);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    // Call the callback function and pass the data to the parent component
    onPnlFromCeUpdate(accumulatedProfit);
  }, [accumulatedProfit]);

  /*  using arrow keys and enter key function activation */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowUp") {
        // Update niftybuyprice with the current lastTradedPrice
        setNiftyBuyPrice(lastTradedPrice);
        handleBuyBtClick();
      } else if (!stoplossChecked && event.key === "ArrowDown") {
        // 40 is the key code for the down arrow
        handleSellBtClick();
      } else if (event.key === "Enter") {
        const focusedElement = document.activeElement;
        const inputId = focusedElement.id;

        if (inputId === "stoplossValue") {
          // Call your function here
          console.log("id");
          calculateNiftyStoplossPrice();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [lastTradedPrice, handleBuyBtClick]);

  return (
    <div className="containercard">
      <ToastContainer />
      <h1 className="buy">CE</h1>
      <label className="labelbuy" htmlFor="callstrike">
        EXP
      </label>
      <Options nextThursdays={getNextThursdays()} />
      <label className="labelQuantity" htmlFor="callstrike">
        QTY:
      </label>
      <Quantity />
      <label className="labelstrike" htmlFor="strikepri">
        CE STRIKE
      </label>
      <div className="strikepricece" id="strikepri">
        {strikePrices.map((strikePrice, index) => (
          <label key={strikePrice} className={`strikeprice-label-${index}`}>
            <input
              type="radio"
              className={`strikeprice-input-${index}`}
              name="strikePrice"
              value={strikePrice}
              defaultChecked={index === 1}
              // Select 2nd radio button by default
              onChange={handleStrikeChange}
            />
            {strikePrice}
          </label>
        ))}
      </div>
      <button className="buybuttonce noselect" onClick={handleBuyBtClick}>
        BUY
      </button>
      <h2 className="ltpceview">{lasttradedpriceforce}</h2>
      <div className="stoploss-checkbox">
        <input
          type="checkbox"
          id="stoploss"
          checked={stoplossChecked}
          onChange={handleStoplossChange}
        />
        <label htmlFor="stoploss" className="slnifty">
          SL-NIFTY
        </label>
      </div>
      {stoplossChecked && (
        <div className="stoploss-input">
          <label htmlFor="stoplossValue" className="SLP">
            PRICE
          </label>
          <input
            type="number"
            id="stoplossValue"
            value={stoplossValue}
            onChange={handleStoplossValueChange}
          />
          <button className="triggerstoploss" onClick={handleClick}>
            SL
          </button>
        </div>
      )}
      {/* stoplossniftyce */}
      <div className="stoplossce-checkbox">
        <input
          type="checkbox"
          id="stoplossce"
          checked={cestoplossChecked}
          onChange={handleCeStoplossChange}
        />
        <label htmlFor="stoplossce" className="slniftyce">
          NIFTYCE
        </label>
      </div>
      {cestoplossChecked && (
        <div className="stoploss-inputce">
          <label htmlFor="stoplossValueniftyce" className="SLPce"></label>
          <input
            type="number"
            id="stoplossValueniftyce"
            value={cestoplossValue}
            onChange={handleCeStoplossValueChange}
          />
          <button className="triggerstoplossce" onClick={handleClickCe}>
            SL
          </button>
        </div>
      )}
      {/* <h1 className="niftybuyprice">{niftybuyprice}</h1> */}
      <button className="sellbuttonce noselect" onClick={handleSellBtClick}>
        SELL
      </button>
      {/* options single pnl */}
      <h2 className="pnlofce">{optionspnl}</h2>

      <label for="LIMIT" className="labellimit">
        LIMIT
      </label>
      <input type="checkbox" id="LIMIT" name="LIMIT"></input>
      <input type="number" id="LIMITenter" name="LIMIT"></input>
      <table>
        <thead>
          <tr>
            <th>NIFTYBUY</th>
            <th>OPTIONSBUY</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{niftybuyprice}</td>
            <td>{optionsbuyprice}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
