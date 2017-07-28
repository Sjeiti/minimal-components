/**
 * Implementation of a linear congruential generator.<br/>
 * The linear congruential generator follows this formula: x=(a*x+c)%n where a=multiplier, c=increment and m=modulus.<br/>
 * Multiplier, increment and modulus can be set separately or via one of the presets.<br/>
 * By default the Lehmer prng is used.
 * @namespace math.lcg
 * @summary Linear congruential generator
 * @todo document
 */

var iMultiplier = 48271
	,iIncrement = 0
	,iModulus = 2147483647
	,iSeed = 123
	,oReturn = {
		rnd: rnd
		,random: random
		//
		,setMultiplier: setMultiplier
		,setIncrement: setIncrement
		,setModulus: setModulus
		//
		,getMultiplier: getMultiplier
		,getIncrement: getIncrement
		,getModulus: getModulus
		//
		,setSeed: setSeed
		//
		,presetLehmer: presetLehmer
		,presetJava: presetJava
		,presetNumeralRecipes: presetNumeralRecipes
	}
;

/**
 * Returns a random number between zero and the set modulus
 * @memberOf math.lcg
 * @param {number} [seed] The seed from which to calculate
 * @param {number} [iterate] The number of iterations
 * @returns {number} An integer between zero and the set modulus
 */
function rnd(seed,iterate) {
	if (seed!==undefined) iSeed = seed;
	if (iterate===undefined) iterate = 1;
	while (iterate--) iSeed = (iMultiplier*iSeed+iIncrement)%iModulus;
	return iSeed;
}

/**
 * Returns a random number between zero and one
 * @memberOf math.lcg
 * @param {number} [seed] The seed from which to calculate
 * @param {number} [iterate] The number of iterations
 * @returns {number} A floating point between zero and one
 */
function random(seed,iterate) {
	return rnd(seed,iterate)/iModulus;
}

/**
 * @memberOf math.lcg
 * @param {number} seed The integer seed
 */
function setSeed(seed) { iSeed = seed; }

/**
 * @memberOf math.lcg
 * @param {number} multiplier The integer multiplier
 */
function setMultiplier(multiplier){	iMultiplier = multiplier; }

/**
 * @memberOf math.lcg
 * @param {number} increment The integer increment
 */
function setIncrement(increment){	iIncrement = increment; }

/**
 * @memberOf math.lcg
 * @param {number} modulus The integer modulus
 */
function setModulus(modulus){		iModulus = modulus; }

/**
 * @memberOf math.lcg
 * @returns {number} The current multiplier
 */
function getMultiplier(){ return iMultiplier; }

/**
 * @memberOf math.lcg
 * @returns {number} The current increment
 */
function getIncrement(){ return iIncrement; }

/**
 * @memberOf math.lcg
 * @returns {number} The current modulus
 */
function getModulus(){ return iModulus; }

/**
 * Sets the current lcg settings to Lehmer
 * @memberOf math.lcg
 * @param {boolean} [minstd]
 * @returns {iddqd.math.prng.lcg}
 */
function presetLehmer(minstd) {
	iMultiplier = minstd?16807:48271;
	iIncrement = 0;
	iModulus = 2147483647; // 2E31-1 mersenne prime
	return oReturn;
}

/**
 * Sets the current lcg settings to Java
 * @memberOf math.lcg
 * @returns {math.lcg}
 */
function presetJava() {
	iMultiplier = 25214903917;
	iIncrement = 11;
	iModulus = 2E48;
	return oReturn;
}

/**
 * Sets the current lcg settings to NumeralRecipes
 * @memberOf math.lcg
 * @returns {math.lcg}
 */
function presetNumeralRecipes() {
	iMultiplier = 1664525;
	iIncrement = 1013904223;
	iModulus = 2E32;
	return oReturn;
}

export default oReturn;