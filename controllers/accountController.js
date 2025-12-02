const bcrypt = require("bcryptjs")
const utilities = require("../utilities")
const models = require("../models/account-model.js")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const accountModel = require("../models/account-model")
const { buildManagement } = require("./invController.js")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    
  })
}

/* Deliver registration */

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
// Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await models.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email
    })
  }

  try {
    const match = await bcrypt.compare(account_password, accountData.account_password)

    if (!match) {
      req.flash("notice", "Incorrect credentials.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
      })
    }

    /* Build JWT payload (remove password) */
    delete accountData.account_password

    const token = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h"
    })

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 3600 * 1000
    })

    /* ✔ TODOS deben ir a /account/management */
    return res.redirect("/account/management")

  } catch (error) {
    console.error("Login error:", error)
    throw new Error("Access Forbidden")
  }
}

/* ****************************************
*  Deliver loggd in view
* *************************************** */
async function buildLogged(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    account_firstname: res.locals.account_firstname,
    account_type: res.locals.account_type,
    account_id: res.locals.account_id
    
  })
}


/*edit account*/

async function buildUpdate(req, res, next) {
  let nav = await utilities.getNav()

  // Los datos están almacenados en res.locals (gracias al JWT middleware)
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: res.locals.account_firstname,
    account_lastname: res.locals.account_lastname,
    account_email: res.locals.account_email,
    account_id: res.locals.account_id
  })
}

/* ****************************************
*  Process account info update
* *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body

  try {
    // Actualizar datos en DB
    const updateResult = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id
    )

    if (!updateResult) {
      req.flash("notice", "Update failed, please try again.")
      return res.status(500).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
        account_id
      })
    }

    /** 🔄 Obtener usuario actualizado para recrear JWT */
    const updatedUser = await accountModel.getAccountByEmail(account_email)
    delete updatedUser.account_password

    const accessToken = jwt.sign(updatedUser, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h"
    })

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      maxAge: 3600 * 1000
    })

    req.flash("notice", "Account information updated successfully.")
    return res.redirect("/account/management")

  } catch (error) {
    console.error("Update error:", error)
    req.flash("notice", "An error occurred while updating your account.")
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    })
  }
}

/* Process password update*/

async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "Error updating password.")
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null
    })
  }

  const passwordResult = await accountModel.updatePassword(hashedPassword, account_id)

  if (passwordResult) {
    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/management")
  }

  req.flash("notice", "Password update failed.")
  return res.status(500).render("account/update", {
    title: "Update Account",
    nav,
    errors: null
  })
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildLogged,
  buildUpdate,
  updateAccount,
  updatePassword
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildLogged, buildUpdate, updateAccount, updatePassword }