const jwt = require("jsonwebtoken")
require("dotenv").config()
const invModel = require("../models/inventory-model.js")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}



/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
/* HTML view for vehicle*/
/* ****************************************/
Util.buildDetailGrid = function (data){
  const item = data[0]
  let detail = `
    <section class="vehicleDetail">
      <div class="vehicleImage">
        <img src="${item.inv_image}" alt="Image of ${item.inv_make} - ${item.inv_model}">
      </div>
      <div class="vehicleInformation">
        <h2>${item.inv_make} - ${item.inv_model} </h2>
        <div class="datos">
          <p>Year: ${item.inv_year}</p>
          <p>color:  ${item.inv_color}</p>
          <p>Miles: ${new Intl.NumberFormat("en-US").format(item.inv_miles)}</p>
          <p class="price">Price: $${new Intl.NumberFormat("en-US").format(item.inv_price)}</p>
        </div>
        <p>Description: ${item.inv_description}</p>
      </div>
    </section>`
  
  return detail

}

/* **************************************
 * Build the classification select list
 ************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
async function checkJWTToken(req, res, next) {
  const token = req.cookies.jwt

  if (!token) {
    res.locals.loggedin = false
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    res.locals.loggedin = true
    res.locals.account_firstname = decoded.account_firstname
    res.locals.account_email = decoded.account_email
    res.locals.account_id = decoded.account_id
    res.locals.account_type = decoded.account_type
    console.log("JWT decodificado:", decoded)
    return next()
  } catch (error) {
    res.clearCookie("jwt")
    res.locals.loggedin = false
    return next()
  }
}

/* Check Login */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* Error handler wrapper */
Util.handleErrors = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* Attach exposed function */
Util.checkJWTToken = checkJWTToken
/* Check Login */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}


/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /* ****************************************
 * Middleware to allow only Employee/Admin
 **************************************** */
Util.checkEmployeeOrAdmin = async function(req, res, next) {
  const token = req.cookies ? req.cookies.jwt : null

  if (!token) {
    const nav = await Util.getNav()
    req.flash("notice", "Please log in.")
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    // Save locals
    res.locals.loggedin = true
    res.locals.account_firstname = decoded.account_firstname
    res.locals.account_email = decoded.account_email
    res.locals.account_id = decoded.account_id
    res.locals.account_type = decoded.account_type

    // Check role
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      return next()
    } else {
      const nav = await Util.getNav()
      req.flash("notice", "You do not have permission to access that page, please login.")
      return res.status(403).render("account/login", {
        title: "Login",
        nav,
        errors: null,
      })
    }
  } catch (error) {
    res.clearCookie("jwt")
    const nav = await Util.getNav()
    req.flash("notice", "Please log in.")
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }
}
/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)




module.exports = Util