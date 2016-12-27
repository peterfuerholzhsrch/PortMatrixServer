"use strict";
/**
 * Created by pfu on 26/10/16.
 *
 * The router module.
 */

var express = require('express');
var router = express.Router();
var networkswitchingsController = require('../controller/networkswitchingsController.js');

router.get("/api/nwsw", networkswitchingsController.getNetworkswitchings);
router.get("/api/nwsw/:id", networkswitchingsController.getNetworkswitching);
router.put("/api/nwsw/:id", networkswitchingsController.saveNetworkswitching); // upsert
router.post("/api/nwsw", networkswitchingsController.insertNetworkswitching);  // insert
router.delete("/api/nwsw/:id", networkswitchingsController.deleteNetworkswitching);

module.exports = router;