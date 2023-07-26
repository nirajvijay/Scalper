import psycopg2

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    host="localhost", port=5432, database="realtime", user="postgres", password="172717"
)
cursor = conn.cursor()

with open("symbol.txt", "r") as symbol_file:
    table_names = [symbol.strip() for symbol in symbol_file.readlines()]

for symbol in table_names:
    table_name = symbol.replace(
        ":", "_"
    )  # Replace ':' with '_' to make a valid table name
    # Create the table if it doesn't exist
    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS {table_name} (TS TIMESTAMPTZ PRIMARY KEY, LTP FLOAT )"
    )

# Commit the changes and close the connection
conn.commit()
cursor.close()
conn.close()
