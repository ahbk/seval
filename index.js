var express = require('express');
var compression = require('compression');
var helmet = require('helmet');
var path = require('path');

var app = express();

app.use(compression());
app.use(helmet());

app.use(express.static(path.join(__dirname, 'ui/dist')));

app.listen(3000, () => console.log('Listening on port 3000'));
