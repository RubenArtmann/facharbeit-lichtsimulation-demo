class Camera {
	constructor(x=-2.78,y=2.73,z=8,rH=0,rV=0) {
		this.pos = glMatrix.vec3.fromValues(x,y,z);
		this.view = glMatrix.mat4.create();
		this.fov = settings.fov*2*Math.PI/360;
		this.halfPlaneWidth = Math.tan(this.fov/2);
		console.log(this.halfPlaneWidth)
		this.halfPlaneWidth = 0.35;

		this.rotateZ = -Math.PI;
		this.rotateX = 0;


		// m.mat4.identity(view_dir);
		// m.mat4.rotateX(view_dir,view_dir,-dy);
		// m.mat4.rotateZ(view_dir,view_dir,dx);
	}
	sampleRay(width,height,pixel_x,pixel_y) {
		let width_inv = 1/width;
		let x = (pixel_x *width_inv *2 -1)*this.halfPlaneWidth;
		let y = (pixel_y *width_inv *2 -(height*width_inv))*this.halfPlaneWidth;

		let dist = Math.sqrt(x*x+y*y+1);
		let dist_inv = 1/dist;
		x *= dist_inv;
		y *= dist_inv;

		let dir = vec3.fromValues(-x,y,-dist_inv);
		vec3.rotateX(dir,dir,vec3Nulled,this.rotateX);
		vec3.rotateZ(dir,dir,vec3Nulled,this.rotateZ);

		return {pos: this.pos, dir: dir};
	}
	update(dTime) {
		if(keyPressed.get("KeyW")) {
			this.pos[1] -= dTime * settings.speed;
			reset();
		}
		if(keyPressed.get("KeyS")) {
			this.pos[1] += dTime * settings.speed;
			reset();
		}
		if(keyPressed.get("KeyA")) {
			this.pos[0] -= dTime * settings.speed;
			reset();
		}
		if(keyPressed.get("KeyD")) {
			this.pos[0] += dTime * settings.speed;
			reset();
		}
		if(keyPressed.get("ShiftLeft")) {
			this.pos[2] -= dTime * settings.speed;
			reset();
		}
		if(keyPressed.get("ControlLeft")) {
			this.pos[2] += dTime * settings.speed;
			reset();
		}
		if(keyPressed.get("ArrowUp")) {
			this.rotateX -= dTime;
			reset();
		}
		if(keyPressed.get("ArrowDown")) {
			this.rotateX += dTime;
			reset();
		}
		if(keyPressed.get("ArrowLeft")) {
			this.rotateZ -= dTime;
			reset();
		}
		if(keyPressed.get("ArrowRight")) {
			this.rotateZ += dTime;
			reset();
		}
	}
}