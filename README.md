minidjvu.js
===========

MiniDjVu.js is an open sourse DjVu decoder on JavaScript based on [minidjvu-0.8](http://minidjvu.sourceforge.net/)

How to use
----------

* download script-file from repository [minidivu.js](https://raw.github.com/lebedkin/minidjvu.js/master/minidjvu.js)

* include it in your HTML web-page

* call from minidjvu.js function `renderdjvu(<filename.js>,<id_canvas>)`, with two arguments: `<filename>` - path to DjVu onepage black&white file, `<id_canvas>` - HTML identifier of a canvas. 

For example:

```html
<html>
	<head>
		<title>Sample</title>
		<script type='text/javascript' src='minidjvu.js'></script>	<!-- include library-->
	</head>

	<body>
		<canvas id="djvucanvas" width="800" hight="1200">			    
			<script type='text/javascript'>
				renderdjvu("sample.djvu","djvucanvas");
			</script>
		</canvas>
	</body>
</html>
```
this sample draw sample.djvu on canvas with id="djvucanvas", pay attention a rendered page is exactly equal to the size of canvas - so make sure to specify the size of the canvas!

**Warning!** HTML web-page must located on a Web server, and  DjVu documents should be placed on the same domain as the HTML file. 

Demo
----

[onlineReader](http://ntfs.narod.ru/onlineReader.html) - Simple online books reader


How to modify
-------------

* Clone the repo `git clone https://lebedkin@github.com/lebedkin/minidjvu.js.git`

* Install and config [emscripten](https://github.com/kripken/emscripten/wiki/Tutorial)

* Lunch make.sh to build project `./make.sh`

Currently under development
---------------------------

* Multypages

* Encryption

* Compatibility with Opera 11.1 and later versions


Authors
-------

Author of original C code:

 + Ilya Mezhirov	http://djvulibre.djvuzone.org

Authors of .js library: 

 + Lebedkin - lebed.salavat at gmail.com	

 + Bannikov - bannandrej at gmail.com

Supervisor 

 + Alexander Shen - alexander.shen at lirmm.fr

