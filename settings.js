const vec3 = glMatrix.vec3;
const vec3Nulled = vec3.fromValues(0,0,0);

window.settings = {
	fov: 45,
	speed: 2,

	resolutionMult: 1/(1<<2),
	sampleSlices: 1<<16,

	importanceSampling: true,
	importanceSamples: 100,

	toneMapper: {
		smallValue: 0.02,
		a: 0.18,
	}
};

window.EPSILON = 0.00001;