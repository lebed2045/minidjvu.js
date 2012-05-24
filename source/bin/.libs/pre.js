Module['prepreRun'] = function() {
	FS.createDataFile('/', 'bmp.bmp', "qwe", true, true);

	var filePreload0 = new XMLHttpRequest;

	filePreload0.open("GET", "/djvu", true);

	filePreload0.responseType = "arraybuffer";

	filePreload0.onload = (function() {
		var arrayBuffer = filePreload0.response;
		assert(arrayBuffer, "Loading file qweqwedjvu failed.");
		var byteArray = arrayBuffer.byteLength ? new Uint8Array(arrayBuffer) : arrayBuffer;
		FS.createDataFile("/", "djvu", byteArray, true, true);
		run();
	});

	Module['canvasId']="qwecanvas";

	filePreload0.send(null);

};


Module['postRun'] = function() {
		

	//=============profiling====================
	Module['startTime'] = new Date().getTime();
	var sumTime = 0;
	var profileN = 0;

	for(i = 0; i < profileN; i++){
		_main();
		
		sumTime += (new Date().getTime() - Module['startTime']);	
		Module.print('_main() works ' + (new Date().getTime() - Module['startTime']) + ' ms');
		Module['startTime'] = new Date().getTime();
	}

	if( profileN > 0 )
		Module.print('the average run time of _main() is ' + (sumTime/profileN) + ' ms');
	//============end of profiling================
	
	Module['startTime'] = new Date().getTime();
	_qwe_loadrender_djvu();
	sumTime = (new Date().getTime() - Module['startTime']);
	Module['startTime'] = new Date().getTime();
	_qwe_save_djvu();
	
	//============end of profiling================

	var BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : console.log("warning: cannot build blobs");

	var URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : console.log("warning: cannot create object URLs");

	var hasBlobConstructor;

	try {
	  new Blob;
	  hasBlobConstructor = true;
	} catch (e) {
	  hasBlobConstructor = false;
	  console.log("warning: no blob constructor, cannot create blobs with mimetypes");
	}

	var arrayBuffer = FS.root.contents['bmp.bmp'].contents;
	assert(arrayBuffer, 'Loading file /bmp.bmp failed.');

	var bb = new BlobBuilder();
		bb.append(new Uint8Array(arrayBuffer).buffer);
	var b = bb.getBlob();
	var url = URLObject.createObjectURL(b);

	var canvas = document.getElementById("qwecanvas");
	var context = canvas.getContext("2d");
	var img = new Image();
	
	var sourceWidth = _qwe_djvu_width();
	var sourceHeight = _qwe_djvu_height();
	var destWidth = canvas.width;
	var destHeight = Math.round( (sourceHeight *  destWidth) / sourceWidth ); 
	canvas.height = destHeight;
	
	img.onload = function(){
		    var steps = sourceWidth/destWidth;
			if (steps > 4) steps = 4;
			if (steps < 1) steps = 1;
			context.globalCompositeOperation = "darker";
			context.globalAlpha = 1;
			for (i = 0; i < steps; i++)
			{
				context.drawImage(img, i, i, sourceWidth - steps + i, sourceHeight - steps + i, 0, 0, destWidth, destHeight);
				context.globalAlpha *= 1 - 1/steps;
			}

		assert(img.complete, 'Image /bmp.bmp could not be decoded');
	};
	img.onerror = function(event) {
		console.log('Image /bmp.bmp could not be decoded');
	};
	img.src = url;
	
	delete bb;
	delete b;
	delete img;
	URLObject.revokeObjectURL(url);

	//============start of profiling================

	Module.print('_load + render ' + (sumTime) + ' ms');
	Module.print('save&free + draw on canvas works ' + (new Date().getTime() - Module['startTime']) + ' ms');

	//============end of profiling==================
	
}
