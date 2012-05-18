minidjvu.js
===========

minidjvu.js is an open sourse DjVu decoder on JavaScript based on [minidjvu-0.8](http://djvulibre.djvuzone.org)

How to use:
----------
* download file minidivu.js
* add in your HTML code: 
	'''
		<script type='text/javascript' src='minidjvu.js'></script>
		<canvas id="djvucanvas" width="800">			    
			<script type='text/javascript'>
				renderdjvu("2.djvu","djvucanvas");
			</script>
		</canvas>
	'''


how to modify:
-------------

* download repo `git clone https://lebedkin@github.com/lebedkin/minidjvu.js.git`
* install and config [emscripten](https://github.com/kripken/emscripten/wiki/Tutorial)
* 

Authors
-------

Author of original C code

	Ilya Mezhirov	http://djvulibre.djvuzone.org

Authors of .js library: 

	Lebedkin	lebed.salavat<at>gmail.com	

  Bannikov	bannandrej<at>gmail.com

