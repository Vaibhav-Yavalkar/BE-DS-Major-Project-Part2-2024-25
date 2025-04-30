import { createThirdwebClient } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
//const clientId = 'a980f7430b54e2cbcd0d2a18651ec48d'; //Web3 project ID
const clientId = '71fe643506a32e2d03d622e9acf6bd48'; //Web3 project ID
if (!clientId) {
  throw new Error("No client ID provided");
}

export const client = createThirdwebClient({
  clientId: clientId,
});