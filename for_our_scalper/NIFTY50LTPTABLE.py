from fyers_api import fyersModel
from fyers_api.Websocket import ws
import os
import pandas as pd
import datetime as dt
import psycopg2
import time

# Connect to the PostgreSQL database
db = psycopg2.connect(
    host="localhost", port=5432, database="realtime", user="postgres", password="172717"
)
c = db.cursor()
# Fetch the access token from the database
c.execute("SELECT token FROM serverapp_accesstoken")
row = c.fetchone()
access_token = row[0]


client_id = "C3HL2IWT0X-100"

# Concatenate the client ID and access token
newtoken = f"{client_id}:{access_token}"

# The symbol to collect data
symbol = ["NSE:NIFTY50-INDEX"]
data_type = "symbolData"

# Websocket connection setup
kws = ws.FyersSocket(access_token=newtoken, run_background=False, log_path=os.getcwd())
start_minute = dt.datetime.now().minute

# Connect to the PostgreSQL database
db = psycopg2.connect(
    host="localhost", port=5432, database="realtime", user="postgres", password="172717"
)
c = db.cursor()


def insert_tick(msg):
    for tick in msg:
        try:
            ltp = tick["ltp"]
            vol = tick["min_volume"]
            ltt = dt.datetime.fromtimestamp(tick["timestamp"])
            tok = "nifty50ltp"
            data = (ltt, ltp, vol)

            # Delete previous data from the table
            c.execute(f"DELETE FROM {tok}")

            # Insert the new data
            c.execute(
                f"INSERT INTO {tok} (TS, PRICE, VOLUME) VALUES (%s, %s, %s)", data
            )

        except Exception as e:
            print(e)
            pass

    db.commit()


def on_tick(msg):
    insert_tick(msg)


# Establish connection and subscribe to data
kws.websocket_data = on_tick
kws.subscribe(symbol=symbol, data_type=data_type)
kws.keep_running()
