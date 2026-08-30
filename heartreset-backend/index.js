// Vercel looks for an Express app exported from one of a few conventional
// filenames at the project root (index.js, app.js, server.js, ...). Our
// actual app lives in server/server.js, so this file just re-exports it.
module.exports = require("./server/server.js");
