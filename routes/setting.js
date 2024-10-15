/*******************************************************************************
 * key Routes
 ******************************************************************************/
'use strict';
const SettingController = require('../controllers/SettingController')
const auth = require('../helpers/auth').validate;
const validator = require('express-joi-validation').createValidator({});
const SettingSchema = require('../validations/setting-schema');

module.exports = (app) => {
  app.post('/admin/api/add/key', validator.body(SettingSchema.addKey), auth,  function(req, res) {
    SettingController.addKey(req, res);
  });
  app.put('/admin/api/update/key/:id', validator.body(SettingSchema.addKey), auth,  function(req, res)  {
    SettingController.updateKey(req, res);
  });
  app.delete('/admin/api/delete/key/:id',auth, function(req, res) {
    SettingController.deleteKey(req, res);
  });
  app.get('/admin/api/key', auth, function (req, res)  {
    SettingController.getKeyDetail(req, res);
  });
  // appKey
  app.post('/admin/api/add/appkey', validator.body(SettingSchema.addAppKey), auth, function(req, res) {
    SettingController.addAppKey(req, res);
  });
  app.put('/admin/api/update/appkey/:id', validator.body(SettingSchema.addAppKey), auth, function(req, res)  {
    SettingController.updateAppKey(req, res);
  });
  app.delete('/admin/api/delete/appkey/:id', auth, function(req, res) {
    SettingController.deleteAppKey(req, res);
  });
  app.get('/admin/api/detail/appkey', auth, function (req, res)  {
    SettingController.getAppKeyDetail(req, res);
  });
};

