let keyPressed = new Map();
document.addEventListener("keydown",(e)=>{
	keyPressed.set(e.code,true);
});
document.addEventListener("keyup",(e)=>{
	keyPressed.set(e.code,false);
});