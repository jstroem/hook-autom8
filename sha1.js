var crypto = require('crypto');

exports = module.exports = function(input){
    return crypto.createHash('sha1').update(input.toString()).digest('hex');
};