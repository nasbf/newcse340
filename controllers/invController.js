const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid
  })
}

/* function to call a specific item detail */

invCont.buildByInvId = async function (req, res, next) {

  const inv_id = req.params.invId
  const data = await invModel.getInventoryByInvId(inv_id)
  if (!data || data.length === 0) {
      return next({ status: 404, message: "Vehicle not found" })
    }
  const gridDetail = await utilities.buildDetailGrid(data)
  let nav = await utilities.getNav()
  const title = `${data[0].inv_make} ${data[0].inv_model}`
  res.render("./inventory/detail", {
    title,
    nav,
    gridDetail
  })
}

/* ***************************
 *  Build management inventory view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null
  })
}

/* ***************************
 *  Build add clasification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/addClassification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

/* ***************************
 *  Build add new vehicle view
 * ************************** */
invCont.buildAddNewVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/addNewVehicle", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null
  })
}

/* ****************************************
 *  Process Add New Vehicle
 * **************************************** */
invCont.addVehicle = async function (req, res) {
  let nav = await utilities.getNav()

  // Recibir datos del formulario
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body

  // Insertar en la BD
  const addResult = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  )

  
  if (addResult) {
    req.flash("notice", `${inv_make} ${inv_model} was successfully added.`)
    res.redirect("/inv/management")
  } else {
    req.flash("notice", "Sorry, adding the vehicle failed.")
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.status(501).render("inventory/addNewVehicle", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null
    })
  }
}

module.exports = invCont