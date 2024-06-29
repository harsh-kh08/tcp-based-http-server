const net = require("net");
const fs = require("fs");
const zlib = require("zlib"); // gZip Compressor
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  // socket.write("HTTP/1.1 200 OK\r\n\r\n"); // PING Statement to identify if connection is healthy or running
  socket.on("data", (data) => {
    /* socket.on('data',callback_ftn) When a connection to a server recieves a request data it will 
     send response using socket.write(""); */

    // Parsing Request
    const request = data.toString();
    const requestMethod = request.split(" ")[0];
    console.log("Request: \n" + request);
    const url = request.split(" ")[1];

    if (requestMethod == "GET") {
      if (url === "/") {
        // End-Point: /
        socket.write(
          "HTTP/1.1 200 OK\r\n\r\n" // Sets the header for response of server
        ); /* The socket.write() method in Node.js is used to send data through the socket to the connected remote endpoint. This is a fundamental method for sending data over a TCP connection in a Node.js application.
                  The server responds to the client by sending an HTTP response using socket.write(). */
      } else if (request.includes("/echo/")) {
        // End-point: /echo
        const content = url.split("/echo/")[1]; // variablecontent
        console.log(content);

        if (request.includes("gzip")) {
          const compressedBody = zlib.gzipSync(content);
          socket.write(
            `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: gzip\r\nContent-Length: ${compressedBody.length}\r\n\r\n`
          ); // This socket.write() sets the header of response

          socket.write(compressedBody); // This spcket.write() sends the response body or data to the client or writes the data on socket;
        } else {
          socket.write(
            `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`
          );
        }
      } else if (url === "/user-agent") {
        //End-point:/user-agent
        const userAgentData = request.split("User-Agent: ")[1].split("\r\n")[0];
        console.log(userAgentData);
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgentData.length}\r\n\r\n${userAgentData}`
        );
      } else if (url.includes("/files/")) {
        const filename = url.split("/files/")[1];
        const directory = process.argv[3];
        if (fs.existsSync(`${directory}/${filename}`)) {
          const content = fs
            .readFileSync(`${directory}/${filename}`)
            .toString();
          console.log(content);
          socket.write(
            `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`
          );
        } else {
          socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
          socket.end(); // This method gracefully ends the connection, ensuring that any remaining data is sent before closing the socket.
          // This method forcibly closes the connection and ensures that no further I/O operations occur on the socket. This is useful if you want to immediately terminate the connection due to an error.
        }
      } else {
        socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
        socket.end();
      }
    } else if (requestMethod == "POST") {
      if (url.includes("/files/")) {
        const file = url.split("/files/")[1]; // Get the file name from Header line
        const text = request.split("\r\n\r\n")[1]; // Text should be pick from request body
        const directory = process.argv[3]; // Directory given in test case runner
        fs.appendFile(`${directory}/${file}`, text, () => {});

        socket.write(`HTTP/1.1 201 Created\r\n\r\n`);
      } else {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.end();
      }
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.end();
    }
  });

  //Error Handling

  socket.on("error", (e) => {
    console.log("Error :" + e);
    socket.end(); // This method gracefully ends the connection, ensuring that any remaining data is sent before closing the socket.

    /* Example Client Reconnection - 
Assuming the client is a web browser:

1. The user might refresh the page or perform another action that prompts the browser to establish a new connection.
2. The browser sends a new HTTP request to the server.
3. The server accepts this new connection and handles the request as a new, separate socket connection.

*/
  });

  //Closing
  socket.on("close", () => {
    socket.end();
    // server.close();
    /* To add support for concurrent connections in your Node.js server, you need to ensure that the server can handle multiple connections without closing itself when one connection ends. 
        Removing server.close() from the close event handler is a good start. 
        Each connection should be handled independently, and the server should remain open to accept new connections */
  });
});

server.listen(4221, "localhost");

/*
Accessing arguments in Node.js: In a Node.js program, you can access these arguments using process.argv. This is an array where:

process.argv[0] is the path to the Node.js executable.
process.argv[1] is the path to the JavaScript file being executed (myProgram.js in the example).
process.argv[2] is arg1.
process.argv[3] is arg2.
process.argv[4] is arg3.

*/

// ---------------------------------------------------------------------------------------------------------------

/*

Making request for reading files in an input

This JavaScript code snippet is using the Node.js fs (file system) module to handle HTTP requests that involve serving files from a specific directory. Here’s a detailed explanation of the code:

Require the fs module:

javascript
Copy code
const fs = require("fs");
This imports the fs module, which provides an API for interacting with the file system.

Check if the path starts with /files/:

javascript
Copy code
if (path.startsWith("/files/")) {
This conditional checks if the requested path starts with /files/. This is a way to determine if the request is asking for a file within a specific directory.

Get the directory and filename:

javascript
Copy code
const directory = process.argv[3];
const filename = path.split("/files/")[1];
directory is set to the third command-line argument (process.argv[3]).
filename is extracted by splitting the path at /files/ and taking the part after it.
Check if the file exists:

javascript
Copy code
if (fs.existsSync(`${directory}/${filename}`)) {
This checks if the file exists in the specified directory using fs.existsSync(), which synchronously tests the existence of the file.

Read the file content and construct the HTTP response:

javascript
Copy code
const content = fs.readFileSync(`${directory}/${filename}`).toString();
const res = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}\r\n`;
socket.write(res);
If the file exists, fs.readFileSync() is used to read the file content synchronously.
The content is converted to a string.
An HTTP response string (res) is constructed:
HTTP/1.1 200 OK: Status line indicating a successful response.
Content-Type: application/octet-stream: Indicates that the content is a binary stream (generic for any file type).
Content-Length: ${content.length}: Specifies the length of the content.
\r\n\r\n: Marks the end of the headers.
${content}: The actual content of the file.
socket.write(res) sends the response to the client.
Handle the case where the file does not exist:

javascript
Copy code
} else {
  socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
}
If the file does not exist, a 404 Not Found response is sent to the client.

*/

// --------------------------------------------------------------------------------------------------------

/*

Procedure for sending compressed data to the client :

Code - 

if (request.includes("gzip")) {
          const compressedBody = zlib.gzipSync(content);
          socket.write(
            HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: gzip\r\nContent-Length: ${compressedBody.length}\r\n\r\n
          );
          socket.write(compressedBody);
        } else {
          socket.write(
            HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}
          ); 




In this code snippet, there are two cases being handled based on whether the request includes "gzip" or not. The code sends back different responses to the client based on this condition.

Explanation of the Code
Check if the Request Includes "gzip":

javascript
Copy code
if (request.includes("gzip")) {
Response with Gzip Compression:

javascript
Copy code
const compressedBody = zlib.gzipSync(content);
socket.write(
  `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: gzip\r\nContent-Length: ${compressedBody.length}\r\n\r\n`
);
socket.write(compressedBody);
Compress the Content:

javascript
Copy code
const compressedBody = zlib.gzipSync(content);
This line compresses the content using gzip compression.

Write the HTTP Headers:

javascript
Copy code
socket.write(
  `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Encoding: gzip\r\nContent-Length: ${compressedBody.length}\r\n\r\n`
);
This writes the HTTP response headers to the socket. Here’s a breakdown of the headers:

HTTP/1.1 200 OK: The status line indicating a successful response.
Content-Type: text/plain: Specifies that the content type is plain text.
Content-Encoding: gzip: Indicates that the content is gzip-compressed.
Content-Length: ${compressedBody.length}: Specifies the length of the compressed content.
Write the Compressed Body:

javascript
Copy code
socket.write(compressedBody);
This writes the actual compressed content to the socket.

Response without Gzip Compression:

javascript
Copy code
} else {
  socket.write(
    `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`
  );
}
Write the HTTP Headers and Body:
javascript
Copy code
socket.write(
  `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`
);
This writes both the HTTP response headers and the uncompressed content to the socket in one call. Here’s a breakdown of this response:
HTTP/1.1 200 OK: The status line indicating a successful response.
Content-Type: text/plain: Specifies that the content type is plain text.
Content-Length: ${content.length}: Specifies the length of the content.
The actual content follows the headers.
Summary of What the Sockets Write
With "gzip" in the Request:

First socket.write sends the HTTP headers indicating a successful response with gzip-compressed content.
Second socket.write sends the compressed content.
Without "gzip" in the Request:

A single socket.write sends both the HTTP headers and the plain (uncompressed) content in one call.
This ensures that the client receives the appropriate response based on whether they requested gzip compression or not.














*/
