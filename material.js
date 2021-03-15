const red   = vec3.fromValues( 0.31, 0.06, 0.06);
const green = vec3.fromValues( 0.16, 0.39, 0.1 );
const white = vec3.fromValues( 0.74, 0.74, 0.75);
const lamp  = vec3.fromValues(15.6, 12, 4);

// blue  ~ 450nm
// green ~ 550nm
// red   ~ 600nm

// const red   = vec3.fromValues(0.287,0.058,0.040);
// const green = vec3.fromValues(0.160,0.285,0.092);
// const white = vec3.fromValues(0.740,0.747,0.343);
// const lamp  = vec3.fromValues(15.6 ,8    ,0    );

// Uniform sampling on a hemisphere to produce outgoing ray directions.
// from http://www.rorydriscoll.com/2009/01/07/better-sampling/
// nicht von mir
const hemisphere = ()=>{
	const u1 = Math.random();
	const u2 = Math.random();
	const r = Math.sqrt(1.0 - u1*u1);
	const phi = 2 * Math.PI * u2;
	return vec3.fromValues(Math.cos(phi)*r, Math.sin(phi)*r, u1);
};

// nicht von mir
const ons = (v1, v2, v3)=>{
	if (Math.abs(v1[0]) > Math.abs(v1[1])) {
		let invLen = 1 / Math.sqrt(v1[0] * v1[0] + v1[2] * v1[2]);
		v2[0] = -v1[2] * invLen;
		v2[1] = 0;
		v2[2] = v1[0] * invLen;
	} else {
		let invLen = 1 / Math.sqrt(v1[1] * v1[1] + v1[2] * v1[2]);
		v2[0] = 0;
		v2[1] = v1[2] * invLen;
		v2[2] = -v1[1] * invLen;
	}
	vec3.cross(v3,v1,v2);
};

const diffuse = (ray,hit,depth)=>{
	let rotX = vec3.create();
	let rotY = vec3.create();
	let temp1 = vec3.create();
	ons(hit.norm, rotX, rotY);
	let cost;
	const sampler = ()=>{
		let sampledDir = hemisphere();
		let rotatedDir = vec3.create();
		temp1[0] = rotX[0];
		temp1[1] = rotY[0];
		temp1[2] = hit.norm[0];
		rotatedDir[0] = vec3.dot(temp1, sampledDir);
		temp1[0] = rotX[1];
		temp1[1] = rotY[1];
		temp1[2] = hit.norm[1];
		rotatedDir[1] = vec3.dot(temp1, sampledDir);
		temp1[0] = rotX[2];
		temp1[1] = rotY[2];
		temp1[2] = hit.norm[2];
		rotatedDir[2] = vec3.dot(temp1, sampledDir);
		cost = vec3.dot(rotatedDir,hit.norm);
		return rotatedDir;
	};

	let pos = vec3.create();
	vec3.scaleAndAdd(pos,ray.pos,ray.dir,hit.dist);

	let c = scene.traceIndirect({pos: pos, dir: sampler()},depth+1);
	vec3.scale(c,c,cost);

	if(settings.importanceSampling) {
		let cDirect = scene.traceDirect(pos,sampler,depth+1);
		vec3.scale(cDirect,cDirect,cost);
		vec3.add(c,c,cDirect);
	}

	return c;
};

materials = [
	/*no material*/()=>{
		return vec3.fromValues(0,0,0);
	},
	/*show normals*/(ray,hit)=>{
		throw new Error();
		return hit.norm;
		hit.norm[0] = Math.abs(hit.norm[0]);
		hit.norm[1] = Math.abs(hit.norm[1]);
		hit.norm[2] = Math.abs(hit.norm[2]);
		// vec3.scaleAndAdd(hit.norm,hit.norm,vec3.fromValues(0.5,0.5,0.5),0.5);
		// vec3.scale(hit.norm,hit.norm,brightness);
		return hit.norm;
	},
	/*(fake)diffuse grey*/(ray,hit)=>{
		throw new Error();
		let lightPos = vec3.fromValues(1,2,-2);
		let rayPos = vec3.create();
		vec3.scaleAndAdd(rayPos,ray.pos,ray.dir,hit.dist);
		let light = 1/vec3.dist(rayPos,lightPos)*2;

		return vec3.fromValues(light,light,light);//1-(hit.dist-1)/4);
	},
	/*mirror*/(ray,hit,depth)=>{
		// return vec3.fromValues(0,0,0.7);
		let temp = vec3.create();
		let cost = vec3.dot(ray.dir,hit.norm);
		// double cost = ray.d.dot(N);
		vec3.scale(temp,hit.norm,cost*2);
		vec3.sub(temp,ray.dir,temp);
		vec3.normalize(temp,temp);
		// ray.d = (ray.d - N*(cost * 2)).norm();


		// return temp;
		// return materials[1](null,{norm:temp});

		// vec3.scaleAndAdd(temp,temp,vec3.fromValues(0.5,0.5,0.5),0.5)
		// return temp;

		let pos = vec3.create();
		vec3.scaleAndAdd(pos,ray.pos,ray.dir,hit.dist);
		let c = scene.trace({pos: pos, dir: temp},depth+1);
		vec3.scale(c,c,0.7);
		// let cDiffuse = diffuse(ray,hit,depth);
		// vec3.scale(cDiffuse,cDiffuse,0.2);
		// vec3.add(c,c,cDiffuse);
		return c;
	},
	/*white*/(ray,hit,depth)=>{
		let c = diffuse(ray,hit,depth);
		vec3.mul(c,c,white);
		return c;
	},
	/*red*/(ray,hit,depth)=>{
		let c = diffuse(ray,hit,depth);
		vec3.mul(c,c,red);
		return c;
	},
	/*green*/(ray,hit,depth)=>{
		let c = diffuse(ray,hit,depth);
		vec3.mul(c,c,green);
		return c;
	},
	/*lamp*/(ray,hit,depth)=>{
		return vec3.clone(lamp);
	}
];

materials[7].isDirect = true;

const getMaterial = (name)=>{
	let material = {
		Emitter: 7,
		box_Material: 3,
		cbox_Material: 4,
		cbox_red: 5,
		cbox_green: 6,
	}[name];
	if(material === undefined) throw new Error(`${name} is not a material`);
	return material;
};