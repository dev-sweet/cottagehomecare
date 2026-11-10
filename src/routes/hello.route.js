const { Router } = require("express");
const { getHello } = require("../controllers/hello.controller");

const router = Router();

router.get("/hello", getHello);

module.exports = router;
