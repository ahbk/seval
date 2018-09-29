var express = require('express');
var compression = require('compression');
var helmet = require('helmet');
var path = require('path');

var app = express();

app.use(compression());
app.use(helmet());
app.use(express.static(path.join(__dirname, 'ui/dist')));

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

if(process.env.NODE_ENV == 'development') {
  app.listen(3000, () => console.log('Listening on port 3000'));
}

if(process.env.NODE_ENV == 'production') {
  app.listen(80, () => console.log('Listening on port 80'));
}
