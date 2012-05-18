minidjvu.js
===========

MiniDjVu.js is an open sourse DjVu decoder on JavaScript based on [minidjvu-0.8](http://djvulibre.djvuzone.org)

How to use
----------

* download file minidivu.js

* call from minidjvu.js a function `renderDjvu(<filename.js>,<id_canvas>)`, where `<filename>` - path to DjVu onepage black&white file, `<id_canvas>` - HTML identifier of a canvas. For example:

```
		<script type='text/javascript' src='minidjvu.js'></script>
		<canvas id="djvucanvas" width="800">			    
			<script type='text/javascript'>
				renderdjvu("sample.djvu","djvucanvas");
			</script>
		</canvas>
```

Demo
----

[onlineReader](http://ntfs.narod.ru/onlineReader.html) - Simple online books reader


How to modify
-------------

* Clone the repo `git clone https://lebedkin@github.com/lebedkin/minidjvu.js.git`

* Install and config [emscripten](https://github.com/kripken/emscripten/wiki/Tutorial)

* To compile: `$ ./em_make`

Currently under development
---------------------------

* Multypages

* Encryption

* Compatibility with Opera 11.1 and later versions


Authors
-------

Author of original C code:

  Ilya Mezhirov	http://djvulibre.djvuzone.org

Authors of .js library: 

 + Lebedkin	lebed.salavat at gmail.com	

  +Bannikov	bannandrej at gmail.com

