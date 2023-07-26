from rest_framework.decorators import api_view
from rest_framework.response import Response
from fyers_api import fyersModel
from django.db import connection




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

# Create your views here.

@api_view(['GET'])    
def last_traded_price_finnifty(request):
    # Get the database cursor from the configured connection
    cursor = connection.cursor()
    
    # Define the table name
    """ table_name = "NIFTY50LTP" """
    
    # Execute the SQL query to retrieve the latest row from the table
    cursor.execute("SELECT * FROM FINNIFTYLTP ORDER BY TS DESC LIMIT 1")
    
    
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