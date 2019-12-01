# Docs

*All request (except creating chat room) are required to pass the SIGN (link signed by ETH PrivKey).*

## CREATE CHAT
1. Client1 create chat room for 2 ETH addresses (own and Client2)
2. Server generate link (/some-random-shit)
3. Server allow connect to this link only for 2 ETH addresses
4. Client1 generate pubKey1 for Diffie-Hellman and wait for Client2

## CONNECT TO CHAT
1. Client2 sign link by ETHPrivKey2, if no valid - redirect to /
2. Server send pubKey1 and generator params to Client2
3. Client2 generate pubKey2 and commonSecretKey
4. Client2 send pubKey2 to server
5. Client1 generate commonSecretKey using pubKey2

## Result:
1. Only owners of defined ETH addresses allowed to chat
2. Both have the same key for symmetric crypto algorithm