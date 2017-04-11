/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

// var dataObject = {
//   results: [
//     {'username': 'alex','text': 'bob is your uncle','rooomname': 'lobby','objectID': '1'},
//     {'username': 'rishi','text': 'hello world','rooomname': 'lobby','objectID': '2'}
//   ]
// }

var fs = require('fs');
var url = require('url');
var objectID = 7;

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;




  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = 'application/json';

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  //response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  // response.end('Hello world!');

  if(request.method === 'GET' && request.url === '/classes/messages') {
    //console.log(request.url);
    // var queryObject = url.parse(request.url, true).query;
    // console.log(queryObject);
    // for(var key in queryObject) {
    //   if(key === 'order') {
    //     orderMessages(queryObject[key]);
    //   }
    //
    //   if(key === 'limit') {
    //     limitMessages(queryObject[key]);
    //   }
    // }
    fs.readFile('./data.txt', 'utf-8', function(err, data) {
      if (err) {
        response.writeHead(404, headers);
      } else {

        data = data.slice(1);
        response.writeHead(200, headers);
        var dataObject = JSON.parse('['+data+']');
        response.end(JSON.stringify({results: dataObject}));
      }
    });
    // response.writeHead(200, headers);
    // response.end(JSON.stringify(dataObject));
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
          response.writeHead(404);
          response.end('{"success": "YAY - message posted", "status": 201}')
        } else {
          console.log('trying to write 201');
          response.writeHead(201, headers);
          response.end('{"success": "YAY - message posted", "status": 201}')
        }
      });
    });

    // request.on('end', function() {
    //   response.end('{"success": "YAY - message posted", "status": 201}');
    // });

  } else if(request.method === 'GET' && request.url === '/classes/rooms') {

  } else {
    response.writeHead(404, headers);
    response.end('Invalid URL on server');
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

module.exports.requestHandler = requestHandler;
