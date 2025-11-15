// util/ExpressError.js
// Small custom Error type that carries an HTTP status code alongside the message.
class ExpressError extends Error{
  constructor(statusCode, message){
    super();
    this.statusCode=statusCode;
    this.message=message;
  }
}

module.exports=ExpressError;