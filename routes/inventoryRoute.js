// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities/")
const invCont = require("../controllers/invController")

// Route to build inventory by classification view
// NO PROTEGER estas (son públicas)
router.get("/type/:classificationId", invController.buildByClassificationId)
router.get("/detail/:invId", invController.buildByInvId)

// PROTEGER TODAS ESTAS
router.get(
  "/management",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagement)
)

router.get(
  "/add-classification",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  "/add-classification",
  utilities.checkEmployeeOrAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
)

router.get(
  "/add-vehicle",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddNewVehicle)
)

router.post(
  "/add-vehicle",
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addVehicle)
)

router.get(
  "/edit/:inv_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildEditInventoryView)
)

router.post(
  "/update/",
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.get(
  "/delete/:inv_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteView)
)

router.post(
  "/delete/",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryItem)
)
router.get(
  "/getInventory/:classification_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.getInventoryJSON)
)


router.get(
  "/getInventoryPublic/:classification_id",
  
   utilities.handleErrors(invController.getRequestsJSON)
)

router.get("/request/:inv_id",
  utilities.checkLogin, 
  utilities.handleErrors(invController.buildRequestView)
);


module.exports = router;