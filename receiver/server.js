const fs = require("fs");
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackconfig = require('./webpack.config');
const webpackMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const app = express();
var server = require('http').Server(app);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.log(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.log(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

app.get('/', function (req, res) {
  res.render('index', {
    title: 'Unity',
	dev_mode: process.env.DEV === 'true'
  });
});

app.set('views', path.join(__dirname, "frontend", "views"));
app.set('view engine', 'jade');
app.use("/", express.static(path.join(__dirname, 'frontend', 'images')));
if (process.env.DEV === 'true') {
  const webpackCompiler = webpack(webpackconfig);
  const wpmw = webpackMiddleware(webpackCompiler, {});
  app.use(wpmw);
  const wphmw = webpackHotMiddleware(webpackCompiler);
  app.use(wphmw);
} else {
  app.use(express.static('dist'));
}



server.listen(normalizePort(process.env.PORT || '1226'));
server.on('error', onError);
server.on('listening', onListening);  

if (process.env.DEV === 'true') {

  process.env.JADE_PORT = normalizePort(process.env.JADE_PORT || '35729');
  var livereload = require('livereload').createServer({
    exts: ['jade'],
    port: process.env.JADE_PORT
  });

  livereload.watch(path.join(__dirname, 'frontend', 'views'));
}