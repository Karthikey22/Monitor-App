const {ethers,WebSocketProvider}=require("ethers");
const twilio=require('twilio');

require("dotenv").config()
const fs=require("fs");

const addressesData=fs.readFileSync("addresses.json");
const addresses=new Set(JSON.parse(addressesData));

// const transferEventSignature=ethers.utils.id("'Transfer(address,address,uint256)'");


const chains = [
    {
        name: 'Sepolia Ethereum',
        rpcUrl: process.env.SEPOLIA_RPC_URL, // Ethereum RPC URL
        tokenContract: process.env.SEPOLIA_TOKEN_CONTRACT, // LINK Token contract on Sepolia Ethereum
    },
    {
        name: 'Polygon mainnet',
        rpcUrl: process.env.POLYGON_RPC_URL, // Polygon  RPC URL
        tokenContract: process.env.POLYGON_TOKEN_CONTRACT, // SAND Token contract on Polygon
    }
];

const abi = [
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'function name() view returns(string)',
    'function decimals() view returns(uint8)'
];

const monitor=async(chain)=>{
    const provider=new WebSocketProvider(chain.rpcUrl)
    // console.log("provider: ",chain.rpcUrl)

    const contract= new ethers.Contract(chain.tokenContract,abi,provider);
    const tokenName=await contract.name();
    const tokenDecimal=await contract.decimals();

    const accountSid=process.env.TWILIO_ACCOUNT_SID;
    const authToken=process.env.TWILIO_AUTH_TOKEN;
    const client=twilio(accountSid,authToken);

    contract.on('Transfer',async(from,to,value,event)=>{
        try{
            // console.log("event :",event);
            const transactionHash=event.log.transactionHash;
            const blockNumber=event.log.blockNumber;
            const timestamp=await getBlockTimestamp(provider,blockNumber);
            const stringValue=value.toString();
            const tokenAmount=ethers.formatUnits(stringValue,tokenDecimal);

            if(addresses.has(from) || addresses.has(to)){
                console.log("Match found on :",chain.name);
                console.log(`Transaction hash ${transactionHash}`);
                console.log(`From: ${from}`);
                console.log(`To: ${to}`);
                console.log(`Blocknumber: ${blockNumber}`);
                console.log(`Timestamp: ${timestamp}`);
                console.log(`Token value: ${tokenAmount}`);
                console.log(`Token name ${tokenName}`);

                try{
                    const message=await client.messages.create({
                        body:`Transaction alert on ${chain.name} \nTxn hash: ${transactionHash} \nFrom: ${from} \nTo:${to} \nAmount: ${tokenAmount} ${tokenName} \nTime:${timestamp}`,
                        from: process.env.TWILIO_NUMBER,
                        to: process.env.MY_MOBILE_NUMBER

                    });
                    console.log('Message sent successfully:', message.sid);
                }
             catch(error){
                console.error('Error sending message:', error.message);
            }
            }
        }
        catch(err){
            console.error(`Error occurred during events on chain: ${chain.name}`, err);
        }
    });

    provider.on('error', (err) => {
        console.error(`Provider error on ${chain.name}:`, err);
    });

    // console.log("Chain name: ",chain.name);

}

const getBlockTimestamp = async (provider, blockNumber) => {
    const block = await provider.getBlock(blockNumber);
    return new Date(block.timestamp * 1000);
};

chains.forEach((chain)=>monitor(chain));

