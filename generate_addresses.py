from web3 import Web3
import json
import os

from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()
w3=Web3()

def generate_random_address():
    account=w3.eth.account.create()
    address=account.address
    return address

# addresses=[generate_random_address() for _ in range(10000)]

# print(len(addresses))

# with open("addresses.json","w") as json_file:
#     json.dump(addresses,json_file,indent=4)

import pandas as pd
import json
import glob

# Use glob to find all CSV files in the directory
csv_files = glob.glob(f"./token_data/**.csv")

# Initialize an empty set to store unique addresses
unique_addresses = set()

# Process each CSV file
for file in csv_files:
    # Read the CSV file into a DataFrame
    df = pd.read_csv(file)
    
    # Extract the 'address' column and add to the set
    if 'Address' in df.columns:
        unique_addresses.update(df['Address'].dropna().unique())
    else:
        print(f"'address' column not found in {file}")

# Convert the set to a list
addresses_list = list(unique_addresses)


with open("polygon_addresses.json", "w") as f:
    json.dump(addresses_list, f,indent=4)

