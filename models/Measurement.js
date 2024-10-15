/** *****************************************************************************
 * Measurement Model
 ******************************************************************************/
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamps');

const measurementSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    device: { type: Schema.Types.ObjectId, ref: 'Device', required: true },
    measure: { type: Number, required: true},
    scale: { type: String, default: 'C', enum: ['C', 'F'], required: true },
    measureDateTime: { type: Date, required: true, default: Date.now },
    createdAt: Date,
    updatedAt: Date
});

// middle ware in serial
measurementSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});
// Add timestamp plugin
measurementSchema.plugin(timestamps, { index: true });
module.exports = mongoose.model('Measurement', measurementSchema);
