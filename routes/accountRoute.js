// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')


router.get("/login", 
  utilities.handleErrors(accountController.buildLogin)
)

router.get("/register", 
  utilities.handleErrors(accountController.buildRegister)
)

router.post('/register', 
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogData,
  utilities.handleErrors(accountController.accountLogin)
  // (req, res) => {
  //   res.status(200).send('login process')
  // }
)

router.get(
  "/",
  // regValidate.loginRules(),
  // regValidate.checkLogData,
  utilities.checkLogin, utilities.handleErrors(accountController.buildLogged)
  
)


module.exports = router;
