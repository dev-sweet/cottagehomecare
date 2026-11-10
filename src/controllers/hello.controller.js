const { getHelloMessage } = require("../models/hello.model");

const getHello = (req, res) => {
  const data = getHelloMessage();
  res.status(200).json(data);
};

module.exports = { getHello };
