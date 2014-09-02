/**
 * Created by Emmanuel on 27.08.2014.
 */
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LinkDumpSchema   = new Schema({
    links: []
});

module.exports = mongoose.model('LinkDump', LinkDumpSchema);