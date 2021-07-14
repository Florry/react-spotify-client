# React spotify client
An abandoned (pre hooks) react spotify client I started working on on and off when the 2010 version of spotify stopped working (ca 2018). 
The code is a bit messy and has a lot of TODOs. I'm not sure if it even works for anyone else's account at the moment 😁 Some things behave a bit strange now, tracks flop around a bit when scrolling which wasn't present before 😬it was abandoned mid way through development so it might be some half implemented "fix" somewhere 🤷‍♂️


![](https://github.com/Florry/spotify-client/blob/master/spotify-react-4.png)

## How to run
```
npm install
npm start

Go to localhost:3000

Login with your spotify premium account
 ```
 
 # Backend cache
 There is a very hastly thrown together backend cache implementation @ [feature/backend-server](https://github.com/Florry/spotify-client/tree/feature/backend-server). It also uses spotify's newer auth method.  

 ## How to run
 ### Server
```
// start mongodb
mongod

cd ./server

npm install
npm start

```
### Client
```
npm install
npm start

Go to localhost:3000

Login with your spotify premium account
```

 Spotify's api only allows so many requests so it might be unresponsive from time to time 
