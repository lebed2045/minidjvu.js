minidjvu.js
===========

MiniDjVu.js is an open sourse DjVu decoder on JavaScript based on [minidjvu-0.8](http://djvulibre.djvuzone.org)

How to use
----------

* download file minidivu.js

* add in your HTML code: 

```
		<script type='text/javascript' src='minidjvu.js'></script>
		<canvas id="djvucanvas" width="800">			    
			<script type='text/javascript'>
				renderdjvu("2.djvu","djvucanvas");
			</script>
		</canvas>
```

Demo
----

Simple online books reader [link](http://ntfs.narod.ru/onlineReader.html)


How to modify
-------------

* Clone the repo `git clone https://lebedkin@github.com/lebedkin/minidjvu.js.git`

* Install and config [emscripten](https://github.com/kripken/emscripten/wiki/Tutorial)

* Run 

Currently under development
---------------------------

* Multypages

* Encryption

* Compatibility with Opera 11.1 and later


Authors
-------

Author of original C code:

  Ilya Mezhirov	http://djvulibre.djvuzone.org

Authors of .js library: 

  Lebedkin	lebed.salavat at gmail.com	

  Bannikov	bannandrej at gmail.com

