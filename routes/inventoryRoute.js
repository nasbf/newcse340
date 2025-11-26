// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")

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

module.exports = router;