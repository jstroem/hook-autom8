exports = module.exports = function(err){
	if (err istanceof Error)
		throw err;
	else
		throw new Error(err);
};