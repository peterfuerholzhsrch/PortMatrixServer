'use strict';


/**
 * The network switchings router module.
 */

var express = require('express');
var router = express.Router();
var networkswitchingsController = require('../controller/networkswitchingsController.js');

router.get('/:projectId/', networkswitchingsController.getNetworkswitchings);
router.get('/:projectId/:id', networkswitchingsController.getNetworkswitching);
router.put('/:projectId/:id', networkswitchingsController.saveNetworkswitching);
router.post('/:projectId/', networkswitchingsController.insertNetworkswitching);
router.delete('/:projectId/:id', networkswitchingsController.deleteNetworkswitching);

module.exports = router;