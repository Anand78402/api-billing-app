/** *****************************************************************************
 * Setting Model
 ******************************************************************************/
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamps');

const keySchema = new Schema({
    secretKey: { type: String, required: true},
    createdAt: Date,
    updatedAt: Date
});

// middle ware in serial
keySchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});
// Add timestamp plugin
keySchema.plugin(timestamps, { index: true });
module.exports = mongoose.model('Key', keySchema);
