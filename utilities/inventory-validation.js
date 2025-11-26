const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/* **********************************
 * Inventory Validation Rules
 ********************************** */
validate.inventoryRules = () => {
  return [

    body("classification_id")
      .notEmpty()
      .withMessage("Please select a classification."),

    body("inv_make")
      .trim()
      .notEmpty()
      .matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/)
      .withMessage("Make must contain letters only."),

    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required."),

    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),

    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),

    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number."),

    body("inv_year")
      .trim()
      .notEmpty()
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Year must be a valid number."),

    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt()
      .withMessage("Miles must be an integer."),

    body("inv_color")
      .trim()
      .notEmpty()
      .matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/)
      .withMessage("Color must contain letters only."),
  ]
}

/* **********************************
 * Check Validation Results
 *********************************** */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)

    req.flash("notice", "Please correct the errors below.")

    return res.render("inventory/addNewVehicle", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_year: req.body.inv_year,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id
    })
  }

  next()
}

module.exports = validate