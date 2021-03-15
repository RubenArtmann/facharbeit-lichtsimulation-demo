let v0v1 = vec3.create();
let v0v2 = vec3.create();
let pvec = vec3.create();
let tvec = vec3.create();
let qvec = vec3.create();
// nicht von mir (wegen geschwindigkeit)
const intersectTriangle = (ray, v0, v1, v2)=>{
	// Vec3f v0v1 = v1 - v0;
	vec3.sub(v0v1,v1,v0);
	// Vec3f v0v2 = v2 - v0;
	vec3.sub(v0v2,v2,v0);

	// Vec3f pvec = dir.crossProduct(v0v2);
	vec3.cross(pvec,ray.dir,v0v2);
	// float det = v0v1.dotProduct(pvec);
	let det = vec3.dot(v0v1,pvec);

	if (det < EPSILON) return;

	let invDet = 1 / det;

	// Vec3f tvec = orig - v0;
	vec3.sub(tvec,ray.pos,v0);
	// u = tvec.dotProduct(pvec) * invDet;
	let u = vec3.dot(tvec,pvec) * invDet;
	if (u < 0 || u > 1) return;

	// Vec3f qvec = tvec.crossProduct(v0v1);
	vec3.cross(qvec,tvec,v0v1);
	// v = dir.dotProduct(qvec) * invDet;
	let v = vec3.dot(ray.dir,qvec) * invDet;
	if (v < 0 || u + v > 1) return;

	// t = v0v2.dotProduct(qvec) * invDet;
	let t = vec3.dot(v0v2,qvec) * invDet;

	if(t<0) return;

	let norm = vec3.create();
	vec3.cross(norm,v0v1,v0v2);
	vec3.normalize(norm,norm);

	return {dist: t, norm: norm};
};

let tempV0 = vec3.create();
let tempV1 = vec3.create();
let tempV2 = vec3.create();

class Mesh {
	constructor(material) {
		this.vertices = new Float32Array();
		this.material = material;
	}
	intersect(ray) {
		let closest = {dist: Infinity};
		for (let i = 0; i < this.vertices.length; i+=9) {
			tempV0[0] = this.vertices[i+0];
			tempV0[1] = this.vertices[i+1];
			tempV0[2] = this.vertices[i+2];
			tempV1[0] = this.vertices[i+3];
			tempV1[1] = this.vertices[i+4];
			tempV1[2] = this.vertices[i+5];
			tempV2[0] = this.vertices[i+6];
			tempV2[1] = this.vertices[i+7];
			tempV2[2] = this.vertices[i+8];
			// console.log(tempV0,tempV1,tempV2)
			let hit = intersectTriangle(ray,tempV0,tempV1,tempV2);
			if(!hit) continue;
			if(closest.dist>hit.dist) closest = hit;
		}
		closest.material = this.material;
		// this.indices = new Float32Array();
		return closest;
	}
}


const loadObj = (string)=>{
	let meshes = [];
	let obj = new OBJ.Mesh(string);
	console.log(obj)
	for (let i = 0; i < obj.indicesPerMaterial.length; i++) {
		let mesh = new Mesh(getMaterial(obj.materialNames[i]));
		mesh.materialString = obj.materialNames[i];
		let indices = obj.indicesPerMaterial[i];
		let vertices = obj.vertices;

		mesh.vertices = new Float32Array(indices.length*3);
		for (let i = 0; i < indices.length; i++) {
			mesh.vertices[i*3+0] = vertices[indices[i]*3+0];
			mesh.vertices[i*3+1] = vertices[indices[i]*3+1];
			mesh.vertices[i*3+2] = vertices[indices[i]*3+2];
		}
		meshes.push(mesh);
	}
	return meshes;
};