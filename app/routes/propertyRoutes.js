const express = require('express');
const router = express.Router();
const permit = require('../middlewares/permissions');
const  upload   = require('../middlewares/multerobject');
const {
    getAllProperty,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    searchProperty,
    joinPropertyWaitlist,
    getPropertyWaitlist,
} = require('../controller/propertyController.js');

const {
    getAllUnit,
    addpropertyUnit,
    getAllpropertyUnit,
    getUnitById,
    getunitImage,
    updatepropertyUnit,
    deletepropertyUnit,
    searchpropertyUnit,
    reservepropertyUnit,
    getreservedpropertyUnit,
} = require('../controller/unitController.js')


//property routes
router.get('/', getAllProperty);
router.get('/:id', getPropertyById);
router.post('/', permit("admin"), createProperty);
router.patch('/:id', permit("admin"), updateProperty);
router.delete('/:id',permit("admin"), deleteProperty);
router.post('/search',searchProperty);
router.post('/joinwaitlist/:id', joinPropertyWaitlist);
router.get('/waitlist/:id',permit("admin"), getPropertyWaitlist);

// property-unit routes
router.get('/unit', getAllUnit);
router.post('/unit', permit("admin"), upload.single('file'), addpropertyUnit);
router.get('/unit/:propertyid', getAllpropertyUnit);
router.get('/unit/single/unitid', getUnitById);
router.get('/unit/image/:id', getunitImage);
router.patch('/unit/update/:id', permit("admin"), updatepropertyUnit);
router.delete('/unit/delete/:id', permit("admin"), deletepropertyUnit);
router.post('/unit/search/:id', searchpropertyUnit);
router.post('/unit/reserve/:unitId', reservepropertyUnit);
router.get('/unit/reservedunits/:id', permit("admin"), getreservedpropertyUnit);

module.exports = router;