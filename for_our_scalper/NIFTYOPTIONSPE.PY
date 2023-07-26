from fyers_api.Websocket import ws
from fyers_api import fyersModel
import os, time
import threading
import datetime as dt
import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="realtime",
        user="postgres",
        password="172717",
    )
    cursor = conn.cursor()
    print("Connection to PostgreSQL successful!")
except (Exception, psycopg2.Error) as e:
    print("Error connecting to PostgreSQL:", e)


def run_process_symbol_data(ws_accesstoken):
    data_type = "symbolData"
    with open("symbolpe.txt", "r") as f:
        symbol = f.read().splitlines()
        print(symbol)

    fs = ws.FyersSocket(
        access_token=ws_accesstoken, run_background=False, log_path=os.getcwd()
    )
    fs.websocket_data = custom_message
    fs.subscribe(symbol=symbol, data_type=data_type)
    fs.keep_running()


def custom_message(msg):
    symbol_data = {}
    for data in msg:
        try:
            symbol = data["symbol"]
            ltp = data["ltp"]
            timestamp = time.strftime(
                "%y-%m-%d %H:%M:%S", time.localtime(data["timestamp"])
            )

            # Modify symbol name for table name (replace ":" with "_")
            modified_table_name = symbol.replace(":", "_")

            cursor.execute(f"DELETE FROM {modified_table_name}")
            # The modified table name exists as a table in the database
            cursor.execute(
                f"INSERT INTO {modified_table_name} (TS, LTP) VALUES (%s, %s)",
                (timestamp, ltp),
            )
            conn.commit()

            # Print the values for all symbols
            print(f"TIME :{timestamp}, Symbol: {symbol}, LTP: {ltp}")

        except Exception as e:
            print(e)
            pass

    # Print the values for all symbols
    for symbol, ltp in symbol_data.items():
        print(f"Symbol: {symbol}, LTP: {ltp}")


def main():
    # Connect to the PostgreSQL database
    db = psycopg2.connect(
        host="localhost",
        port=5432,
        database="realtime",
        user="postgres",
        password="172717",
    )
    c = db.cursor()
    # Fetch the access token from the database
    c.execute("SELECT token FROM serverapp_accesstoken")
    row = c.fetchone()
    access_token = row[0]

    app_id = "C3HL2IWT0X-100"
    ws_accesstoken = f"{app_id}:{access_token}"
    run_process_symbol_data(ws_accesstoken)


if __name__ == "__main__":
    main()
