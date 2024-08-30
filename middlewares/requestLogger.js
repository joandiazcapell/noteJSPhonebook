const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:  ', request.path);
    console.log('Body:  ', request.body);
    console.log('---');
    next(); // Call next() to pass control to the next middleware function
  };
  
  module.exports = requestLogger;