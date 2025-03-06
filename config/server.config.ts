const env = process.env.NODE_ENV;
const prodServer = "http://localhost:5173";
const devServer = "http://localhost:5173";
const stagingServer = "http://localhost:5173";

// Match local IPs like 192.168.x.x
// const localIPPattern = /^http:\/\/192\.168\.8\.\d{1,3}(:\d+)?$/;
const localIPPattern = /^http:\/\/[\d\.]+(:\d+)?$/;

// Match localhost for development
const localhostPattern = /^http:\/\/localhost(:\d+)?$/;

// Determine the server name based on the environment
const serverName = env === "production"
  ? prodServer
  : env === "staging"
  ? stagingServer
  : devServer;

export { serverName, localIPPattern, localhostPattern };