const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const {
  authenticate,
  optionalAuthenticate,
} = require("../middlewares/auth.middleware");
const {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
} = require("../validators/auth.validator");

const router = Router();

router.post("/register", registerValidator, authController.register);
router.post("/login", loginValidator, authController.login);
router.get("/me", authenticate, authController.getMe);
router.post(
  "/refresh-token",
  refreshTokenValidator,
  authController.refreshToken
);
router.post("/logout", optionalAuthenticate, authController.logout);

module.exports = router;
