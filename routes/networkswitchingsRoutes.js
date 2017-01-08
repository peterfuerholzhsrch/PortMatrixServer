"use strict";
/**
 * Created by pfu on 26/10/16.
 *
 * The router module.
 */

var express = require('express');
var router = express.Router();
var networkswitchingsController = require('../controller/networkswitchingsController.js');

router.get("/", networkswitchingsController.getNetworkswitchings);
router.get("/:id", networkswitchingsController.getNetworkswitching);
router.put("/:id", networkswitchingsController.saveNetworkswitching); // upsert
router.post("/", networkswitchingsController.insertNetworkswitching);  // insert
router.delete("/:id", networkswitchingsController.deleteNetworkswitching);

module.exports = router;