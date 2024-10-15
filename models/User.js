/*******************************************************************************
 * User Model
 ******************************************************************************/
'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamps');

// Define device token setting
const deviceTokenSchema = new Schema({
  deviceId: { type: String, default: 'Freeasy' },
  deviceToken: { type: String, default: 'Freeasy' },
  deviceType: { type: String, default: 'Web', enum: ['Web', 'Android', 'Iphone'] }
});

//Define User schema
const UserSchema = new Schema({
  fullName: { type: String, default: '' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, trim: true, required: true }, //select: false
  userType: { type: Number, default: 2, enum: [1, 2] }, // 1=>Admin User, 2=>Normal user
  loginCode: { type: String, default: '' },
  picture: { type: String, default: '' },
  lastLogin: { type: Date, default: '' },
  loginAttempDate: { type: Date, default: '' },
  loginAttemp: { type: Number, default: 0 },
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken: { type: String, default: '' },
  forgotPasswordToken: { type: String, default: '' },
  forgotPasswordCode: { type: String, default: '' },
  firstLogin: { type: Boolean, default: false, enum: [true, false] },
  isActive: { type: Boolean, default: true, enum: [true, false] },
  isLoggedIn: { type: Boolean, default: false, enum: [true, false] },
  tokens: [{ type: deviceTokenSchema }],
  address: { type: String, default: '' },
  state: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  region: { type: String, default: '' },
  province: { type: String, default: '' },
  zipCode: { type: String, default: '' },
  createdAt: Date,
  updatedAt: Date
});

//middle ware in serial
UserSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  if (this.firstName)
    this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1);
  if (this.lastName)
    this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1);
  if (this.email)
    this.email = this.email ? this.email.toLowerCase().trim() : this.email;
  if (this.fullName)
    this.fullName = this.fullName.charAt(0).toUpperCase() + this.fullName.slice(1);
  next();
});

// Add timestamp plugin
UserSchema.plugin(timestamps, { index: true });
module.exports = mongoose.model('User', UserSchema);
