// util/wrapAsync.js
// Small helper to wrap async route handlers and forward errors to Express error middleware.
// Usage: router.get('/', wrapAsync(async (req,res)=>{ ... }));
module.exports=(fn)=>{
  return (req, res, next)=>{
    fn(req, res, next).catch(next);
  }
}