const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');


const {
  getAllMachines,
  getMachineWiseActiveAllotments,
} = require('../controllers/common.controller.js');
const { getStatsByResReqId } = require('../controllers/reportGeneration.controller.js');

router.use(requireAuth);
router.get('/get_machines', getAllMachines);
router.get('/allotments/:machineId', getMachineWiseActiveAllotments);
router.get('/getStatsByResReqId/:resourceRequestId',getStatsByResReqId)
module.exports = router;