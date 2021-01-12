const fs = require('fs');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const elasticsearch = require('elasticsearch');
const cors = require('cors');
const config = require('config');

const bonsai_url = config.get('BONSAI_URL');
const port = config.get('PORT');

// Set up Elastic Search Client
const client = new elasticsearch.Client({
  host: bonsai_url
  // log: 'trace'
});

// serve static files from public directory
const rootDir = path.resolve(__dirname);
app.use(cors());
app.use(express.static(rootDir));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));

/* GET home page. */
function fetch_fn(req, res, next) {
  try {
    {
      // This is for backwards compability (BQA and BDEV) - where web app is served from a root path.
      res.sendFile(path.join(rootDir, 'src', 'index_nodestart.html'));
    }
  } catch (err) {
    console.log(err.message);
  }
}

async function searchRoles(req, res, next) {
  try {
    {
      client.search({
        body: JSON.parse(req.query.searchQuery),
        index: 'roledefs'
      })
        .then((e) => {
          res.json(e);
        })
        .catch((c) => {
          res.json(c);
        });
      // const {data} = await axios.get(bonsai_url + '/_search?pretty', {
      //   data: req.body
      // });
      //
      // res.json(data);
    }
  } catch (err) {
    console.log(err.message);
  }
}

app.get('/searchRoles', function (req, res, next) { searchRoles(req, res, next); });
app.get('/*', function (req, res, next) { fetch_fn(req, res, next); });

const listenPort = port || 3000;

app.listen(listenPort, function () {
  console.log('Listening Port:', listenPort);
});
