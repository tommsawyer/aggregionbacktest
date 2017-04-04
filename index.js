const mongoose   = require('mongoose');
const HttpServer = require('./http_server/Server');
const config     = require('./config/config');

mongoose.Promise = Promise;

mongoose.connect(config.mongoUrl)
  .then(() => {
    let server = new HttpServer(config.port, true);
    return server.listen();
  })
  .then(() => {
    console.log(`Listening on port ${config.port}`);
  });
