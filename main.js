window.addEventListener("load",()=>{
	window.canvas = document.querySelector("#canvas");
	window.c = canvas.getContext("2d");
	let width;
	let height;
	let aspect_ratio;
	let sampleCount;
	let sampleSlice;
	let samples;

	window.scene = new Scene();
	window.camera = new Camera();

	const resize = ()=>{
		canvas.width = window.innerWidth*settings.resolutionMult;
		canvas.height = window.innerHeight*settings.resolutionMult;

		width = canvas.width;
		height = canvas.height;
		aspect_ratio = width/height;
		sampleCount = 1;
		sampleSlice = 0;
		samples = new Float32Array(width*height*3);

		while(settings.sampleSlices>height) settings.sampleSlices /= 2;

		c.fillStyle = "rgba(0,0,0,1)";
		c.fillRect(0,0,width,height);
	}
	window.reset = ()=>{resize();};
	window.addEventListener("resize",resize);


	let lastFrame = performance.now();
	const draw = ()=>{
		requestAnimationFrame(draw);
		let currentTime = performance.now();
		let dTime = (currentTime-lastFrame)/1000;
		lastFrame = currentTime;
		document.querySelector("#fps").innerText = `FPS: ${Math.round(1/dTime)}`;
		document.querySelector("#spp").innerText = `SPP: ${sampleCount}`;
		document.querySelector("#samples").innerText = `SAMPLES: ${sampleCount*width*height}`;



		camera.update(dTime);



		// c.clearRect(0,0,width,height);

		const get = (pixel_x,pixel_y)=>{
			let i = (pixel_x+pixel_y*width)*3;
			return glMatrix.vec3.fromValues(samples[i],samples[i+1],samples[i+2]);
		};

		const set = (pixel_x,pixel_y,p)=>{
			let i = (pixel_x+pixel_y*width)*3;
			samples[i] = p[0];
			samples[i+1] = p[1];
			samples[i+2] = p[2];
		};

		// let sampleCountAfter = sampleCount+settings.spp;
		// let sampleCountAfter_inv = 1/sampleCountAfter;

		for(let pixel_y=sampleSlice; pixel_y<height; pixel_y+=settings.sampleSlices) {
			for(let pixel_x=0; pixel_x<width; pixel_x++) {
				let p = get(pixel_x,pixel_y);
				// if(sampleCount>1000 && p[0]==0 && p[1]==0 && p[2]==0) {
				// 	continue;
				// }

				let ray = camera.sampleRay(width,height,pixel_x+Math.random(),pixel_y+Math.random());
				let color = scene.trace(ray);

				// vec3.scale(p,p,sampleCount);
				vec3.add(p,p,color);
				// vec3.scale(p,p,sampleCountAfter_inv);
				// p[0] = (p[0]*sampleCount+hits*255)/(sampleCount+settings.spp);
				set(pixel_x,pixel_y,p);
			}
		}
		sampleSlice++;
		if(sampleSlice >= settings.sampleSlices) {
			sampleSlice = 0;
			sampleCount++;
			if(dTime<0.05) {
				settings.sampleSlices /= 2;
				console.log(settings.sampleSlices)
			}
		}

		let imageData = c.getImageData(0,0,width,height);
		let pixels = imageData.data;

		tonemap(samples,sampleCount,pixels);

		c.putImageData(imageData,0,0);
	};

	resize();
	requestAnimationFrame(draw);
});