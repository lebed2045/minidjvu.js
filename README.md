minidjvu.js
===========

MiniDjVu.js is an open sourse DjVu decoder on JavaScript based on [minidjvu-0.8](http://djvulibre.djvuzone.org)

How to use
----------

* download script-file minidivu.js

* include it in your HTML web-page

* call from minidjvu.js function `renderdjvu(<filename.js>,<id_canvas>)`, with two arguments: `<filename>` - path to DjVu onepage black&white file, `<id_canvas>` - HTML identifier of a canvas. For example:

```html
		<script type='text/javascript' src='minidjvu.js'></script>
		<canvas id="djvucanvas" width="800">			    
			<script type='text/javascript'>
				renderdjvu("sample.djvu","djvucanvas");
			</script>
		</canvas>
```
this sample draw sample.djvu on canvas with id="djvucanvas", pay attention a rendered page is exactly equal to the width of canvas - so make sure to specify the width of the canvas!

**Warning!**

HTML web-page must located on a Web server, and  DjVu documents should be placed on the same domain as the HTML file. 

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

 + Lebedkin	lebed.salavat at gmail.com	

 + Bannikov	bannandrej at gmail.com

