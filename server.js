const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const config = require('./config');


const server = express();
const PORT = config.port;
const STATUS_ERROR = 422;
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


server.get('/places', (req, res) => {
  const query = req.query.search;
  const searchURL = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${Key}`

  fetch(searchURL)
  .then(res => res.json())
  .then(json => {
    results = json.results
    results = results.map(result => {
      return {
        name: result.name,
        place_id: result.place_id,
        types: result.types
      }
    })
  })
  .then(json => res.json(results))
  .catch(err => {
    console.log(err);
    res.status(STATUS_ERROR);
    res.send('There seems to be an error with your API call request.')
  })
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
  }))
  .catch(err => {
    console.log(err);
    res.status(STATUS_ERROR);
    res.send('There seems to be an error with your API call request.')
  })
});





server.listen(PORT, err => {
  if(err) {
    console.log(`Error starting your server at port ${PORT}`);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
})