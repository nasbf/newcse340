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
    grid,
    
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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
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

    const classificationSelect = await utilities.buildClassificationList()
    res.status(201).render("inventory/management", {
      title: "Login",
      nav,
      classificationSelect,
      errors: null,
    })
    // res.redirect("/inv/management")
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


/* ****************************************
 *  Process Add New Classification
 * **************************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()

  // Recibir datos del formulario
  const {classification_name } = req.body

  // Insertar en la BD
  const result = await invModel.addClassification(classification_name)

  
  if (result) {
    req.flash("notice", `${classification_name}  was successfully added.`)
    const classificationSelect = await utilities.buildClassificationList()
    
    res.status(201).render("inventory/management", {
      title: "Login",
      nav,
      classificationSelect,
      errors: null,
    })
    
  } else {
    req.flash("notice", "Sorry, adding the classification failed.")
    
    res.status(501).render("inventory/addClassification", {
      title: "Add New Classification",
      nav,      
      errors: null
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build Edit Inventory View
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)

  const itemData = await invModel.getInventoryByInvId(inv_id)

  if (!itemData || itemData.length === 0) {
    return next(new Error("Item not found"))
  }

  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList(itemData[0].classification_id)

  res.render("inventory/edit", {
    title: `Edit ${itemData[0].inv_make} ${itemData[0].inv_model}`,
    nav,
    classificationSelect,
    itemData: itemData[0],
    errors: null
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/management")
  } else {

    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")

    res.status(501).render("inventory/edit", {

      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      itemData: {
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      }
    })
  }
}

/* ***************************
 *  Build Delete View
 * ************************** */
// invCont.buildDeleteView = async function (req, res, next) {
//   const inv_id = parseInt(req.params.inv_id)
//   let nav = await utilities.getNav()
//   const itemData = await invModel.getInventoryByInvId(inv_id)
//   const itemName = `${itemData.inv_make} ${itemData.inv_model}`
//   res.render("inventory/delete-confirm", {
//     title: "Delete" + itemName,
//     nav,
//     errors: null,
//     inv_id: itemData.inv_id,
//     inv_make: itemData.inv_make,
//     inv_model: itemData.inv_model,
//     inv_year: itemData.inv_year,
//     inv_price: itemData.inv_price,
//   })
// };

invCont.buildDeleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const data = await invModel.getInventoryByInvId(inv_id);

    if (!data || data.length === 0) {
      req.flash("notice", "Vehicle not found.");
      return res.redirect("/inv/");
    }
    const itemData = data[0];
    let nav = await utilities.getNav();

    return res.render("./inventory/delete-confirm", {
      title: `Delete ${itemData.inv_make} ${itemData.inv_model} ${itemData.inv_model}`,
      nav,
      itemData,
      errors: null
    });
  } catch (error) {
    console.error("Error loading delete view:", error);
    next(error);
  }
};

/* ***************************
 *  Build Delete View
 * ************************** */
invCont.buildDeleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const itemData = await invModel.getInventoryByInvId(inv_id)

  if (!itemData || itemData.length === 0) {
    return next(new Error("Item not found"))
  }

  let nav = await utilities.getNav()
  const item = itemData[0]
  const classificationSelect = await utilities.buildClassificationList(item.classification_id)

  res.render("inventory/delete-confirm", {
    title: `Delete ${item.inv_make} ${item.inv_model}`,
    nav,
    itemData: item,
    classificationSelect,
    errors: null
  })
}

/* ***************************
 *   Delete Inventory
 * ************************** */
  invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)

  if (!inv_id || Number.isNaN(inv_id)) {
    req.flash("notice", "Invalid item id.")
    return res.redirect("/inv/management")
  }

  try {
    
    const itemData = await invModel.getInventoryByInvId(inv_id)
    if (!itemData || itemData.length === 0) {
      req.flash("notice", "Item not found.")
      return res.redirect("/inv/management")
    }
    const item = itemData[0]
    const deleteResult = await invModel.deleteInventoryItem(inv_id)
    if (deleteResult && deleteResult.rowCount > 0) {
      req.flash("notice", `The ${item.inv_make} ${item.inv_model} was successfully deleted.`)
      return res.redirect("/inv/management")
    } else {
      req.flash("notice", "Deletion failed.")
      return res.redirect(`/inv/delete/${inv_id}`)
    }
  } catch (error) {
    console.error("Delete controller error:", error)
    req.flash("notice", "An error occurred while trying to delete.")
    return res.redirect("/inv/management")
  }
}

module.exports = invCont