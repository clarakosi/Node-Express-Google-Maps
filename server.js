const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const config = require('./config');


const server = express();
const PORT = config.port;
const Key = config.gmaps.apiKey;
server.use(bodyParser.json());


const query = 'tacos+in+Detroit';
const searchURL = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${Key}`
let results = [];

let shortResults = () => {
  results = results.map(result => {
  return {
    name: result.name,
    place_id: result.place_id,
    types: result.types
    }
  })
}

fetch(searchURL)
  .then(res => res.json())
  .then(json => results = json.results)

server.get('/places', (req, res) => {
  shortResults();
  res.json(results);
});

server.get('/place', (req, res) => {
  shortResults();
  let id = results[0].place_id;
  let placeResult = [];
  const placeURL =`https://maps.googleapis.com/maps/api/place/details/json?placeid=${id}&key=${Key}`
  fetch(placeURL).then(res => res.json()).then(json => res.json({
    name: json.result.name,
    address: json.result.formatted_address,
    phoneNumber: json.result.formatted_phone_number,
    rating: json.result.rating,
    types: json.result.types
  }));
});





server.listen(PORT, err => {
  if(err) {
    console.log(`Error starting your server at port ${PORT}`);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
})