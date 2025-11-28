// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.buildByInvId);
router.get("/management", invController.buildManagement);
router.get("/add-classification", invController.buildAddClassification);
router.get("/add-vehicle", invController.buildAddNewVehicle);
router.get("/add-classification", invController.buildAddNewVehicle);


router.post(
  "/add-vehicle",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  invController.addVehicle
  
)


router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification,
)
router.get(
  "/getInventory/:classification_id", 
  utilities.handleErrors(invController.getInventoryJSON))

module.exports = router;