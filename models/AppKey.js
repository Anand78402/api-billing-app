/** *****************************************************************************
 * ApplicationKey Model
 ******************************************************************************/
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamps');

const appKeySchema = new Schema({
    applicationKey: { type: String, required: true},
    createdAt: Date,
    updatedAt: Date
});

// middle ware in serial
appKeySchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});
// Add timestamp plugin
appKeySchema.plugin(timestamps, { index: true });
module.exports = mongoose.model('AppKey', appKeySchema);
