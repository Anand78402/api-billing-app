/** *****************************************************************************
 * Device Model
 ******************************************************************************/
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamps');

const deviceSchema = new Schema({
    deviceName: { type: String, default: '' },
    deviceCode: { type: String, required: true },
    description: { type: String, default: '' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    deviceConnected: { type: Boolean, default: false ,enum: [true, false]},
    createdAt: Date,
    updatedAt: Date
});

// middle ware in serial
deviceSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    if (this.deviceName) this.deviceName = this.deviceName.charAt(0).toUpperCase() + this.deviceName.slice(1);
    next();
});
// Add timestamp plugin
deviceSchema.plugin(timestamps, { index: true });
module.exports = mongoose.model('Device', deviceSchema);
