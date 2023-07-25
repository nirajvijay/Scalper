from rest_framework.decorators import api_view
from rest_framework.response import Response
from fyers_api import fyersModel
from django.db import connection
from .fyers_accesstoken import generate_accesstoken

from .models import AccessToken

import os
import math
from datetime import datetime
from django.utils.timezone import localtime
from django.utils import timezone
from datetime import timedelta
from django.http import JsonResponse
import datetime as dt
from fyers_api.Websocket import ws
import time

client_id = "C3HL2IWT0X-100"
access_token = None

data = None  # Declare data as a global variable

def get_current_access_token():
    global access_token
    access_token = AccessToken.objects.latest('created_at').token


@api_view(['POST'])
def place_order(request):
    global data  # Declare data as a global variable within the function
    get_current_access_token()
    

    
    fyers = fyersModel.FyersModel(
        client_id=client_id, token=access_token, log_path=os.getcwd())

    data = request.data
    print(data)  # Get the order data from the request

    response = fyers.place_order(data=data)
    return Response(response)

@api_view(['POST'])
def sellOrder(request):
    
    fyers = fyersModel.FyersModel(
        client_id=client_id, token=access_token, log_path=os.getcwd())

    data = request.data
    print(data)  # Get the order data from the request

    response = fyers.place_order(data=data)
    return Response(response)


@api_view(['GET'])
def get_strike(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT PRICE FROM NIFTY50LTP")
        data = cursor.fetchall()
        strikeprice = data[0][0]
        
        strike_price = math.ceil(strikeprice / 50) * 50
        strike_prices = [strike_price - 50, strike_price, strike_price + 50]
        print(strike_prices)

        return Response(strike_prices)
    
@api_view(['GET'])
def get_accesstoken(request):
    """ # Check if there is a previous access token
    previous_token = AccessToken.objects.first()

    # Get the current time
    current_time = timezone.localtime() """
    

    # Check if 24 hours have elapsed since the previous token generation
    """ if previous_token:
      print("entered")
      previous_token_created_at = previous_token.created_at
      if (current_time - previous_token_created_at) < timedelta(hours=6):
        # Return a response indicating that a new token cannot be generated yet
         print("entered")
         return Response("access_token_already_generated")
    else: """
    # Generate the new access token
    accesstoken = generate_accesstoken()
    print(accesstoken)

            # Delete previous access token, if any
    AccessToken.objects.all().delete()
            # Store the new access token in the database
    AccessToken.objects.create(token=accesstoken)
        
    return Response("got accesstoken")
    
@api_view(['GET'])    
def last_traded_price(request):
    # Get the database cursor from the configured connection
    cursor = connection.cursor()
    
    # Define the table name
    """ table_name = "NIFTY50LTP" """
    
    # Execute the SQL query to retrieve the latest row from the table
    cursor.execute("SELECT * FROM NIFTY50LTP ORDER BY TS DESC LIMIT 1")
    
    
    # Fetch the latest row from the result
    latest_row = cursor.fetchone()
    print(latest_row)
    latest_price = latest_row[1] if latest_row else None
    
    # Close the cursor
    cursor.close()
    
    # Prepare the response as JSON
    response = {
        'latest_price': latest_price
    }
    print (response)
    
    # Return the response as JSON
    return JsonResponse(response)

@api_view(['POST'])    
def last_traded_price_ce(request):
    # Get the additional data from the request body
    selectedstrike = request.data.get('selectedstrike')
    
    # Replace ":" with "_"
    selectedstrike = selectedstrike.replace(':', '_')
    
    # Get the database cursor from the configured connection
    cursor = connection.cursor()
    
    # Define the table name
    """ table_name = "NIFTY50LTP" """
    
    # Execute the SQL query to retrieve the latest row from the table
    cursor.execute(f"SELECT * FROM {selectedstrike} LIMIT 1")

    
    
    # Fetch the latest row from the result
    latestCE_row = cursor.fetchone()
    print(latestCE_row)
    latestCE_price = latestCE_row[1] if latestCE_row else None
    
    # Close the cursor
    cursor.close()
    
    # Prepare the response as JSON
    response = {
        'latest_price': latestCE_price
    }
    print (response)
    
    # Return the response as JSON
    return JsonResponse(response)

@api_view(['POST'])    
def last_traded_price_pe(request):
    # Get the additional data from the request body
    selectedstrike = request.data.get('selectedstrike')
    
    # Replace ":" with "_"
    selectedstrike = selectedstrike.replace(':', '_')
    
    # Get the database cursor from the configured connection
    cursor = connection.cursor()
    
    # Define the table name
    """ table_name = "NIFTY50LTP" """
    
    # Execute the SQL query to retrieve the latest row from the table
    cursor.execute(f"SELECT * FROM {selectedstrike} LIMIT 1")

    
    
    # Fetch the latest row from the result
    latestPE_row = cursor.fetchone()
    print(latestCE_row)
    latestPE_price = latestPE_row[1] if latestPE_row else None
    
    # Close the cursor
    cursor.close()
    
    # Prepare the response as JSON
    response = {
        'latest_price': latestPE_price
    }
    print (response)
    
    # Return the response as JSON
    return JsonResponse(response)

@api_view(['GET'])
def close_all(request):
    get_current_access_token()
    
    fyers = fyersModel.FyersModel(
        client_id=client_id, token=access_token, log_path=os.getcwd())
    
    data = {}
    
    response = fyers.exit_positions(data=data)
      # Get the order data from the request

    
    return Response(response)

@api_view(['GET'])
def order_book(request,):
    global data  # Declare data as a global variable within the function
    print(data)
    symbol = data['symbol']
    qty = data['qty']
    
    print(qty)
    response_data = {
            'symbol': symbol,
            'qty': qty
        }
    response = response_data;
    return Response(response)