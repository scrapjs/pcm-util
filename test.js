var util = require('./');
var assert = require('assert');

describe('Method suffix', function () {

});

describe('Normalize format', function () {
	it('Keep prototype values', function () {
		var A = function(){};
		A.prototype = Object.create({samplesPerFrame: 1});
		var a = new A();
		util.normalizeFormat(a);
		assert.equal(a.samplesPerFrame, 1);
	});
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
	it('Float', function () {
		var buf = new Buffer(8);
		buf.writeFloatLE(1.0, 0);
		buf.writeFloatLE(-0.5, 4);

		var newBuf = util.mapSamples(buf, function (value) { return -1 * value;}, { float: true });
		var val1 = newBuf.readFloatLE(0);
		var val2 = newBuf.readFloatLE(4);

		assert.equal(-1, val1);
		assert.equal(0.5, val2);
	});

	it('Int', function () {
		var buf = new Buffer(8);
		buf.writeInt16LE(20000, 0);
		buf.writeInt16LE(-10000, 4);

		var newBuf = util.mapSamples(buf, function (value) { return -1 * value;});
		var val1 = newBuf.readInt16LE(0);
		var val2 = newBuf.readInt16LE(4);

		assert.equal(-20000, val1);
		assert.equal(10000, val2);
	});
});

describe('Get channel data', function () {

});