# Homechain api 

This is a wrapper for consuming [Google's Place Details API](https://developers.google.com/maps/documentation/places/web-service/details#PlaceDetailsRequests).

## Structure

A usual Express API on top of Serverless framework, to make deployment to an AWS enviroment easier.
- The Express API code lives in `index.js`
- It is deployed to AWS Lambda, but the routing is all still delegated to the Express application itself 

## Running Locally
**Note that the GOOGLE_API_KEY lives in a `config.json` file in the /server directory

1. `cd server` then `npm i`
2. `sls offline start` will run the functions locally, the port is set to 8000 as a default, `http://localhost:8000/`
3. `sls deploy` to deploy changes


