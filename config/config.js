module.exports = {
  port: 3000,
  mongoUrl: 'mongodb://localhost:27017/aggregionback',
  mongoTestUrl: 'mongodb://localhost:27017/aggregionbacktest',
  auth: {
    secret: 'some_secret_key'
  }
}
