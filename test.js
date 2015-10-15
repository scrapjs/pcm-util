var util = require('./');
var assert = require('assert');

describe('Method suffix', function () {

});

describe('Normalize format', function () {

});

describe('Sample conversions', function () {
	it('FloatLE → Int16BE', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1.0, 0);
		buf.writeFloatLE(-0.5, 4);

		var newBuf = util.convertFormat(buf, { float: true }, { float: false, signed: true, bitDepth: 16, byteOrder: 'BE' });
		var val1 = newBuf.readInt16BE(0);
		var val2 = newBuf.readInt16BE(2);

		assert.equal(Math.pow(2, 15) - 1, val1);
		assert.equal(-Math.pow(2, 14), val2);
	});
});

describe('Map samples', function () {
	it('Simple', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1.0, 0);
		buf.writeFloatLE(-0.5, 4);

		var newBuf = util.mapSamples(buf, function (value) { return -1 * value;}, { float: true });
		var val1 = newBuf.readFloatLE(0);
		var val2 = newBuf.readFloatLE(4);

		assert.equal(-1, val1);
		assert.equal(0.5, val2);
	});
});

describe('Get channel data', function () {

});