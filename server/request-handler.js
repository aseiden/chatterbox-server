var fs = require('fs');
var url = require('url');
var _ = require('underscore');
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');
var objectID = 7;

var limitMessages = function (limit, data) {
  var newData = data.slice(0,limit);
  data.length = 0;
  for(var i = 0; i < newData.length; i++) {
    data.push(newData[i]);
  }
};

var orderMessages = function (orderKey, data) {
  var negative = false;

  if (orderKey[0] === '-') {
    negative=true;
    orderKey = orderKey.slice(1);
  }

  _.sortBy(data, orderKey);

  if (negative) {
    data.reverse();
  }
};

var requestHandler = function(request, response) {

  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = 'application/json';

  var getURL = url.parse(request.url, true);
  console.log('URL path', getURL);
  if(request.method === 'GET' && getURL.pathname === '/classes/messages') {
    fs.readFile('./data.txt', 'utf-8', function(err, data) {
      if (err) {
        response.writeHead(404, headers);
      } else {
        var queryObject = getURL.query;
        data = data.slice(1);
        response.writeHead(200, headers);
        var dataObject = JSON.parse('['+data+']');
        for(var key in queryObject) {
          console.log('current key is '+key);
          if(key === 'order') {
            orderMessages(queryObject[key], dataObject);
          }

          if(key === 'limit') {
            limitMessages(queryObject[key], dataObject);
          }
        }
        response.end(JSON.stringify({results: dataObject}));
      }
    });
  } else if (request.method === 'POST') {
    var body = [];
    request.on('data', function(message){
      body.push(message);
    }).on('end', function() {
      body = Buffer.concat(body).toString();
      var jsonBody = JSON.parse(body);
      if(!jsonBody['roomname']||jsonBody['roomname'] === '- Add new room -' ) {
        jsonBody['roomname'] = 'lobby';
      }
      jsonBody.objectID = objectID;
      objectID++;
      jsonBody.createdAt = new Date().getTime();
      fs.appendFile('./data.txt', ','+JSON.stringify(jsonBody), 'utf-8', function(err) {
        if(err) {
          response.writeHead(404, headers);
          response.end('{"success": "YAY - message posted", "status": 201}')
        } else {
          console.log('trying to write 201');
          response.writeHead(201, headers);
          response.end('{"success": "YAY - message posted", "status": 201}')
        }
      });
    });

  } else if(request.method === 'GET' ) {
    var serve = serveStatic('./client');
    serve(request, response, finalhandler(request, response));
    // fs.readFile('./client/index.html', function(err, data) {
    //   if (err) {
    //     response.writeHead(500, headers);
    //     res.end('FILE NOT FOUND, PLEASE TRY HARDER');
    //   } else {
    //     var testHeaders = headers;
    //     testHeaders['Content-type'] = 'text/html'
    //     response.writeHead(200, testHeaders);
    //     response.end(data);
    //   }
    // })
  } else {
    response.writeHead(404, headers);
    response.end('Invalid URL on server');
  }
};

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

module.exports.requestHandler = requestHandler;
