/*******************************************************************************
 * Device Routes
 ******************************************************************************/
'use strict';
const DeviceController = require('../controllers/DeviceController')
const auth = require('../helpers/auth').validate;
const validator = require('express-joi-validation').createValidator({});
const DeviceSchema = require('../validations/device-schema');

module.exports = function (app) {
    app.post('/admin/api/create/device', auth, validator.body(DeviceSchema.create), function (req, res) {
        DeviceController.createDevice(req, res);
    });
    app.put('/admin/api/update/device/:id', auth, validator.body(DeviceSchema.update),  function (req, res) {
        DeviceController.updateDevice(req, res);
    });
    app.delete('/admin/api/delete/device/:id', auth, function (req, res) {
        DeviceController.deleteDevice(req, res);
    });
    app.get('/admin/api/get/devices', auth, function (req, res) {
        DeviceController.getDevices(req, res);
    })
    app.get('/admin/api/get/device/:id', auth, function (req, res) {
        DeviceController.getDeviceDetail(req, res);
    })
    app.get('/admin/api/get/users', auth, function (req, res) {
        DeviceController.getUsersList(req, res);
    });
    app.post('/api/device/setDevice', function (req,res){
        DeviceController.setDevice(req,res);
    })
    app.get('/api/device/name', function (req, res) {
        DeviceController.getName(req, res);
    })
    app.get('/admin/api/fridge/name', function (req, res) {
        DeviceController.getFridgeName(req, res);
    })
};
