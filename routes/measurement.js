/*******************************************************************************
 * Measurement Routes
 ******************************************************************************/
'use strict';
const MeasurementController = require('../controllers/MeasurementController')
const auth = require('../helpers/auth').validate;
const validator = require('express-joi-validation').createValidator({});
const MeasurementSchema = require('../validations/measurement-schema');

module.exports = function (app) {
    app.post('/admin/api/add/measurement', auth, validator.body(MeasurementSchema.createMeasurement), function (req, res) {
        MeasurementController.addMeasurement(req, res);
    });
    app.put('/admin/api/update/measurement/:id', auth, validator.body(MeasurementSchema.updateMeasurement), function (req, res) {
        MeasurementController.updateMeasurment(req, res);
    });
    app.delete('/admin/api/delete/measurement/:id', auth, function (req, res) {
        MeasurementController.deleteMeasurement(req, res);
    });
    app.get('/admin/api/get/measurements', auth, function (req, res) {
        MeasurementController.getMeasurements(req, res);
    })
    app.get('/admin/api/get/measurement/:id', auth, function (req, res) {
        MeasurementController.getMeasurementDetail(req, res);
    })
    app.get('/admin/api/get/options/device', auth, function (req, res) {
        MeasurementController.getDeviceOptions(req, res);
    })
    app.post('/admin/api/measurement/setRilevamenti', validator.body(MeasurementSchema.addDeviceMeasurement),  function (req, res) {
        MeasurementController.addDeviceMeasurement (req, res);
    })
    app.put('/admin/api/update/user/:id', auth, function (req, res) {
        MeasurementController.updateUserInMeasurements(req, res);
    });
    app.post('/api/measurement/getRilevamenti', validator.body(MeasurementSchema.getDeviceMeasurements), function (req,res){
        MeasurementController.getDeviceMeasurements(req, res);
    })
};
