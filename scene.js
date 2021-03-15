const intersectSphere = (ray,center=vec3.fromValues(0,0,0),r=1)=>{
	let temp = vec3.create();

	vec3.sub(temp,ray.pos,center);
	vec3.scale(temp,temp,2);
	let b = vec3.dot(temp,ray.dir)

	vec3.sub(temp,ray.pos,center);
	let c_ = vec3.dot(temp,temp) - r*r;

	let disc = b*b - 4 * c_;
	if (disc < 0) return;
	disc = Math.sqrt(disc);
	let sol1 = -b + disc;
	let sol2 = -b - disc;
	let dist = (sol2 > EPSILON) ? sol2 / 2 : ((sol1 > EPSILON) ? sol1 / 2 : 0);
	if(dist<=0) return;

	let hit = vec3.create();
	vec3.scaleAndAdd(hit,ray.pos,ray.dir,dist);

	vec3.sub(temp,hit,center);
	vec3.normalize(temp,temp);
	return {dist: dist, norm: temp};
};

const sampleSphere = (point,sampler,center,radius)=>{
	// console.log(point,sampler,center,radius)
	let count = 0;
	let ray_working = {pos: point, dir: sampler()};
	for (let i = 0; i < settings.importanceSamples; i++) {
		let ray = {pos: point, dir: sampler()};
		if(intersectSphere(ray,center,radius)) {
			count++;
			ray_working = ray;
		}
	}
	ray_working.p = count/settings.importanceSamples;
	return ray_working;
};

class Scene {
	constructor() {
		this.lightBoundingSpheres = [];
		this.meshes = loadObj(document.getElementById('cornellbox-nodata.obj').innerHTML);
		// this.meshes.push(...loadObj(document.getElementById('teapot.obj').innerHTML));
		console.log(this.meshes);
		this.addLightBoundingSphereFromMesh(this.meshes[0]);
	}
	addLightBoundingSphereFromMesh(mesh) {
		let center = vec3.create();
		for (let i = 0; i < mesh.vertices.length; i+=3) {
			let v = vec3.fromValues(
				mesh.vertices[i+0],
				mesh.vertices[i+1],
				mesh.vertices[i+2]);
			vec3.add(center,center,v);
		}
		vec3.scale(center,center,3/mesh.vertices.length);

		let radius = 0;
		for (let i = 0; i < mesh.vertices.length; i+=3) {
			let v = vec3.fromValues(
				mesh.vertices[i+0],
				mesh.vertices[i+1],
				mesh.vertices[i+2]);
			let d = vec3.dist(center,v);
			if(d>radius) radius=d;
		}

		this.lightBoundingSpheres.push({
			center: center,
			radius: radius,
			material: mesh.material,
		});
		console.log(this)
	}
	intersect(ray) {
		let closest = {dist: Infinity, material: 0};
		for (let i = 0; i < this.meshes.length; i+=1) {
			let hit = this.meshes[i].intersect(ray);
			if(!hit) continue;
			if(closest.dist>hit.dist) closest = hit;
		}
		return closest;

		// let hit1 = intersectSphere(ray,vec3.fromValues(0,0,0),0.5);
		// if(!hit1) hit1 = {dist: Infinity};
		// hit1.material = 4;
		// let hit1 = intersectTriangle(ray,v0,v1,v2);
		// if(!hit1) hit1 = {dist: Infinity};
		// hit1.material = 4;
		// let hit1 = mesh.intersect(ray);
		let hit1 = closest;
		let hit2 = intersectSphere(ray,this.lightBoundingSpheres[0].pos,this.lightBoundingSpheres[0].r);
		if(!hit2) hit2 = {dist: Infinity};
		hit2.material = 1;

		if(hit1.dist<hit2.dist && hit1.dist != Infinity) return hit1;
		if(hit2.dist != Infinity) return hit2;
		return {material: 0};
	}
	traceDirect(point,sampler,depth) {
		let color = vec3.create();
		// if(depth>1) return color;
		for (let i = 0; i < this.lightBoundingSpheres.length; i++) {
			let s = this.lightBoundingSpheres[i];
			let ray = sampleSphere(point,sampler,s.center,s.radius);
			let hit = this.intersect(ray);
			if(hit.material===s.material) {
				let c = materials[s.material](ray,hit,depth);
				vec3.scale(c,c,ray.p);
				vec3.add(color,color,c);
			}
		}
		return color;
	}
	traceIndirect(ray,depth) {
		let p = depth>=2?0.5:1;
		if(Math.random()>p) return vec3.create();
		let hit = this.intersect(ray);

		if(settings.importanceSampling && materials[hit.material].isDirect) return vec3.create();

		let c = materials[hit.material](ray,hit,depth);
		vec3.scale(c,c,1/p);
		return c;
	}
	trace(ray,depth=0) {
		let p = depth>=2?0.5:1;
		if(Math.random()>p) return vec3.create();
		let hit = this.intersect(ray);

		let c = materials[hit.material](ray,hit,depth);
		vec3.scale(c,c,1/p);
		return c;
	}
}