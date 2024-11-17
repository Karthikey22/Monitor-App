from web3 import Web3
import json
w3=Web3()

def generate_random_address():
    account=w3.eth.account.create()
    address=account.address
    return address

addresses=[generate_random_address() for _ in range(10000)]

print(len(addresses))

with open("addresses.json","w") as json_file:
    json.dump(addresses,json_file,indent=4)
# accounts=w3.eth.account.create()

# print("private key:",w3.to_hex(accounts.key))
# print("account address",accounts.address)