const express = require('express');
const router = express.Router();
const permit = require('../middlewares/permissions');
const  upload   = require('../middlewares/multerobject');
const {
    getAllProperty,
    getPropertyById,
    createProperty,
    getpropertyimages,
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
    getusersunderunit,
} = require('../controller/unitController.js')


//property routes
router.get('/', getAllProperty);
router.get('/:id', getPropertyById);
router.post('/', permit("admin"), upload.array("file", 5), createProperty);
router.get('/image/:id', getpropertyimages);
router.patch('/:id', permit("admin"), updateProperty);
router.delete('/:id',permit("admin"), deleteProperty);
router.post('/search',searchProperty);
router.post('/joinwaitlist/:id', joinPropertyWaitlist);
router.get('/waitlist/:id',permit("admin"), getPropertyWaitlist);

// property-unit routes
router.get('/allunit/', getAllUnit);
router.post('/unit', permit("admin"), upload.single('file'), addpropertyUnit);
router.get('/unit/:propertyid', getAllpropertyUnit);
router.get('/singleunit/:id', getUnitById);
router.get('/unit/image/:id', getunitImage);
router.patch('/unit/update/:id', permit("admin"), updatepropertyUnit);
router.delete('/unit/delete/:id', permit("admin"), deletepropertyUnit);
router.post('/unit/search/:id', searchpropertyUnit);
router.post('/unit/reserve/:unitId', permit("investor"), reservepropertyUnit);
router.get('/unit/user/reserve/:unitId', permit("investor admin"), getreservedpropertyUnit);
router.get('/unit/all/reserve/:unitId', permit("admin"), getusersunderunit);

module.exports = router;