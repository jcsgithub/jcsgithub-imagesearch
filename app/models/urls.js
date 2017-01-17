'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Url = new Schema({
    original_url: String,
    short_url: String
});

module.exports = mongoose.model('Url', Url);
