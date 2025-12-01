// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
const invCont = require("../controllers/invController")


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
  "/management",
  utilities.checkLogin,
     
  utilities.handleErrors(invCont.buildManagement)
)

router.get("/logout", (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
})


/* edit account and password*/

router.get(
  "/update/:id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdate)
)
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.loginRules(),
  regValidate.checkEditData,
  utilities.handleErrors(accountController.updateAccount)
)

router.post(
  "/password",
  utilities.checkLogin,
  
  utilities.handleErrors(accountController.updatePassword)
)

  

module.exports = router;
