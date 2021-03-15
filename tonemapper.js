const tonemap = (samples,sampleCount,pixels)=>{
	let sampleCount_inv = 1/sampleCount;
	// for (let i = 0; i < pixels.length/4; i++) {
	// 	pixels[i*4] = Math.sqrt(samples[i*3])*255;
	// 	pixels[i*4+1] = Math.sqrt(samples[i*3+1])*255;
	// 	pixels[i*4+2] = Math.sqrt(samples[i*3+2])*255;
	// }
	// return;
	// Reinhard tonemapper
	let sum = 0;
	for (let i = 0; i < samples.length; i++) {
		if(samples[i]<0) continue;
		sum += Math.log(samples[i]*sampleCount_inv+settings.toneMapper.smallValue);
	}
	let lw = Math.exp(sum/samples.length);
	// console.log(sum,lw,samples.length)

	const a = settings.toneMapper.a;
	for (let i = 0; i < pixels.length/4; i++) {
		pixels[i*4+0] = Math.sqrt(a/lw*samples[i*3  ]*sampleCount_inv)*255;
		pixels[i*4+1] = Math.sqrt(a/lw*samples[i*3+1]*sampleCount_inv)*255;
		pixels[i*4+2] = Math.sqrt(a/lw*samples[i*3+2]*sampleCount_inv)*255;
	}
};