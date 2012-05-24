Module["prepreRun"] = (function() {
  FS.createDataFile("/", "bmp.bmp", "qwe", true, true);
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
  Module["canvasId"] = "qwecanvas";
  filePreload0.send(null);
});

Module["postRun"] = (function() {
  Module["startTime"] = (new Date).getTime();
  var sumTime = 0;
  var profileN = 1;
  for (i = 0; i < profileN; i++) {
    _main();
    sumTime += (new Date).getTime() - Module["startTime"];
    Module.print("_main() works " + ((new Date).getTime() - Module["startTime"]) + " ms");
    Module["startTime"] = (new Date).getTime();
  }
  Module.print("the average run time of _main() is " + sumTime / profileN + " ms");
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
  var arrayBuffer = FS.root.contents["bmp.bmp"].contents;
  assert(arrayBuffer, "Loading file /bmp.bmp failed.");
  var bb = new BlobBuilder;
  bb.append((new Uint8Array(arrayBuffer)).buffer);
  var b = bb.getBlob();
  var url = URLObject.createObjectURL(b);
  img.onload = (function() {
    var steps = sourceWidth / destWidth;
    if (steps > 3) steps = 3;
    if (steps < 1) steps = 1;
    context.globalCompositeOperation = "darker";
    context.globalAlpha = 1;
    for (i = 0; i < steps; i++) {
      context.drawImage(img, i, i, sourceWidth - steps + i, sourceHeight - steps + i, 0, 0, destWidth, destHeight);
      context.globalAlpha *= 1 - 1 / steps;
    }
    assert(img.complete, "Image /bmp.bmp could not be decoded");
  });
  img.onerror = (function(event) {
    console.log("Image /bmp.bmp could not be decoded");
  });
  img.src = url;
});

try {
  this["Module"] = Module;
} catch (e) {
  this["Module"] = Module = {};
}

var ENVIRONMENT_IS_NODE = typeof process === "object";

var ENVIRONMENT_IS_WEB = typeof window === "object";

var ENVIRONMENT_IS_WORKER = typeof importScripts === "function";

var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  Module["print"] = (function(x) {
    process["stdout"].write(x + "\n");
  });
  Module["printErr"] = (function(x) {
    process["stderr"].write(x + "\n");
  });
  var nodeFS = require("fs");
  var nodePath = require("path");
  Module["read"] = (function(filename) {
    filename = nodePath["normalize"](filename);
    var ret = nodeFS["readFileSync"](filename).toString();
    if (!ret && filename != nodePath["resolve"](filename)) {
      filename = path.join(__dirname, "..", "src", filename);
      ret = nodeFS["readFileSync"](filename).toString();
    }
    return ret;
  });
  Module["load"] = (function(f) {
    globalEval(read(f));
  });
  if (!Module["arguments"]) {
    Module["arguments"] = process["argv"].slice(2);
  }
} else if (ENVIRONMENT_IS_SHELL) {
  Module["print"] = print;
  Module["printErr"] = printErr;
  if (typeof read != "undefined") {
    Module["read"] = read;
  } else {
    Module["read"] = (function(f) {
      snarf(f);
    });
  }
  if (!Module["arguments"]) {
    if (typeof scriptArgs != "undefined") {
      Module["arguments"] = scriptArgs;
    } else if (typeof arguments != "undefined") {
      Module["arguments"] = arguments;
    }
  }
} else if (ENVIRONMENT_IS_WEB) {
  if (!Module["print"]) {
    Module["print"] = (function(x) {
      console.log(x);
    });
  }
  if (!Module["printErr"]) {
    Module["printErr"] = (function(x) {
      console.log(x);
    });
  }
  Module["read"] = (function(url) {
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    xhr.send(null);
    return xhr.responseText;
  });
  if (!Module["arguments"]) {
    if (typeof arguments != "undefined") {
      Module["arguments"] = arguments;
    }
  }
} else if (ENVIRONMENT_IS_WORKER) {
  Module["load"] = importScripts;
} else {
  throw "Unknown runtime environment. Where are we?";
}

function globalEval(x) {
  eval.call(null, x);
}

if (!Module["load"] == "undefined" && Module["read"]) {
  Module["load"] = (function(f) {
    globalEval(Module["read"](f));
  });
}

if (!Module["printErr"]) {
  Module["printErr"] = (function() {});
}

if (!Module["print"]) {
  Module["print"] = Module["printErr"];
}

if (!Module["arguments"]) {
  Module["arguments"] = [];
}

Module.print = Module["print"];

Module.printErr = Module["printErr"];

var Runtime = {
  stackSave: (function() {
    return STACKTOP;
  }),
  stackRestore: (function(stackTop) {
    STACKTOP = stackTop;
  }),
  forceAlign: (function(target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target / quantum) * quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return "((((" + target + ")+" + (quantum - 1) + ")>>" + logg + ")<<" + logg + ")";
    }
    return "Math.ceil((" + target + ")/" + quantum + ")*" + quantum;
  }),
  isNumberType: (function(type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  }),
  isPointerType: function isPointerType(type) {
    return type[type.length - 1] == "*";
  },
  isStructType: function isStructType(type) {
    if (isPointerType(type)) return false;
    if (/^\[\d+\ x\ (.*)\]/.test(type)) return true;
    if (/<?{ ?[^}]* ?}>?/.test(type)) return true;
    return type[0] == "%";
  },
  INT_TYPES: {
    "i1": 0,
    "i8": 0,
    "i16": 0,
    "i32": 0,
    "i64": 0
  },
  FLOAT_TYPES: {
    "float": 0,
    "double": 0
  },
  bitshift64: (function(low, high, op, bits) {
    var ander = Math.pow(2, bits) - 1;
    if (bits < 32) {
      switch (op) {
       case "shl":
        return [ low << bits, high << bits | (low & ander << 32 - bits) >>> 32 - bits ];
       case "ashr":
        return [ (low >>> bits | (high & ander) << 32 - bits) >> 0 >>> 0, high >> bits >>> 0 ];
       case "lshr":
        return [ (low >>> bits | (high & ander) << 32 - bits) >>> 0, high >>> bits ];
      }
    } else if (bits == 32) {
      switch (op) {
       case "shl":
        return [ 0, low ];
       case "ashr":
        return [ high, (high | 0) < 0 ? ander : 0 ];
       case "lshr":
        return [ high, 0 ];
      }
    } else {
      switch (op) {
       case "shl":
        return [ 0, low << bits - 32 ];
       case "ashr":
        return [ high >> bits - 32 >>> 0, (high | 0) < 0 ? ander : 0 ];
       case "lshr":
        return [ high >>> bits - 32, 0 ];
      }
    }
    abort("unknown bitshift64 op: " + [ value, op, bits ]);
  }),
  or64: (function(x, y) {
    var l = x | 0 | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  }),
  and64: (function(x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  }),
  xor64: (function(x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  }),
  getNativeTypeSize: (function(type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      "%i1": 1,
      "%i8": 1,
      "%i16": 2,
      "%i32": 4,
      "%i64": 8,
      "%float": 4,
      "%double": 8
    }["%" + type];
    if (!size) {
      if (type[type.length - 1] == "*") {
        size = Runtime.QUANTUM_SIZE;
      } else if (type[0] == "i") {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits / 8;
      }
    }
    return size;
  }),
  getNativeFieldSize: (function(type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  }),
  dedup: function dedup(items, ident) {
    var seen = {};
    if (ident) {
      return items.filter((function(item) {
        if (seen[item[ident]]) return false;
        seen[item[ident]] = true;
        return true;
      }));
    } else {
      return items.filter((function(item) {
        if (seen[item]) return false;
        seen[item] = true;
        return true;
      }));
    }
  },
  set: function set() {
    var args = typeof arguments[0] === "object" ? arguments[0] : arguments;
    var ret = {};
    for (var i = 0; i < args.length; i++) {
      ret[args[i]] = 0;
    }
    return ret;
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map((function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field);
        alignSize = size;
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Types.types[field].alignSize;
      } else {
        throw "Unclear type in struct: " + field + ", in " + type.name_ + " :: " + dump(Types.types[type.name_]);
      }
      alignSize = type.packed ? 1 : Math.min(alignSize, Runtime.QUANTUM_SIZE);
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize);
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr - prev);
      }
      prev = curr;
      return curr;
    }));
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = type.flatFactor != 1;
    return type.flatIndexes;
  },
  generateStructInfo: (function(struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === "undefined" ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      assert(type.fields.length === struct.length, "Number of named fields must match the type for " + typeName);
      alignment = type.flatIndexes;
    } else {
      var type = {
        fields: struct.map((function(item) {
          return item[0];
        }))
      };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach((function(item, i) {
        if (typeof item === "string") {
          ret[item] = alignment[i] + offset;
        } else {
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      }));
    } else {
      struct.forEach((function(item, i) {
        ret[item[1]] = alignment[i];
      }));
    }
    return ret;
  }),
  addFunction: (function(func) {
    var ret = FUNCTION_TABLE.length;
    FUNCTION_TABLE.push(func);
    FUNCTION_TABLE.push(0);
    return ret;
  }),
  warnOnce: (function(text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  }),
  funcWrappers: {},
  getFuncWrapper: (function(func) {
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = (function() {
        FUNCTION_TABLE[func].apply(null, arguments);
      });
    }
    return Runtime.funcWrappers[func];
  }),
  stackAlloc: function stackAlloc(size) {
    var ret = STACKTOP;
    STACKTOP += size;
    STACKTOP = STACKTOP + 3 >> 2 << 2;
    return ret;
  },
  staticAlloc: function staticAlloc(size) {
    var ret = STATICTOP;
    STATICTOP += size;
    STATICTOP = STATICTOP + 3 >> 2 << 2;
    if (STATICTOP >= TOTAL_MEMORY) enlargeMemory();
    return ret;
  },
  alignMemory: function alignMemory(size, quantum) {
    var ret = size = Math.ceil(size / (quantum ? quantum : 4)) * (quantum ? quantum : 4);
    return ret;
  },
  makeBigInt: function makeBigInt(low, high, unsigned) {
    var ret = unsigned ? (low >>> 0) + (high >>> 0) * 4294967296 : (low >>> 0) + (high | 0) * 4294967296;
    return ret;
  },
  QUANTUM_SIZE: 4,
  __dummy__: 0
};

var CorrectionsMonitor = {
  MAX_ALLOWED: 0,
  corrections: 0,
  sigs: {},
  note: (function(type, succeed, sig) {
    if (!succeed) {
      this.corrections++;
      if (this.corrections >= this.MAX_ALLOWED) abort("\n\nToo many corrections!");
    }
  }),
  print: (function() {})
};

var __THREW__ = false;

var ABORT = false;

var undef = 0;

var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;

var tempI64, tempI64b;

function abort(text) {
  Module.print(text + ":\n" + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}

function assert(condition, text) {
  if (!condition) {
    abort("Assertion failed: " + text);
  }
}

var globalScope = this;

function ccall(ident, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == "string") {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length + 1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == "array") {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == "string") {
      return Pointer_stringify(value);
    }
    assert(type != "array");
    return value;
  }
  try {
    var func = eval("_" + ident);
  } catch (e) {
    try {
      func = globalScope["Module"]["_" + ident];
    } catch (e) {}
  }
  assert(func, "Cannot call unknown function " + ident + " (perhaps LLVM optimizations or closure removed it?)");
  var i = 0;
  var cArgs = args ? args.map((function(arg) {
    return toC(arg, argTypes[i++]);
  })) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

Module["ccall"] = ccall;

function cwrap(ident, returnType, argTypes) {
  return (function() {
    return ccall(ident, returnType, argTypes, Array.prototype.slice.call(arguments));
  });
}

Module["cwrap"] = cwrap;

function setValue(ptr, value, type, noSafe) {
  type = type || "i8";
  if (type[type.length - 1] === "*") type = "i32";
  switch (type) {
   case "i1":
    HEAP8[ptr] = value;
    break;
   case "i8":
    HEAP8[ptr] = value;
    break;
   case "i16":
    HEAP16[ptr >> 1] = value;
    break;
   case "i32":
    HEAP32[ptr >> 2] = value;
    break;
   case "i64":
    HEAP32[ptr >> 2] = value;
    break;
   case "float":
    HEAPF32[ptr >> 2] = value;
    break;
   case "double":
    HEAPF32[ptr >> 2] = value;
    break;
   default:
    abort("invalid type for setValue: " + type);
  }
}

Module["setValue"] = setValue;

function getValue(ptr, type, noSafe) {
  type = type || "i8";
  if (type[type.length - 1] === "*") type = "i32";
  switch (type) {
   case "i1":
    return HEAP8[ptr];
   case "i8":
    return HEAP8[ptr];
   case "i16":
    return HEAP16[ptr >> 1];
   case "i32":
    return HEAP32[ptr >> 2];
   case "i64":
    return HEAP32[ptr >> 2];
   case "float":
    return HEAPF32[ptr >> 2];
   case "double":
    return HEAPF32[ptr >> 2];
   default:
    abort("invalid type for setValue: " + type);
  }
  return null;
}

Module["getValue"] = getValue;

var ALLOC_NORMAL = 0;

var ALLOC_STACK = 1;

var ALLOC_STATIC = 2;

Module["ALLOC_NORMAL"] = ALLOC_NORMAL;

Module["ALLOC_STACK"] = ALLOC_STACK;

Module["ALLOC_STATIC"] = ALLOC_STATIC;

function allocate(slab, types, allocator) {
  var zeroinit, size;
  if (typeof slab === "number") {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === "string" ? types : null;
  var ret = [ _malloc, Runtime.stackAlloc, Runtime.staticAlloc ][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  if (zeroinit) {
    _memset(ret, 0, size);
    return ret;
  }
  var i = 0, type;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === "function") {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == "i64") type = "i32";
    setValue(ret + i, curr, type);
    i += Runtime.getNativeTypeSize(type);
  }
  return ret;
}

Module["allocate"] = allocate;

function Pointer_stringify(ptr, length) {
  var nullTerminated = typeof length == "undefined";
  var ret = "";
  var i = 0;
  var t;
  var nullByte = String.fromCharCode(0);
  while (1) {
    t = String.fromCharCode(HEAPU8[ptr + i]);
    if (nullTerminated && t == nullByte) {
      break;
    } else {}
    ret += t;
    i += 1;
    if (!nullTerminated && i == length) {
      break;
    }
  }
  return ret;
}

Module["Pointer_stringify"] = Pointer_stringify;

function Array_stringify(array) {
  var ret = "";
  for (var i = 0; i < array.length; i++) {
    ret += String.fromCharCode(array[i]);
  }
  return ret;
}

Module["Array_stringify"] = Array_stringify;

var FUNCTION_TABLE;

var PAGE_SIZE = 4096;

function alignMemoryPage(x) {
  return x + 4095 >> 12 << 12;
}

var HEAP;

var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STACK_ROOT, STACKTOP, STACK_MAX;

var STATICTOP;

function enlargeMemory() {
  while (TOTAL_MEMORY <= STATICTOP) {
    TOTAL_MEMORY = alignMemoryPage(2 * TOTAL_MEMORY);
  }
  var oldHEAP8 = HEAP8;
  var buffer = new ArrayBuffer(TOTAL_MEMORY);
  HEAP8 = new Int8Array(buffer);
  HEAP16 = new Int16Array(buffer);
  HEAP32 = new Int32Array(buffer);
  HEAPU8 = new Uint8Array(buffer);
  HEAPU16 = new Uint16Array(buffer);
  HEAPU32 = new Uint32Array(buffer);
  HEAPF32 = new Float32Array(buffer);
  HEAPF64 = new Float64Array(buffer);
  HEAP8.set(oldHEAP8);
}

var TOTAL_STACK = Module["TOTAL_STACK"] || 3145728;

var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 5242880;

var FAST_MEMORY = Module["FAST_MEMORY"] || 0;

assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1))["subarray"] && !!(new Int32Array(1))["set"], "Cannot fallback to non-typed array case: Code is too specialized");

var buffer = new ArrayBuffer(TOTAL_MEMORY);

HEAP8 = new Int8Array(buffer);

HEAP16 = new Int16Array(buffer);

HEAP32 = new Int32Array(buffer);

HEAPU8 = new Uint8Array(buffer);

HEAPU16 = new Uint16Array(buffer);

HEAPU32 = new Uint32Array(buffer);

HEAPF32 = new Float32Array(buffer);

HEAPF64 = new Float64Array(buffer);

HEAP32[0] = 255;

assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, "Typed arrays 2 must be run on a little-endian system");

var base = intArrayFromString("(null)");

STATICTOP = base.length;

for (var i = 0; i < base.length; i++) {
  HEAP8[i] = base[i];
}

Module["HEAP"] = HEAP;

Module["HEAP8"] = HEAP8;

Module["HEAP16"] = HEAP16;

Module["HEAP32"] = HEAP32;

Module["HEAPU8"] = HEAPU8;

Module["HEAPU16"] = HEAPU16;

Module["HEAPU32"] = HEAPU32;

Module["HEAPF32"] = HEAPF32;

Module["HEAPF64"] = HEAPF64;

STACK_ROOT = STACKTOP = Runtime.alignMemory(STATICTOP);

STACK_MAX = STACK_ROOT + TOTAL_STACK;

var tempDoublePtr = Runtime.alignMemory(STACK_MAX, 8);

var tempDoubleI8 = HEAP8.subarray(tempDoublePtr);

var tempDoubleI32 = HEAP32.subarray(tempDoublePtr >> 2);

var tempDoubleF32 = HEAPF32.subarray(tempDoublePtr >> 2);

var tempDoubleF64 = HEAPF64.subarray(tempDoublePtr >> 3);

function copyTempFloat(ptr) {
  tempDoubleI8[0] = HEAP8[ptr];
  tempDoubleI8[1] = HEAP8[ptr + 1];
  tempDoubleI8[2] = HEAP8[ptr + 2];
  tempDoubleI8[3] = HEAP8[ptr + 3];
}

function copyTempDouble(ptr) {
  tempDoubleI8[0] = HEAP8[ptr];
  tempDoubleI8[1] = HEAP8[ptr + 1];
  tempDoubleI8[2] = HEAP8[ptr + 2];
  tempDoubleI8[3] = HEAP8[ptr + 3];
  tempDoubleI8[4] = HEAP8[ptr + 4];
  tempDoubleI8[5] = HEAP8[ptr + 5];
  tempDoubleI8[6] = HEAP8[ptr + 6];
  tempDoubleI8[7] = HEAP8[ptr + 7];
}

STACK_MAX = tempDoublePtr + 8;

STATICTOP = alignMemoryPage(STACK_MAX);

function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    var callback = callbacks.shift();
    var func = callback.func;
    if (typeof func === "number") {
      func = FUNCTION_TABLE[func];
    }
    func(callback.arg === undefined ? null : callback.arg);
  }
}

var __ATINIT__ = [];

var __ATMAIN__ = [];

var __ATEXIT__ = [];

function initRuntime() {
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
  CorrectionsMonitor.print();
}

function Array_copy(ptr, num) {
  return Array.prototype.slice.call(HEAP8.subarray(ptr, ptr + num));
  return HEAP.slice(ptr, ptr + num);
}

Module["Array_copy"] = Array_copy;

function TypedArray_copy(ptr, num, offset) {
  if (offset === undefined) {
    offset = 0;
  }
  var arr = new Uint8Array(num - offset);
  for (var i = offset; i < num; ++i) {
    arr[i - offset] = HEAP8[ptr + i];
  }
  return arr.buffer;
}

Module["TypedArray_copy"] = TypedArray_copy;

function String_len(ptr) {
  var i = 0;
  while (HEAP8[ptr + i]) i++;
  return i;
}

Module["String_len"] = String_len;

function String_copy(ptr, addZero) {
  var len = String_len(ptr);
  if (addZero) len++;
  var ret = Array_copy(ptr, len);
  if (addZero) ret[len - 1] = 0;
  return ret;
}

Module["String_copy"] = String_copy;

function intArrayFromString(stringy, dontAddNull, length) {
  var ret = [];
  var t;
  var i = 0;
  if (length === undefined) {
    length = stringy.length;
  }
  while (i < length) {
    var chr = stringy.charCodeAt(i);
    if (chr > 255) {
      chr &= 255;
    }
    ret.push(chr);
    i = i + 1;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}

Module["intArrayFromString"] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 255) {
      chr &= 255;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join("");
}

Module["intArrayToString"] = intArrayToString;

function writeStringToMemory(string, buffer, dontAddNull) {
  var i = 0;
  while (i < string.length) {
    var chr = string.charCodeAt(i);
    if (chr > 255) {
      chr &= 255;
    }
    HEAP8[buffer + i] = chr;
    i = i + 1;
  }
  if (!dontAddNull) {
    HEAP8[buffer + i] = 0;
  }
}

Module["writeStringToMemory"] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[buffer + i] = array[i];
  }
}

Module["writeArrayToMemory"] = writeArrayToMemory;

var STRING_TABLE = [];

function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2 * Math.abs(1 << bits - 1) + value : Math.pow(2, bits) + value;
}

function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << bits - 1) : Math.pow(2, bits - 1);
  if (value >= half && (bits <= 32 || value > half)) {
    value = -2 * half + value;
  }
  return value;
}

var runDependencies = 0;

function addRunDependency() {
  runDependencies++;
  if (Module["monitorRunDependencies"]) {
    Module["monitorRunDependencies"](runDependencies);
  }
}

function removeRunDependency() {
  runDependencies--;
  if (Module["monitorRunDependencies"]) {
    Module["monitorRunDependencies"](runDependencies);
  }
  if (runDependencies == 0) run();
}

function _qwe_djvu_height() {
  return HEAP32[_qwe_djvu_height_var >> 2];
  return null;
}

function _qwe_djvu_width() {
  return HEAP32[_qwe_djvu_width_var >> 2];
  return null;
}

function _mdjvu_get_error($e) {
  var $retval;
  var $e_addr;
  $e_addr = $e;
  var $0 = $e_addr;
  if ($0 == 0) {
    $retval = STRING_TABLE.__str19;
  } else if ($0 == 1) {
    $retval = STRING_TABLE.__str120;
  } else if ($0 == 2) {
    $retval = STRING_TABLE.__str221;
  } else if ($0 == 3) {
    $retval = STRING_TABLE.__str322;
  } else if ($0 == 4) {
    $retval = STRING_TABLE.__str423;
  } else if ($0 == 5) {
    $retval = STRING_TABLE.__str524;
  } else if ($0 == 6) {
    $retval = STRING_TABLE.__str625;
  } else if ($0 == 7) {
    $retval = STRING_TABLE.__str726;
  } else if ($0 == 8) {
    $retval = STRING_TABLE.__str827;
  } else if ($0 == 9) {
    $retval = STRING_TABLE.__str928;
  } else if ($0 == 10) {
    $retval = STRING_TABLE.__str1029;
  } else if ($0 == 11) {
    $retval = STRING_TABLE.__str1130;
  } else if ($0 == 12) {
    $retval = STRING_TABLE.__str1231;
  } else {
    $retval = STRING_TABLE.__str1332;
  }
  return $retval;
  return null;
}

function _mdjvu_get_error_message($error) {
  var $error_addr;
  $error_addr = $error;
  return $error_addr;
  return null;
}

function _mdjvu_bitmap_get_width($b) {
  var $b_addr;
  $b_addr = $b;
  return HEAP32[$b_addr + 4 >> 2];
  return null;
}

function _mdjvu_bitmap_get_height($b) {
  var $b_addr;
  $b_addr = $b;
  return HEAP32[$b_addr + 8 >> 2];
  return null;
}

function _mdjvu_bitmap_get_index($b) {
  var $retval;
  var $b_addr;
  $b_addr = $b;
  if ($b_addr != 0) {
    $retval = HEAP32[$b_addr + 12 >> 2];
  } else {
    $retval = -1;
  }
  return $retval;
  return null;
}

function _mdjvu_bitmap_set_index($b, $v) {
  var $b_addr;
  var $v_addr;
  $b_addr = $b;
  $v_addr = $v;
  HEAP32[$b_addr + 12 >> 2] = $v_addr;
  return;
  return;
}

function _mdjvu_bitmap_get_packed_row_size($b) {
  var $b_addr;
  $b_addr = $b;
  return HEAP32[$b_addr + 4 >> 2] + 7 >> 3;
  return null;
}

function _mdjvu_bitmap_access_packed_row($b, $i) {
  var $b_addr;
  var $i_addr;
  $b_addr = $b;
  $i_addr = $i;
  return HEAP32[HEAP32[$b_addr >> 2] + ($i_addr << 2) >> 2];
  return null;
}

function _mdjvu_bitmap_pack_row($b, $bytes, $y) {
  var $b_addr$s2;
  var __label__;
  var $b_addr;
  var $bytes_addr;
  var $y_addr;
  var $bits;
  var $coef;
  var $a;
  var $i;
  $b_addr = $b;
  $b_addr$s2 = $b_addr >> 2;
  $bytes_addr = $bytes;
  $y_addr = $y;
  $bits = HEAP32[HEAP32[$b_addr$s2] + ($y_addr << 2) >> 2];
  $coef = 128;
  $a = 0;
  $i = HEAP32[$b_addr$s2 + 1];
  while (1) {
    var $8 = $i;
    var $dec = $8 - 1;
    $i = $dec;
    if ($8 == 0) {
      break;
    }
    var $9 = $bytes_addr;
    var $incdec_ptr = $9 + 1;
    $bytes_addr = $incdec_ptr;
    if (HEAP8[$9] != 0) {
      var $or = $a | $coef;
      $a = $or;
    }
    var $shr = $coef >> 1;
    $coef = $shr;
    if ($coef != 0) {
      __label__ = 8;
    } else {
      $coef = 128;
      var $16 = $bits;
      var $incdec_ptr4 = $16 + 1;
      $bits = $incdec_ptr4;
      HEAP8[$16] = $a & 255;
      $a = 0;
    }
  }
  if ((HEAP32[$b_addr$s2 + 1] & 7) != 0) {
    HEAP8[$bits] = $a & 255;
  }
  return;
  return;
}

_mdjvu_bitmap_pack_row["X"] = 1;

function _mdjvu_bitmap_unpack_row($b, $bytes, $y) {
  var __label__;
  var $b_addr;
  var $bytes_addr;
  var $y_addr;
  var $bits;
  var $coef;
  var $a;
  var $i;
  $b_addr = $b;
  $bytes_addr = $bytes;
  $y_addr = $y;
  $bits = HEAP32[HEAP32[$b_addr >> 2] + ($y_addr << 2) >> 2];
  $coef = 128;
  $a = HEAPU8[$bits];
  $i = HEAP32[$b_addr + 4 >> 2];
  while (1) {
    var $10 = $i;
    var $dec = $10 - 1;
    $i = $dec;
    if ($10 == 0) {
      break;
    }
    var $13 = $bytes_addr;
    var $incdec_ptr = $13 + 1;
    $bytes_addr = $incdec_ptr;
    HEAP8[$13] = $a & $coef & 255;
    var $shr = $coef >> 1;
    $coef = $shr;
    if ($coef != 0) {
      __label__ = 8;
    } else {
      $coef = 128;
      if ($i == 0) {
        break;
      }
      var $incdec_ptr5 = $bits + 1;
      $bits = $incdec_ptr5;
      $a = HEAPU8[$incdec_ptr5];
    }
  }
  return;
  return;
}

_mdjvu_bitmap_unpack_row["X"] = 1;

function _mdjvu_bitmap_unpack_row_0_or_1($b, $bytes, $y) {
  var __label__;
  var $b_addr;
  var $bytes_addr;
  var $y_addr;
  var $bits;
  var $coef;
  var $a;
  var $i;
  $b_addr = $b;
  $bytes_addr = $bytes;
  $y_addr = $y;
  $bits = HEAP32[HEAP32[$b_addr >> 2] + ($y_addr << 2) >> 2];
  $coef = 128;
  $a = HEAPU8[$bits];
  $i = HEAP32[$b_addr + 4 >> 2];
  while (1) {
    var $10 = $i;
    var $dec = $10 - 1;
    $i = $dec;
    if ($10 == 0) {
      break;
    }
    var $cond = ($a & $coef) != 0 ? 1 : 0;
    var $13 = $bytes_addr;
    var $incdec_ptr = $13 + 1;
    $bytes_addr = $incdec_ptr;
    HEAP8[$13] = $cond & 255;
    var $shr = $coef >> 1;
    $coef = $shr;
    if ($coef != 0) {
      __label__ = 8;
    } else {
      $coef = 128;
      if ($i == 0) {
        break;
      }
      var $incdec_ptr6 = $bits + 1;
      $bits = $incdec_ptr6;
      $a = HEAPU8[$incdec_ptr6];
    }
  }
  return;
  return;
}

_mdjvu_bitmap_unpack_row_0_or_1["X"] = 1;

function _main($argc, $argv) {
  var $retval;
  var $argc_addr;
  var $argv_addr;
  $retval = 0;
  $argc_addr = $argc;
  $argv_addr = $argv;
  _qwe_loadrender_djvu();
  _qwe_save_djvu();
  return 0;
  return null;
}

function _qwe_save_djvu() {
  var $0 = HEAP32[_image >> 2];
  _mdjvu_image_destroy($0);
  var $1 = HEAP32[_bitmap >> 2];
  _save_bitmap($1, STRING_TABLE.__str);
  var $2 = HEAP32[_bitmap >> 2];
  _mdjvu_bitmap_destroy($2);
  return;
  return;
}

function _decide_if_bmp($path) {
  var $path_addr;
  $path_addr = $path;
  var $call = _ends_with_ignore_case($path_addr, STRING_TABLE.__str7);
  return $call;
  return null;
}

function _decide_if_tiff($path) {
  var $path_addr;
  $path_addr = $path;
  var $call = _ends_with_ignore_case($path_addr, STRING_TABLE.__str5);
  if ($call != 0) {
    var $2 = 1;
  } else {
    var $call1 = _ends_with_ignore_case($path_addr, STRING_TABLE.__str6);
    var $2 = $call1 != 0;
  }
  var $2;
  return $2;
  return null;
}

function _qwe_loadrender_djvu() {
  var $inc = HEAP32[_qwe_loadrender_djvu_calls >> 2] + 1;
  HEAP32[_qwe_loadrender_djvu_calls >> 2] = $inc;
  var $call = _load_image(STRING_TABLE.__str8);
  HEAP32[_image >> 2] = $call;
  var $1 = HEAP32[_image >> 2];
  var $call1 = _mdjvu_render($1);
  HEAP32[_bitmap >> 2] = $call1;
  var $2 = HEAP32[_image >> 2];
  var $call2 = _mdjvu_image_get_width($2);
  HEAP32[_qwe_djvu_width_var >> 2] = $call2;
  var $3 = HEAP32[_image >> 2];
  var $call3 = _mdjvu_image_get_height($3);
  HEAP32[_qwe_djvu_height_var >> 2] = $call3;
  var $call4 = _qwe_djvu_width();
  HEAP32[_temp >> 2] = $call4;
  var $call5 = _qwe_djvu_height();
  HEAP32[_temp >> 2] = $call5;
  return;
  return;
}

function _mdjvu_create_2d_array($w, $h) {
  var $w_addr;
  var $h_addr;
  var $i;
  var $data;
  var $result;
  $w_addr = $w;
  $h_addr = $h;
  var $call = _calloc($h_addr, $w_addr + 4);
  $result = $call;
  $data = ($h_addr << 2) + $result;
  $i = 0;
  while (1) {
    if ($i >= $h_addr) {
      break;
    }
    HEAP32[$result + ($i << 2) >> 2] = $data + $w_addr * $i;
    var $inc = $i + 1;
    $i = $inc;
  }
  return $result;
  return null;
}

function _mdjvu_destroy_2d_array($p) {
  var $p_addr;
  $p_addr = $p;
  _free($p_addr);
  return;
  return;
}

function _mdjvu_bitmap_create($width, $height) {
  var $b$s2;
  var $width_addr;
  var $height_addr;
  var $b;
  $width_addr = $width;
  $height_addr = $height;
  var $call = _malloc(16);
  $b = $call;
  $b$s2 = $b >> 2;
  var $inc = HEAP32[_alive_bitmap_counter >> 2] + 1;
  HEAP32[_alive_bitmap_counter >> 2] = $inc;
  HEAP32[$b$s2 + 1] = $width_addr;
  HEAP32[$b$s2 + 2] = $height_addr;
  HEAP32[$b$s2 + 3] = -1;
  var $call3 = _mdjvu_create_2d_array($width_addr + 7 >> 3, $height_addr);
  HEAP32[$b$s2] = $call3;
  return $b;
  return null;
}

function _mdjvu_bitmap_destroy($bmp) {
  var $bmp_addr;
  var $b;
  $bmp_addr = $bmp;
  $b = $bmp_addr;
  var $dec = HEAP32[_alive_bitmap_counter >> 2] - 1;
  HEAP32[_alive_bitmap_counter >> 2] = $dec;
  var $4 = HEAP32[$b >> 2];
  _mdjvu_destroy_2d_array($4);
  _free($b);
  return;
  return;
}

function _mdjvu_bitmap_clone($b) {
  var $b_addr$s2;
  var $b_addr;
  var $result;
  $b_addr = $b;
  $b_addr$s2 = $b_addr >> 2;
  var $2 = HEAP32[$b_addr$s2 + 1];
  var $5 = HEAP32[$b_addr$s2 + 2];
  var $call = _mdjvu_bitmap_create($2, $5);
  $result = $call;
  var $9 = HEAP32[HEAP32[$result >> 2] >> 2];
  var $13 = HEAP32[HEAP32[$b_addr$s2] >> 2];
  var $mul = (HEAP32[$b_addr$s2 + 1] + 7 >> 3) * HEAP32[$b_addr$s2 + 2];
  _memcpy($9, $13, $mul, 1);
  return $result;
  return null;
}

function _mdjvu_bitmap_exchange($d, $src) {
  var $19$s2;
  var $18$s2;
  var $15$s2;
  var $14$s2;
  var $9$s2;
  var $8$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP += 16;
  var $d_addr;
  var $src_addr;
  var $d_index_backup;
  var $s_index_backup;
  var $tmp = __stackBase__;
  $d_addr = $d;
  $src_addr = $src;
  $d_index_backup = HEAP32[$d_addr + 12 >> 2];
  $s_index_backup = HEAP32[$src_addr + 12 >> 2];
  var $8$s2 = $tmp >> 2;
  var $9$s2 = $d_addr >> 2;
  HEAP32[$8$s2] = HEAP32[$9$s2];
  HEAP32[$8$s2 + 1] = HEAP32[$9$s2 + 1];
  HEAP32[$8$s2 + 2] = HEAP32[$9$s2 + 2];
  HEAP32[$8$s2 + 3] = HEAP32[$9$s2 + 3];
  var $14$s2 = $d_addr >> 2;
  var $15$s2 = $src_addr >> 2;
  HEAP32[$14$s2] = HEAP32[$15$s2];
  HEAP32[$14$s2 + 1] = HEAP32[$15$s2 + 1];
  HEAP32[$14$s2 + 2] = HEAP32[$15$s2 + 2];
  HEAP32[$14$s2 + 3] = HEAP32[$15$s2 + 3];
  var $18$s2 = $src_addr >> 2;
  var $19$s2 = $tmp >> 2;
  HEAP32[$18$s2] = HEAP32[$19$s2];
  HEAP32[$18$s2 + 1] = HEAP32[$19$s2 + 1];
  HEAP32[$18$s2 + 2] = HEAP32[$19$s2 + 2];
  HEAP32[$18$s2 + 3] = HEAP32[$19$s2 + 3];
  HEAP32[$d_addr + 12 >> 2] = $d_index_backup;
  HEAP32[$src_addr + 12 >> 2] = $s_index_backup;
  STACKTOP = __stackBase__;
  return;
  return;
}

function _mdjvu_bitmap_pack_all($b, $data) {
  var $b_addr;
  var $data_addr;
  var $i;
  var $h;
  $b_addr = $b;
  $data_addr = $data;
  $i = 0;
  $h = HEAP32[$b_addr + 8 >> 2];
  $i = 0;
  while (1) {
    if ($i >= $h) {
      break;
    }
    var $8 = HEAP32[$data_addr + ($i << 2) >> 2];
    _mdjvu_bitmap_pack_row($b_addr, $8, $i);
    var $inc = $i + 1;
    $i = $inc;
  }
  return;
  return;
}

function _save_bitmap($bitmap, $path) {
  var __stackBase__ = STACKTOP;
  STACKTOP += 4;
  var $bitmap_addr;
  var $path_addr;
  var $error = __stackBase__;
  var $result;
  $bitmap_addr = $bitmap;
  $path_addr = $path;
  var $call = _decide_if_bmp($path_addr);
  if ($call != 0) {
    if (HEAP32[_verbose >> 2] != 0) {
      var $call3 = _printf(STRING_TABLE.__str1, (tempInt = STACKTOP, STACKTOP += 4, HEAP32[tempInt >> 2] = $path_addr, tempInt));
    }
    var $5 = HEAP32[_dpi >> 2];
    var $call4 = _mdjvu_save_bmp($bitmap_addr, $path_addr, $5, $error);
    $result = $call4;
  } else {
    var $call5 = _decide_if_tiff($path_addr);
    if ($call5 != 0) {
      if (HEAP32[_verbose >> 2] != 0) {
        var $call10 = _printf(STRING_TABLE.__str2, (tempInt = STACKTOP, STACKTOP += 4, HEAP32[tempInt >> 2] = $path_addr, tempInt));
      }
      if (HEAP32[_warnings >> 2] == 0) {
        _mdjvu_disable_tiff_warnings();
      }
      var $call15 = _mdjvu_save_tiff($bitmap_addr, $path_addr, $error);
      $result = $call15;
    } else {
      if (HEAP32[_verbose >> 2] != 0) {
        var $call19 = _printf(STRING_TABLE.__str3, (tempInt = STACKTOP, STACKTOP += 4, HEAP32[tempInt >> 2] = $path_addr, tempInt));
      }
      var $call21 = _mdjvu_save_pbm($bitmap_addr, $path_addr, $error);
      $result = $call21;
    }
  }
  if ($result != 0) {
    STACKTOP = __stackBase__;
    return;
  } else {
    var $17 = HEAP32[_stderr >> 2];
    var $18 = $path_addr;
    var $19 = HEAP32[$error >> 2];
    var $call26 = _mdjvu_get_error_message($19);
    var $call27 = _fprintf($17, STRING_TABLE.__str4, (tempInt = STACKTOP, STACKTOP += 8, HEAP32[tempInt >> 2] = $18, HEAP32[tempInt + 4 >> 2] = $call26, tempInt));
    _exit(1);
    throw "Reached an unreachable!";
  }
  return;
}

_save_bitmap["X"] = 1;

function _load_image($path) {
  var __stackBase__ = STACKTOP;
  STACKTOP += 4;
  var $path_addr;
  var $error = __stackBase__;
  var $image;
  $path_addr = $path;
  if (HEAP32[_verbose >> 2] != 0) {
    var $call = _printf(STRING_TABLE.__str9, (tempInt = STACKTOP, STACKTOP += 4, HEAP32[tempInt >> 2] = $path_addr, tempInt));
  }
  var $call1 = _mdjvu_load_djvu_page($path_addr, $error);
  $image = $call1;
  if ($image != 0) {
    if (HEAP32[_verbose >> 2] != 0) {
      var $call9 = _mdjvu_image_get_bitmap_count($image);
      var $call10 = _mdjvu_image_get_blit_count($image);
      var $call11 = _printf(STRING_TABLE.__str10, (tempInt = STACKTOP, STACKTOP += 8, HEAP32[tempInt >> 2] = $call9, HEAP32[tempInt + 4 >> 2] = $call10, tempInt));
    }
    STACKTOP = __stackBase__;
    return $image;
  } else {
    var $4 = HEAP32[_stderr >> 2];
    var $5 = $path_addr;
    var $6 = HEAP32[$error >> 2];
    var $call4 = _mdjvu_get_error_message($6);
    var $call5 = _fprintf($4, STRING_TABLE.__str4, (tempInt = STACKTOP, STACKTOP += 8, HEAP32[tempInt >> 2] = $5, HEAP32[tempInt + 4 >> 2] = $call4, tempInt));
    _exit(1);
    throw "Reached an unreachable!";
  }
  return null;
}

function _column_is_empty($bmp, $x) {
  var $bmp_addr$s2;
  var $retval;
  var $bmp_addr;
  var $x_addr;
  var $byte_offset;
  var $mask;
  var $bytes_per_row;
  var $p;
  var $i;
  $bmp_addr = $bmp;
  $bmp_addr$s2 = $bmp_addr >> 2;
  $x_addr = $x;
  $byte_offset = $x_addr >> 3;
  $mask = 1 << 7 - ($x_addr & 7);
  $bytes_per_row = HEAP32[$bmp_addr$s2 + 1] + 7 >> 3;
  $p = HEAP32[HEAP32[$bmp_addr$s2] >> 2] + $byte_offset;
  $i = HEAP32[$bmp_addr$s2 + 2];
  while (1) {
    var $10 = $i;
    var $dec = $10 - 1;
    $i = $dec;
    if ($10 == 0) {
      $retval = 1;
      break;
    }
    if ((HEAPU8[$p] & $mask) != 0) {
      $retval = 0;
      break;
    }
    var $add_ptr4 = $p + $bytes_per_row;
    $p = $add_ptr4;
  }
  return $retval;
  return null;
}

_column_is_empty["X"] = 1;

function _row_is_empty($bmp, $y) {
  var $bmp_addr$s2;
  var $retval;
  var $bmp_addr;
  var $y_addr;
  var $row;
  var $bytes_to_check;
  var $bits_to_check;
  var $mask;
  var $i;
  $bmp_addr = $bmp;
  $bmp_addr$s2 = $bmp_addr >> 2;
  $y_addr = $y;
  $row = HEAP32[HEAP32[$bmp_addr$s2] + ($y_addr << 2) >> 2];
  $bytes_to_check = (HEAP32[$bmp_addr$s2 + 1] + 7 >> 3) - 1;
  $bits_to_check = HEAP32[$bmp_addr$s2 + 1] - ($bytes_to_check << 3);
  $mask = 255 << 8 - $bits_to_check;
  $i = 0;
  while (1) {
    if ($i < $bytes_to_check) {
      if (HEAP8[$row + $i] != 0) {
        $retval = 0;
        break;
      }
      var $inc = $i + 1;
      $i = $inc;
    } else {
      if ((HEAPU8[$row + $bytes_to_check] & $mask) != 0) {
        $retval = 0;
        break;
      }
      $retval = 1;
      break;
    }
  }
  return $retval;
  return null;
}

_row_is_empty["X"] = 1;

function _mdjvu_image_get_width($image) {
  var $image_addr;
  $image_addr = $image;
  return HEAP32[$image_addr >> 2];
  return null;
}

function _mdjvu_image_get_height($image) {
  var $image_addr;
  $image_addr = $image;
  return HEAP32[$image_addr + 4 >> 2];
  return null;
}

function _mdjvu_image_get_bitmap_count($image) {
  var $image_addr;
  $image_addr = $image;
  return HEAP32[$image_addr + 12 >> 2];
  return null;
}

function _mdjvu_image_get_blit_count($image) {
  var $image_addr;
  $image_addr = $image;
  return HEAP32[$image_addr + 32 >> 2];
  return null;
}

function _mdjvu_bitmap_crop($b, $left, $top, $w, $h) {
  var $b_addr$s2;
  var __label__;
  var $retval;
  var $b_addr;
  var $left_addr;
  var $top_addr;
  var $w_addr;
  var $h_addr;
  var $result;
  var $i;
  var $count;
  var $buf;
  $b_addr = $b;
  $b_addr$s2 = $b_addr >> 2;
  $left_addr = $left;
  $top_addr = $top;
  $w_addr = $w;
  $h_addr = $h;
  var $cmp = $left_addr == 0;
  do {
    if ($cmp) {
      if ($top_addr != 0) {
        __label__ = 7;
        break;
      }
      if ($w_addr != HEAP32[$b_addr$s2 + 1]) {
        __label__ = 7;
        break;
      }
      if ($h_addr != HEAP32[$b_addr$s2 + 2]) {
        __label__ = 7;
        break;
      }
      var $call = _mdjvu_bitmap_clone($b_addr);
      $retval = $call;
      __label__ = 11;
      break;
    }
    __label__ = 7;
  } while (0);
  if (__label__ == 7) {
    $i = $top_addr;
    $count = $h_addr;
    var $call6 = _mdjvu_bitmap_create($w_addr, $h_addr);
    $result = $call6;
    var $17 = HEAP32[$b_addr$s2 + 1];
    var $call8 = _malloc($17);
    $buf = $call8;
    while (1) {
      var $18 = $count;
      var $dec = $18 - 1;
      $count = $dec;
      if ($18 == 0) {
        break;
      }
      _mdjvu_bitmap_unpack_row($b_addr, $buf, $i);
      _mdjvu_bitmap_pack_row($result, $buf + $left_addr, $i - $top_addr);
      var $inc = $i + 1;
      $i = $inc;
    }
    _free($buf);
    $retval = $result;
  }
  return $retval;
  return null;
}

_mdjvu_bitmap_crop["X"] = 1;

function _mdjvu_bitmap_get_bounding_box($b, $pl, $pt, $pw, $ph) {
  var $b_addr;
  var $pl_addr;
  var $pt_addr;
  var $pw_addr;
  var $ph_addr;
  var $right;
  var $left;
  var $bottom;
  var $top;
  $b_addr = $b;
  $pl_addr = $pl;
  $pt_addr = $pt;
  $pw_addr = $pw;
  $ph_addr = $ph;
  $right = HEAP32[$b_addr + 4 >> 2] - 1;
  $left = 0;
  $bottom = HEAP32[$b_addr + 8 >> 2] - 1;
  $top = 0;
  while (1) {
    var $call = _column_is_empty($b_addr, $right);
    if ($call != 0) {
      var $10 = $right != 0;
    } else {
      var $10 = 0;
    }
    var $10;
    if (!$10) {
      break;
    }
    var $dec = $right - 1;
    $right = $dec;
  }
  while (1) {
    var $call4 = _column_is_empty($b_addr, $left);
    if ($call4 != 0) {
      var $17 = $left < $right;
    } else {
      var $17 = 0;
    }
    var $17;
    if (!$17) {
      break;
    }
    var $inc = $left + 1;
    $left = $inc;
  }
  HEAP32[$pl_addr >> 2] = $left;
  HEAP32[$pw_addr >> 2] = $right - $left + 1;
  while (1) {
    var $call12 = _row_is_empty($b_addr, $bottom);
    if ($call12 != 0) {
      var $28 = $bottom != 0;
    } else {
      var $28 = 0;
    }
    var $28;
    if (!$28) {
      break;
    }
    var $dec18 = $bottom - 1;
    $bottom = $dec18;
  }
  while (1) {
    var $call21 = _row_is_empty($b_addr, $top);
    if ($call21 != 0) {
      var $35 = $top < $bottom;
    } else {
      var $35 = 0;
    }
    var $35;
    if (!$35) {
      break;
    }
    var $inc27 = $top + 1;
    $top = $inc27;
  }
  HEAP32[$pt_addr >> 2] = $top;
  HEAP32[$ph_addr >> 2] = $bottom - $top + 1;
  return;
  return;
}

_mdjvu_bitmap_get_bounding_box["X"] = 1;

function _mdjvu_bitmap_remove_margins($b, $px, $py) {
  var __stackBase__ = STACKTOP;
  STACKTOP += 8;
  var __label__;
  var $b_addr;
  var $px_addr;
  var $py_addr;
  var $w = __stackBase__;
  var $h = __stackBase__ + 4;
  var $cropped;
  $b_addr = $b;
  $px_addr = $px;
  $py_addr = $py;
  _mdjvu_bitmap_get_bounding_box($b_addr, $px_addr, $py_addr, $w, $h);
  var $tobool = HEAP32[$px_addr >> 2] != 0;
  do {
    if (!$tobool) {
      if (HEAP32[$py_addr >> 2] != 0) {
        __label__ = 7;
        break;
      }
      if (HEAP32[$w >> 2] != HEAP32[$b_addr + 4 >> 2]) {
        __label__ = 7;
        break;
      }
      if (HEAP32[$h >> 2] != HEAP32[$b_addr + 8 >> 2]) {
        __label__ = 7;
        break;
      }
      __label__ = 8;
      break;
    }
    __label__ = 7;
  } while (0);
  if (__label__ == 7) {
    var $17 = HEAP32[$px_addr >> 2];
    var $19 = HEAP32[$py_addr >> 2];
    var $20 = HEAP32[$w >> 2];
    var $21 = HEAP32[$h >> 2];
    var $call = _mdjvu_bitmap_crop($b_addr, $17, $19, $20, $21);
    $cropped = $call;
    _mdjvu_bitmap_exchange($b_addr, $cropped);
    _mdjvu_bitmap_destroy($cropped);
  }
  STACKTOP = __stackBase__;
  return;
  return;
}

_mdjvu_bitmap_remove_margins["X"] = 1;

function _mdjvu_bitmap_get_mass($b) {
  var $b_addr;
  var $m;
  var $w;
  var $h;
  var $buf;
  var $y;
  var $x;
  $b_addr = $b;
  $m = 0;
  $w = HEAP32[$b_addr + 4 >> 2];
  $h = HEAP32[$b_addr + 8 >> 2];
  var $call = _malloc($w);
  $buf = $call;
  $y = 0;
  while (1) {
    if ($y >= $h) {
      break;
    }
    _mdjvu_bitmap_unpack_row_0_or_1($b_addr, $buf, $y);
    $x = 0;
    while (1) {
      if ($x >= $w) {
        break;
      }
      var $add = $m + HEAPU8[$buf + $x];
      $m = $add;
      var $inc = $x + 1;
      $x = $inc;
    }
    var $inc5 = $y + 1;
    $y = $inc5;
  }
  _free($buf);
  return $m;
  return null;
}

_mdjvu_bitmap_get_mass["X"] = 1;

function _mdjvu_image_create($width, $height) {
  var $image$s2;
  var $width_addr;
  var $height_addr;
  var $i;
  var $image;
  $width_addr = $width;
  $height_addr = $height;
  var $call = _malloc(76);
  $image = $call;
  $image$s2 = $image >> 2;
  HEAP32[$image$s2] = $width_addr;
  HEAP32[$image$s2 + 1] = $height_addr;
  HEAP32[$image$s2 + 4] = 16;
  var $mul = HEAP32[$image$s2 + 4] << 2;
  var $call4 = _malloc($mul);
  var $8 = $call4;
  HEAP32[$image$s2 + 2] = $8;
  HEAP32[$image$s2 + 3] = 0;
  HEAP32[$image$s2 + 9] = 32;
  var $mul6 = HEAP32[$image$s2 + 9] << 2;
  var $call7 = _malloc($mul6);
  var $14 = $call7;
  HEAP32[$image$s2 + 5] = $14;
  var $mul9 = HEAP32[$image$s2 + 9] << 2;
  var $call10 = _malloc($mul9);
  var $18 = $call10;
  HEAP32[$image$s2 + 6] = $18;
  var $mul12 = HEAP32[$image$s2 + 9] << 2;
  var $call13 = _malloc($mul12);
  var $22 = $call13;
  HEAP32[$image$s2 + 7] = $22;
  HEAP32[$image$s2 + 8] = 0;
  HEAP32[$image$s2 + 10] = 0;
  HEAP32[$image$s2 + 11] = 0;
  $i = 0;
  while (1) {
    if ($i >= 7) {
      break;
    }
    HEAP32[(($i << 2) + 48 >> 2) + $image$s2] = 0;
    var $inc = $i + 1;
    $i = $inc;
  }
  return $image;
  return null;
}

_mdjvu_image_create["X"] = 1;

function _mdjvu_image_destroy($image) {
  var $image_addr$s2;
  var $image_addr;
  var $i;
  var $k;
  $image_addr = $image;
  $image_addr$s2 = $image_addr >> 2;
  var $3 = HEAP32[$image_addr$s2 + 7];
  _free($3);
  var $7 = HEAP32[$image_addr$s2 + 5];
  _free($7);
  var $11 = HEAP32[$image_addr$s2 + 6];
  _free($11);
  $k = 0;
  while (1) {
    if ($k >= 7) {
      break;
    }
    _mdjvu_image_disable_artifact($image_addr, $k);
    var $inc = $k + 1;
    $k = $inc;
  }
  $i = 0;
  while (1) {
    if ($i >= HEAP32[$image_addr$s2 + 3]) {
      break;
    }
    var $24 = HEAP32[HEAP32[$image_addr$s2 + 2] + ($i << 2) >> 2];
    _mdjvu_bitmap_destroy($24);
    var $inc5 = $i + 1;
    $i = $inc5;
  }
  var $29 = HEAP32[$image_addr$s2 + 2];
  _free($29);
  _free($image_addr);
  return;
  return;
}

_mdjvu_image_destroy["X"] = 1;

function _mdjvu_image_disable_artifact($image, $artifact_index) {
  var $image_addr$s2;
  var $image_addr;
  var $artifact_index_addr;
  $image_addr = $image;
  $image_addr$s2 = $image_addr >> 2;
  $artifact_index_addr = $artifact_index;
  if (HEAP32[(($artifact_index_addr << 2) + 48 >> 2) + $image_addr$s2] != 0) {
    var $7 = HEAP32[(($artifact_index_addr << 2) + 48 >> 2) + $image_addr$s2];
    _free($7);
    HEAP32[(($artifact_index_addr << 2) + 48 >> 2) + $image_addr$s2] = 0;
  }
  return;
  return;
}

function _mdjvu_image_get_bitmap($image, $i) {
  var $image_addr;
  var $i_addr;
  $image_addr = $image;
  $i_addr = $i;
  return HEAP32[HEAP32[$image_addr + 8 >> 2] + ($i_addr << 2) >> 2];
  return null;
}

function _mdjvu_image_get_blit_x($image, $i) {
  var $image_addr;
  var $i_addr;
  $image_addr = $image;
  $i_addr = $i;
  return HEAP32[HEAP32[$image_addr + 20 >> 2] + ($i_addr << 2) >> 2];
  return null;
}

function _mdjvu_image_get_blit_y($image, $i) {
  var $image_addr;
  var $i_addr;
  $image_addr = $image;
  $i_addr = $i;
  return HEAP32[HEAP32[$image_addr + 24 >> 2] + ($i_addr << 2) >> 2];
  return null;
}

function _mdjvu_image_set_blit_x($image, $i, $x) {
  var $image_addr;
  var $i_addr;
  var $x_addr;
  $image_addr = $image;
  $i_addr = $i;
  $x_addr = $x;
  var $arrayidx = ($i_addr << 2) + HEAP32[$image_addr + 20 >> 2];
  HEAP32[$arrayidx >> 2] = $x_addr;
  return;
  return;
}

function _mdjvu_image_set_blit_y($image, $i, $y) {
  var $image_addr;
  var $i_addr;
  var $y_addr;
  $image_addr = $image;
  $i_addr = $i;
  $y_addr = $y;
  var $arrayidx = ($i_addr << 2) + HEAP32[$image_addr + 24 >> 2];
  HEAP32[$arrayidx >> 2] = $y_addr;
  return;
  return;
}

function _mdjvu_image_get_blit_bitmap($image, $i) {
  var $image_addr;
  var $i_addr;
  $image_addr = $image;
  $i_addr = $i;
  return HEAP32[HEAP32[$image_addr + 28 >> 2] + ($i_addr << 2) >> 2];
  return null;
}

function _mdjvu_image_add_bitmap($image, $bmp) {
  var $image_addr$s2;
  var $image_addr;
  var $bmp_addr;
  var $i;
  $image_addr = $image;
  $image_addr$s2 = $image_addr >> 2;
  $bmp_addr = $bmp;
  if (HEAP32[$image_addr$s2 + 3] == HEAP32[$image_addr$s2 + 4]) {
    var $bitmaps_allocated1 = $image_addr + 16;
    var $shl = HEAP32[$bitmaps_allocated1 >> 2] << 1;
    HEAP32[$bitmaps_allocated1 >> 2] = $shl;
    var $12 = HEAP32[$image_addr$s2 + 2];
    var $mul = HEAP32[$image_addr$s2 + 4] << 2;
    var $call = _realloc($12, $mul);
    var $16 = $call;
    HEAP32[$image_addr$s2 + 2] = $16;
    $i = 0;
    while (1) {
      if ($i >= 7) {
        break;
      }
      if (HEAP32[(($i << 2) + 48 >> 2) + $image_addr$s2] != 0) {
        var $27 = HEAP32[(($i << 2) + 48 >> 2) + $image_addr$s2];
        var $mul10 = HEAP32[$image_addr$s2 + 4] * HEAP32[_artifact_sizes + ($i << 2) >> 2];
        var $call11 = _realloc($27, $mul10);
        HEAP32[(($i << 2) + 48 >> 2) + $image_addr$s2] = $call11;
      }
      var $inc = $i + 1;
      $i = $inc;
    }
  }
  var $arrayidx17 = (HEAP32[$image_addr$s2 + 3] << 2) + HEAP32[$image_addr$s2 + 2];
  HEAP32[$arrayidx17 >> 2] = $bmp_addr;
  var $47 = HEAP32[$image_addr$s2 + 3];
  _mdjvu_bitmap_set_index($bmp_addr, $47);
  _initialize_artifacts($image_addr + 48, $bmp_addr);
  var $bitmaps_count20 = $image_addr + 12;
  var $53 = HEAP32[$bitmaps_count20 >> 2];
  var $inc21 = $53 + 1;
  HEAP32[$bitmaps_count20 >> 2] = $inc21;
  return $53;
  return null;
}

_mdjvu_image_add_bitmap["X"] = 1;

function _initialize_artifacts($artifacts, $bitmap) {
  var $artifacts_addr;
  var $bitmap_addr;
  var $a;
  $artifacts_addr = $artifacts;
  $bitmap_addr = $bitmap;
  $a = 0;
  while (1) {
    if ($a >= 7) {
      break;
    }
    if (HEAP32[$artifacts_addr + ($a << 2) >> 2] != 0) {
      _initialize_artifact($artifacts_addr, $bitmap_addr, $a);
    }
    var $inc = $a + 1;
    $a = $inc;
  }
  return;
  return;
}

function _mdjvu_image_new_bitmap($image, $w, $h) {
  var $image_addr;
  var $w_addr;
  var $h_addr;
  var $bmp;
  $image_addr = $image;
  $w_addr = $w;
  $h_addr = $h;
  var $call = _mdjvu_bitmap_create($w_addr, $h_addr);
  $bmp = $call;
  var $call1 = _mdjvu_image_add_bitmap($image_addr, $bmp);
  return $bmp;
  return null;
}

function _mdjvu_image_add_blit($image, $x, $y, $bitmap) {
  var $image_addr$s2;
  var $image_addr;
  var $x_addr;
  var $y_addr;
  var $bitmap_addr;
  $image_addr = $image;
  $image_addr$s2 = $image_addr >> 2;
  $x_addr = $x;
  $y_addr = $y;
  $bitmap_addr = $bitmap;
  if (HEAP32[$image_addr$s2 + 8] == HEAP32[$image_addr$s2 + 9]) {
    var $blits_allocated1 = $image_addr + 36;
    var $shl = HEAP32[$blits_allocated1 >> 2] << 1;
    HEAP32[$blits_allocated1 >> 2] = $shl;
    var $12 = HEAP32[$image_addr$s2 + 5];
    var $mul = HEAP32[$image_addr$s2 + 9] << 2;
    var $call = _realloc($12, $mul);
    var $16 = $call;
    HEAP32[$image_addr$s2 + 5] = $16;
    var $22 = HEAP32[$image_addr$s2 + 6];
    var $mul7 = HEAP32[$image_addr$s2 + 9] << 2;
    var $call8 = _realloc($22, $mul7);
    var $26 = $call8;
    HEAP32[$image_addr$s2 + 6] = $26;
    var $32 = HEAP32[$image_addr$s2 + 7];
    var $mul11 = HEAP32[$image_addr$s2 + 9] << 2;
    var $call12 = _realloc($32, $mul11);
    var $36 = $call12;
    HEAP32[$image_addr$s2 + 7] = $36;
  }
  var $arrayidx = (HEAP32[$image_addr$s2 + 8] << 2) + HEAP32[$image_addr$s2 + 5];
  HEAP32[$arrayidx >> 2] = $x_addr;
  var $arrayidx18 = (HEAP32[$image_addr$s2 + 8] << 2) + HEAP32[$image_addr$s2 + 6];
  HEAP32[$arrayidx18 >> 2] = $y_addr;
  var $arrayidx21 = (HEAP32[$image_addr$s2 + 8] << 2) + HEAP32[$image_addr$s2 + 7];
  HEAP32[$arrayidx21 >> 2] = $bitmap_addr;
  var $blits_count22 = $image_addr + 32;
  var $62 = HEAP32[$blits_count22 >> 2];
  var $inc = $62 + 1;
  HEAP32[$blits_count22 >> 2] = $inc;
  return $62;
  return null;
}

_mdjvu_image_add_blit["X"] = 1;

function _initialize_artifact($artifacts, $bitmap, $a) {
  var $artifacts_addr$s2;
  var $artifacts_addr;
  var $bitmap_addr;
  var $a_addr;
  var $i;
  $artifacts_addr = $artifacts;
  $artifacts_addr$s2 = $artifacts_addr >> 2;
  $bitmap_addr = $bitmap;
  $a_addr = $a;
  var $call = _mdjvu_bitmap_get_index($bitmap_addr);
  $i = $call;
  var $1 = $a_addr;
  if ($1 == 0) {
    var $arrayidx1 = ($i << 2) + HEAP32[$artifacts_addr$s2];
    HEAP32[$arrayidx1 >> 2] = 0;
  } else if ($1 == 1) {
    var $arrayidx4 = ($i << 2) + HEAP32[$artifacts_addr$s2 + 1];
    HEAP32[$arrayidx4 >> 2] = 0;
  } else if ($1 == 4) {
    var $call6 = _mdjvu_bitmap_get_mass($bitmap_addr);
    var $arrayidx8 = ($i << 2) + HEAP32[$artifacts_addr$s2 + 4];
    HEAP32[$arrayidx8 >> 2] = $call6;
  } else if ($1 == 5) {
    var $arrayidx11 = ($i << 2) + HEAP32[$artifacts_addr$s2 + 5];
    HEAP32[$arrayidx11 >> 2] = -1;
  } else if ($1 == 2) {
    HEAP8[HEAP32[$artifacts_addr$s2 + 2] + $i] = 0;
  } else if ($1 == 3) {
    HEAP8[HEAP32[$artifacts_addr$s2 + 3] + $i] = 0;
  }
  return;
  return;
}

_initialize_artifact["X"] = 1;

function _my_strcasecmp($s1, $s2) {
  var $retval;
  var $s1_addr;
  var $s2_addr;
  var $c1;
  var $c2;
  var $d;
  $s1_addr = $s1;
  $s2_addr = $s2;
  while (1) {
    if (HEAP8[$s1_addr] == 0) {
      $retval = HEAP8[$s2_addr];
      break;
    }
    var $2 = $s1_addr;
    var $incdec_ptr = $2 + 1;
    $s1_addr = $incdec_ptr;
    var $conv = HEAP8[$2];
    var $call = _tolower($conv);
    $c1 = $call;
    var $4 = $s2_addr;
    var $incdec_ptr1 = $4 + 1;
    $s2_addr = $incdec_ptr1;
    var $conv2 = HEAP8[$4];
    var $call3 = _tolower($conv2);
    $c2 = $call3;
    $d = $c1 - $c2;
    if ($d != 0) {
      $retval = $d;
      break;
    }
  }
  return $retval;
  return null;
}

function _ends_with_ignore_case($s, $prefix) {
  var $retval;
  var $s_addr;
  var $prefix_addr;
  var $sl;
  var $pl;
  $s_addr = $s;
  $prefix_addr = $prefix;
  var $call = _strlen($s_addr);
  $sl = $call;
  var $call1 = _strlen($prefix_addr);
  $pl = $call1;
  if ($sl < $pl) {
    $retval = 0;
  } else {
    var $call3 = _my_strcasecmp($s_addr + $sl + -$pl, $prefix_addr);
    $retval = $call3 != 0 ^ 1;
  }
  return $retval;
  return null;
}

function _mdjvu_render($img) {
  var $img_addr;
  var $width;
  var $height;
  var $b;
  var $row_buffer;
  var $blit_count;
  var $i;
  var $result;
  var $x;
  var $y;
  var $current_bitmap;
  var $w;
  var $h;
  var $min_col;
  var $max_col_plus_one;
  var $min_row;
  var $max_row_plus_one;
  var $row;
  var $col;
  var $target;
  $img_addr = $img;
  var $call = _mdjvu_image_get_width($img_addr);
  $width = $call;
  var $call1 = _mdjvu_image_get_height($img_addr);
  $height = $call1;
  var $call2 = _mdjvu_create_2d_array($width, $height);
  $b = $call2;
  var $call3 = _malloc($width);
  $row_buffer = $call3;
  var $call4 = _mdjvu_image_get_blit_count($img_addr);
  $blit_count = $call4;
  var $call5 = _mdjvu_bitmap_create($width, $height);
  $result = $call5;
  $i = 0;
  while (1) {
    if ($i >= $height) {
      break;
    }
    var $12 = HEAP32[$b + ($i << 2) >> 2];
    _memset($12, 0, $width, 1);
    var $inc = $i + 1;
    $i = $inc;
  }
  $i = 0;
  while (1) {
    if ($i >= $blit_count) {
      break;
    }
    var $call9 = _mdjvu_image_get_blit_x($img_addr, $i);
    $x = $call9;
    var $call10 = _mdjvu_image_get_blit_y($img_addr, $i);
    $y = $call10;
    var $call11 = _mdjvu_image_get_blit_bitmap($img_addr, $i);
    $current_bitmap = $call11;
    var $call12 = _mdjvu_bitmap_get_width($current_bitmap);
    $w = $call12;
    var $call13 = _mdjvu_bitmap_get_height($current_bitmap);
    $h = $call13;
    if ($x >= 0) {
      var $cond = 0;
    } else {
      var $cond = -$x;
    }
    var $cond;
    $min_col = $cond;
    if ($x + $w <= $width) {
      var $cond20 = $w;
    } else {
      var $cond20 = $width - $x;
    }
    var $cond20;
    $max_col_plus_one = $cond20;
    if ($y >= 0) {
      var $cond26 = 0;
    } else {
      var $cond26 = -$y;
    }
    var $cond26;
    $min_row = $cond26;
    if ($y + $h <= $height) {
      var $cond33 = $h;
    } else {
      var $cond33 = $height - $y;
    }
    var $cond33;
    $max_row_plus_one = $cond33;
    $row = $min_row;
    while (1) {
      if ($row >= $max_row_plus_one) {
        break;
      }
      $target = HEAP32[$b + ($y + $row << 2) >> 2] + $x;
      _mdjvu_bitmap_unpack_row($current_bitmap, $row_buffer, $row);
      $col = $min_col;
      while (1) {
        if ($col >= $max_col_plus_one) {
          break;
        }
        var $arrayidx43 = $target + $col;
        HEAP8[$arrayidx43] = (HEAPU8[$arrayidx43] | HEAPU8[$row_buffer + $col]) & 255;
        var $inc47 = $col + 1;
        $col = $inc47;
      }
      var $inc50 = $row + 1;
      $row = $inc50;
    }
    var $inc53 = $i + 1;
    $i = $inc53;
  }
  _free($row_buffer);
  _mdjvu_bitmap_pack_all($result, $b);
  _mdjvu_destroy_2d_array($b);
  return $result;
  return null;
}

_mdjvu_render["X"] = 1;

function _mdjvu_file_save_bmp($bmp, $file, $resolution, $perr) {
  var $bmp_addr;
  var $file_addr;
  var $resolution_addr;
  var $perr_addr;
  var $f;
  $bmp_addr = $bmp;
  $file_addr = $file;
  $resolution_addr = $resolution;
  $perr_addr = $perr;
  $f = $file_addr;
  var $2 = $f;
  var $call = _mdjvu_bitmap_get_width($bmp_addr);
  var $call1 = _mdjvu_bitmap_get_height($bmp_addr);
  _write_bmp_header($2, $call, $call1, $resolution_addr);
  _save_DIB_bytes($bmp_addr, $f);
  return 1;
  return null;
}

function _mdjvu_disable_tiff_warnings() {
  return;
  return;
}

function _skip_in_chunk($chunk, $len) {
  var $chunk_addr;
  var $len_addr;
  $chunk_addr = $chunk;
  $len_addr = $len;
  while (1) {
    if ($chunk_addr == 0) {
      break;
    }
    var $skipped = $chunk_addr + 8;
    var $add = HEAP32[$skipped >> 2] + $len_addr;
    HEAP32[$skipped >> 2] = $add;
    var $5 = HEAP32[$chunk_addr + 12 >> 2];
    $chunk_addr = $5;
  }
  return;
  return;
}

function _write_bmp_header($f, $w, $h, $resolution) {
  var $f_addr;
  var $w_addr;
  var $h_addr;
  var $resolution_addr;
  var $row_size;
  var $data_size;
  var $data_offset;
  var $dpm;
  $f_addr = $f;
  $w_addr = $w;
  $h_addr = $h;
  $resolution_addr = $resolution;
  $row_size = ($w_addr + 31 & -32) >>> 3;
  $data_size = $row_size * $h_addr;
  $data_offset = 62;
  $dpm = $resolution_addr * 5e3 / 127 & -1;
  var $call = _fputc(66, $f_addr);
  var $call2 = _fputc(77, $f_addr);
  _write_uint32($f_addr, $data_size + $data_offset);
  _write_uint32($f_addr, 0);
  _write_uint32($f_addr, $data_offset);
  _write_uint32($f_addr, 40);
  _write_uint32($f_addr, $w_addr);
  _write_uint32($f_addr, $h_addr);
  _write_uint16($f_addr, 1);
  _write_uint16($f_addr, 1);
  _write_uint32($f_addr, 0);
  _write_uint32($f_addr, $data_size);
  _write_uint32($f_addr, $dpm);
  _write_uint32($f_addr, $dpm);
  _write_uint32($f_addr, 2);
  _write_uint32($f_addr, 0);
  _write_uint32($f_addr, 0);
  _write_uint32($f_addr, 16777215);
  return;
  return;
}

_write_bmp_header["X"] = 1;

function _save_DIB_bytes($bmp, $f) {
  var $bmp_addr;
  var $f_addr;
  var $w;
  var $h;
  var $bytes_per_row;
  var $DIB_row_size;
  var $buf;
  var $p;
  var $i;
  var $mask;
  var $j;
  var $row;
  $bmp_addr = $bmp;
  $f_addr = $f;
  var $call = _mdjvu_bitmap_get_width($bmp_addr);
  $w = $call;
  var $call1 = _mdjvu_bitmap_get_height($bmp_addr);
  $h = $call1;
  var $call2 = _mdjvu_bitmap_get_packed_row_size($bmp_addr);
  $bytes_per_row = $call2;
  $DIB_row_size = ($w + 31 & -32) >> 3;
  var $call3 = _malloc($DIB_row_size);
  $buf = $call3;
  if (($w & 7) != 0) {
    $mask = 255 >> ($w & 7) ^ -1;
  } else {
    $mask = -1;
  }
  $i = $h;
  while (1) {
    if ($i == 0) {
      break;
    }
    var $call8 = _mdjvu_bitmap_access_packed_row($bmp_addr, $i - 1);
    $row = $call8;
    _memcpy($buf, $row, $bytes_per_row, 1);
    $j = $DIB_row_size >> 2;
    $p = $buf;
    while (1) {
      if ($j == 0) {
        break;
      }
      var $neg13 = HEAP32[$p >> 2] ^ -1;
      HEAP32[$p >> 2] = $neg13;
      var $dec = $j - 1;
      $j = $dec;
      var $incdec_ptr = $p + 4;
      $p = $incdec_ptr;
    }
    if ($bytes_per_row > 1) {
      var $call16 = _fwrite($buf, 1, $bytes_per_row - 1, $f_addr);
    }
    var $and19 = HEAPU8[$buf + ($bytes_per_row - 1)] & $mask;
    var $call20 = _fputc($and19, $f_addr);
    $j = $DIB_row_size - $bytes_per_row;
    while (1) {
      if ($j == 0) {
        break;
      }
      var $call25 = _fputc(0, $f_addr);
      var $dec27 = $j - 1;
      $j = $dec27;
    }
    var $dec30 = $i - 1;
    $i = $dec30;
  }
  _free($buf);
  return;
  return;
}

_save_DIB_bytes["X"] = 1;

function _mdjvu_save_bmp($bmp, $path, $resolution, $perr) {
  var $retval;
  var $bmp_addr;
  var $path_addr;
  var $resolution_addr;
  var $perr_addr;
  var $f;
  var $result;
  $bmp_addr = $bmp;
  $path_addr = $path;
  $resolution_addr = $resolution;
  $perr_addr = $perr;
  var $call = _fopen($path_addr, STRING_TABLE.__str97);
  $f = $call;
  if ($perr_addr != 0) {
    HEAP32[$perr_addr >> 2] = 0;
  }
  if ($f != 0) {
    var $call5 = _mdjvu_file_save_bmp($bmp_addr, $f, $resolution_addr, $perr_addr);
    $result = $call5;
    var $call6 = _fclose($f);
    $retval = $result;
  } else {
    var $call3 = _mdjvu_get_error(0);
    HEAP32[$perr_addr >> 2] = $call3;
    $retval = 0;
  }
  return $retval;
  return null;
}

function _write_uint32($f, $i) {
  var $f_addr;
  var $i_addr;
  $f_addr = $f;
  $i_addr = $i;
  var $call = _fputc($i_addr, $f_addr);
  var $call1 = _fputc($i_addr >>> 8, $f_addr);
  var $call3 = _fputc($i_addr >>> 16, $f_addr);
  var $call5 = _fputc($i_addr >>> 24, $f_addr);
  return;
  return;
}

function _write_uint16($f, $i) {
  var $f_addr;
  var $i_addr;
  $f_addr = $f;
  $i_addr = $i;
  var $call = _fputc($i_addr, $f_addr);
  var $call2 = _fputc($i_addr >> 8, $f_addr);
  return;
  return;
}

function _mdjvu_locate_jb2_chunk($file, $plength, $perr) {
  var $perr_addr$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP += 32;
  var $retval;
  var $file_addr;
  var $plength_addr;
  var $perr_addr;
  var $FORM = __stackBase__;
  var $Sjbz = __stackBase__ + 16;
  var $f;
  var $i;
  $file_addr = $file;
  $plength_addr = $plength;
  $perr_addr = $perr;
  $perr_addr$s2 = $perr_addr >> 2;
  $f = $file_addr;
  var $call = _read_uint32_most_significant_byte_first($f);
  $i = $call;
  if ($perr_addr != 0) {
    HEAP32[$perr_addr$s2] = 0;
  }
  if ($i != 1096033876) {
    if ($perr_addr != 0) {
      var $call4 = _mdjvu_get_error(5);
      HEAP32[$perr_addr$s2] = $call4;
    }
    $retval = 0;
  } else {
    _get_child_chunk($f, $FORM, 0);
    var $call7 = _find_sibling_chunk($f, $FORM, 1179603533);
    if ($call7 != 0) {
      var $call15 = _read_uint32_most_significant_byte_first($f);
      if ($call15 != 1145722453) {
        if ($perr_addr != 0) {
          var $call20 = _mdjvu_get_error(8);
          HEAP32[$perr_addr$s2] = $call20;
        }
        $retval = 0;
      } else {
        _skip_in_chunk($FORM, 4);
        _get_child_chunk($f, $Sjbz, $FORM);
        var $call23 = _find_sibling_chunk($f, $Sjbz, 1399480954);
        if ($call23 != 0) {
          var $19 = HEAP32[$Sjbz + 4 >> 2];
          HEAP32[$plength_addr >> 2] = $19;
          $retval = 1;
        } else {
          if ($perr_addr != 0) {
            var $call28 = _mdjvu_get_error(9);
            HEAP32[$perr_addr$s2] = $call28;
          }
          $retval = 0;
        }
      }
    } else {
      if ($perr_addr != 0) {
        var $call12 = _mdjvu_get_error(5);
        HEAP32[$perr_addr$s2] = $call12;
      }
      $retval = 0;
    }
  }
  STACKTOP = __stackBase__;
  return $retval;
  return null;
}

_mdjvu_locate_jb2_chunk["X"] = 1;

function _read_uint32_most_significant_byte_first($f) {
  var $f_addr;
  var $r;
  $f_addr = $f;
  var $call = _fgetc($f_addr);
  $r = $call << 24;
  var $call1 = _fgetc($f_addr);
  var $or = $r | $call1 << 16;
  $r = $or;
  var $call3 = _fgetc($f_addr);
  var $or5 = $r | $call3 << 8;
  $r = $or5;
  var $call6 = _fgetc($f_addr);
  var $or7 = $r | $call6;
  $r = $or7;
  return $r;
  return null;
}

function _get_child_chunk($file, $chunk, $parent) {
  var $chunk_addr$s2;
  var $file_addr;
  var $chunk_addr;
  var $parent_addr;
  $file_addr = $file;
  $chunk_addr = $chunk;
  $chunk_addr$s2 = $chunk_addr >> 2;
  $parent_addr = $parent;
  var $call = _read_uint32_most_significant_byte_first($file_addr);
  HEAP32[$chunk_addr$s2] = $call;
  var $call1 = _read_uint32_most_significant_byte_first($file_addr);
  HEAP32[$chunk_addr$s2 + 1] = $call1;
  HEAP32[$chunk_addr$s2 + 2] = 0;
  HEAP32[$chunk_addr$s2 + 3] = $parent_addr;
  _skip_in_chunk($parent_addr, 8);
  return;
  return;
}

function _find_sibling_chunk($file, $chunk, $id) {
  var $chunk_addr$s2;
  var $retval;
  var $file_addr;
  var $chunk_addr;
  var $id_addr;
  $file_addr = $file;
  $chunk_addr = $chunk;
  $chunk_addr$s2 = $chunk_addr >> 2;
  $id_addr = $id;
  $_$67 : while (1) {
    if (HEAP32[$chunk_addr$s2] == $id_addr) {
      $retval = 1;
      break;
    }
    var $tobool = HEAP32[$chunk_addr$s2 + 3] != 0;
    do {
      if ($tobool) {
        if (!(HEAPU32[HEAP32[$chunk_addr$s2 + 3] + 8 >> 2] >= HEAPU32[HEAP32[$chunk_addr$s2 + 3] + 4 >> 2])) {
          break;
        }
        $retval = 0;
        break $_$67;
      }
    } while (0);
    _skip_to_next_sibling_chunk($file_addr, $chunk_addr);
  }
  return $retval;
  return null;
}

function _mdjvu_file_load_djvu_page($file, $perr) {
  var __stackBase__ = STACKTOP;
  STACKTOP += 4;
  var $retval;
  var $file_addr;
  var $perr_addr;
  var $length = __stackBase__;
  $file_addr = $file;
  $perr_addr = $perr;
  var $call = _mdjvu_locate_jb2_chunk($file_addr, $length, $perr_addr);
  if ($call != 0) {
    var $3 = HEAP32[$length >> 2];
    var $call1 = _mdjvu_file_load_jb2($file_addr, $3, $perr_addr);
    $retval = $call1;
  } else {
    $retval = 0;
  }
  STACKTOP = __stackBase__;
  return $retval;
  return null;
}

function _mdjvu_load_djvu_page($path, $perr) {
  var $retval;
  var $path_addr;
  var $perr_addr;
  var $result;
  var $f;
  $path_addr = $path;
  $perr_addr = $perr;
  var $call = _fopen($path_addr, STRING_TABLE.__str99);
  $f = $call;
  if ($perr_addr != 0) {
    HEAP32[$perr_addr >> 2] = 0;
  }
  if ($f != 0) {
    var $call8 = _mdjvu_file_load_djvu_page($f, $perr_addr);
    $result = $call8;
    var $call9 = _fclose($f);
    $retval = $result;
  } else {
    if ($perr_addr != 0) {
      var $call5 = _mdjvu_get_error(1);
      HEAP32[$perr_addr >> 2] = $call5;
    }
    $retval = 0;
  }
  return $retval;
  return null;
}

function _skip_to_next_sibling_chunk($file, $chunk) {
  var $chunk_addr$s2;
  var $file_addr;
  var $chunk_addr;
  $file_addr = $file;
  $chunk_addr = $chunk;
  $chunk_addr$s2 = $chunk_addr >> 2;
  var $1 = HEAP32[$chunk_addr$s2 + 3];
  var $add = HEAP32[$chunk_addr$s2 + 1] + 8;
  _skip_in_chunk($1, $add);
  var $and = HEAP32[$chunk_addr$s2 + 1] + 1 & -2;
  var $call = _fseek($file_addr, $and, 1);
  var $call3 = _read_uint32_most_significant_byte_first($file_addr);
  HEAP32[$chunk_addr$s2] = $call3;
  var $call4 = _read_uint32_most_significant_byte_first($file_addr);
  HEAP32[$chunk_addr$s2 + 1] = $call4;
  HEAP32[$chunk_addr$s2 + 2] = 0;
  return;
  return;
}

function _mdjvu_save_pbm($b, $path, $perr) {
  var $retval;
  var $b_addr;
  var $path_addr;
  var $perr_addr;
  var $file;
  var $result;
  $b_addr = $b;
  $path_addr = $path;
  $perr_addr = $perr;
  var $call = _fopen($path_addr, STRING_TABLE.__str115);
  $file = $call;
  if ($perr_addr != 0) {
    HEAP32[$perr_addr >> 2] = 0;
  }
  if ($file != 0) {
    var $call8 = _mdjvu_file_save_pbm($b_addr, $file, $perr_addr);
    $result = $call8;
    var $call9 = _fclose($file);
    $retval = $result;
  } else {
    if ($perr_addr != 0) {
      var $call5 = _mdjvu_get_error(0);
      HEAP32[$perr_addr >> 2] = $call5;
    }
    $retval = 0;
  }
  return $retval;
  return null;
}

function _mdjvu_file_save_pbm($b, $f, $perr) {
  var $retval;
  var $b_addr;
  var $f_addr;
  var $perr_addr;
  var $file;
  var $bytes_per_row;
  var $width;
  var $height;
  var $i;
  var $row;
  $b_addr = $b;
  $f_addr = $f;
  $perr_addr = $perr;
  $file = $f_addr;
  var $call = _mdjvu_bitmap_get_packed_row_size($b_addr);
  $bytes_per_row = $call;
  var $call1 = _mdjvu_bitmap_get_width($b_addr);
  $width = $call1;
  var $call2 = _mdjvu_bitmap_get_height($b_addr);
  $height = $call2;
  if ($perr_addr != 0) {
    HEAP32[$perr_addr >> 2] = 0;
  }
  var $call3 = _fprintf($file, STRING_TABLE.__str1116, (tempInt = STACKTOP, STACKTOP += 8, HEAP32[tempInt >> 2] = $width, HEAP32[tempInt + 4 >> 2] = $height, tempInt));
  $i = 0;
  while (1) {
    if ($i >= $height) {
      $retval = 1;
      break;
    }
    var $call4 = _mdjvu_bitmap_access_packed_row($b_addr, $i);
    $row = $call4;
    var $call5 = _fwrite($row, $bytes_per_row, 1, $file);
    if ($call5 != 1) {
      if ($perr_addr != 0) {
        var $call10 = _mdjvu_get_error(2);
        HEAP32[$perr_addr >> 2] = $call10;
      }
      $retval = 0;
      break;
    }
    var $inc = $i + 1;
    $i = $inc;
  }
  return $retval;
  return null;
}

_mdjvu_file_save_pbm["X"] = 1;

function _mdjvu_save_tiff($bitmap, $path, $perr) {
  var $bitmap_addr;
  var $path_addr;
  var $perr_addr;
  $bitmap_addr = $bitmap;
  $path_addr = $path;
  $perr_addr = $perr;
  var $call = _mdjvu_get_error(11);
  HEAP32[$perr_addr >> 2] = $call;
  return 0;
  return null;
}

function __ZN16JB2BitmapDecoder8load_rowEP14MinidjvuBitmapiPh($this, $sh, $y, $row) {
  var $this_addr;
  var $sh_addr;
  var $y_addr;
  var $row_addr;
  $this_addr = $this;
  $sh_addr = $sh;
  $y_addr = $y;
  $row_addr = $row;
  return;
  return;
}

function __ZN12ZPBitContextC1Ev($this) {
  var $this_addr;
  $this_addr = $this;
  __ZN12ZPBitContextC2Ev($this_addr);
  return;
  return;
}

function __ZN16JB2BitmapDecoder17reset_numcontextsEv($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  __ZN12ZPNumContext5resetEv($this1 + 3076);
  __ZN12ZPNumContext5resetEv($this1 + 3104);
  __ZN12ZPNumContext5resetEv($this1 + 3132);
  __ZN12ZPNumContext5resetEv($this1 + 3160);
  return;
  return;
}

function __ZN16JB2BitmapDecoder17code_row_directlyEiPhS0_S0_S0_($this, $n, $up2, $up1, $target, $erosion) {
  var __label__;
  var $this_addr;
  var $n_addr;
  var $up2_addr;
  var $up1_addr;
  var $target_addr;
  var $erosion_addr;
  var $context;
  var $i;
  var $pixel;
  $this_addr = $this;
  $n_addr = $n;
  $up2_addr = $up2;
  $up1_addr = $up1;
  $target_addr = $target;
  $erosion_addr = $erosion;
  var $this1 = $this_addr;
  $context = 0;
  if (HEAP8[$up2_addr] != 0) {
    $context = 2;
  }
  if (HEAP8[$up2_addr + 1] != 0) {
    var $conv5 = ($context | 4) & 65535;
    $context = $conv5;
  }
  if (HEAP8[$up1_addr] != 0) {
    var $conv12 = ($context | 32) & 65535;
    $context = $conv12;
  }
  if (HEAP8[$up1_addr + 1] != 0) {
    var $conv19 = ($context | 64) & 65535;
    $context = $conv19;
  }
  if (HEAP8[$up1_addr + 2] != 0) {
    var $conv26 = ($context | 128) & 65535;
    $context = $conv26;
  }
  $i = $n_addr;
  while (1) {
    var $15 = $i;
    var $dec = $15 - 1;
    $i = $dec;
    if ($15 == 0) {
      break;
    }
    var $17 = $target_addr;
    var $incdec_ptr = $17 + 1;
    $target_addr = $incdec_ptr;
    var $18 = $erosion_addr;
    var $incdec_ptr30 = $18 + 1;
    $erosion_addr = $incdec_ptr30;
    var $conv31 = HEAPU8[$18];
    var $call = __ZN16JB2BitmapDecoder10code_pixelER12ZPBitContextPhi($this1, $this1 + ($context + 4), $17, $conv31);
    $pixel = $call;
    var $conv33 = $context >> 1 & 65535;
    $context = $conv33;
    var $conv35 = $context & 379 & 65535;
    $context = $conv35;
    var $incdec_ptr36 = $up1_addr + 1;
    $up1_addr = $incdec_ptr36;
    var $incdec_ptr37 = $up2_addr + 1;
    $up2_addr = $incdec_ptr37;
    if (HEAP8[$up2_addr + 1] != 0) {
      var $conv43 = ($context | 4) & 65535;
      $context = $conv43;
    }
    if (HEAP8[$up1_addr + 2] != 0) {
      var $conv50 = ($context | 128) & 65535;
      $context = $conv50;
    }
    if ($pixel != 0) {
      var $conv56 = ($context | 512) & 65535;
      $context = $conv56;
    } else {
      __label__ = 20;
    }
  }
  return;
  return;
}

__ZN16JB2BitmapDecoder17code_row_directlyEiPhS0_S0_S0_["X"] = 1;

function __ZN16JB2BitmapDecoder10code_pixelER12ZPBitContextPhi($this, $context, $pixel, $erosion) {
  var $this_addr;
  var $context_addr;
  var $pixel_addr;
  var $erosion_addr;
  $this_addr = $this;
  $context_addr = $context;
  $pixel_addr = $pixel;
  $erosion_addr = $erosion;
  var $ref = HEAP32[$this_addr >> 2];
  var $call = __ZN9ZPDecoder6decodeER12ZPBitContext($ref, $context_addr);
  var $conv = $call & 255;
  HEAP8[$pixel_addr] = $conv;
  return $conv;
  return null;
}

function __ZN16JB2BitmapDecoder22code_row_by_refinementEiPhS0_S0_S0_S0_S0_($this, $n, $up1, $target, $p_up, $p_sm, $p_dn, $erosion) {
  var __label__;
  var $this_addr;
  var $n_addr;
  var $up1_addr;
  var $target_addr;
  var $p_up_addr;
  var $p_sm_addr;
  var $p_dn_addr;
  var $erosion_addr;
  var $context;
  var $x;
  var $pixel;
  $this_addr = $this;
  $n_addr = $n;
  $up1_addr = $up1;
  $target_addr = $target;
  $p_up_addr = $p_up;
  $p_sm_addr = $p_sm;
  $p_dn_addr = $p_dn;
  $erosion_addr = $erosion;
  var $this1 = $this_addr;
  $context = 0;
  if (HEAP8[$up1_addr] != 0) {
    $context = 2;
  }
  if (HEAP8[$up1_addr + 1] != 0) {
    var $conv5 = ($context | 4) & 65535;
    $context = $conv5;
  }
  if (HEAP8[$p_up_addr] != 0) {
    var $conv12 = ($context | 16) & 65535;
    $context = $conv12;
  }
  if (HEAP8[$p_sm_addr - 1] != 0) {
    var $conv19 = ($context | 32) & 65535;
    $context = $conv19;
  }
  if (HEAP8[$p_sm_addr] != 0) {
    var $conv26 = ($context | 64) & 65535;
    $context = $conv26;
  }
  if (HEAP8[$p_sm_addr + 1] != 0) {
    var $conv33 = ($context | 128) & 65535;
    $context = $conv33;
  }
  if (HEAP8[$p_dn_addr - 1] != 0) {
    var $conv40 = ($context | 256) & 65535;
    $context = $conv40;
  }
  if (HEAP8[$p_dn_addr] != 0) {
    var $conv47 = ($context | 512) & 65535;
    $context = $conv47;
  }
  if (HEAP8[$p_dn_addr + 1] != 0) {
    var $conv54 = ($context | 1024) & 65535;
    $context = $conv54;
  }
  $x = $n_addr;
  while (1) {
    var $27 = $x;
    var $dec = $27 - 1;
    $x = $dec;
    if ($27 == 0) {
      break;
    }
    var $29 = $target_addr;
    var $incdec_ptr = $29 + 1;
    $target_addr = $incdec_ptr;
    var $30 = $erosion_addr;
    var $incdec_ptr58 = $30 + 1;
    $erosion_addr = $incdec_ptr58;
    var $conv59 = HEAPU8[$30];
    var $call = __ZN16JB2BitmapDecoder10code_pixelER12ZPBitContextPhi($this1, $this1 + ($context + 1028), $29, $conv59);
    $pixel = $call;
    var $conv61 = $context >> 1 & 65535;
    $context = $conv61;
    var $conv63 = $context & 867 & 65535;
    $context = $conv63;
    var $incdec_ptr64 = $up1_addr + 1;
    $up1_addr = $incdec_ptr64;
    var $incdec_ptr65 = $p_up_addr + 1;
    $p_up_addr = $incdec_ptr65;
    var $incdec_ptr66 = $p_sm_addr + 1;
    $p_sm_addr = $incdec_ptr66;
    var $incdec_ptr67 = $p_dn_addr + 1;
    $p_dn_addr = $incdec_ptr67;
    if (HEAP8[$up1_addr + 1] != 0) {
      var $conv73 = ($context | 4) & 65535;
      $context = $conv73;
    }
    if ($pixel != 0) {
      var $conv79 = ($context | 8) & 65535;
      $context = $conv79;
    }
    if (HEAP8[$p_up_addr] != 0) {
      var $conv86 = ($context | 16) & 65535;
      $context = $conv86;
    }
    if (HEAP8[$p_sm_addr + 1] != 0) {
      var $conv93 = ($context | 128) & 65535;
      $context = $conv93;
    }
    if (HEAP8[$p_dn_addr + 1] != 0) {
      var $conv100 = ($context | 1024) & 65535;
      $context = $conv100;
    } else {
      __label__ = 32;
    }
  }
  return;
  return;
}

__ZN16JB2BitmapDecoder22code_row_by_refinementEiPhS0_S0_S0_S0_S0_["X"] = 1;

function __ZN16JB2BitmapDecoder19code_image_directlyEP14MinidjvuBitmapS1_($this, $shape, $erosion_mask) {
  var $this_addr;
  var $shape_addr;
  var $erosion_mask_addr;
  var $w;
  var $h;
  var $up2;
  var $up1;
  var $target;
  var $erosion;
  var $y;
  var $t;
  $this_addr = $this;
  $shape_addr = $shape;
  $erosion_mask_addr = $erosion_mask;
  var $this1 = $this_addr;
  var $call = _mdjvu_bitmap_get_width($shape_addr);
  $w = $call;
  var $call2 = _mdjvu_bitmap_get_height($shape_addr);
  $h = $call2;
  var $call3 = _calloc($w + 3, 1);
  $up2 = $call3;
  var $call5 = _calloc($w + 3, 1);
  $up1 = $call5;
  var $call7 = _malloc($w + 3);
  $target = $call7;
  var $call8 = _calloc($w, 1);
  $erosion = $call8;
  HEAP8[$target + ($w + 2)] = 0;
  HEAP8[$target + ($w + 1)] = 0;
  HEAP8[$target + $w] = 0;
  $y = 0;
  while (1) {
    if ($y >= $h) {
      break;
    }
    __ZN16JB2BitmapDecoder8load_rowEP14MinidjvuBitmapiPh($this1, $shape_addr, $y, $target);
    if ($erosion_mask_addr != 0) {
      _mdjvu_bitmap_unpack_row($erosion_mask_addr, $erosion, $y);
    }
    __ZN16JB2BitmapDecoder17code_row_directlyEiPhS0_S0_S0_($this1, $w, $up2, $up1, $target, $erosion);
    __ZN16JB2BitmapDecoder8save_rowEP14MinidjvuBitmapiPhi($this1, $shape_addr, $y, $target, $erosion_mask_addr != 0);
    $t = $up2;
    $up2 = $up1;
    $up1 = $target;
    $target = $t;
    var $inc = $y + 1;
    $y = $inc;
  }
  _free($up2);
  _free($up1);
  _free($target);
  _free($erosion);
  return;
  return;
}

__ZN16JB2BitmapDecoder19code_image_directlyEP14MinidjvuBitmapS1_["X"] = 1;

function __ZN16JB2BitmapDecoder8save_rowEP14MinidjvuBitmapiPhi($this, $sh, $y, $row, $erosion) {
  var $this_addr;
  var $sh_addr;
  var $y_addr;
  var $row_addr;
  var $erosion_addr;
  $this_addr = $this;
  $sh_addr = $sh;
  $y_addr = $y;
  $row_addr = $row;
  $erosion_addr = $erosion;
  _mdjvu_bitmap_pack_row($sh_addr, $row_addr, $y_addr);
  return;
  return;
}

function __ZN16JB2BitmapDecoderC2ER9ZPDecoderP15ZPMemoryWatcher($this, $z, $w) {
  var $this_addr;
  var $z_addr;
  var $w_addr;
  $this_addr = $this;
  $z_addr = $z;
  $w_addr = $w;
  var $this1 = $this_addr;
  HEAP32[$this1 >> 2] = $z_addr;
  var $array_begin = $this1 + 4;
  var $arrayctor_end = $array_begin + 1024;
  var $arrayctor_cur = $array_begin;
  while (1) {
    var $arrayctor_cur;
    __ZN12ZPBitContextC1Ev($arrayctor_cur);
    var $arrayctor_next = $arrayctor_cur + 1;
    if ($arrayctor_next == $arrayctor_end) {
      break;
    }
    var $arrayctor_cur = $arrayctor_next;
  }
  var $array_begin2 = $this1 + 1028;
  var $arrayctor_end3 = $array_begin2 + 2048;
  var $arrayctor_cur5 = $array_begin2;
  while (1) {
    var $arrayctor_cur5;
    __ZN12ZPBitContextC1Ev($arrayctor_cur5);
    var $arrayctor_next6 = $arrayctor_cur5 + 1;
    if ($arrayctor_next6 == $arrayctor_end3) {
      break;
    }
    var $arrayctor_cur5 = $arrayctor_next6;
  }
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 3076, 0, 262142, $w_addr);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 3104, 0, 262142, $w_addr);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 3132, -262143, 262142, $w_addr);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 3160, -262143, 262142, $w_addr);
  return;
  return;
}

__ZN16JB2BitmapDecoderC2ER9ZPDecoderP15ZPMemoryWatcher["X"] = 1;

function __ZN12ZPBitContextC2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  HEAP8[$this_addr] = 0;
  return;
  return;
}

function __ZN16JB2BitmapDecoder24code_image_by_refinementEP14MinidjvuBitmapS1_S1_($this, $shape, $prototype, $erosion_mask) {
  var __label__;
  var $this_addr;
  var $shape_addr;
  var $prototype_addr;
  var $erosion_mask_addr;
  var $w;
  var $h;
  var $pw;
  var $ph;
  var $max_width;
  var $up1;
  var $target;
  var $erosion;
  var $buf_prototype_up;
  var $buf_prototype_sm;
  var $buf_prototype_dn;
  var $prototype_up;
  var $prototype_sm;
  var $prototype_dn;
  var $center_x;
  var $center_y;
  var $proto_center_x;
  var $proto_center_y;
  var $shift_x;
  var $shift_y;
  var $y;
  var $proto_unpack;
  var $code_shift;
  var $proto_y_dn;
  var $t;
  var $t52;
  var $t62;
  $this_addr = $this;
  $shape_addr = $shape;
  $prototype_addr = $prototype;
  $erosion_mask_addr = $erosion_mask;
  var $this1 = $this_addr;
  var $call = _mdjvu_bitmap_get_width($shape_addr);
  $w = $call;
  var $call2 = _mdjvu_bitmap_get_height($shape_addr);
  $h = $call2;
  var $call3 = _mdjvu_bitmap_get_width($prototype_addr);
  $pw = $call3;
  var $call4 = _mdjvu_bitmap_get_height($prototype_addr);
  $ph = $call4;
  var $cond = $w > $pw ? $w : $pw;
  $max_width = $cond;
  var $call5 = _calloc($max_width + 2, 1);
  $up1 = $call5;
  var $call7 = _calloc($max_width + 2, 1);
  $target = $call7;
  var $call8 = _calloc($max_width, 1);
  $erosion = $call8;
  var $call10 = _calloc($max_width + 3, 1);
  $buf_prototype_up = $call10;
  var $call12 = _calloc($max_width + 3, 1);
  $buf_prototype_sm = $call12;
  var $call14 = _calloc($max_width + 3, 1);
  $buf_prototype_dn = $call14;
  $prototype_up = $buf_prototype_up + 1;
  $prototype_sm = $buf_prototype_sm + 1;
  $prototype_dn = $buf_prototype_dn + 1;
  $center_x = $w - ($w / 2 & -1);
  $center_y = $h / 2 & -1;
  $proto_center_x = $pw - ($pw / 2 & -1);
  $proto_center_y = $ph / 2 & -1;
  $shift_x = $proto_center_x - $center_x;
  $shift_y = $proto_center_y - $center_y;
  if ($shift_x < 0) {
    var $cond25 = -$shift_x;
  } else {
    var $cond25 = 0;
  }
  var $cond25;
  $proto_unpack = $cond25;
  if ($shift_x > 0) {
    var $cond30 = $shift_x;
  } else {
    var $cond30 = 0;
  }
  var $cond30;
  $code_shift = $cond30;
  $y = $shift_y - 1;
  var $cmp32 = $y >= 0;
  do {
    if ($cmp32) {
      if ($y >= $ph) {
        break;
      }
      _mdjvu_bitmap_unpack_row_0_or_1($prototype_addr, $prototype_sm + $proto_unpack, $y);
    }
  } while (0);
  $y = $shift_y;
  var $cmp35 = $y >= 0;
  do {
    if ($cmp35) {
      if ($y >= $ph) {
        break;
      }
      _mdjvu_bitmap_unpack_row_0_or_1($prototype_addr, $prototype_dn + $proto_unpack, $y);
    }
  } while (0);
  $y = 0;
  while (1) {
    if ($y >= $h) {
      break;
    }
    $proto_y_dn = $y + ($shift_y + 1);
    if ($proto_y_dn >= 0) {
      if ($proto_y_dn < $ph) {
        $t = $prototype_up;
        $prototype_up = $prototype_sm;
        $prototype_sm = $prototype_dn;
        $prototype_dn = $t;
        _mdjvu_bitmap_unpack_row_0_or_1($prototype_addr, $prototype_dn + $proto_unpack, $proto_y_dn);
      } else {
        if ($proto_y_dn < $ph + 3) {
          $t52 = $prototype_up;
          $prototype_up = $prototype_sm;
          $prototype_sm = $prototype_dn;
          $prototype_dn = $t52;
          _memset($prototype_dn, 0, $max_width, 1);
        } else {
          __label__ = 21;
        }
      }
    }
    __ZN16JB2BitmapDecoder8load_rowEP14MinidjvuBitmapiPh($this1, $shape_addr, $y, $target);
    if ($erosion_mask_addr != 0) {
      _mdjvu_bitmap_unpack_row($erosion_mask_addr, $erosion, $y);
    }
    __ZN16JB2BitmapDecoder22code_row_by_refinementEiPhS0_S0_S0_S0_S0_($this1, $w, $up1, $target, $prototype_up + $code_shift, $prototype_sm + $code_shift, $prototype_dn + $code_shift, $erosion);
    __ZN16JB2BitmapDecoder8save_rowEP14MinidjvuBitmapiPhi($this1, $shape_addr, $y, $target, $erosion_mask_addr != 0);
    $t62 = $up1;
    $up1 = $target;
    $target = $t62;
    var $inc = $y + 1;
    $y = $inc;
  }
  _free($up1);
  _free($target);
  _free($erosion);
  _free($buf_prototype_up);
  _free($buf_prototype_sm);
  _free($buf_prototype_dn);
  return;
  return;
}

__ZN16JB2BitmapDecoder24code_image_by_refinementEP14MinidjvuBitmapS1_S1_["X"] = 1;

function __ZN16JB2BitmapDecoder6decodeEP13MinidjvuImageP14MinidjvuBitmap($this, $img, $proto) {
  var $this1$s2;
  var $retval;
  var $this_addr;
  var $img_addr;
  var $proto_addr;
  var $pw;
  var $ph;
  var $w;
  var $h;
  var $shape;
  var $w9;
  var $h13;
  var $shape17;
  $this_addr = $this;
  $img_addr = $img;
  $proto_addr = $proto;
  var $this1 = $this_addr, $this1$s2 = $this1 >> 2;
  if ($proto_addr != 0) {
    var $call = _mdjvu_bitmap_get_width($proto_addr);
    $pw = $call;
    var $call2 = _mdjvu_bitmap_get_height($proto_addr);
    $ph = $call2;
    var $3 = $pw;
    var $ref = HEAP32[$this1$s2];
    var $call3 = __ZN9ZPDecoder6decodeER12ZPNumContext($ref, $this1 + 3132);
    $w = $3 + $call3;
    var $4 = $ph;
    var $ref5 = HEAP32[$this1$s2];
    var $call6 = __ZN9ZPDecoder6decodeER12ZPNumContext($ref5, $this1 + 3160);
    $h = $4 + $call6;
    var $call8 = _mdjvu_image_new_bitmap($img_addr, $w, $h);
    $shape = $call8;
    __ZN16JB2BitmapDecoder24code_image_by_refinementEP14MinidjvuBitmapS1_S1_($this1, $shape, $proto_addr, 0);
    $retval = $shape;
  } else {
    var $ref11 = HEAP32[$this1$s2];
    var $call12 = __ZN9ZPDecoder6decodeER12ZPNumContext($ref11, $this1 + 3076);
    $w9 = $call12;
    var $ref15 = HEAP32[$this1$s2];
    var $call16 = __ZN9ZPDecoder6decodeER12ZPNumContext($ref15, $this1 + 3104);
    $h13 = $call16;
    var $call18 = _mdjvu_image_new_bitmap($img_addr, $w9, $h13);
    $shape17 = $call18;
    __ZN16JB2BitmapDecoder19code_image_directlyEP14MinidjvuBitmapS1_($this1, $shape17, 0);
    $retval = $shape17;
  }
  return $retval;
  return null;
}

__ZN16JB2BitmapDecoder6decodeEP13MinidjvuImageP14MinidjvuBitmap["X"] = 1;

function __ZN7WatcherC1Ev($this) {
  var $this_addr;
  $this_addr = $this;
  __ZN7WatcherC2Ev($this_addr);
  return;
  return;
}

function __ZN7JB2RectC1Eiiii($this, $l, $t, $w, $h) {
  var $this_addr;
  var $l_addr;
  var $t_addr;
  var $w_addr;
  var $h_addr;
  $this_addr = $this;
  $l_addr = $l;
  $t_addr = $t;
  $w_addr = $w;
  $h_addr = $h;
  __ZN7JB2RectC2Eiiii($this_addr, $l_addr, $t_addr, $w_addr, $h_addr);
  return;
  return;
}

function __ZN7JB2RectC1Ev($this) {
  var $this_addr;
  $this_addr = $this;
  __ZN7JB2RectC2Ev($this_addr);
  return;
  return;
}

function __ZN7WatcherD1Ev($this) {
  var $this_addr;
  $this_addr = $this;
  __ZN7WatcherD2Ev($this_addr);
  return;
  return;
}

function __ZN8JB2CoderC2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  __ZN7WatcherC1Ev($this1);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 8, 0, 262142, $this1);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 36, 0, 0, $this1);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 64, 0, 0, $this1);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 92, 0, 0, $this1);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 120, -262143, 262142, $this1);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 148, -262143, 262142, $this1);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 176, -262143, 262142, $this1);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 204, -262143, 262142, $this1);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 232, 0, 262142, $this1);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 260, 0, 255, $this1);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 288, 0, 262142, $this1);
  __ZN12ZPBitContextC1Ev($this1 + 316);
  __ZN12ZPBitContextC1Ev($this1 + 317);
  FUNCTION_TABLE[__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher]($this1 + 320, 0, 11, $this1);
  __ZN7JB2RectC1Eiiii($this1 + 348, -1, 0, 0, 1);
  __ZN7JB2RectC1Ev($this1 + 364);
  __ZN7JB2RectC1Ev($this1 + 380);
  __ZN7JB2RectC1Ev($this1 + 396);
  HEAP32[$this1 + 412 >> 2] = 0;
  return;
  return;
}

__ZN8JB2CoderC2Ev["X"] = 1;

function __ZN7JB2RectC2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  return;
  return;
}

function __ZN15ZPMemoryWatcherC2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  HEAP32[$this_addr >> 2] = __ZTV15ZPMemoryWatcher + 8;
  return;
  return;
}

function __ZN7JB2RectC2Eiiii($this, $l, $t, $w, $h) {
  var $this1$s2;
  var $this_addr;
  var $l_addr;
  var $t_addr;
  var $w_addr;
  var $h_addr;
  $this_addr = $this;
  $l_addr = $l;
  $t_addr = $t;
  $w_addr = $w;
  $h_addr = $h;
  var $this1$s2 = $this_addr >> 2;
  HEAP32[$this1$s2] = $l_addr;
  HEAP32[$this1$s2 + 1] = $t_addr;
  HEAP32[$this1$s2 + 2] = $w_addr;
  HEAP32[$this1$s2 + 3] = $h_addr;
  return;
  return;
}

function __ZN7Watcher17handle_allocationEv($this) {
  var $this_addr;
  $this_addr = $this;
  var $count = $this_addr + 4;
  var $inc = HEAP32[$count >> 2] + 1;
  HEAP32[$count >> 2] = $inc;
  return;
  return;
}

function __ZN8JB2Coder17reset_numcontextsEv($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  __ZN12ZPNumContext5resetEv($this1 + 320);
  __ZN12ZPNumContext5resetEv($this1 + 8);
  __ZN12ZPNumContext5resetEv($this1 + 36);
  __ZN12ZPNumContext5resetEv($this1 + 64);
  __ZN12ZPNumContext5resetEv($this1 + 92);
  __ZN12ZPNumContext5resetEv($this1 + 120);
  __ZN12ZPNumContext5resetEv($this1 + 148);
  __ZN12ZPNumContext5resetEv($this1 + 176);
  __ZN12ZPNumContext5resetEv($this1 + 204);
  __ZN12ZPNumContext5resetEv($this1 + 232);
  __ZN12ZPNumContext5resetEv($this1 + 260);
  __ZN12ZPNumContext5resetEv($this1 + 288);
  return;
  return;
}

function __ZN10JB2Decoder25decode_character_positionERiS0_ii($this, $x, $y, $w, $h) {
  var $80$s2;
  var $79$s2;
  var $76$s2;
  var $75$s2;
  var $26$s2;
  var $25$s2;
  var $this1$s2;
  var $y_addr$s2;
  var $x_addr$s2;
  var $this_addr;
  var $x_addr;
  var $y_addr;
  var $w_addr;
  var $h_addr;
  var $dy;
  var $baseline;
  var $b1;
  var $b2;
  var $b3;
  var $t;
  var $t52;
  var $t56;
  $this_addr = $this;
  $x_addr = $x;
  $x_addr$s2 = $x_addr >> 2;
  $y_addr = $y;
  $y_addr$s2 = $y_addr >> 2;
  $w_addr = $w;
  $h_addr = $h;
  var $this1 = $this_addr, $this1$s2 = $this1 >> 2;
  var $call = __ZN9ZPDecoder6decodeER12ZPBitContext($this1 + 3604, $this1 + 317);
  if ($call != 0) {
    var $2 = HEAP32[$this1$s2 + 87];
    var $call3 = __ZN9ZPDecoder6decodeER12ZPNumContext($this1 + 3604, $this1 + 176);
    var $add = $2 + $call3;
    HEAP32[$x_addr$s2] = $add;
    var $call5 = __ZN9ZPDecoder6decodeER12ZPNumContext($this1 + 3604, $this1 + 204);
    $dy = $call5;
    var $sub9 = HEAP32[$this1$s2 + 88] + HEAP32[$this1$s2 + 90] - 1 - $dy;
    HEAP32[$y_addr$s2] = $sub9;
    HEAP32[$this1$s2 + 103] = 1;
    var $14 = HEAP32[$x_addr$s2];
    HEAP32[$this1$s2 + 87] = $14;
    var $17 = HEAP32[$y_addr$s2];
    HEAP32[$this1$s2 + 88] = $17;
    HEAP32[$this1$s2 + 89] = $w_addr;
    HEAP32[$this1$s2 + 90] = $h_addr;
    var $25$s2 = $this1 + 396 >> 2;
    var $26$s2 = $this1 + 348 >> 2;
    HEAP32[$25$s2] = HEAP32[$26$s2];
    HEAP32[$25$s2 + 1] = HEAP32[$26$s2 + 1];
    HEAP32[$25$s2 + 2] = HEAP32[$26$s2 + 2];
    HEAP32[$25$s2 + 3] = HEAP32[$26$s2 + 3];
  } else {
    var $sub23 = HEAP32[$this1$s2 + 99] + HEAP32[$this1$s2 + 101] - 1;
    var $call25 = __ZN9ZPDecoder6decodeER12ZPNumContext($this1 + 3604, $this1 + 120);
    var $add26 = $sub23 + $call25;
    HEAP32[$x_addr$s2] = $add26;
    if (HEAP32[$this1$s2 + 103] < 3) {
      $baseline = HEAP32[$this1$s2 + 88] + HEAP32[$this1$s2 + 90];
    } else {
      $b1 = HEAP32[$this1$s2 + 100] + HEAP32[$this1$s2 + 102];
      $b2 = HEAP32[$this1$s2 + 96] + HEAP32[$this1$s2 + 98];
      $b3 = HEAP32[$this1$s2 + 92] + HEAP32[$this1$s2 + 94];
      if ($b1 > $b2) {
        $t = $b1;
        $b1 = $b2;
        $b2 = $t;
      }
      if ($b1 > $b3) {
        $t52 = $b1;
        $b1 = $b3;
        $b3 = $t52;
      }
      if ($b2 > $b3) {
        $t56 = $b2;
        $b2 = $b3;
        $b3 = $t56;
      }
      $baseline = $b2;
    }
    var $sub59 = $baseline - $h_addr;
    var $call61 = __ZN9ZPDecoder6decodeER12ZPNumContext($this1 + 3604, $this1 + 148);
    HEAP32[$y_addr$s2] = $sub59 - $call61;
    var $line_counter63 = $this1 + 412;
    var $inc = HEAP32[$line_counter63 >> 2] + 1;
    HEAP32[$line_counter63 >> 2] = $inc;
    var $75$s2 = $this1 + 364 >> 2;
    var $76$s2 = $this1 + 380 >> 2;
    HEAP32[$75$s2] = HEAP32[$76$s2];
    HEAP32[$75$s2 + 1] = HEAP32[$76$s2 + 1];
    HEAP32[$75$s2 + 2] = HEAP32[$76$s2 + 2];
    HEAP32[$75$s2 + 3] = HEAP32[$76$s2 + 3];
    var $79$s2 = $this1 + 380 >> 2;
    var $80$s2 = $this1 + 396 >> 2;
    HEAP32[$79$s2] = HEAP32[$80$s2];
    HEAP32[$79$s2 + 1] = HEAP32[$80$s2 + 1];
    HEAP32[$79$s2 + 2] = HEAP32[$80$s2 + 2];
    HEAP32[$79$s2 + 3] = HEAP32[$80$s2 + 3];
    var $82 = HEAP32[$x_addr$s2];
    HEAP32[$this1$s2 + 99] = $82;
    var $85 = HEAP32[$y_addr$s2];
    HEAP32[$this1$s2 + 100] = $85;
    HEAP32[$this1$s2 + 101] = $w_addr;
    HEAP32[$this1$s2 + 102] = $h_addr;
  }
  return;
  return;
}

__ZN10JB2Decoder25decode_character_positionERiS0_ii["X"] = 1;

function __ZN10JB2Decoder11decode_blitEP13MinidjvuImagei($this, $img, $shape_index) {
  var __stackBase__ = STACKTOP;
  STACKTOP += 8;
  var $this_addr;
  var $img_addr;
  var $shape_index_addr;
  var $shape;
  var $w;
  var $h;
  var $x = __stackBase__;
  var $y = __stackBase__ + 4;
  $this_addr = $this;
  $img_addr = $img;
  $shape_index_addr = $shape_index;
  var $this1 = $this_addr;
  var $call = _mdjvu_image_get_bitmap($img_addr, $shape_index_addr);
  $shape = $call;
  var $call2 = _mdjvu_bitmap_get_width($shape);
  $w = $call2;
  var $call3 = _mdjvu_bitmap_get_height($shape);
  $h = $call3;
  __ZN10JB2Decoder25decode_character_positionERiS0_ii($this1, $x, $y, $w, $h);
  var $7 = HEAP32[$x >> 2];
  var $8 = HEAP32[$y >> 2];
  var $call4 = _mdjvu_image_add_blit($img_addr, $7, $8, $shape);
  STACKTOP = __stackBase__;
  return $call4;
  return null;
}

function __ZN10JB2Decoder5resetEv($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  __ZN8JB2Coder17reset_numcontextsEv($this1);
  __ZN16JB2BitmapDecoder17reset_numcontextsEv($this1 + 416);
  return;
  return;
}

function __ZN10JB2Decoder18decode_record_typeEv($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  var $call = __ZN9ZPDecoder6decodeER12ZPNumContext($this1 + 3604, $this1 + 320);
  return $call;
  return null;
}

function __ZN7WatcherD2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  __ZN15ZPMemoryWatcherD2Ev($this_addr);
  return;
  return;
}

function __ZN7WatcherC2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  __ZN15ZPMemoryWatcherC2Ev($this1);
  HEAP32[$this1 >> 2] = __ZTV7Watcher + 8;
  HEAP32[$this1 + 4 >> 2] = 0;
  return;
  return;
}

function __ZN7WatcherD0Ev($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  __ZN7WatcherD1Ev($this1);
  __ZdlPv($this1);
  return;
  return;
}

function __ZN8JB2CoderD2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 320);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 288);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 260);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 232);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 204);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 176);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 148);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 120);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 92);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 64);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 36);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 8);
  __ZN7WatcherD1Ev($this1);
  return;
  return;
}

__ZN8JB2CoderD2Ev["X"] = 1;

function __ZN10JB2DecoderC2EP7__sFILEi($this, $f, $length) {
  var $this_addr;
  var $f_addr;
  var $length_addr;
  $this_addr = $this;
  $f_addr = $f;
  $length_addr = $length;
  var $this1 = $this_addr;
  __ZN8JB2CoderC2Ev($this1);
  __ZN16JB2BitmapDecoderC2ER9ZPDecoderP15ZPMemoryWatcher($this1 + 416, $this1 + 3604, 0);
  FUNCTION_TABLE[__ZN9ZPDecoderC1EP7__sFILEi]($this1 + 3604, $f_addr, $length_addr);
  return;
  return;
}

__ZN10JB2DecoderC2EP7__sFILEi["X"] = 1;

function __ZN16JB2BitmapDecoderD2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 3160);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 3132);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 3104);
  FUNCTION_TABLE[__ZN12ZPNumContextD1Ev]($this1 + 3076);
  return;
  return;
}

__ZN16JB2BitmapDecoderD2Ev["X"] = 1;

function __ZN15ZPMemoryWatcherD2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  return;
  return;
}

function __ZN12ZPNumContext4initEv($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  HEAP16[$this1 + 16 >> 1] = 1;
  HEAP8[HEAP32[$this1 + 12 >> 2]] = 0;
  HEAP16[HEAP32[$this1 + 24 >> 2] >> 1] = 0;
  HEAP16[HEAP32[$this1 + 20 >> 2] >> 1] = 0;
  return;
  return;
}

function __ZL16decode_lib_shapeR10JB2DecoderP13MinidjvuImagebP14MinidjvuBitmap($jb2, $img, $with_blit, $proto) {
  var __stackBase__ = STACKTOP;
  STACKTOP += 8;
  var $jb2_addr;
  var $img_addr;
  var $with_blit_addr;
  var $proto_addr;
  var $blit;
  var $index;
  var $shape;
  var $x = __stackBase__;
  var $y = __stackBase__ + 4;
  $jb2_addr = $jb2;
  $img_addr = $img;
  $with_blit_addr = $with_blit;
  $proto_addr = $proto;
  $blit = -1;
  var $call = _mdjvu_image_get_bitmap_count($img_addr);
  $index = $call;
  var $call1 = __ZN16JB2BitmapDecoder6decodeEP13MinidjvuImageP14MinidjvuBitmap($jb2_addr + 416, $img_addr, $proto_addr);
  $shape = $call1;
  if ($with_blit_addr & 1) {
    var $call2 = __ZN10JB2Decoder11decode_blitEP13MinidjvuImagei($jb2_addr, $img_addr, $index);
    $blit = $call2;
  }
  _mdjvu_bitmap_remove_margins($shape, $x, $y);
  if ($with_blit_addr & 1) {
    var $12 = $img_addr;
    var $13 = $blit;
    var $call5 = _mdjvu_image_get_blit_x($img_addr, $blit);
    var $add = $call5 + HEAP32[$x >> 2];
    _mdjvu_image_set_blit_x($12, $13, $add);
    var $17 = $img_addr;
    var $18 = $blit;
    var $call6 = _mdjvu_image_get_blit_y($img_addr, $blit);
    var $add7 = $call6 + HEAP32[$y >> 2];
    _mdjvu_image_set_blit_y($17, $18, $add7);
  }
  STACKTOP = __stackBase__;
  return $shape;
  return null;
}

__ZL16decode_lib_shapeR10JB2DecoderP13MinidjvuImagebP14MinidjvuBitmap["X"] = 1;

function __Z14append_to_listIP14MinidjvuBitmapEPT_RS3_RiS5_($list, $count, $allocated) {
  var $list_addr$s2;
  var $list_addr;
  var $count_addr;
  var $allocated_addr;
  $list_addr = $list;
  $list_addr$s2 = $list_addr >> 2;
  $count_addr = $count;
  $allocated_addr = $allocated;
  if (HEAP32[$allocated_addr >> 2] == HEAP32[$count_addr >> 2]) {
    var $4 = $allocated_addr;
    var $shl = HEAP32[$4 >> 2] << 1;
    HEAP32[$4 >> 2] = $shl;
    var $8 = HEAP32[$list_addr$s2];
    var $mul = HEAP32[$allocated_addr >> 2] << 2;
    var $call = _realloc($8, $mul);
    var $11 = $call;
    HEAP32[$list_addr$s2] = $11;
  }
  var $13 = $count_addr;
  var $14 = HEAP32[$13 >> 2];
  var $inc = $14 + 1;
  HEAP32[$13 >> 2] = $inc;
  return ($14 << 2) + HEAP32[$list_addr$s2];
  return null;
}

function __ZN10JB2DecoderD1Ev($this) {
  var $this_addr;
  $this_addr = $this;
  __ZN10JB2DecoderD2Ev($this_addr);
  return;
  return;
}

function __ZN15ZPMemoryWatcherD0Ev($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  FUNCTION_TABLE[__ZN15ZPMemoryWatcherD1Ev]($this1);
  __ZdlPv($this1);
  return;
  return;
}

function __ZN12ZPNumContextC2EiiP15ZPMemoryWatcher($this, $amin, $amax, $w) {
  var $this_addr;
  var $amin_addr;
  var $amax_addr;
  var $w_addr;
  $this_addr = $this;
  $amin_addr = $amin;
  $amax_addr = $amax;
  $w_addr = $w;
  var $this1 = $this_addr;
  HEAP32[$this1 >> 2] = $amin_addr;
  HEAP32[$this1 + 4 >> 2] = $amax_addr;
  HEAP32[$this1 + 8 >> 2] = $w_addr;
  HEAP16[$this1 + 18 >> 1] = 512;
  var $mul = HEAPU16[$this1 + 18 >> 1];
  var $call = _malloc($mul);
  HEAP32[$this1 + 12 >> 2] = $call;
  var $mul5 = HEAPU16[$this1 + 18 >> 1] << 1;
  var $call6 = _malloc($mul5);
  HEAP32[$this1 + 20 >> 2] = $call6;
  var $mul9 = HEAPU16[$this1 + 18 >> 1] << 1;
  var $call10 = _malloc($mul9);
  HEAP32[$this1 + 24 >> 2] = $call10;
  __ZN12ZPNumContext4initEv($this1);
  return;
  return;
}

function __ZN12ZPNumContextD2Ev($this) {
  var $this1$s2;
  var $this_addr;
  $this_addr = $this;
  var $this1$s2 = $this_addr >> 2;
  var $1 = HEAP32[$this1$s2 + 3];
  _free($1);
  var $3 = HEAP32[$this1$s2 + 5];
  _free($3);
  var $5 = HEAP32[$this1$s2 + 6];
  _free($5);
  return;
  return;
}

function _mdjvu_file_load_jb2($file, $length, $perr) {
  var $library$s2;
  var $lib_count$s2;
  var $perr_addr$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP += 3644;
  var $retval;
  var $file_addr;
  var $length_addr;
  var $perr_addr;
  var $f;
  var $jb2 = __stackBase__;
  var $zp;
  var $d;
  var $t;
  var $cleanup_dest_slot;
  var $w;
  var $h;
  var $img;
  var $lib_count = __stackBase__ + 3632, $lib_count$s2 = $lib_count >> 2;
  var $lib_alloc = __stackBase__ + 3636;
  var $library = __stackBase__ + 3640, $library$s2 = $library >> 2;
  var $match;
  var $match78;
  var $match100;
  var $match126;
  var $bmp;
  var $x;
  var $y;
  var $len;
  $file_addr = $file;
  $length_addr = $length;
  $perr_addr = $perr;
  $perr_addr$s2 = $perr_addr >> 2;
  if ($perr_addr != 0) {
    HEAP32[$perr_addr$s2] = 0;
  }
  $f = $file_addr;
  FUNCTION_TABLE[__ZN10JB2DecoderC1EP7__sFILEi]($jb2, $f, $length_addr);
  $zp = $jb2 + 3604;
  $d = 0;
  var $call = __ZN10JB2Decoder18decode_record_typeEv($jb2);
  $t = $call;
  if ($t == 9) {
    var $required_dictionary_size = $jb2 + 288;
    var $call4 = __ZN9ZPDecoder6decodeER12ZPNumContext($zp, $required_dictionary_size);
    $d = $call4;
    var $call6 = __ZN10JB2Decoder18decode_record_typeEv($jb2);
    $t = $call6;
  }
  var $cmp8 = $t != 0;
  $_$11 : do {
    if ($cmp8) {
      if ($perr_addr != 0) {
        var $call13 = _mdjvu_get_error(6);
        HEAP32[$perr_addr$s2] = $call13;
      }
      $retval = 0;
      $cleanup_dest_slot = 1;
    } else {
      var $image_size = $jb2 + 8;
      var $call17 = __ZN9ZPDecoder6decodeER12ZPNumContext($zp, $image_size);
      $w = $call17;
      var $image_size18 = $jb2 + 8;
      var $call20 = __ZN9ZPDecoder6decodeER12ZPNumContext($zp, $image_size18);
      $h = $call20;
      var $eventual_image_refinement = $jb2 + 316;
      var $call22 = __ZN9ZPDecoder6decodeER12ZPBitContext($zp, $eventual_image_refinement);
      var $symbol_column_number = $jb2 + 64;
      __ZN12ZPNumContext12set_intervalEii($symbol_column_number, 1, $w);
      var $symbol_row_number = $jb2 + 92;
      __ZN12ZPNumContext12set_intervalEii($symbol_row_number, 1, $h);
      var $call26 = _mdjvu_image_create($w, $h);
      $img = $call26;
      HEAP32[$lib_count$s2] = 0;
      HEAP32[$lib_alloc >> 2] = 128;
      var $mul = HEAP32[$lib_alloc >> 2] << 2;
      var $call27 = _malloc($mul);
      var $28 = $call27;
      HEAP32[$library$s2] = $28;
      while (1) {
        var $call29 = __ZN10JB2Decoder18decode_record_typeEv($jb2);
        $t = $call29;
        var $29 = $t;
        if ($29 == 1) {
          var $call31 = __ZL16decode_lib_shapeR10JB2DecoderP13MinidjvuImagebP14MinidjvuBitmap($jb2, $img, 1, 0);
          var $call33 = __Z14append_to_listIP14MinidjvuBitmapEPT_RS3_RiS5_($library, $lib_count, $lib_alloc);
          HEAP32[$call33 >> 2] = $call31;
        } else if ($29 == 2) {
          var $call36 = __ZL16decode_lib_shapeR10JB2DecoderP13MinidjvuImagebP14MinidjvuBitmap($jb2, $img, 0, 0);
          var $call38 = __Z14append_to_listIP14MinidjvuBitmapEPT_RS3_RiS5_($library, $lib_count, $lib_alloc);
          HEAP32[$call38 >> 2] = $call36;
        } else if ($29 == 3) {
          var $33 = $jb2 + 416;
          var $call41 = __ZN16JB2BitmapDecoder6decodeEP13MinidjvuImageP14MinidjvuBitmap($33, $img, 0);
          var $35 = $img;
          var $call43 = _mdjvu_image_get_bitmap_count($img);
          var $sub = $call43 - 1;
          var $call45 = __ZN10JB2Decoder11decode_blitEP13MinidjvuImagei($jb2, $35, $sub);
        } else if ($29 == 4) {
          if (HEAP32[$lib_count$s2] == 0) {
            _mdjvu_image_destroy($img);
            var $40 = HEAP32[$library$s2];
            _free($40);
            if ($perr_addr != 0) {
              var $call53 = _mdjvu_get_error(6);
              HEAP32[$perr_addr$s2] = $call53;
            }
            $retval = 0;
            $cleanup_dest_slot = 1;
            break $_$11;
          }
          var $matching_symbol_index = $jb2 + 36;
          var $sub56 = HEAP32[$lib_count$s2] - 1;
          __ZN12ZPNumContext12set_intervalEii($matching_symbol_index, 0, $sub56);
          var $matching_symbol_index58 = $jb2 + 36;
          var $call60 = __ZN9ZPDecoder6decodeER12ZPNumContext($zp, $matching_symbol_index58);
          $match = $call60;
          var $50 = HEAP32[HEAP32[$library$s2] + ($match << 2) >> 2];
          var $call62 = __ZL16decode_lib_shapeR10JB2DecoderP13MinidjvuImagebP14MinidjvuBitmap($jb2, $img, 1, $50);
          var $call64 = __Z14append_to_listIP14MinidjvuBitmapEPT_RS3_RiS5_($library, $lib_count, $lib_alloc);
          HEAP32[$call64 >> 2] = $call62;
        } else if ($29 == 5) {
          if (HEAP32[$lib_count$s2] == 0) {
            _mdjvu_image_destroy($img);
            var $54 = HEAP32[$library$s2];
            _free($54);
            if ($perr_addr != 0) {
              var $call72 = _mdjvu_get_error(6);
              HEAP32[$perr_addr$s2] = $call72;
            }
            $retval = 0;
            $cleanup_dest_slot = 1;
            break $_$11;
          }
          var $matching_symbol_index75 = $jb2 + 36;
          var $sub76 = HEAP32[$lib_count$s2] - 1;
          __ZN12ZPNumContext12set_intervalEii($matching_symbol_index75, 0, $sub76);
          var $matching_symbol_index79 = $jb2 + 36;
          var $call81 = __ZN9ZPDecoder6decodeER12ZPNumContext($zp, $matching_symbol_index79);
          $match78 = $call81;
          var $64 = HEAP32[HEAP32[$library$s2] + ($match78 << 2) >> 2];
          var $call84 = __ZL16decode_lib_shapeR10JB2DecoderP13MinidjvuImagebP14MinidjvuBitmap($jb2, $img, 0, $64);
          var $call86 = __Z14append_to_listIP14MinidjvuBitmapEPT_RS3_RiS5_($library, $lib_count, $lib_alloc);
          HEAP32[$call86 >> 2] = $call84;
        } else if ($29 == 6) {
          if (HEAP32[$lib_count$s2] == 0) {
            _mdjvu_image_destroy($img);
            var $68 = HEAP32[$library$s2];
            _free($68);
            if ($perr_addr != 0) {
              var $call94 = _mdjvu_get_error(6);
              HEAP32[$perr_addr$s2] = $call94;
            }
            $retval = 0;
            $cleanup_dest_slot = 1;
            break $_$11;
          }
          var $matching_symbol_index97 = $jb2 + 36;
          var $sub98 = HEAP32[$lib_count$s2] - 1;
          __ZN12ZPNumContext12set_intervalEii($matching_symbol_index97, 0, $sub98);
          var $matching_symbol_index101 = $jb2 + 36;
          var $call103 = __ZN9ZPDecoder6decodeER12ZPNumContext($zp, $matching_symbol_index101);
          $match100 = $call103;
          var $76 = $jb2 + 416;
          var $80 = HEAP32[HEAP32[$library$s2] + ($match100 << 2) >> 2];
          var $call107 = __ZN16JB2BitmapDecoder6decodeEP13MinidjvuImageP14MinidjvuBitmap($76, $img, $80);
          var $81 = $img;
          var $call109 = _mdjvu_image_get_bitmap_count($img);
          var $sub110 = $call109 - 1;
          var $call112 = __ZN10JB2Decoder11decode_blitEP13MinidjvuImagei($jb2, $81, $sub110);
        } else if ($29 == 7) {
          if (HEAP32[$lib_count$s2] == 0) {
            _mdjvu_image_destroy($img);
            var $86 = HEAP32[$library$s2];
            _free($86);
            if ($perr_addr != 0) {
              var $call120 = _mdjvu_get_error(6);
              HEAP32[$perr_addr$s2] = $call120;
            }
            $retval = 0;
            $cleanup_dest_slot = 1;
            break $_$11;
          }
          var $matching_symbol_index123 = $jb2 + 36;
          var $sub124 = HEAP32[$lib_count$s2] - 1;
          __ZN12ZPNumContext12set_intervalEii($matching_symbol_index123, 0, $sub124);
          var $matching_symbol_index127 = $jb2 + 36;
          var $call129 = __ZN9ZPDecoder6decodeER12ZPNumContext($zp, $matching_symbol_index127);
          $match126 = $call129;
          var $call131 = __ZN10JB2Decoder11decode_blitEP13MinidjvuImagei($jb2, $img, $match126);
        } else if ($29 == 8) {
          var $96 = $jb2 + 416;
          var $call135 = __ZN16JB2BitmapDecoder6decodeEP13MinidjvuImageP14MinidjvuBitmap($96, $img, 0);
          $bmp = $call135;
          var $symbol_column_number136 = $jb2 + 64;
          var $call138 = __ZN9ZPDecoder6decodeER12ZPNumContext($zp, $symbol_column_number136);
          $x = $call138 - 1;
          var $100 = $h;
          var $symbol_row_number140 = $jb2 + 92;
          var $call142 = __ZN9ZPDecoder6decodeER12ZPNumContext($zp, $symbol_row_number140);
          $y = $100 - $call142;
          var $call145 = _mdjvu_image_add_blit($img, $x, $y, $bmp);
        } else if ($29 == 9) {
          __ZN10JB2Decoder5resetEv($jb2);
        } else if ($29 == 10) {
          var $comment_length = $jb2 + 232;
          var $call150 = __ZN9ZPDecoder6decodeER12ZPNumContext($zp, $comment_length);
          $len = $call150;
          while (1) {
            var $109 = $len;
            var $dec = $109 - 1;
            $len = $dec;
            if ($109 == 0) {
              break;
            }
            var $comment_octet = $jb2 + 260;
            var $call155 = __ZN9ZPDecoder6decodeER12ZPNumContext($zp, $comment_octet);
          }
        } else if ($29 == 11) {
          var $113 = HEAP32[$library$s2];
          _free($113);
          $retval = $img;
          $cleanup_dest_slot = 1;
          break $_$11;
        } else {
          var $116 = HEAP32[$library$s2];
          _free($116);
          _mdjvu_image_destroy($img);
          if ($perr_addr != 0) {
            var $call161 = _mdjvu_get_error(6);
            HEAP32[$perr_addr$s2] = $call161;
          }
          $retval = 0;
          $cleanup_dest_slot = 1;
          break $_$11;
        }
      }
    }
  } while (0);
  __ZN10JB2DecoderD1Ev($jb2);
  STACKTOP = __stackBase__;
  return $retval;
  return null;
}

_mdjvu_file_load_jb2["X"] = 1;

function __ZN10JB2DecoderD2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  __ZN16JB2BitmapDecoderD2Ev($this1 + 416);
  __ZN8JB2CoderD2Ev($this1);
  return;
  return;
}

function __ZN12ZPNumContext12set_intervalEii($this, $new_min, $new_max) {
  var $this_addr;
  var $new_min_addr;
  var $new_max_addr;
  $this_addr = $this;
  $new_min_addr = $new_min;
  $new_max_addr = $new_max;
  var $this1 = $this_addr;
  HEAP32[$this1 >> 2] = $new_min_addr;
  HEAP32[$this1 + 4 >> 2] = $new_max_addr;
  return;
  return;
}

function __ZN12ZPNumContext8get_leftEt($this, $i) {
  var $retval;
  var $this_addr;
  var $i_addr;
  var $r;
  $this_addr = $this;
  $i_addr = $i;
  var $this1 = $this_addr;
  $r = HEAP16[HEAP32[$this1 + 20 >> 2] + ($i_addr << 1) >> 1];
  if ($r != 0) {
    $retval = $r;
  } else {
    var $call = __ZN12ZPNumContext8new_nodeEv($this1);
    $r = $call;
    HEAP16[HEAP32[$this1 + 20 >> 2] + ($i_addr << 1) >> 1] = $r;
    $retval = $r;
  }
  return $retval;
  return null;
}

function __ZN12ZPNumContext8new_nodeEv($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  if (HEAPU16[$this1 + 16 >> 1] == HEAPU16[$this1 + 18 >> 1]) {
    var $allocated3 = $this1 + 18;
    HEAP16[$allocated3 >> 1] = HEAPU16[$allocated3 >> 1] << 1 & 65535;
    var $4 = HEAP32[$this1 + 12 >> 2];
    var $mul = HEAPU16[$this1 + 18 >> 1];
    var $call = _realloc($4, $mul);
    var $6 = $call;
    HEAP32[$this1 + 12 >> 2] = $6;
    var $8 = HEAP32[$this1 + 20 >> 2];
    var $mul11 = HEAPU16[$this1 + 18 >> 1] << 1;
    var $call12 = _realloc($8, $mul11);
    var $10 = $call12;
    HEAP32[$this1 + 20 >> 2] = $10;
    var $12 = HEAP32[$this1 + 24 >> 2];
    var $mul16 = HEAPU16[$this1 + 18 >> 1] << 1;
    var $call17 = _realloc($12, $mul16);
    var $14 = $call17;
    HEAP32[$this1 + 24 >> 2] = $14;
  }
  HEAP8[HEAP32[$this1 + 12 >> 2] + HEAPU16[$this1 + 16 >> 1]] = 0;
  HEAP16[HEAP32[$this1 + 20 >> 2] + (HEAPU16[$this1 + 16 >> 1] << 1) >> 1] = 0;
  HEAP16[HEAP32[$this1 + 24 >> 2] + (HEAPU16[$this1 + 16 >> 1] << 1) >> 1] = 0;
  if (HEAP32[$this1 + 8 >> 2] != 0) {
    var $22 = HEAP32[$this1 + 8 >> 2];
    var $24 = HEAP32[HEAP32[$22 >> 2] >> 2];
    FUNCTION_TABLE[$24]($22);
  }
  var $n32 = $this1 + 16;
  var $25 = HEAP16[$n32 >> 1];
  var $inc = $25 + 1;
  HEAP16[$n32 >> 1] = $inc;
  return $25;
  return null;
}

__ZN12ZPNumContext8new_nodeEv["X"] = 1;

function __ZN12ZPNumContext9get_rightEt($this, $i) {
  var $retval;
  var $this_addr;
  var $i_addr;
  var $r;
  $this_addr = $this;
  $i_addr = $i;
  var $this1 = $this_addr;
  $r = HEAP16[HEAP32[$this1 + 24 >> 2] + ($i_addr << 1) >> 1];
  if ($r != 0) {
    $retval = $r;
  } else {
    var $call = __ZN12ZPNumContext8new_nodeEv($this1);
    $r = $call;
    HEAP16[HEAP32[$this1 + 24 >> 2] + ($i_addr << 1) >> 1] = $r;
    $retval = $r;
  }
  return $retval;
  return null;
}

function __ZN12ZPNumContext5resetEv($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  HEAP16[$this1 + 18 >> 1] = 512;
  var $1 = HEAP32[$this1 + 12 >> 2];
  var $mul = HEAPU16[$this1 + 18 >> 1];
  var $call = _realloc($1, $mul);
  var $3 = $call;
  HEAP32[$this1 + 12 >> 2] = $3;
  var $5 = HEAP32[$this1 + 20 >> 2];
  var $mul6 = HEAPU16[$this1 + 18 >> 1] << 1;
  var $call7 = _realloc($5, $mul6);
  var $7 = $call7;
  HEAP32[$this1 + 20 >> 2] = $7;
  var $9 = HEAP32[$this1 + 24 >> 2];
  var $mul11 = HEAPU16[$this1 + 18 >> 1] << 1;
  var $call12 = _realloc($9, $mul11);
  var $11 = $call12;
  HEAP32[$this1 + 24 >> 2] = $11;
  __ZN12ZPNumContext4initEv($this1);
  return;
  return;
}

function ___cxx_global_var_init() {
  __ZN6IniterC1Ev(__ZL6initer);
  return;
  return;
}

function __ZN6IniterC1Ev($this) {
  var $this_addr;
  $this_addr = $this;
  __ZN6IniterC2Ev($this_addr);
  return;
  return;
}

function __ZN9ZPDecoderC2EP7__sFILEi($this, $f, $len) {
  var $this1$s2;
  var $this_addr;
  var $f_addr;
  var $len_addr;
  $this_addr = $this;
  $f_addr = $f;
  $len_addr = $len;
  var $this1 = $this_addr, $this1$s2 = $this1 >> 2;
  HEAP32[$this1$s2] = $f_addr;
  HEAP32[$this1$s2 + 1] = 0;
  HEAP32[$this1$s2 + 3] = 0;
  HEAP32[$this1$s2 + 5] = $len_addr;
  __ZN9ZPDecoder4openEv($this1);
  return;
  return;
}

function __ZN9ZPDecoder4openEv($this) {
  var $this1$s2;
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr, $this1$s2 = $this1 >> 2;
  var $call = __ZN9ZPDecoder9next_byteERh($this1, $this1 + 24);
  if (!$call) {
    HEAP8[$this1 + 24] = -1;
  }
  HEAP32[$this1$s2 + 2] = HEAPU8[$this1 + 24] << 8;
  var $call5 = __ZN9ZPDecoder9next_byteERh($this1, $this1 + 24);
  if (!$call5) {
    HEAP8[$this1 + 24] = -1;
  }
  var $or = HEAP32[$this1$s2 + 2] | HEAPU8[$this1 + 24];
  HEAP32[$this1$s2 + 2] = $or;
  HEAP8[$this1 + 26] = 25;
  HEAP8[$this1 + 25] = 0;
  __ZN9ZPDecoder7preloadEv($this1);
  var $3 = HEAP32[$this1$s2 + 2];
  HEAP32[$this1$s2 + 3] = $3;
  if (HEAPU32[$this1$s2 + 2] >= 32768) {
    HEAP32[$this1$s2 + 3] = 32767;
  }
  return;
  return;
}

function __ZN9ZPDecoder9next_byteERh($this, $b) {
  var $retval;
  var $this_addr;
  var $b_addr;
  var $c;
  $this_addr = $this;
  $b_addr = $b;
  var $this1 = $this_addr;
  if (HEAP32[$this1 + 20 >> 2] != 0) {
    var $1 = HEAP32[$this1 >> 2];
    var $call = _fgetc($1);
    $c = $call;
    if ($c == -1) {
      $retval = 0;
    } else {
      var $bytes_left4 = $this1 + 20;
      var $dec = HEAP32[$bytes_left4 >> 2] - 1;
      HEAP32[$bytes_left4 >> 2] = $dec;
      HEAP8[$b_addr] = $c & 255;
      $retval = 1;
    }
  } else {
    $retval = 0;
  }
  return $retval;
  return null;
}

function __ZN9ZPDecoder7preloadEv($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  while (1) {
    if (!(HEAPU8[$this1 + 25] <= 24)) {
      break;
    }
    var $call = __ZN9ZPDecoder9next_byteERh($this1, $this1 + 24);
    if (!$call) {
      HEAP8[$this1 + 24] = -1;
      var $delay = $this1 + 26;
      var $dec = HEAP8[$delay] - 1;
      HEAP8[$delay] = $dec;
    }
    var $or = HEAP32[$this1 + 16 >> 2] << 8 | HEAPU8[$this1 + 24];
    HEAP32[$this1 + 16 >> 2] = $or;
    var $scount6 = $this1 + 25;
    HEAP8[$scount6] = HEAPU8[$scount6] + 8 & 255;
  }
  return;
  return;
}

function __ZN9ZPDecoder6decodeER12ZPNumContext($this, $context) {
  var $context_addr$s2;
  var __label__;
  var $this_addr;
  var $context_addr;
  var $negative;
  var $cutoff;
  var $range;
  var $current_node;
  var $phase;
  var $low;
  var $high;
  var $decision;
  var $temp;
  $this_addr = $this;
  $context_addr = $context;
  $context_addr$s2 = $context_addr >> 2;
  var $this1 = $this_addr;
  $negative = 0;
  $cutoff = 0;
  $range = -1;
  $current_node = 0;
  $phase = 1;
  $low = HEAP32[$context_addr$s2];
  $high = HEAP32[$context_addr$s2 + 1];
  while (1) {
    if ($range == 1) {
      break;
    }
    if ($low >= $cutoff) {
      var $13 = 1;
    } else {
      if ($high >= $cutoff) {
        var $arrayidx = HEAP32[$context_addr$s2 + 3] + $current_node;
        var $call = __ZN9ZPDecoder6decodeER12ZPBitContext($this1, $arrayidx);
        var $12 = $call != 0;
      } else {
        var $12 = 0;
      }
      var $12;
      var $13 = $12;
    }
    var $13;
    $decision = $13;
    if ($decision & 1) {
      var $call5 = __ZN12ZPNumContext9get_rightEt($context_addr, $current_node);
      var $cond = $call5;
    } else {
      var $call6 = __ZN12ZPNumContext8get_leftEt($context_addr, $current_node);
      var $cond = $call6;
    }
    var $cond;
    $current_node = $cond;
    var $19 = $phase;
    if ($19 == 1) {
      $negative = $decision & 1 ^ 1;
      if ($negative & 1) {
        $temp = -$low - 1;
        $low = -$high - 1;
        $high = $temp;
      }
      $phase = 2;
      $cutoff = 1;
    } else if ($19 == 2) {
      if ($decision & 1) {
        var $add23 = $cutoff + ($cutoff + 1);
        $cutoff = $add23;
      } else {
        $phase = 3;
        $range = ($cutoff + 1) / 2 & -1;
        if ($range == 1) {
          $cutoff = 0;
        } else {
          var $div18 = Math.floor($range / 2);
          var $sub19 = $cutoff - $div18;
          $cutoff = $sub19;
        }
      }
    } else if ($19 == 3) {
      var $div26 = Math.floor($range / 2);
      $range = $div26;
      if ($range != 1) {
        if ($decision & 1) {
          var $div34 = Math.floor($range / 2);
          var $add35 = $cutoff + $div34;
          $cutoff = $add35;
        } else {
          var $div31 = Math.floor($range / 2);
          var $sub32 = $cutoff - $div31;
          $cutoff = $sub32;
        }
      } else {
        if ($decision & 1) {
          __label__ = 29;
        } else {
          var $dec = $cutoff - 1;
          $cutoff = $dec;
        }
      }
    } else {
      __label__ = 31;
    }
  }
  if ($negative & 1) {
    var $cond48 = -$cutoff - 1;
  } else {
    var $cond48 = $cutoff;
  }
  var $cond48;
  return $cond48;
  return null;
}

__ZN9ZPDecoder6decodeER12ZPNumContext["X"] = 1;

function __ZN9ZPDecoder6decodeER12ZPBitContext($this, $context) {
  var $this1$s2;
  var $retval;
  var $this_addr;
  var $context_addr;
  var $z;
  var $d;
  $this_addr = $this;
  $context_addr = $context;
  var $this1 = $this_addr, $this1$s2 = $this1 >> 2;
  $z = HEAP32[$this1$s2 + 1] + HEAPU16[__ZL10ZP_p_table + (HEAPU8[$context_addr] << 1) >> 1];
  if ($z <= HEAPU32[$this1$s2 + 3]) {
    HEAP32[$this1$s2 + 1] = $z;
    $retval = HEAPU8[$context_addr] & 1;
  } else {
    $d = ($z + HEAP32[$this1$s2 + 1] >>> 2) + 24576;
    if ($z > $d) {
      $z = $d;
    }
    var $call = __ZN9ZPDecoder10decode_subER12ZPBitContextj($this1, $context_addr, $z);
    $retval = $call;
  }
  return $retval;
  return null;
}

__ZN9ZPDecoder6decodeER12ZPBitContext["X"] = 1;

function __ZN9ZPDecoder10decode_subER12ZPBitContextj($this, $context, $z) {
  var $this1$s2;
  var $retval;
  var $this_addr;
  var $context_addr;
  var $z_addr;
  var $bit;
  var $shift;
  $this_addr = $this;
  $context_addr = $context;
  $z_addr = $z;
  var $this1 = $this_addr, $this1$s2 = $this1 >> 2;
  $bit = HEAPU8[$context_addr] & 1;
  if ($z_addr > HEAPU32[$this1$s2 + 2]) {
    var $sub = 65536 - $z_addr;
    $z_addr = $sub;
    var $a = $this1 + 4;
    var $add = HEAP32[$a >> 2] + $z_addr;
    HEAP32[$a >> 2] = $add;
    var $add3 = HEAP32[$this1$s2 + 2] + $z_addr;
    HEAP32[$this1$s2 + 2] = $add3;
    var $arrayidx = STRING_TABLE.__ZL11ZP_dn_table + HEAPU8[$context_addr];
    var $11 = HEAP8[$arrayidx];
    HEAP8[$context_addr] = $11;
    var $13 = HEAP32[$this1$s2 + 1];
    var $call = __ZN9ZPDecoder3ffzEj($this1, $13);
    $shift = $call;
    var $scount = $this1 + 25;
    HEAP8[$scount] = HEAPU8[$scount] - $shift & 255;
    var $conv13 = HEAP32[$this1$s2 + 1] << $shift & 65535;
    HEAP32[$this1$s2 + 1] = $conv13;
    var $or = HEAP32[$this1$s2 + 2] << $shift & 65535 | HEAPU32[$this1$s2 + 4] >>> HEAPU8[$this1 + 25] & (1 << $shift) - 1;
    HEAP32[$this1$s2 + 2] = $or;
    if (HEAPU8[$this1 + 25] < 16) {
      __ZN9ZPDecoder7preloadEv($this1);
    }
    var $24 = HEAP32[$this1$s2 + 2];
    HEAP32[$this1$s2 + 3] = $24;
    if (HEAPU32[$this1$s2 + 2] >= 32768) {
      HEAP32[$this1$s2 + 3] = 32767;
    }
    $retval = $bit ^ 1;
  } else {
    if (HEAPU32[$this1$s2 + 1] >= HEAPU16[__ZL10ZP_m_table + (HEAPU8[$context_addr] << 1) >> 1]) {
      var $arrayidx44 = STRING_TABLE.__ZL11ZP_up_table + HEAPU8[$context_addr];
      var $33 = HEAP8[$arrayidx44];
      HEAP8[$context_addr] = $33;
    }
    var $scount47 = $this1 + 25;
    HEAP8[$scount47] = HEAPU8[$scount47] - 1 & 255;
    HEAP32[$this1$s2 + 1] = $z_addr << 1 & 65535;
    var $or64 = HEAP32[$this1$s2 + 2] << 1 & 65535 | HEAPU32[$this1$s2 + 4] >>> HEAPU8[$this1 + 25] & 1;
    HEAP32[$this1$s2 + 2] = $or64;
    if (HEAPU8[$this1 + 25] < 16) {
      __ZN9ZPDecoder7preloadEv($this1);
    }
    var $41 = HEAP32[$this1$s2 + 2];
    HEAP32[$this1$s2 + 3] = $41;
    if (HEAPU32[$this1$s2 + 2] >= 32768) {
      HEAP32[$this1$s2 + 3] = 32767;
    }
    $retval = $bit;
  }
  return $retval;
  return null;
}

__ZN9ZPDecoder10decode_subER12ZPBitContextj["X"] = 1;

function __ZN9ZPDecoder3ffzEj($this, $x) {
  var $this_addr;
  var $x_addr;
  $this_addr = $this;
  $x_addr = $x;
  if ($x_addr >= 65280) {
    var $cond = HEAP8[__ZL12ZP_FFZ_table + ($x_addr & 255)] + 8;
  } else {
    var $cond = HEAP8[__ZL12ZP_FFZ_table + ($x_addr >>> 8 & 255)];
  }
  var $cond;
  return $cond;
  return null;
}

function __ZL14init_ffz_tablev() {
  var $i;
  var $j;
  $i = 0;
  while (1) {
    if ($i >= 256) {
      break;
    }
    HEAP8[__ZL12ZP_FFZ_table + $i] = 0;
    $j = $i;
    while (1) {
      if (($j & 128) == 0) {
        break;
      }
      var $arrayidx3 = __ZL12ZP_FFZ_table + $i;
      var $conv4 = HEAP8[$arrayidx3] + 1 & 255;
      HEAP8[$arrayidx3] = $conv4;
      var $shl = $j << 1;
      $j = $shl;
    }
    var $inc = $i + 1;
    $i = $inc;
  }
  return;
  return;
}

function __ZL11init_tablesv() {
  var __label__;
  var $i;
  var $j;
  $i = 0;
  while (1) {
    if ($i >= 256) {
      __label__ = 12;
      break;
    }
    if (HEAPU16[__ZL10ZP_m_table + ($i << 1) >> 1] == 65535) {
      __label__ = 5;
      break;
    }
    var $inc7 = $i + 1;
    $i = $inc7;
  }
  if (__label__ == 5) {
    $j = $i;
    while (1) {
      if ($j >= 256) {
        break;
      }
      HEAP16[__ZL10ZP_m_table + ($j << 1) >> 1] = 0;
      var $inc = $j + 1;
      $j = $inc;
    }
  }
  return;
  return;
}

function __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi($this, $info, $adjustedPtr, $path_below) {
  var $info_addr$s2;
  var __label__;
  var $this_addr;
  var $info_addr;
  var $adjustedPtr_addr;
  var $path_below_addr;
  $this_addr = $this;
  $info_addr = $info;
  $info_addr$s2 = $info_addr >> 2;
  $adjustedPtr_addr = $adjustedPtr;
  $path_below_addr = $path_below;
  if (HEAP32[$info_addr$s2 + 4] == 0) {
    HEAP32[$info_addr$s2 + 4] = $adjustedPtr_addr;
    HEAP32[$info_addr$s2 + 6] = $path_below_addr;
    HEAP32[$info_addr$s2 + 9] = 1;
  } else {
    if (HEAP32[$info_addr$s2 + 4] == $adjustedPtr_addr) {
      if (HEAP32[$info_addr$s2 + 6] == 2) {
        HEAP32[$info_addr$s2 + 6] = $path_below_addr;
      } else {
        __label__ = 7;
      }
    } else {
      var $number_to_static_ptr11 = $info_addr + 36;
      var $add = HEAP32[$number_to_static_ptr11 >> 2] + 1;
      HEAP32[$number_to_static_ptr11 >> 2] = $add;
      HEAP32[$info_addr$s2 + 6] = 2;
      HEAP8[$info_addr + 54] = 1;
    }
  }
  return;
  return;
}

__ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi["X"] = 1;

function __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i($this, $info, $dst_ptr, $current_ptr, $path_below) {
  var $info_addr$s2;
  var __label__;
  var $this_addr;
  var $info_addr;
  var $dst_ptr_addr;
  var $current_ptr_addr;
  var $path_below_addr;
  $this_addr = $this;
  $info_addr = $info;
  $info_addr$s2 = $info_addr >> 2;
  $dst_ptr_addr = $dst_ptr;
  $current_ptr_addr = $current_ptr;
  $path_below_addr = $path_below;
  HEAP8[$info_addr + 53] = 1;
  if ($current_ptr_addr == HEAP32[$info_addr$s2 + 1]) {
    HEAP8[$info_addr + 52] = 1;
    if (HEAP32[$info_addr$s2 + 4] == 0) {
      HEAP32[$info_addr$s2 + 4] = $dst_ptr_addr;
      HEAP32[$info_addr$s2 + 6] = $path_below_addr;
      HEAP32[$info_addr$s2 + 9] = 1;
      var $cmp5 = HEAP32[$info_addr$s2 + 12] == 1;
      do {
        if ($cmp5) {
          if (HEAP32[$info_addr$s2 + 6] != 1) {
            break;
          }
          HEAP8[$info_addr + 54] = 1;
        } else {
          __label__ = 7;
        }
      } while (0);
    } else {
      if (HEAP32[$info_addr$s2 + 4] == $dst_ptr_addr) {
        if (HEAP32[$info_addr$s2 + 6] == 2) {
          HEAP32[$info_addr$s2 + 6] = $path_below_addr;
        }
        var $cmp18 = HEAP32[$info_addr$s2 + 12] == 1;
        do {
          if ($cmp18) {
            if (HEAP32[$info_addr$s2 + 6] != 1) {
              break;
            }
            HEAP8[$info_addr + 54] = 1;
          } else {
            __label__ = 14;
          }
        } while (0);
      } else {
        var $number_to_static_ptr26 = $info_addr + 36;
        var $add = HEAP32[$number_to_static_ptr26 >> 2] + 1;
        HEAP32[$number_to_static_ptr26 >> 2] = $add;
        HEAP8[$info_addr + 54] = 1;
      }
    }
  }
  return;
  return;
}

__ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i["X"] = 1;

function __ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi($this, $info, $current_ptr, $path_below) {
  var $info_addr$s2;
  var __label__;
  var $this_addr;
  var $info_addr;
  var $current_ptr_addr;
  var $path_below_addr;
  $this_addr = $this;
  $info_addr = $info;
  $info_addr$s2 = $info_addr >> 2;
  $current_ptr_addr = $current_ptr;
  $path_below_addr = $path_below;
  if ($current_ptr_addr == HEAP32[$info_addr$s2 + 1]) {
    if (HEAP32[$info_addr$s2 + 7] != 1) {
      HEAP32[$info_addr$s2 + 7] = $path_below_addr;
    } else {
      __label__ = 5;
    }
  }
  return;
  return;
}

function __ZN6IniterC2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  __ZL4initv();
  return;
  return;
}

function __ZL4initv() {
  __ZL14init_ffz_tablev();
  __ZL11init_tablesv();
  return;
  return;
}

function __GLOBAL__I_a() {
  ___cxx_global_var_init();
  return;
  return;
}

function __ZN10__cxxabiv116__shim_type_infoD2Ev($this) {
  var $this_addr;
  $this_addr = $this;
  __ZNSt9type_infoD2Ev($this_addr);
  return;
  return;
}

function __ZN10__cxxabiv117__class_type_infoD0Ev($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  FUNCTION_TABLE[__ZN10__cxxabiv117__class_type_infoD1Ev]($this1);
  __ZdlPv($this1);
  return;
  return;
}

function __ZN10__cxxabiv120__si_class_type_infoD0Ev($this) {
  var $this_addr;
  $this_addr = $this;
  var $this1 = $this_addr;
  FUNCTION_TABLE[__ZN10__cxxabiv120__si_class_type_infoD1Ev]($this1);
  __ZdlPv($this1);
  return;
  return;
}

function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv($this, $thrown_type, $adjustedPtr) {
  var $info$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP += 56;
  var $retval;
  var $this_addr;
  var $thrown_type_addr;
  var $adjustedPtr_addr;
  var $thrown_class_type;
  var $info = __stackBase__, $info$s2 = $info >> 2;
  $this_addr = $this;
  $thrown_type_addr = $thrown_type;
  $adjustedPtr_addr = $adjustedPtr;
  var $this1 = $this_addr;
  if ($this1 == $thrown_type_addr) {
    $retval = 1;
  } else {
    var $2 = $thrown_type_addr;
    if ($2 == 0) {
      var $7 = 0;
    } else {
      var $5 = ___dynamic_cast($2, __ZTIN10__cxxabiv116__shim_type_infoE, __ZTIN10__cxxabiv117__class_type_infoE, -1);
      var $7 = $5;
    }
    var $7;
    $thrown_class_type = $7;
    if ($thrown_class_type == 0) {
      $retval = 0;
    } else {
      var $9 = $info;
      for (var $$dest = $9 >> 2, $$stop = $$dest + 14; $$dest < $$stop; $$dest++) {
        HEAP32[$$dest] = 0;
      }
      HEAP32[$info$s2] = $thrown_class_type;
      HEAP32[$info$s2 + 2] = $this1;
      HEAP32[$info$s2 + 3] = -1;
      HEAP32[$info$s2 + 12] = 1;
      var $11 = $thrown_class_type;
      var $13 = HEAP32[HEAP32[$11 >> 2] + 20 >> 2];
      var $15 = HEAP32[$adjustedPtr_addr >> 2];
      FUNCTION_TABLE[$13]($11, $info, $15, 1);
      if (HEAP32[$info$s2 + 6] == 1) {
        var $17 = HEAP32[$info$s2 + 4];
        HEAP32[$adjustedPtr_addr >> 2] = $17;
        $retval = 1;
      } else {
        $retval = 0;
      }
    }
  }
  STACKTOP = __stackBase__;
  return $retval;
  return null;
}

__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv["X"] = 1;

function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this, $info, $adjustedPtr, $path_below) {
  var $this_addr;
  var $info_addr;
  var $adjustedPtr_addr;
  var $path_below_addr;
  $this_addr = $this;
  $info_addr = $info;
  $adjustedPtr_addr = $adjustedPtr;
  $path_below_addr = $path_below;
  var $this1 = $this_addr;
  if ($this1 == HEAP32[$info_addr + 8 >> 2]) {
    __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi($this1, $info_addr, $adjustedPtr_addr, $path_below_addr);
  }
  return;
  return;
}

function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi($this, $info, $adjustedPtr, $path_below) {
  var $this_addr;
  var $info_addr;
  var $adjustedPtr_addr;
  var $path_below_addr;
  $this_addr = $this;
  $info_addr = $info;
  $adjustedPtr_addr = $adjustedPtr;
  $path_below_addr = $path_below;
  var $this1 = $this_addr;
  if ($this1 == HEAP32[$info_addr + 8 >> 2]) {
    __ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi($this1, $info_addr, $adjustedPtr_addr, $path_below_addr);
  } else {
    var $7 = HEAP32[$this1 + 8 >> 2];
    var $9 = HEAP32[HEAP32[$7 >> 2] + 20 >> 2];
    FUNCTION_TABLE[$9]($7, $info_addr, $adjustedPtr_addr, $path_below_addr);
  }
  return;
  return;
}

function ___dynamic_cast($static_ptr, $static_type, $dst_type, $src2dst_offset) {
  var $info$s2;
  var __stackBase__ = STACKTOP;
  STACKTOP += 56;
  var __label__;
  var $static_ptr_addr;
  var $static_type_addr;
  var $dst_type_addr;
  var $src2dst_offset_addr;
  var $vtable;
  var $offset_to_derived;
  var $dynamic_ptr;
  var $dynamic_type;
  var $dst_ptr;
  var $info = __stackBase__, $info$s2 = $info >> 2;
  $static_ptr_addr = $static_ptr;
  $static_type_addr = $static_type;
  $dst_type_addr = $dst_type;
  $src2dst_offset_addr = $src2dst_offset;
  $vtable = HEAP32[$static_ptr_addr >> 2];
  $offset_to_derived = HEAP32[$vtable - 8 >> 2];
  $dynamic_ptr = $static_ptr_addr + $offset_to_derived;
  $dynamic_type = HEAP32[$vtable - 4 >> 2];
  $dst_ptr = 0;
  HEAP32[$info$s2] = $dst_type_addr;
  HEAP32[$info$s2 + 1] = $static_ptr_addr;
  HEAP32[$info$s2 + 2] = $static_type_addr;
  HEAP32[$info$s2 + 3] = $src2dst_offset_addr;
  HEAP32[$info$s2 + 4] = 0;
  HEAP32[$info$s2 + 5] = 0;
  HEAP32[$info$s2 + 6] = 0;
  HEAP32[$info$s2 + 7] = 0;
  HEAP32[$info$s2 + 8] = 0;
  HEAP32[$info$s2 + 9] = 0;
  HEAP32[$info$s2 + 10] = 0;
  HEAP32[$info$s2 + 11] = 0;
  HEAP32[$info$s2 + 12] = 0;
  HEAP8[$info + 52] = 0;
  HEAP8[$info + 53] = 0;
  HEAP8[$info + 54] = 0;
  if ($dynamic_type == $dst_type_addr) {
    HEAP32[$info$s2 + 12] = 1;
    var $17 = $dynamic_type;
    var $19 = HEAP32[HEAP32[$17 >> 2] + 12 >> 2];
    FUNCTION_TABLE[$19]($17, $info, $dynamic_ptr, $dynamic_ptr, 1);
    if (HEAP32[$info$s2 + 6] == 1) {
      $dst_ptr = $dynamic_ptr;
    } else {
      __label__ = 5;
    }
  } else {
    var $24 = $dynamic_type;
    var $26 = HEAP32[HEAP32[$24 >> 2] + 16 >> 2];
    FUNCTION_TABLE[$26]($24, $info, $dynamic_ptr, 1);
    var $28 = HEAP32[$info$s2 + 9];
    if ($28 == 0) {
      var $cmp15 = HEAP32[$info$s2 + 10] == 1;
      do {
        if ($cmp15) {
          if (HEAP32[$info$s2 + 7] != 1) {
            break;
          }
          if (HEAP32[$info$s2 + 8] != 1) {
            break;
          }
          $dst_ptr = HEAP32[$info$s2 + 5];
        } else {
          __label__ = 11;
        }
      } while (0);
    } else if ($28 == 1) {
      var $cmp26 = HEAP32[$info$s2 + 6] == 1;
      do {
        if ($cmp26) {
          __label__ = 16;
        } else {
          if (HEAP32[$info$s2 + 10] != 0) {
            __label__ = 17;
            break;
          }
          if (HEAP32[$info$s2 + 7] != 1) {
            __label__ = 17;
            break;
          }
          if (HEAP32[$info$s2 + 8] == 1) {
            __label__ = 16;
            break;
          }
          __label__ = 17;
          break;
        }
      } while (0);
      if (__label__ == 16) {
        $dst_ptr = HEAP32[$info$s2 + 4];
      }
    } else {
      __label__ = 18;
    }
  }
  STACKTOP = __stackBase__;
  return $dst_ptr;
  return null;
}

___dynamic_cast["X"] = 1;

function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvi($this, $info, $current_ptr, $path_below) {
  var $info_addr$s2;
  var __label__;
  var $this_addr;
  var $info_addr;
  var $current_ptr_addr;
  var $path_below_addr;
  var $is_dst_type_derived_from_static_type13;
  var $does_dst_type_point_to_our_static_type;
  $this_addr = $this;
  $info_addr = $info;
  $info_addr$s2 = $info_addr >> 2;
  $current_ptr_addr = $current_ptr;
  $path_below_addr = $path_below;
  var $this1 = $this_addr;
  if ($this1 == HEAP32[$info_addr$s2 + 2]) {
    __ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi($this1, $info_addr, $current_ptr_addr, $path_below_addr);
  } else {
    if ($this1 == HEAP32[$info_addr$s2]) {
      var $cmp4 = $current_ptr_addr == HEAP32[$info_addr$s2 + 4];
      do {
        if (!$cmp4) {
          if ($current_ptr_addr == HEAP32[$info_addr$s2 + 5]) {
            __label__ = 7;
            break;
          }
          HEAP32[$info_addr$s2 + 8] = $path_below_addr;
          if (HEAP32[$info_addr$s2 + 11] != 4) {
            $is_dst_type_derived_from_static_type13 = 0;
            $does_dst_type_point_to_our_static_type = 0;
            HEAP8[$info_addr + 52] = 0;
            HEAP8[$info_addr + 53] = 0;
            var $24 = HEAP32[$this1 + 8 >> 2];
            var $26 = HEAP32[HEAP32[$24 >> 2] + 12 >> 2];
            FUNCTION_TABLE[$26]($24, $info_addr, $current_ptr_addr, $current_ptr_addr, 1);
            if (HEAP8[$info_addr + 53] & 1) {
              $is_dst_type_derived_from_static_type13 = 1;
              if (HEAP8[$info_addr + 52] & 1) {
                $does_dst_type_point_to_our_static_type = 1;
              } else {
                __label__ = 14;
              }
            }
            if (!($does_dst_type_point_to_our_static_type & 1)) {
              HEAP32[$info_addr$s2 + 5] = $current_ptr_addr;
              var $number_to_dst_ptr = $info_addr + 40;
              var $add = HEAP32[$number_to_dst_ptr >> 2] + 1;
              HEAP32[$number_to_dst_ptr >> 2] = $add;
              var $cmp24 = HEAP32[$info_addr$s2 + 9] == 1;
              do {
                if ($cmp24) {
                  if (HEAP32[$info_addr$s2 + 6] != 2) {
                    break;
                  }
                  HEAP8[$info_addr + 54] = 1;
                } else {
                  __label__ = 19;
                }
              } while (0);
            }
            if ($is_dst_type_derived_from_static_type13 & 1) {
              HEAP32[$info_addr$s2 + 11] = 3;
            } else {
              HEAP32[$info_addr$s2 + 11] = 4;
            }
          }
          __label__ = 25;
          break;
        }
        __label__ = 7;
      } while (0);
      if (__label__ == 7) {
        if ($path_below_addr == 1) {
          HEAP32[$info_addr$s2 + 8] = 1;
        } else {
          __label__ = 9;
        }
      }
    } else {
      var $47 = HEAP32[$this1 + 8 >> 2];
      var $49 = HEAP32[HEAP32[$47 >> 2] + 16 >> 2];
      FUNCTION_TABLE[$49]($47, $info_addr, $current_ptr_addr, $path_below_addr);
    }
  }
  return;
  return;
}

__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvi["X"] = 1;

function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvi($this, $info, $current_ptr, $path_below) {
  var $info_addr$s2;
  var __label__;
  var $this_addr;
  var $info_addr;
  var $current_ptr_addr;
  var $path_below_addr;
  $this_addr = $this;
  $info_addr = $info;
  $info_addr$s2 = $info_addr >> 2;
  $current_ptr_addr = $current_ptr;
  $path_below_addr = $path_below;
  var $this1 = $this_addr;
  if ($this1 == HEAP32[$info_addr$s2 + 2]) {
    __ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi($this1, $info_addr, $current_ptr_addr, $path_below_addr);
  } else {
    if ($this1 == HEAP32[$info_addr$s2]) {
      var $cmp4 = $current_ptr_addr == HEAP32[$info_addr$s2 + 4];
      do {
        if (!$cmp4) {
          if ($current_ptr_addr == HEAP32[$info_addr$s2 + 5]) {
            __label__ = 7;
            break;
          }
          HEAP32[$info_addr$s2 + 8] = $path_below_addr;
          HEAP32[$info_addr$s2 + 5] = $current_ptr_addr;
          var $number_to_dst_ptr = $info_addr + 40;
          var $add = HEAP32[$number_to_dst_ptr >> 2] + 1;
          HEAP32[$number_to_dst_ptr >> 2] = $add;
          var $cmp12 = HEAP32[$info_addr$s2 + 9] == 1;
          do {
            if ($cmp12) {
              if (HEAP32[$info_addr$s2 + 6] != 2) {
                break;
              }
              HEAP8[$info_addr + 54] = 1;
            }
          } while (0);
          HEAP32[$info_addr$s2 + 11] = 4;
          __label__ = 14;
          break;
        }
        __label__ = 7;
      } while (0);
      if (__label__ == 7) {
        if ($path_below_addr == 1) {
          HEAP32[$info_addr$s2 + 8] = 1;
        } else {
          __label__ = 9;
        }
      }
    } else {
      __label__ = 15;
    }
  }
  return;
  return;
}

__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvi["X"] = 1;

function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i($this, $info, $dst_ptr, $current_ptr, $path_below) {
  var $this_addr;
  var $info_addr;
  var $dst_ptr_addr;
  var $current_ptr_addr;
  var $path_below_addr;
  $this_addr = $this;
  $info_addr = $info;
  $dst_ptr_addr = $dst_ptr;
  $current_ptr_addr = $current_ptr;
  $path_below_addr = $path_below;
  var $this1 = $this_addr;
  if ($this1 == HEAP32[$info_addr + 8 >> 2]) {
    __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i($this1, $info_addr, $dst_ptr_addr, $current_ptr_addr, $path_below_addr);
  } else {
    var $8 = HEAP32[$this1 + 8 >> 2];
    var $10 = HEAP32[HEAP32[$8 >> 2] + 12 >> 2];
    FUNCTION_TABLE[$10]($8, $info_addr, $dst_ptr_addr, $current_ptr_addr, $path_below_addr);
  }
  return;
  return;
}

function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i($this, $info, $dst_ptr, $current_ptr, $path_below) {
  var $this_addr;
  var $info_addr;
  var $dst_ptr_addr;
  var $current_ptr_addr;
  var $path_below_addr;
  $this_addr = $this;
  $info_addr = $info;
  $dst_ptr_addr = $dst_ptr;
  $current_ptr_addr = $current_ptr;
  $path_below_addr = $path_below;
  var $this1 = $this_addr;
  if ($this1 == HEAP32[$info_addr + 8 >> 2]) {
    __ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i($this1, $info_addr, $dst_ptr_addr, $current_ptr_addr, $path_below_addr);
  }
  return;
  return;
}

function _malloc($bytes) {
  var $B$s2;
  var __label__;
  var $bytes_addr;
  var $mem;
  var $nb;
  var $idx;
  var $smallbits;
  var $b;
  var $p;
  var $F;
  var $b33;
  var $p34;
  var $r;
  var $rsize;
  var $i;
  var $leftbits;
  var $leastbit;
  var $Y;
  var $K;
  var $N;
  var $F68;
  var $DVS;
  var $DV;
  var $I;
  var $B;
  var $F102;
  var $rsize157;
  var $p159;
  var $r163;
  var $dvs;
  var $rsize185;
  var $p187;
  var $r188;
  $bytes_addr = $bytes;
  var $cmp = $bytes_addr <= 244;
  $_$2 : do {
    if (!$cmp) {
      if ($bytes_addr >= 4294967232) {
        $nb = -1;
      } else {
        $nb = $bytes_addr + 11 & -8;
        var $cmp144 = HEAP32[__gm_ + 4 >> 2] != 0;
        do {
          if ($cmp144) {
            var $call147 = _tmalloc_large(__gm_, $nb);
            $mem = $call147;
            if ($call147 == 0) {
              break;
            }
            __label__ = 54;
            break $_$2;
          }
          __label__ = 43;
        } while (0);
      }
      __label__ = 45;
      break;
    }
    if ($bytes_addr < 11) {
      var $cond = 16;
    } else {
      var $cond = $bytes_addr + 11 & -8;
    }
    var $cond;
    $nb = $cond;
    $idx = $nb >>> 3;
    $smallbits = HEAPU32[__gm_ >> 2] >>> $idx;
    if (($smallbits & 3) != 0) {
      var $add8 = $idx + (($smallbits ^ -1) & 1);
      $idx = $add8;
      $b = ($idx << 3) + __gm_ + 40;
      $p = HEAP32[$b + 8 >> 2];
      $F = HEAP32[$p + 8 >> 2];
      if ($b == $F) {
        var $and14 = HEAP32[__gm_ >> 2] & (1 << $idx ^ -1);
        HEAP32[__gm_ >> 2] = $and14;
      } else {
        if ($F >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
          HEAP32[$b + 8 >> 2] = $F;
          HEAP32[$F + 12 >> 2] = $b;
        } else {
          _abort();
          throw "Reached an unreachable!";
        }
      }
      HEAP32[$p + 4 >> 2] = $idx << 3 | 1 | 2;
      var $head23 = ($idx << 3) + $p + 4;
      var $or24 = HEAP32[$head23 >> 2] | 1;
      HEAP32[$head23 >> 2] = $or24;
      $mem = $p + 8;
      __label__ = 54;
      break;
    }
    if ($nb > HEAPU32[__gm_ + 8 >> 2]) {
      if ($smallbits != 0) {
        $leftbits = $smallbits << $idx & (1 << $idx << 1 | -(1 << $idx << 1));
        $leastbit = $leftbits & -$leftbits;
        $Y = $leastbit - 1;
        $K = $Y >>> 12 & 16;
        $N = $K;
        var $shr47 = $Y >>> $K;
        $Y = $shr47;
        var $and49 = $Y >>> 5 & 8;
        $K = $and49;
        var $add50 = $N + $and49;
        $N = $add50;
        var $shr51 = $Y >>> $K;
        $Y = $shr51;
        var $and53 = $Y >>> 2 & 4;
        $K = $and53;
        var $add54 = $N + $and53;
        $N = $add54;
        var $shr55 = $Y >>> $K;
        $Y = $shr55;
        var $and57 = $Y >>> 1 & 2;
        $K = $and57;
        var $add58 = $N + $and57;
        $N = $add58;
        var $shr59 = $Y >>> $K;
        $Y = $shr59;
        var $and61 = $Y >>> 1 & 1;
        $K = $and61;
        var $add62 = $N + $and61;
        $N = $add62;
        var $shr63 = $Y >>> $K;
        $Y = $shr63;
        $i = $N + $Y;
        $b33 = ($i << 3) + __gm_ + 40;
        $p34 = HEAP32[$b33 + 8 >> 2];
        $F68 = HEAP32[$p34 + 8 >> 2];
        if ($b33 == $F68) {
          var $and75 = HEAP32[__gm_ >> 2] & (1 << $i ^ -1);
          HEAP32[__gm_ >> 2] = $and75;
        } else {
          if ($F68 >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
            HEAP32[$b33 + 8 >> 2] = $F68;
            HEAP32[$F68 + 12 >> 2] = $b33;
          } else {
            _abort();
            throw "Reached an unreachable!";
          }
        }
        $rsize = ($i << 3) - $nb;
        HEAP32[$p34 + 4 >> 2] = $nb | 1 | 2;
        $r = $p34 + $nb;
        HEAP32[$r + 4 >> 2] = $rsize | 1;
        HEAP32[$r + $rsize >> 2] = $rsize;
        $DVS = HEAP32[__gm_ + 8 >> 2];
        if ($DVS != 0) {
          $DV = HEAP32[__gm_ + 20 >> 2];
          $I = $DVS >>> 3;
          $B = ($I << 3) + __gm_ + 40;
          $B$s2 = $B >> 2;
          $F102 = $B;
          if ((HEAP32[__gm_ >> 2] & 1 << $I) != 0) {
            if (HEAP32[$B$s2 + 2] >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
              $F102 = HEAP32[$B$s2 + 2];
            } else {
              _abort();
              throw "Reached an unreachable!";
            }
          } else {
            var $or108 = HEAP32[__gm_ >> 2] | 1 << $I;
            HEAP32[__gm_ >> 2] = $or108;
          }
          HEAP32[$B$s2 + 2] = $DV;
          HEAP32[$F102 + 12 >> 2] = $DV;
          HEAP32[$DV + 8 >> 2] = $F102;
          HEAP32[$DV + 12 >> 2] = $B;
        }
        HEAP32[__gm_ + 8 >> 2] = $rsize;
        HEAP32[__gm_ + 20 >> 2] = $r;
        $mem = $p34 + 8;
        __label__ = 54;
        break;
      }
      var $cmp127 = HEAP32[__gm_ + 4 >> 2] != 0;
      do {
        if ($cmp127) {
          var $call = _tmalloc_small(__gm_, $nb);
          $mem = $call;
          if ($call == 0) {
            break;
          }
          __label__ = 54;
          break $_$2;
        }
        __label__ = 34;
      } while (0);
    }
    __label__ = 45;
    break;
  } while (0);
  if (__label__ == 45) {
    if ($nb <= HEAPU32[__gm_ + 8 >> 2]) {
      $rsize157 = HEAP32[__gm_ + 8 >> 2] - $nb;
      $p159 = HEAP32[__gm_ + 20 >> 2];
      if ($rsize157 >= 16) {
        var $146 = $p159 + $nb;
        HEAP32[__gm_ + 20 >> 2] = $146;
        $r163 = $146;
        HEAP32[__gm_ + 8 >> 2] = $rsize157;
        HEAP32[$r163 + 4 >> 2] = $rsize157 | 1;
        HEAP32[$r163 + $rsize157 >> 2] = $rsize157;
        HEAP32[$p159 + 4 >> 2] = $nb | 1 | 2;
      } else {
        $dvs = HEAP32[__gm_ + 8 >> 2];
        HEAP32[__gm_ + 8 >> 2] = 0;
        HEAP32[__gm_ + 20 >> 2] = 0;
        HEAP32[$p159 + 4 >> 2] = $dvs | 1 | 2;
        var $head177 = $p159 + ($dvs + 4);
        var $or178 = HEAP32[$head177 >> 2] | 1;
        HEAP32[$head177 >> 2] = $or178;
      }
      $mem = $p159 + 8;
    } else {
      if ($nb < HEAPU32[__gm_ + 12 >> 2]) {
        var $sub186 = HEAP32[__gm_ + 12 >> 2] - $nb;
        HEAP32[__gm_ + 12 >> 2] = $sub186;
        $rsize185 = $sub186;
        $p187 = HEAP32[__gm_ + 24 >> 2];
        var $175 = $p187 + $nb;
        HEAP32[__gm_ + 24 >> 2] = $175;
        $r188 = $175;
        HEAP32[$r188 + 4 >> 2] = $rsize185 | 1;
        HEAP32[$p187 + 4 >> 2] = $nb | 1 | 2;
        $mem = $p187 + 8;
      } else {
        var $call198 = _sys_alloc(__gm_, $nb);
        $mem = $call198;
      }
    }
  }
  return $mem;
  return null;
}

_malloc["X"] = 1;

function _tmalloc_small($m, $nb) {
  var $B$s2;
  var $XP$s2;
  var $m_addr$s2;
  var __label__;
  var $m_addr;
  var $nb_addr;
  var $t;
  var $v;
  var $rsize;
  var $i;
  var $leastbit;
  var $Y;
  var $K;
  var $N;
  var $trem;
  var $r;
  var $XP;
  var $R;
  var $F;
  var $RP;
  var $CP;
  var $H;
  var $C0;
  var $C1;
  var $DVS;
  var $DV;
  var $I;
  var $B;
  var $F191;
  $m_addr = $m;
  $m_addr$s2 = $m_addr >> 2;
  $nb_addr = $nb;
  $leastbit = HEAP32[$m_addr$s2 + 1] & -HEAP32[$m_addr$s2 + 1];
  $Y = $leastbit - 1;
  $K = $Y >>> 12 & 16;
  $N = $K;
  var $shr4 = $Y >>> $K;
  $Y = $shr4;
  var $and6 = $Y >>> 5 & 8;
  $K = $and6;
  var $add = $N + $and6;
  $N = $add;
  var $shr7 = $Y >>> $K;
  $Y = $shr7;
  var $and9 = $Y >>> 2 & 4;
  $K = $and9;
  var $add10 = $N + $and9;
  $N = $add10;
  var $shr11 = $Y >>> $K;
  $Y = $shr11;
  var $and13 = $Y >>> 1 & 2;
  $K = $and13;
  var $add14 = $N + $and13;
  $N = $add14;
  var $shr15 = $Y >>> $K;
  $Y = $shr15;
  var $and17 = $Y >>> 1 & 1;
  $K = $and17;
  var $add18 = $N + $and17;
  $N = $add18;
  var $shr19 = $Y >>> $K;
  $Y = $shr19;
  $i = $N + $Y;
  var $29 = HEAP32[(($i << 2) + 304 >> 2) + $m_addr$s2];
  $t = $29;
  $v = $29;
  $rsize = (HEAP32[$t + 4 >> 2] & -8) - $nb_addr;
  while (1) {
    if (HEAP32[$t + 16 >> 2] != 0) {
      var $cond = HEAP32[$t + 16 >> 2];
    } else {
      var $cond = HEAP32[$t + 20 >> 2];
    }
    var $cond;
    $t = $cond;
    if ($cond == 0) {
      break;
    }
    $trem = (HEAP32[$t + 4 >> 2] & -8) - $nb_addr;
    if ($trem < $rsize) {
      $rsize = $trem;
      $v = $t;
    } else {
      __label__ = 9;
    }
  }
  if ($v >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
    $r = $v + $nb_addr;
    if ($v < $r == 1 != 0) {
      $XP = HEAP32[$v + 24 >> 2];
      $XP$s2 = $XP >> 2;
      if (HEAP32[$v + 12 >> 2] != $v) {
        $F = HEAP32[$v + 8 >> 2];
        $R = HEAP32[$v + 12 >> 2];
        if ($F >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
          HEAP32[$F + 12 >> 2] = $R;
          HEAP32[$R + 8 >> 2] = $F;
        } else {
          _abort();
          throw "Reached an unreachable!";
        }
      } else {
        var $arrayidx55 = $v + 20;
        $RP = $arrayidx55;
        var $76 = HEAP32[$arrayidx55 >> 2];
        $R = $76;
        var $cmp56 = $76 != 0;
        do {
          if ($cmp56) {
            __label__ = 19;
          } else {
            var $arrayidx59 = $v + 16;
            $RP = $arrayidx59;
            var $78 = HEAP32[$arrayidx59 >> 2];
            $R = $78;
            if ($78 != 0) {
              __label__ = 19;
              break;
            }
            __label__ = 28;
            break;
          }
        } while (0);
        if (__label__ == 19) {
          while (1) {
            var $arrayidx65 = $R + 20;
            $CP = $arrayidx65;
            if (HEAP32[$arrayidx65 >> 2] != 0) {
              var $83 = 1;
            } else {
              var $arrayidx69 = $R + 16;
              $CP = $arrayidx69;
              var $83 = HEAP32[$arrayidx69 >> 2] != 0;
            }
            var $83;
            if (!$83) {
              break;
            }
            var $84 = $CP;
            $RP = $84;
            $R = HEAP32[$84 >> 2];
          }
          if ($RP >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
            HEAP32[$RP >> 2] = 0;
          } else {
            _abort();
            throw "Reached an unreachable!";
          }
        }
      }
      if ($XP != 0) {
        $H = (HEAP32[$v + 28 >> 2] << 2) + $m_addr + 304;
        if ($v == HEAP32[$H >> 2]) {
          var $98 = $R;
          HEAP32[$H >> 2] = $98;
          if ($98 == 0) {
            var $treemap96 = $m_addr + 4;
            var $and97 = HEAP32[$treemap96 >> 2] & (1 << HEAP32[$v + 28 >> 2] ^ -1);
            HEAP32[$treemap96 >> 2] = $and97;
          } else {
            __label__ = 33;
          }
        } else {
          if ($XP >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
            if (HEAP32[$XP$s2 + 4] == $v) {
              HEAP32[$XP$s2 + 4] = $R;
            } else {
              HEAP32[$XP$s2 + 5] = $R;
            }
          } else {
            _abort();
            throw "Reached an unreachable!";
          }
        }
        if ($R != 0) {
          if ($R >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
            HEAP32[$R + 24 >> 2] = $XP;
            var $123 = HEAP32[$v + 16 >> 2];
            $C0 = $123;
            if ($123 != 0) {
              if ($C0 >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                HEAP32[$R + 16 >> 2] = $C0;
                HEAP32[$C0 + 24 >> 2] = $R;
              } else {
                _abort();
                throw "Reached an unreachable!";
              }
            }
            var $133 = HEAP32[$v + 20 >> 2];
            $C1 = $133;
            if ($133 != 0) {
              if ($C1 >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                HEAP32[$R + 20 >> 2] = $C1;
                HEAP32[$C1 + 24 >> 2] = $R;
              } else {
                _abort();
                throw "Reached an unreachable!";
              }
            } else {
              __label__ = 53;
            }
          } else {
            _abort();
            throw "Reached an unreachable!";
          }
        } else {
          __label__ = 56;
        }
      }
      if ($rsize < 16) {
        HEAP32[$v + 4 >> 2] = $rsize + $nb_addr | 1 | 2;
        var $head176 = $v + ($rsize + ($nb_addr + 4));
        var $or177 = HEAP32[$head176 >> 2] | 1;
        HEAP32[$head176 >> 2] = $or177;
      } else {
        HEAP32[$v + 4 >> 2] = $nb_addr | 1 | 2;
        HEAP32[$r + 4 >> 2] = $rsize | 1;
        HEAP32[$r + $rsize >> 2] = $rsize;
        $DVS = HEAP32[$m_addr$s2 + 2];
        if ($DVS != 0) {
          $DV = HEAP32[$m_addr$s2 + 5];
          $I = $DVS >>> 3;
          $B = ($I << 3) + $m_addr + 40;
          $B$s2 = $B >> 2;
          $F191 = $B;
          if ((HEAP32[$m_addr$s2] & 1 << $I) != 0) {
            if (HEAP32[$B$s2 + 2] >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
              $F191 = HEAP32[$B$s2 + 2];
            } else {
              _abort();
              throw "Reached an unreachable!";
            }
          } else {
            var $smallmap197 = $m_addr;
            var $or198 = HEAP32[$smallmap197 >> 2] | 1 << $I;
            HEAP32[$smallmap197 >> 2] = $or198;
          }
          HEAP32[$B$s2 + 2] = $DV;
          HEAP32[$F191 + 12 >> 2] = $DV;
          HEAP32[$DV + 8 >> 2] = $F191;
          HEAP32[$DV + 12 >> 2] = $B;
        }
        HEAP32[$m_addr$s2 + 2] = $rsize;
        HEAP32[$m_addr$s2 + 5] = $r;
      }
      return $v + 8;
    }
  }
  _abort();
  throw "Reached an unreachable!";
  return null;
}

_tmalloc_small["X"] = 1;

function _tmalloc_large($m, $nb) {
  var $C$s2;
  var $TP$s2;
  var $B$s2;
  var $XP$s2;
  var $r$s2;
  var $m_addr$s2;
  var __label__;
  var $retval;
  var $m_addr;
  var $nb_addr;
  var $v;
  var $rsize;
  var $t;
  var $idx;
  var $X;
  var $Y;
  var $N;
  var $K;
  var $sizebits;
  var $rst;
  var $rt;
  var $trem;
  var $leftbits;
  var $i;
  var $leastbit;
  var $Y68;
  var $K70;
  var $N73;
  var $trem97;
  var $r;
  var $XP;
  var $R;
  var $F;
  var $RP;
  var $CP;
  var $H;
  var $C0;
  var $C1;
  var $I;
  var $B;
  var $F282;
  var $TP;
  var $H307;
  var $I308;
  var $X309;
  var $Y319;
  var $N320;
  var $K324;
  var $T;
  var $K365;
  var $C;
  var $F404;
  $m_addr = $m;
  $m_addr$s2 = $m_addr >> 2;
  $nb_addr = $nb;
  $v = 0;
  $rsize = -$nb_addr;
  $X = $nb_addr >>> 8;
  if ($X == 0) {
    $idx = 0;
  } else {
    if ($X > 65535) {
      $idx = 31;
    } else {
      $Y = $X;
      $N = $Y - 256 >>> 16 & 8;
      var $shl = $Y << $N;
      $Y = $shl;
      $K = $shl - 4096 >>> 16 & 4;
      var $add = $N + $K;
      $N = $add;
      var $shl9 = $Y << $K;
      $Y = $shl9;
      var $and12 = $shl9 - 16384 >>> 16 & 2;
      $K = $and12;
      var $add13 = $N + $and12;
      $N = $add13;
      var $shl15 = $Y << $K;
      $Y = $shl15;
      var $add17 = 14 - $N + ($shl15 >>> 15);
      $K = $add17;
      $idx = ($K << 1) + ($nb_addr >>> $K + 7 & 1);
    }
  }
  var $21 = HEAP32[(($idx << 2) + 304 >> 2) + $m_addr$s2];
  $t = $21;
  if ($21 != 0) {
    if ($idx == 31) {
      var $cond = 0;
    } else {
      var $cond = 31 - (($idx >>> 1) + 8 - 2);
    }
    var $cond;
    $sizebits = $nb_addr << $cond;
    $rst = 0;
    while (1) {
      $trem = (HEAP32[$t + 4 >> 2] & -8) - $nb_addr;
      if ($trem < $rsize) {
        $v = $t;
        var $31 = $trem;
        $rsize = $31;
        if ($31 == 0) {
          break;
        }
      }
      $rt = HEAP32[$t + 20 >> 2];
      var $36 = HEAP32[$t + (($sizebits >>> 31 & 1) << 2) + 16 >> 2];
      $t = $36;
      var $cmp45 = $rt != 0;
      do {
        if ($cmp45) {
          if ($rt == $t) {
            break;
          }
          $rst = $rt;
        }
      } while (0);
      if ($t == 0) {
        $t = $rst;
        break;
      }
      var $shl52 = $sizebits << 1;
      $sizebits = $shl52;
    }
  }
  var $cmp54 = $t == 0;
  do {
    if ($cmp54) {
      if ($v != 0) {
        break;
      }
      $leftbits = (1 << $idx << 1 | -(1 << $idx << 1)) & HEAP32[$m_addr$s2 + 1];
      if ($leftbits != 0) {
        $leastbit = $leftbits & -$leftbits;
        $Y68 = $leastbit - 1;
        $K70 = $Y68 >>> 12 & 16;
        $N73 = $K70;
        var $shr74 = $Y68 >>> $K70;
        $Y68 = $shr74;
        var $and76 = $Y68 >>> 5 & 8;
        $K70 = $and76;
        var $add77 = $N73 + $and76;
        $N73 = $add77;
        var $shr78 = $Y68 >>> $K70;
        $Y68 = $shr78;
        var $and80 = $Y68 >>> 2 & 4;
        $K70 = $and80;
        var $add81 = $N73 + $and80;
        $N73 = $add81;
        var $shr82 = $Y68 >>> $K70;
        $Y68 = $shr82;
        var $and84 = $Y68 >>> 1 & 2;
        $K70 = $and84;
        var $add85 = $N73 + $and84;
        $N73 = $add85;
        var $shr86 = $Y68 >>> $K70;
        $Y68 = $shr86;
        var $and88 = $Y68 >>> 1 & 1;
        $K70 = $and88;
        var $add89 = $N73 + $and88;
        $N73 = $add89;
        var $shr90 = $Y68 >>> $K70;
        $Y68 = $shr90;
        $i = $N73 + $Y68;
        $t = HEAP32[(($i << 2) + 304 >> 2) + $m_addr$s2];
      } else {
        __label__ = 28;
      }
    } else {
      __label__ = 29;
    }
  } while (0);
  while (1) {
    if ($t == 0) {
      break;
    }
    $trem97 = (HEAP32[$t + 4 >> 2] & -8) - $nb_addr;
    if ($trem97 < $rsize) {
      $rsize = $trem97;
      $v = $t;
    }
    if (HEAP32[$t + 16 >> 2] != 0) {
      var $cond114 = HEAP32[$t + 16 >> 2];
    } else {
      var $cond114 = HEAP32[$t + 20 >> 2];
    }
    var $cond114;
    $t = $cond114;
  }
  var $cmp115 = $v != 0;
  do {
    if ($cmp115) {
      if ($rsize >= HEAP32[$m_addr$s2 + 2] - $nb_addr) {
        __label__ = 127;
        break;
      }
      if ($v >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
        $r = $v + $nb_addr;
        $r$s2 = $r >> 2;
        if ($v < $r == 1 != 0) {
          $XP = HEAP32[$v + 24 >> 2];
          $XP$s2 = $XP >> 2;
          if (HEAP32[$v + 12 >> 2] != $v) {
            $F = HEAP32[$v + 8 >> 2];
            $R = HEAP32[$v + 12 >> 2];
            if ($F >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
              HEAP32[$F + 12 >> 2] = $R;
              HEAP32[$R + 8 >> 2] = $F;
            } else {
              _abort();
              throw "Reached an unreachable!";
            }
          } else {
            var $arrayidx143 = $v + 20;
            $RP = $arrayidx143;
            var $128 = HEAP32[$arrayidx143 >> 2];
            $R = $128;
            var $cmp144 = $128 != 0;
            do {
              if ($cmp144) {
                __label__ = 48;
              } else {
                var $arrayidx147 = $v + 16;
                $RP = $arrayidx147;
                var $130 = HEAP32[$arrayidx147 >> 2];
                $R = $130;
                if ($130 != 0) {
                  __label__ = 48;
                  break;
                }
                __label__ = 57;
                break;
              }
            } while (0);
            if (__label__ == 48) {
              while (1) {
                var $arrayidx153 = $R + 20;
                $CP = $arrayidx153;
                if (HEAP32[$arrayidx153 >> 2] != 0) {
                  var $135 = 1;
                } else {
                  var $arrayidx157 = $R + 16;
                  $CP = $arrayidx157;
                  var $135 = HEAP32[$arrayidx157 >> 2] != 0;
                }
                var $135;
                if (!$135) {
                  break;
                }
                var $136 = $CP;
                $RP = $136;
                $R = HEAP32[$136 >> 2];
              }
              if ($RP >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                HEAP32[$RP >> 2] = 0;
              } else {
                _abort();
                throw "Reached an unreachable!";
              }
            }
          }
          if ($XP != 0) {
            $H = (HEAP32[$v + 28 >> 2] << 2) + $m_addr + 304;
            if ($v == HEAP32[$H >> 2]) {
              var $150 = $R;
              HEAP32[$H >> 2] = $150;
              if ($150 == 0) {
                var $treemap185 = $m_addr + 4;
                var $and186 = HEAP32[$treemap185 >> 2] & (1 << HEAP32[$v + 28 >> 2] ^ -1);
                HEAP32[$treemap185 >> 2] = $and186;
              } else {
                __label__ = 62;
              }
            } else {
              if ($XP >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                if (HEAP32[$XP$s2 + 4] == $v) {
                  HEAP32[$XP$s2 + 4] = $R;
                } else {
                  HEAP32[$XP$s2 + 5] = $R;
                }
              } else {
                _abort();
                throw "Reached an unreachable!";
              }
            }
            if ($R != 0) {
              if ($R >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                HEAP32[$R + 24 >> 2] = $XP;
                var $175 = HEAP32[$v + 16 >> 2];
                $C0 = $175;
                if ($175 != 0) {
                  if ($C0 >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                    HEAP32[$R + 16 >> 2] = $C0;
                    HEAP32[$C0 + 24 >> 2] = $R;
                  } else {
                    _abort();
                    throw "Reached an unreachable!";
                  }
                }
                var $185 = HEAP32[$v + 20 >> 2];
                $C1 = $185;
                if ($185 != 0) {
                  if ($C1 >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                    HEAP32[$R + 20 >> 2] = $C1;
                    HEAP32[$C1 + 24 >> 2] = $R;
                  } else {
                    _abort();
                    throw "Reached an unreachable!";
                  }
                } else {
                  __label__ = 82;
                }
              } else {
                _abort();
                throw "Reached an unreachable!";
              }
            } else {
              __label__ = 85;
            }
          }
          if ($rsize < 16) {
            HEAP32[$v + 4 >> 2] = $rsize + $nb_addr | 1 | 2;
            var $head266 = $v + ($rsize + ($nb_addr + 4));
            var $or267 = HEAP32[$head266 >> 2] | 1;
            HEAP32[$head266 >> 2] = $or267;
          } else {
            HEAP32[$v + 4 >> 2] = $nb_addr | 1 | 2;
            HEAP32[$r$s2 + 1] = $rsize | 1;
            HEAP32[($rsize >> 2) + $r$s2] = $rsize;
            if ($rsize >>> 3 < 32) {
              $I = $rsize >>> 3;
              $B = ($I << 3) + $m_addr + 40;
              $B$s2 = $B >> 2;
              $F282 = $B;
              if ((HEAP32[$m_addr$s2] & 1 << $I) != 0) {
                if (HEAP32[$B$s2 + 2] >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                  $F282 = HEAP32[$B$s2 + 2];
                } else {
                  _abort();
                  throw "Reached an unreachable!";
                }
              } else {
                var $smallmap288 = $m_addr;
                var $or289 = HEAP32[$smallmap288 >> 2] | 1 << $I;
                HEAP32[$smallmap288 >> 2] = $or289;
              }
              HEAP32[$B$s2 + 2] = $r;
              HEAP32[$F282 + 12 >> 2] = $r;
              HEAP32[$r$s2 + 2] = $F282;
              HEAP32[$r$s2 + 3] = $B;
            } else {
              $TP = $r;
              $TP$s2 = $TP >> 2;
              $X309 = $rsize >>> 8;
              if ($X309 == 0) {
                $I308 = 0;
              } else {
                if ($X309 > 65535) {
                  $I308 = 31;
                } else {
                  $Y319 = $X309;
                  $N320 = $Y319 - 256 >>> 16 & 8;
                  var $shl325 = $Y319 << $N320;
                  $Y319 = $shl325;
                  $K324 = $shl325 - 4096 >>> 16 & 4;
                  var $add329 = $N320 + $K324;
                  $N320 = $add329;
                  var $shl330 = $Y319 << $K324;
                  $Y319 = $shl330;
                  var $and333 = $shl330 - 16384 >>> 16 & 2;
                  $K324 = $and333;
                  var $add334 = $N320 + $and333;
                  $N320 = $add334;
                  var $shl336 = $Y319 << $K324;
                  $Y319 = $shl336;
                  var $add338 = 14 - $N320 + ($shl336 >>> 15);
                  $K324 = $add338;
                  $I308 = ($K324 << 1) + ($rsize >>> $K324 + 7 & 1);
                }
              }
              $H307 = ($I308 << 2) + $m_addr + 304;
              HEAP32[$TP$s2 + 7] = $I308;
              HEAP32[$TP$s2 + 5] = 0;
              HEAP32[$TP$s2 + 4] = 0;
              if ((HEAP32[$m_addr$s2 + 1] & 1 << $I308) != 0) {
                $T = HEAP32[$H307 >> 2];
                if ($I308 == 31) {
                  var $cond375 = 0;
                } else {
                  var $cond375 = 31 - (($I308 >>> 1) + 8 - 2);
                }
                var $cond375;
                $K365 = $rsize << $cond375;
                while (1) {
                  if ((HEAP32[$T + 4 >> 2] & -8) != $rsize) {
                    $C = (($K365 >>> 31 & 1) << 2) + $T + 16;
                    $C$s2 = $C >> 2;
                    var $shl387 = $K365 << 1;
                    $K365 = $shl387;
                    if (HEAP32[$C$s2] != 0) {
                      $T = HEAP32[$C$s2];
                    } else {
                      if ($C >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                        HEAP32[$C$s2] = $TP;
                        HEAP32[$TP$s2 + 6] = $T;
                        var $304 = $TP;
                        HEAP32[$TP$s2 + 3] = $304;
                        HEAP32[$TP$s2 + 2] = $304;
                        break;
                      }
                      _abort();
                      throw "Reached an unreachable!";
                    }
                  } else {
                    $F404 = HEAP32[$T + 8 >> 2];
                    if ($T >= HEAPU32[$m_addr$s2 + 4]) {
                      var $317 = $F404 >= HEAPU32[$m_addr$s2 + 4];
                    } else {
                      var $317 = 0;
                    }
                    var $317;
                    if ($317 == 1 != 0) {
                      var $318 = $TP;
                      HEAP32[$F404 + 12 >> 2] = $318;
                      HEAP32[$T + 8 >> 2] = $318;
                      HEAP32[$TP$s2 + 2] = $F404;
                      HEAP32[$TP$s2 + 3] = $T;
                      HEAP32[$TP$s2 + 6] = 0;
                      break;
                    }
                    _abort();
                    throw "Reached an unreachable!";
                  }
                }
              } else {
                var $treemap359 = $m_addr + 4;
                var $or360 = HEAP32[$treemap359 >> 2] | 1 << $I308;
                HEAP32[$treemap359 >> 2] = $or360;
                HEAP32[$H307 >> 2] = $TP;
                HEAP32[$TP$s2 + 6] = $H307;
                var $278 = $TP;
                HEAP32[$TP$s2 + 3] = $278;
                HEAP32[$TP$s2 + 2] = $278;
              }
            }
          }
          $retval = $v + 8;
          __label__ = 128;
          break;
        }
      }
      _abort();
      throw "Reached an unreachable!";
    } else {
      __label__ = 127;
    }
  } while (0);
  if (__label__ == 127) {
    $retval = 0;
  }
  return $retval;
  return null;
}

_tmalloc_large["X"] = 1;

function _sys_alloc($m, $nb) {
  var $m_addr$s2;
  var __label__;
  var $retval;
  var $m_addr;
  var $nb_addr;
  var $tbase;
  var $tsize;
  var $mmap_flag;
  var $mem;
  var $br;
  var $ss;
  var $asize;
  var $base;
  var $esize;
  var $end;
  var $asize97;
  var $br106;
  var $end107;
  var $ssize;
  var $mn;
  var $sp;
  var $oldbase;
  var $rsize;
  var $p;
  var $r;
  $m_addr = $m;
  $m_addr$s2 = $m_addr >> 2;
  $nb_addr = $nb;
  $tbase = -1;
  $tsize = 0;
  $mmap_flag = 0;
  if (HEAP32[_mparams >> 2] != 0) {
    var $1 = 1;
  } else {
    var $call = _init_mparams();
    var $1 = $call != 0;
  }
  var $1;
  var $tobool1 = (HEAP32[$m_addr$s2 + 110] & 0) != 0;
  do {
    if ($tobool1) {
      if (!($nb_addr >= HEAPU32[_mparams + 12 >> 2])) {
        __label__ = 10;
        break;
      }
      if (HEAP32[$m_addr$s2 + 3] == 0) {
        __label__ = 10;
        break;
      }
      var $call5 = _mmap_alloc($m_addr, $nb_addr);
      $mem = $call5;
      if ($mem != 0) {
        $retval = $mem;
        __label__ = 93;
        break;
      }
      __label__ = 10;
      break;
    } else {
      __label__ = 10;
    }
  } while (0);
  $_$12 : do {
    if (__label__ == 10) {
      if ((HEAP32[$m_addr$s2 + 110] & 4) == 0) {
        $br = -1;
        if (HEAP32[$m_addr$s2 + 6] == 0) {
          var $cond = 0;
        } else {
          var $19 = HEAP32[$m_addr$s2 + 6];
          var $call15 = _segment_holding($m_addr, $19);
          var $cond = $call15;
        }
        var $cond;
        $ss = $cond;
        $asize = 0;
        if ($ss == 0) {
          var $call18 = _sbrk(0);
          $base = $call18;
          if ($base != -1) {
            $asize = $nb_addr + (HEAP32[_mparams + 8 >> 2] - 1) + 48 & (HEAP32[_mparams + 8 >> 2] - 1 ^ -1);
            if (($base & HEAP32[_mparams + 4 >> 2] - 1) != 0) {
              var $add34 = $asize + (($base + (HEAP32[_mparams + 4 >> 2] - 1) & (HEAP32[_mparams + 4 >> 2] - 1 ^ -1)) - $base);
              $asize = $add34;
            }
            var $cmp36 = $asize < 2147483647;
            do {
              if ($cmp36) {
                var $call38 = _sbrk($asize);
                $br = $call38;
                if ($call38 != $base) {
                  break;
                }
                $tbase = $base;
                $tsize = $asize;
              } else {
                __label__ = 21;
              }
            } while (0);
          } else {
            __label__ = 22;
          }
        } else {
          $asize = $nb_addr - HEAP32[$m_addr$s2 + 3] + (HEAP32[_mparams + 8 >> 2] - 1) + 48 & (HEAP32[_mparams + 8 >> 2] - 1 ^ -1);
          var $cmp51 = $asize < 2147483647;
          do {
            if ($cmp51) {
              var $call53 = _sbrk($asize);
              $br = $call53;
              if ($call53 != HEAP32[$ss >> 2] + HEAP32[$ss + 4 >> 2]) {
                break;
              }
              $tbase = $br;
              $tsize = $asize;
            } else {
              __label__ = 26;
            }
          } while (0);
        }
        if ($tbase == -1) {
          if ($br != -1) {
            var $cmp63 = $asize < 2147483647;
            do {
              if ($cmp63) {
                if ($asize >= $nb_addr + 48) {
                  break;
                }
                $esize = $nb_addr + 48 - $asize + (HEAP32[_mparams + 8 >> 2] - 1) & (HEAP32[_mparams + 8 >> 2] - 1 ^ -1);
                if ($esize < 2147483647) {
                  var $call77 = _sbrk($esize);
                  $end = $call77;
                  if ($end != -1) {
                    var $add80 = $asize + $esize;
                    $asize = $add80;
                  } else {
                    var $call83 = _sbrk(-$asize);
                    $br = -1;
                  }
                } else {
                  __label__ = 36;
                }
              } else {
                __label__ = 37;
              }
            } while (0);
          }
          if ($br != -1) {
            $tbase = $br;
            $tsize = $asize;
          } else {
            var $mflags91 = $m_addr + 440;
            var $or = HEAP32[$mflags91 >> 2] | 4;
            HEAP32[$mflags91 >> 2] = $or;
          }
        } else {
          __label__ = 42;
        }
      }
      if ($tbase == -1) {
        $asize97 = $nb_addr + (HEAP32[_mparams + 8 >> 2] - 1) + 48 & (HEAP32[_mparams + 8 >> 2] - 1 ^ -1);
        if ($asize97 < 2147483647) {
          $br106 = -1;
          $end107 = -1;
          var $call108 = _sbrk($asize97);
          $br106 = $call108;
          var $call109 = _sbrk(0);
          $end107 = $call109;
          var $cmp110 = $br106 != -1;
          do {
            if ($cmp110) {
              if ($end107 == -1) {
                break;
              }
              if ($br106 >= $end107) {
                break;
              }
              $ssize = $end107 - $br106;
              if ($ssize > $nb_addr + 40) {
                $tbase = $br106;
                $tsize = $ssize;
              } else {
                __label__ = 50;
              }
            } else {
              __label__ = 51;
            }
          } while (0);
        } else {
          __label__ = 52;
        }
      }
      if ($tbase != -1) {
        var $footprint = $m_addr + 432;
        var $add125 = HEAP32[$footprint >> 2] + $tsize;
        HEAP32[$footprint >> 2] = $add125;
        if ($add125 > HEAPU32[$m_addr$s2 + 109]) {
          var $96 = HEAP32[$m_addr$s2 + 108];
          HEAP32[$m_addr$s2 + 109] = $96;
        }
        if (HEAP32[$m_addr$s2 + 6] != 0) {
          $sp = $m_addr + 444;
          while (1) {
            if ($sp != 0) {
              var $144 = $tbase != HEAP32[$sp >> 2] + HEAP32[$sp + 4 >> 2];
            } else {
              var $144 = 0;
            }
            var $144;
            if (!$144) {
              break;
            }
            var $146 = HEAP32[$sp + 8 >> 2];
            $sp = $146;
          }
          var $cmp165 = $sp != 0;
          do {
            if ($cmp165) {
              if ((HEAP32[$sp + 12 >> 2] & 8) != 0) {
                __label__ = 75;
                break;
              }
              if ((HEAP32[$sp + 12 >> 2] & 0) != $mmap_flag) {
                __label__ = 75;
                break;
              }
              if (!(HEAP32[$m_addr$s2 + 6] >= HEAPU32[$sp >> 2])) {
                __label__ = 75;
                break;
              }
              if (HEAP32[$m_addr$s2 + 6] >= HEAP32[$sp >> 2] + HEAP32[$sp + 4 >> 2]) {
                __label__ = 75;
                break;
              }
              var $size185 = $sp + 4;
              var $add186 = HEAP32[$size185 >> 2] + $tsize;
              HEAP32[$size185 >> 2] = $add186;
              var $170 = HEAP32[$m_addr$s2 + 6];
              var $add189 = HEAP32[$m_addr$s2 + 3] + $tsize;
              _init_top($m_addr, $170, $add189);
              __label__ = 88;
              break;
            }
            __label__ = 75;
          } while (0);
          if (__label__ == 75) {
            if ($tbase < HEAPU32[$m_addr$s2 + 4]) {
              HEAP32[$m_addr$s2 + 4] = $tbase;
            }
            $sp = $m_addr + 444;
            while (1) {
              if ($sp != 0) {
                var $185 = HEAP32[$sp >> 2] != $tbase + $tsize;
              } else {
                var $185 = 0;
              }
              var $185;
              if (!$185) {
                break;
              }
              var $187 = HEAP32[$sp + 8 >> 2];
              $sp = $187;
            }
            var $cmp207 = $sp != 0;
            do {
              if ($cmp207) {
                if ((HEAP32[$sp + 12 >> 2] & 8) != 0) {
                  break;
                }
                if ((HEAP32[$sp + 12 >> 2] & 0) != $mmap_flag) {
                  break;
                }
                $oldbase = HEAP32[$sp >> 2];
                HEAP32[$sp >> 2] = $tbase;
                var $size219 = $sp + 4;
                var $add220 = HEAP32[$size219 >> 2] + $tsize;
                HEAP32[$size219 >> 2] = $add220;
                var $call221 = _prepend_alloc($m_addr, $tbase, $oldbase, $nb_addr);
                $retval = $call221;
                break $_$12;
              }
            } while (0);
            _add_segment($m_addr, $tbase, $tsize, $mmap_flag);
          }
        } else {
          var $cmp134 = HEAP32[$m_addr$s2 + 4] == 0;
          do {
            if ($cmp134) {
              __label__ = 59;
            } else {
              if ($tbase < HEAPU32[$m_addr$s2 + 4]) {
                __label__ = 59;
                break;
              }
              __label__ = 60;
              break;
            }
          } while (0);
          if (__label__ == 59) {
            HEAP32[$m_addr$s2 + 4] = $tbase;
          }
          HEAP32[$m_addr$s2 + 111] = $tbase;
          HEAP32[$m_addr$s2 + 112] = $tsize;
          HEAP32[$m_addr$s2 + 114] = $mmap_flag;
          var $113 = HEAP32[_mparams >> 2];
          HEAP32[$m_addr$s2 + 9] = $113;
          HEAP32[$m_addr$s2 + 8] = -1;
          _init_bins($m_addr);
          if ($m_addr == __gm_) {
            _init_top($m_addr, $tbase, $tsize - 40);
          } else {
            $mn = $m_addr - 8 + (HEAP32[$m_addr - 8 + 4 >> 2] & -8);
            _init_top($m_addr, $mn, $tbase + $tsize - $mn - 40);
          }
        }
        if ($nb_addr < HEAPU32[$m_addr$s2 + 3]) {
          var $topsize229 = $m_addr + 12;
          var $sub230 = HEAP32[$topsize229 >> 2] - $nb_addr;
          HEAP32[$topsize229 >> 2] = $sub230;
          $rsize = $sub230;
          $p = HEAP32[$m_addr$s2 + 6];
          var $220 = $p + $nb_addr;
          HEAP32[$m_addr$s2 + 6] = $220;
          $r = $220;
          HEAP32[$r + 4 >> 2] = $rsize | 1;
          HEAP32[$p + 4 >> 2] = $nb_addr | 1 | 2;
          $retval = $p + 8;
          break;
        }
      }
      var $call242 = ___errno();
      HEAP32[$call242 >> 2] = 12;
      $retval = 0;
    }
  } while (0);
  return $retval;
  return null;
}

_sys_alloc["X"] = 1;

function _free($mem) {
  var $C$s2;
  var $tp$s2;
  var $B449$s2;
  var $XP286$s2;
  var $TP285$s2;
  var $XP$s2;
  var $TP$s2;
  var $next$s2;
  var __label__;
  var $mem_addr;
  var $p;
  var $psize;
  var $next;
  var $prevsize;
  var $prev;
  var $F;
  var $B;
  var $I;
  var $TP;
  var $XP;
  var $R;
  var $F60;
  var $RP;
  var $CP;
  var $H;
  var $C0;
  var $C1;
  var $tsize;
  var $dsize;
  var $nsize;
  var $F245;
  var $B247;
  var $I249;
  var $TP285;
  var $XP286;
  var $R288;
  var $F293;
  var $RP306;
  var $CP317;
  var $H343;
  var $C0385;
  var $C1386;
  var $I447;
  var $B449;
  var $F452;
  var $tp;
  var $H475;
  var $I476;
  var $X;
  var $Y;
  var $N;
  var $K;
  var $T;
  var $K525;
  var $C;
  var $F558;
  $mem_addr = $mem;
  var $cmp = $mem_addr != 0;
  $_$2 : do {
    if ($cmp) {
      $p = $mem_addr - 8;
      if ($p >= HEAPU32[__gm_ + 16 >> 2]) {
        var $8 = (HEAP32[$p + 4 >> 2] & 3) != 1;
      } else {
        var $8 = 0;
      }
      var $8;
      var $tobool = $8 == 1 != 0;
      $_$7 : do {
        if ($tobool) {
          $psize = HEAP32[$p + 4 >> 2] & -8;
          $next = $p + $psize;
          $next$s2 = $next >> 2;
          var $tobool9 = (HEAP32[$p + 4 >> 2] & 1) != 0;
          do {
            if ($tobool9) {
              __label__ = 78;
            } else {
              $prevsize = HEAP32[$p >> 2];
              if ((HEAP32[$p + 4 >> 2] & 3) == 0) {
                var $add15 = $psize + ($prevsize + 16);
                $psize = $add15;
                __label__ = 196;
                break;
              }
              $prev = $p + -$prevsize;
              var $add17 = $psize + $prevsize;
              $psize = $add17;
              $p = $prev;
              if ($prev >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                if ($p != HEAP32[__gm_ + 20 >> 2]) {
                  if ($prevsize >>> 3 < 32) {
                    $F = HEAP32[$p + 8 >> 2];
                    $B = HEAP32[$p + 12 >> 2];
                    $I = $prevsize >>> 3;
                    if ($F == $B) {
                      var $and32 = HEAP32[__gm_ >> 2] & (1 << $I ^ -1);
                      HEAP32[__gm_ >> 2] = $and32;
                    } else {
                      var $cmp35 = $F == ($I << 3) + __gm_ + 40;
                      do {
                        if ($cmp35) {
                          __label__ = 16;
                        } else {
                          if ($F >= HEAPU32[__gm_ + 16 >> 2]) {
                            __label__ = 16;
                            break;
                          }
                          var $60 = 0;
                          __label__ = 19;
                          break;
                        }
                      } while (0);
                      if (__label__ == 16) {
                        if ($B == ($I << 3) + __gm_ + 40) {
                          var $59 = 1;
                        } else {
                          var $59 = $B >= HEAPU32[__gm_ + 16 >> 2];
                        }
                        var $59;
                        var $60 = $59;
                      }
                      var $60;
                      if ($60 == 1 != 0) {
                        HEAP32[$F + 12 >> 2] = $B;
                        HEAP32[$B + 8 >> 2] = $F;
                      } else {
                        _abort();
                        throw "Reached an unreachable!";
                      }
                    }
                  } else {
                    $TP = $p;
                    $TP$s2 = $TP >> 2;
                    $XP = HEAP32[$TP$s2 + 6];
                    $XP$s2 = $XP >> 2;
                    if (HEAP32[$TP$s2 + 3] != $TP) {
                      $F60 = HEAP32[$TP$s2 + 2];
                      $R = HEAP32[$TP$s2 + 3];
                      if ($F60 >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                        HEAP32[$F60 + 12 >> 2] = $R;
                        HEAP32[$R + 8 >> 2] = $F60;
                      } else {
                        _abort();
                        throw "Reached an unreachable!";
                      }
                    } else {
                      var $arrayidx73 = $TP + 20;
                      $RP = $arrayidx73;
                      var $84 = HEAP32[$arrayidx73 >> 2];
                      $R = $84;
                      var $cmp74 = $84 != 0;
                      do {
                        if ($cmp74) {
                          __label__ = 31;
                        } else {
                          var $arrayidx78 = $TP + 16;
                          $RP = $arrayidx78;
                          var $86 = HEAP32[$arrayidx78 >> 2];
                          $R = $86;
                          if ($86 != 0) {
                            __label__ = 31;
                            break;
                          }
                          __label__ = 40;
                          break;
                        }
                      } while (0);
                      if (__label__ == 31) {
                        while (1) {
                          var $arrayidx83 = $R + 20;
                          $CP = $arrayidx83;
                          if (HEAP32[$arrayidx83 >> 2] != 0) {
                            var $91 = 1;
                          } else {
                            var $arrayidx88 = $R + 16;
                            $CP = $arrayidx88;
                            var $91 = HEAP32[$arrayidx88 >> 2] != 0;
                          }
                          var $91;
                          if (!$91) {
                            break;
                          }
                          var $92 = $CP;
                          $RP = $92;
                          $R = HEAP32[$92 >> 2];
                        }
                        if ($RP >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                          HEAP32[$RP >> 2] = 0;
                        } else {
                          _abort();
                          throw "Reached an unreachable!";
                        }
                      }
                    }
                    if ($XP != 0) {
                      $H = (HEAP32[$TP$s2 + 7] << 2) + __gm_ + 304;
                      if ($TP == HEAP32[$H >> 2]) {
                        var $104 = $R;
                        HEAP32[$H >> 2] = $104;
                        if ($104 == 0) {
                          var $and114 = HEAP32[__gm_ + 4 >> 2] & (1 << HEAP32[$TP$s2 + 7] ^ -1);
                          HEAP32[__gm_ + 4 >> 2] = $and114;
                        } else {
                          __label__ = 45;
                        }
                      } else {
                        if ($XP >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                          if (HEAP32[$XP$s2 + 4] == $TP) {
                            HEAP32[$XP$s2 + 4] = $R;
                          } else {
                            HEAP32[$XP$s2 + 5] = $R;
                          }
                        } else {
                          _abort();
                          throw "Reached an unreachable!";
                        }
                      }
                      if ($R != 0) {
                        if ($R >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                          HEAP32[$R + 24 >> 2] = $XP;
                          var $126 = HEAP32[$TP$s2 + 4];
                          $C0 = $126;
                          if ($126 != 0) {
                            if ($C0 >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                              HEAP32[$R + 16 >> 2] = $C0;
                              HEAP32[$C0 + 24 >> 2] = $R;
                            } else {
                              _abort();
                              throw "Reached an unreachable!";
                            }
                          }
                          var $135 = HEAP32[$TP$s2 + 5];
                          $C1 = $135;
                          if ($135 != 0) {
                            if ($C1 >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                              HEAP32[$R + 20 >> 2] = $C1;
                              HEAP32[$C1 + 24 >> 2] = $R;
                            } else {
                              _abort();
                              throw "Reached an unreachable!";
                            }
                          } else {
                            __label__ = 65;
                          }
                        } else {
                          _abort();
                          throw "Reached an unreachable!";
                        }
                      } else {
                        __label__ = 68;
                      }
                    } else {
                      __label__ = 69;
                    }
                  }
                } else {
                  if ((HEAP32[$next$s2 + 1] & 3) == 3) {
                    HEAP32[__gm_ + 8 >> 2] = $psize;
                    var $head188 = $next + 4;
                    var $and189 = HEAP32[$head188 >> 2] & -2;
                    HEAP32[$head188 >> 2] = $and189;
                    HEAP32[$p + 4 >> 2] = $psize | 1;
                    HEAP32[$p + $psize >> 2] = $psize;
                    __label__ = 196;
                    break;
                  }
                }
                __label__ = 78;
                break;
              }
              __label__ = 195;
              break $_$7;
            }
          } while (0);
          do {
            if (__label__ == 78) {
              if ($p < $next) {
                var $161 = (HEAP32[$next$s2 + 1] & 1) != 0;
              } else {
                var $161 = 0;
              }
              var $161;
              if ($161 == 1 == 0) {
                __label__ = 194;
                break $_$7;
              }
              if ((HEAP32[$next$s2 + 1] & 2) != 0) {
                var $head436 = $next + 4;
                var $and437 = HEAP32[$head436 >> 2] & -2;
                HEAP32[$head436 >> 2] = $and437;
                HEAP32[$p + 4 >> 2] = $psize | 1;
                HEAP32[$p + $psize >> 2] = $psize;
              } else {
                if ($next == HEAP32[__gm_ + 24 >> 2]) {
                  var $add217 = HEAP32[__gm_ + 12 >> 2] + $psize;
                  HEAP32[__gm_ + 12 >> 2] = $add217;
                  $tsize = $add217;
                  HEAP32[__gm_ + 24 >> 2] = $p;
                  HEAP32[$p + 4 >> 2] = $tsize | 1;
                  if ($p == HEAP32[__gm_ + 20 >> 2]) {
                    HEAP32[__gm_ + 20 >> 2] = 0;
                    HEAP32[__gm_ + 8 >> 2] = 0;
                  }
                  if ($tsize > HEAPU32[__gm_ + 28 >> 2]) {
                    var $call = _sys_trim(__gm_, 0);
                  }
                  break;
                }
                if ($next == HEAP32[__gm_ + 20 >> 2]) {
                  var $add232 = HEAP32[__gm_ + 8 >> 2] + $psize;
                  HEAP32[__gm_ + 8 >> 2] = $add232;
                  $dsize = $add232;
                  HEAP32[__gm_ + 20 >> 2] = $p;
                  HEAP32[$p + 4 >> 2] = $dsize | 1;
                  HEAP32[$p + $dsize >> 2] = $dsize;
                  break;
                }
                $nsize = HEAP32[$next$s2 + 1] & -8;
                var $add240 = $psize + $nsize;
                $psize = $add240;
                if ($nsize >>> 3 < 32) {
                  $F245 = HEAP32[$next$s2 + 2];
                  $B247 = HEAP32[$next$s2 + 3];
                  $I249 = $nsize >>> 3;
                  if ($F245 == $B247) {
                    var $and256 = HEAP32[__gm_ >> 2] & (1 << $I249 ^ -1);
                    HEAP32[__gm_ >> 2] = $and256;
                  } else {
                    var $cmp260 = $F245 == ($I249 << 3) + __gm_ + 40;
                    do {
                      if ($cmp260) {
                        __label__ = 95;
                      } else {
                        if ($F245 >= HEAPU32[__gm_ + 16 >> 2]) {
                          __label__ = 95;
                          break;
                        }
                        var $216 = 0;
                        __label__ = 98;
                        break;
                      }
                    } while (0);
                    if (__label__ == 95) {
                      if ($B247 == ($I249 << 3) + __gm_ + 40) {
                        var $215 = 1;
                      } else {
                        var $215 = $B247 >= HEAPU32[__gm_ + 16 >> 2];
                      }
                      var $215;
                      var $216 = $215;
                    }
                    var $216;
                    if ($216 == 1 != 0) {
                      HEAP32[$F245 + 12 >> 2] = $B247;
                      HEAP32[$B247 + 8 >> 2] = $F245;
                    } else {
                      _abort();
                      throw "Reached an unreachable!";
                    }
                  }
                } else {
                  $TP285 = $next;
                  $TP285$s2 = $TP285 >> 2;
                  $XP286 = HEAP32[$TP285$s2 + 6];
                  $XP286$s2 = $XP286 >> 2;
                  if (HEAP32[$TP285$s2 + 3] != $TP285) {
                    $F293 = HEAP32[$TP285$s2 + 2];
                    $R288 = HEAP32[$TP285$s2 + 3];
                    if ($F293 >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                      HEAP32[$F293 + 12 >> 2] = $R288;
                      HEAP32[$R288 + 8 >> 2] = $F293;
                    } else {
                      _abort();
                      throw "Reached an unreachable!";
                    }
                  } else {
                    var $arrayidx308 = $TP285 + 20;
                    $RP306 = $arrayidx308;
                    var $240 = HEAP32[$arrayidx308 >> 2];
                    $R288 = $240;
                    var $cmp309 = $240 != 0;
                    do {
                      if ($cmp309) {
                        __label__ = 110;
                      } else {
                        var $arrayidx313 = $TP285 + 16;
                        $RP306 = $arrayidx313;
                        var $242 = HEAP32[$arrayidx313 >> 2];
                        $R288 = $242;
                        if ($242 != 0) {
                          __label__ = 110;
                          break;
                        }
                        __label__ = 119;
                        break;
                      }
                    } while (0);
                    if (__label__ == 110) {
                      while (1) {
                        var $arrayidx320 = $R288 + 20;
                        $CP317 = $arrayidx320;
                        if (HEAP32[$arrayidx320 >> 2] != 0) {
                          var $247 = 1;
                        } else {
                          var $arrayidx325 = $R288 + 16;
                          $CP317 = $arrayidx325;
                          var $247 = HEAP32[$arrayidx325 >> 2] != 0;
                        }
                        var $247;
                        if (!$247) {
                          break;
                        }
                        var $248 = $CP317;
                        $RP306 = $248;
                        $R288 = HEAP32[$248 >> 2];
                      }
                      if ($RP306 >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                        HEAP32[$RP306 >> 2] = 0;
                      } else {
                        _abort();
                        throw "Reached an unreachable!";
                      }
                    }
                  }
                  if ($XP286 != 0) {
                    $H343 = (HEAP32[$TP285$s2 + 7] << 2) + __gm_ + 304;
                    if ($TP285 == HEAP32[$H343 >> 2]) {
                      var $260 = $R288;
                      HEAP32[$H343 >> 2] = $260;
                      if ($260 == 0) {
                        var $and355 = HEAP32[__gm_ + 4 >> 2] & (1 << HEAP32[$TP285$s2 + 7] ^ -1);
                        HEAP32[__gm_ + 4 >> 2] = $and355;
                      } else {
                        __label__ = 124;
                      }
                    } else {
                      if ($XP286 >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                        if (HEAP32[$XP286$s2 + 4] == $TP285) {
                          HEAP32[$XP286$s2 + 4] = $R288;
                        } else {
                          HEAP32[$XP286$s2 + 5] = $R288;
                        }
                      } else {
                        _abort();
                        throw "Reached an unreachable!";
                      }
                    }
                    if ($R288 != 0) {
                      if ($R288 >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                        HEAP32[$R288 + 24 >> 2] = $XP286;
                        var $282 = HEAP32[$TP285$s2 + 4];
                        $C0385 = $282;
                        if ($282 != 0) {
                          if ($C0385 >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                            HEAP32[$R288 + 16 >> 2] = $C0385;
                            HEAP32[$C0385 + 24 >> 2] = $R288;
                          } else {
                            _abort();
                            throw "Reached an unreachable!";
                          }
                        }
                        var $291 = HEAP32[$TP285$s2 + 5];
                        $C1386 = $291;
                        if ($291 != 0) {
                          if ($C1386 >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                            HEAP32[$R288 + 20 >> 2] = $C1386;
                            HEAP32[$C1386 + 24 >> 2] = $R288;
                          } else {
                            _abort();
                            throw "Reached an unreachable!";
                          }
                        } else {
                          __label__ = 144;
                        }
                      } else {
                        _abort();
                        throw "Reached an unreachable!";
                      }
                    } else {
                      __label__ = 147;
                    }
                  } else {
                    __label__ = 148;
                  }
                }
                HEAP32[$p + 4 >> 2] = $psize | 1;
                HEAP32[$p + $psize >> 2] = $psize;
                if ($p == HEAP32[__gm_ + 20 >> 2]) {
                  HEAP32[__gm_ + 8 >> 2] = $psize;
                  break;
                }
              }
              if ($psize >>> 3 < 32) {
                $I447 = $psize >>> 3;
                $B449 = ($I447 << 3) + __gm_ + 40;
                $B449$s2 = $B449 >> 2;
                $F452 = $B449;
                if ((HEAP32[__gm_ >> 2] & 1 << $I447) != 0) {
                  if (HEAP32[$B449$s2 + 2] >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                    $F452 = HEAP32[$B449$s2 + 2];
                  } else {
                    _abort();
                    throw "Reached an unreachable!";
                  }
                } else {
                  var $or458 = HEAP32[__gm_ >> 2] | 1 << $I447;
                  HEAP32[__gm_ >> 2] = $or458;
                }
                HEAP32[$B449$s2 + 2] = $p;
                HEAP32[$F452 + 12 >> 2] = $p;
                HEAP32[$p + 8 >> 2] = $F452;
                HEAP32[$p + 12 >> 2] = $B449;
              } else {
                $tp = $p;
                $tp$s2 = $tp >> 2;
                $X = $psize >>> 8;
                if ($X == 0) {
                  $I476 = 0;
                } else {
                  if ($X > 65535) {
                    $I476 = 31;
                  } else {
                    $Y = $X;
                    $N = $Y - 256 >>> 16 & 8;
                    var $shl488 = $Y << $N;
                    $Y = $shl488;
                    $K = $shl488 - 4096 >>> 16 & 4;
                    var $add492 = $N + $K;
                    $N = $add492;
                    var $shl493 = $Y << $K;
                    $Y = $shl493;
                    var $and496 = $shl493 - 16384 >>> 16 & 2;
                    $K = $and496;
                    var $add497 = $N + $and496;
                    $N = $add497;
                    var $shl499 = $Y << $K;
                    $Y = $shl499;
                    var $add501 = 14 - $N + ($shl499 >>> 15);
                    $K = $add501;
                    $I476 = ($K << 1) + ($psize >>> $K + 7 & 1);
                  }
                }
                $H475 = ($I476 << 2) + __gm_ + 304;
                HEAP32[$tp$s2 + 7] = $I476;
                HEAP32[$tp$s2 + 5] = 0;
                HEAP32[$tp$s2 + 4] = 0;
                if ((HEAP32[__gm_ + 4 >> 2] & 1 << $I476) != 0) {
                  $T = HEAP32[$H475 >> 2];
                  if ($I476 == 31) {
                    var $cond = 0;
                  } else {
                    var $cond = 31 - (($I476 >>> 1) + 8 - 2);
                  }
                  var $cond;
                  $K525 = $psize << $cond;
                  while (1) {
                    if ((HEAP32[$T + 4 >> 2] & -8) != $psize) {
                      $C = (($K525 >>> 31 & 1) << 2) + $T + 16;
                      $C$s2 = $C >> 2;
                      var $shl542 = $K525 << 1;
                      $K525 = $shl542;
                      if (HEAP32[$C$s2] != 0) {
                        $T = HEAP32[$C$s2];
                      } else {
                        if ($C >= HEAPU32[__gm_ + 16 >> 2] == 1 != 0) {
                          HEAP32[$C$s2] = $tp;
                          HEAP32[$tp$s2 + 6] = $T;
                          var $401 = $tp;
                          HEAP32[$tp$s2 + 3] = $401;
                          HEAP32[$tp$s2 + 2] = $401;
                          break;
                        }
                        _abort();
                        throw "Reached an unreachable!";
                      }
                    } else {
                      $F558 = HEAP32[$T + 8 >> 2];
                      if ($T >= HEAPU32[__gm_ + 16 >> 2]) {
                        var $412 = $F558 >= HEAPU32[__gm_ + 16 >> 2];
                      } else {
                        var $412 = 0;
                      }
                      var $412;
                      if ($412 == 1 != 0) {
                        var $413 = $tp;
                        HEAP32[$F558 + 12 >> 2] = $413;
                        HEAP32[$T + 8 >> 2] = $413;
                        HEAP32[$tp$s2 + 2] = $F558;
                        HEAP32[$tp$s2 + 3] = $T;
                        HEAP32[$tp$s2 + 6] = 0;
                        break;
                      }
                      _abort();
                      throw "Reached an unreachable!";
                    }
                  }
                } else {
                  var $or520 = HEAP32[__gm_ + 4 >> 2] | 1 << $I476;
                  HEAP32[__gm_ + 4 >> 2] = $or520;
                  HEAP32[$H475 >> 2] = $tp;
                  HEAP32[$tp$s2 + 6] = $H475;
                  var $376 = $tp;
                  HEAP32[$tp$s2 + 3] = $376;
                  HEAP32[$tp$s2 + 2] = $376;
                }
                var $dec = HEAP32[__gm_ + 32 >> 2] - 1;
                HEAP32[__gm_ + 32 >> 2] = $dec;
                if ($dec == 0) {
                  var $call581 = _release_unused_segments(__gm_);
                } else {
                  __label__ = 191;
                }
              }
            }
          } while (0);
          break $_$2;
        }
      } while (0);
      _abort();
      throw "Reached an unreachable!";
    }
  } while (0);
  return;
  return;
}

_free["X"] = 1;

function _sys_trim($m, $pad) {
  var $sp$s2;
  var $m_addr$s2;
  var __label__;
  var $m_addr;
  var $pad_addr;
  var $released;
  var $unit;
  var $extra;
  var $sp;
  var $old_br;
  var $rel_br;
  var $new_br;
  $m_addr = $m;
  $m_addr$s2 = $m_addr >> 2;
  $pad_addr = $pad;
  $released = 0;
  if (HEAP32[_mparams >> 2] != 0) {
    var $1 = 1;
  } else {
    var $call = _init_mparams();
    var $1 = $call != 0;
  }
  var $1;
  var $cmp1 = $pad_addr < 4294967232;
  do {
    if ($cmp1) {
      if (HEAP32[$m_addr$s2 + 6] == 0) {
        break;
      }
      var $add = $pad_addr + 40;
      $pad_addr = $add;
      if (HEAPU32[$m_addr$s2 + 3] > $pad_addr) {
        $unit = HEAP32[_mparams + 8 >> 2];
        var $add7 = HEAP32[$m_addr$s2 + 3] - $pad_addr + ($unit - 1);
        var $div = Math.floor($add7 / $unit);
        $extra = ($div - 1) * $unit;
        var $19 = HEAP32[$m_addr$s2 + 6];
        var $call10 = _segment_holding($m_addr, $19);
        $sp = $call10;
        $sp$s2 = $sp >> 2;
        if ((HEAP32[$sp$s2 + 3] & 8) == 0) {
          if ((HEAP32[$sp$s2 + 3] & 0) == 0) {
            if ($extra >= 2147483647) {
              $extra = -2147483648 - $unit;
            }
            var $call20 = _sbrk(0);
            $old_br = $call20;
            if ($old_br == HEAP32[$sp$s2] + HEAP32[$sp$s2 + 1]) {
              var $call24 = _sbrk(-$extra);
              $rel_br = $call24;
              var $call25 = _sbrk(0);
              $new_br = $call25;
              var $cmp26 = $rel_br != -1;
              do {
                if ($cmp26) {
                  if ($new_br >= $old_br) {
                    break;
                  }
                  $released = $old_br - $new_br;
                } else {
                  __label__ = 16;
                }
              } while (0);
            } else {
              __label__ = 17;
            }
          }
        }
        if ($released != 0) {
          var $size36 = $sp + 4;
          var $sub37 = HEAP32[$size36 >> 2] - $released;
          HEAP32[$size36 >> 2] = $sub37;
          var $footprint = $m_addr + 432;
          var $sub38 = HEAP32[$footprint >> 2] - $released;
          HEAP32[$footprint >> 2] = $sub38;
          var $46 = HEAP32[$m_addr$s2 + 6];
          var $sub41 = HEAP32[$m_addr$s2 + 3] - $released;
          _init_top($m_addr, $46, $sub41);
        } else {
          __label__ = 21;
        }
      }
      var $cmp44 = $released == 0;
      do {
        if ($cmp44) {
          if (HEAPU32[$m_addr$s2 + 3] <= HEAPU32[$m_addr$s2 + 7]) {
            break;
          }
          HEAP32[$m_addr$s2 + 7] = -1;
        } else {
          __label__ = 25;
        }
      } while (0);
    }
  } while (0);
  var $cond = $released != 0 ? 1 : 0;
  return $cond;
  return null;
}

_sys_trim["X"] = 1;

function _calloc($n_elements, $elem_size) {
  var __label__;
  var $n_elements_addr;
  var $elem_size_addr;
  var $mem;
  var $req;
  $n_elements_addr = $n_elements;
  $elem_size_addr = $elem_size;
  $req = 0;
  if ($n_elements_addr != 0) {
    $req = $n_elements_addr * $elem_size_addr;
    var $tobool = (($n_elements_addr | $elem_size_addr) & -65536) != 0;
    do {
      if ($tobool) {
        var $div = Math.floor($req / $n_elements_addr);
        if ($div == $elem_size_addr) {
          break;
        }
        $req = -1;
      } else {
        __label__ = 6;
      }
    } while (0);
  }
  var $call = _malloc($req);
  $mem = $call;
  var $cmp4 = $mem != 0;
  do {
    if ($cmp4) {
      if ((HEAP32[$mem - 8 + 4 >> 2] & 3) == 0) {
        break;
      }
      _memset($mem, 0, $req, 1);
    }
  } while (0);
  return $mem;
  return null;
}

function _realloc($oldmem, $bytes) {
  var $retval;
  var $oldmem_addr;
  var $bytes_addr;
  var $m;
  $oldmem_addr = $oldmem;
  $bytes_addr = $bytes;
  if ($oldmem_addr == 0) {
    var $call = _malloc($bytes_addr);
    $retval = $call;
  } else {
    $m = __gm_;
    var $call1 = _internal_realloc($m, $oldmem_addr, $bytes_addr);
    $retval = $call1;
  }
  return $retval;
  return null;
}

function _release_unused_segments($m) {
  var $C$s2;
  var $XP$s2;
  var $tp$s2;
  var $m_addr$s2;
  var __label__;
  var $m_addr;
  var $released;
  var $nsegs;
  var $pred;
  var $sp;
  var $base;
  var $size;
  var $next3;
  var $p;
  var $psize;
  var $tp;
  var $XP;
  var $R;
  var $F;
  var $RP;
  var $CP;
  var $H;
  var $C0;
  var $C1;
  var $H147;
  var $I;
  var $X;
  var $Y;
  var $N;
  var $K;
  var $T;
  var $K197;
  var $C;
  var $F235;
  $m_addr = $m;
  $m_addr$s2 = $m_addr >> 2;
  $released = 0;
  $nsegs = 0;
  $pred = $m_addr + 444;
  $sp = HEAP32[$pred + 8 >> 2];
  while (1) {
    if ($sp != 0) {
      $base = HEAP32[$sp >> 2];
      $size = HEAP32[$sp + 4 >> 2];
      $next3 = HEAP32[$sp + 8 >> 2];
      var $inc = $nsegs + 1;
      $nsegs = $inc;
      var $tobool = (HEAP32[$sp + 12 >> 2] & 0) != 0;
      do {
        if ($tobool) {
          if ((HEAP32[$sp + 12 >> 2] & 8) != 0) {
            break;
          }
          if (($base + 8 & 7) == 0) {
            var $cond = 0;
          } else {
            var $cond = 8 - ($base + 8 & 7) & 7;
          }
          var $cond;
          $p = $base + $cond;
          $psize = HEAP32[$p + 4 >> 2] & -8;
          var $cmp17 = (HEAP32[$p + 4 >> 2] & 3) != 1;
          do {
            if ($cmp17) {
              __label__ = 86;
            } else {
              if (!($p + $psize >= $base + $size - 40)) {
                break;
              }
              $tp = $p;
              $tp$s2 = $tp >> 2;
              if ($p == HEAP32[$m_addr$s2 + 5]) {
                HEAP32[$m_addr$s2 + 5] = 0;
                HEAP32[$m_addr$s2 + 2] = 0;
              } else {
                $XP = HEAP32[$tp$s2 + 6];
                $XP$s2 = $XP >> 2;
                if (HEAP32[$tp$s2 + 3] != $tp) {
                  $F = HEAP32[$tp$s2 + 2];
                  $R = HEAP32[$tp$s2 + 3];
                  if ($F >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                    HEAP32[$F + 12 >> 2] = $R;
                    HEAP32[$R + 8 >> 2] = $F;
                  } else {
                    _abort();
                    throw "Reached an unreachable!";
                  }
                } else {
                  var $arrayidx = $tp + 20;
                  $RP = $arrayidx;
                  var $55 = HEAP32[$arrayidx >> 2];
                  $R = $55;
                  var $cmp37 = $55 != 0;
                  do {
                    if ($cmp37) {
                      __label__ = 20;
                    } else {
                      var $arrayidx40 = $tp + 16;
                      $RP = $arrayidx40;
                      var $57 = HEAP32[$arrayidx40 >> 2];
                      $R = $57;
                      if ($57 != 0) {
                        __label__ = 20;
                        break;
                      }
                      __label__ = 29;
                      break;
                    }
                  } while (0);
                  if (__label__ == 20) {
                    while (1) {
                      var $arrayidx46 = $R + 20;
                      $CP = $arrayidx46;
                      if (HEAP32[$arrayidx46 >> 2] != 0) {
                        var $62 = 1;
                      } else {
                        var $arrayidx50 = $R + 16;
                        $CP = $arrayidx50;
                        var $62 = HEAP32[$arrayidx50 >> 2] != 0;
                      }
                      var $62;
                      if (!$62) {
                        break;
                      }
                      var $63 = $CP;
                      $RP = $63;
                      $R = HEAP32[$63 >> 2];
                    }
                    if ($RP >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                      HEAP32[$RP >> 2] = 0;
                    } else {
                      _abort();
                      throw "Reached an unreachable!";
                    }
                  }
                }
                if ($XP != 0) {
                  $H = (HEAP32[$tp$s2 + 7] << 2) + $m_addr + 304;
                  if ($tp == HEAP32[$H >> 2]) {
                    var $77 = $R;
                    HEAP32[$H >> 2] = $77;
                    if ($77 == 0) {
                      var $treemap = $m_addr + 4;
                      var $and75 = HEAP32[$treemap >> 2] & (1 << HEAP32[$tp$s2 + 7] ^ -1);
                      HEAP32[$treemap >> 2] = $and75;
                    } else {
                      __label__ = 34;
                    }
                  } else {
                    if ($XP >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                      if (HEAP32[$XP$s2 + 4] == $tp) {
                        HEAP32[$XP$s2 + 4] = $R;
                      } else {
                        HEAP32[$XP$s2 + 5] = $R;
                      }
                    } else {
                      _abort();
                      throw "Reached an unreachable!";
                    }
                  }
                  if ($R != 0) {
                    if ($R >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                      HEAP32[$R + 24 >> 2] = $XP;
                      var $102 = HEAP32[$tp$s2 + 4];
                      $C0 = $102;
                      if ($102 != 0) {
                        if ($C0 >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                          HEAP32[$R + 16 >> 2] = $C0;
                          HEAP32[$C0 + 24 >> 2] = $R;
                        } else {
                          _abort();
                          throw "Reached an unreachable!";
                        }
                      }
                      var $112 = HEAP32[$tp$s2 + 5];
                      $C1 = $112;
                      if ($112 != 0) {
                        if ($C1 >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                          HEAP32[$R + 20 >> 2] = $C1;
                          HEAP32[$C1 + 24 >> 2] = $R;
                        } else {
                          _abort();
                          throw "Reached an unreachable!";
                        }
                      } else {
                        __label__ = 54;
                      }
                    } else {
                      _abort();
                      throw "Reached an unreachable!";
                    }
                  } else {
                    __label__ = 57;
                  }
                } else {
                  __label__ = 58;
                }
              }
              $X = $psize >>> 8;
              if ($X == 0) {
                $I = 0;
              } else {
                if ($X > 65535) {
                  $I = 31;
                } else {
                  $Y = $X;
                  $N = $Y - 256 >>> 16 & 8;
                  var $shl159 = $Y << $N;
                  $Y = $shl159;
                  $K = $shl159 - 4096 >>> 16 & 4;
                  var $add = $N + $K;
                  $N = $add;
                  var $shl163 = $Y << $K;
                  $Y = $shl163;
                  var $and166 = $shl163 - 16384 >>> 16 & 2;
                  $K = $and166;
                  var $add167 = $N + $and166;
                  $N = $add167;
                  var $shl169 = $Y << $K;
                  $Y = $shl169;
                  var $add171 = 14 - $N + ($shl169 >>> 15);
                  $K = $add171;
                  $I = ($K << 1) + ($psize >>> $K + 7 & 1);
                }
              }
              $H147 = ($I << 2) + $m_addr + 304;
              HEAP32[$tp$s2 + 7] = $I;
              HEAP32[$tp$s2 + 5] = 0;
              HEAP32[$tp$s2 + 4] = 0;
              if ((HEAP32[$m_addr$s2 + 1] & 1 << $I) != 0) {
                $T = HEAP32[$H147 >> 2];
                if ($I == 31) {
                  var $cond207 = 0;
                } else {
                  var $cond207 = 31 - (($I >>> 1) + 8 - 2);
                }
                var $cond207;
                $K197 = $psize << $cond207;
                while (1) {
                  if ((HEAP32[$T + 4 >> 2] & -8) != $psize) {
                    $C = (($K197 >>> 31 & 1) << 2) + $T + 16;
                    $C$s2 = $C >> 2;
                    var $shl218 = $K197 << 1;
                    $K197 = $shl218;
                    if (HEAP32[$C$s2] != 0) {
                      $T = HEAP32[$C$s2];
                    } else {
                      if ($C >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                        HEAP32[$C$s2] = $tp;
                        HEAP32[$tp$s2 + 6] = $T;
                        var $182 = $tp;
                        HEAP32[$tp$s2 + 3] = $182;
                        HEAP32[$tp$s2 + 2] = $182;
                        break;
                      }
                      _abort();
                      throw "Reached an unreachable!";
                    }
                  } else {
                    $F235 = HEAP32[$T + 8 >> 2];
                    if ($T >= HEAPU32[$m_addr$s2 + 4]) {
                      var $195 = $F235 >= HEAPU32[$m_addr$s2 + 4];
                    } else {
                      var $195 = 0;
                    }
                    var $195;
                    if ($195 == 1 != 0) {
                      var $196 = $tp;
                      HEAP32[$F235 + 12 >> 2] = $196;
                      HEAP32[$T + 8 >> 2] = $196;
                      HEAP32[$tp$s2 + 2] = $F235;
                      HEAP32[$tp$s2 + 3] = $T;
                      HEAP32[$tp$s2 + 6] = 0;
                      break;
                    }
                    _abort();
                    throw "Reached an unreachable!";
                  }
                }
              } else {
                var $treemap192 = $m_addr + 4;
                var $or = HEAP32[$treemap192 >> 2] | 1 << $I;
                HEAP32[$treemap192 >> 2] = $or;
                HEAP32[$H147 >> 2] = $tp;
                HEAP32[$tp$s2 + 6] = $H147;
                var $156 = $tp;
                HEAP32[$tp$s2 + 3] = $156;
                HEAP32[$tp$s2 + 2] = $156;
              }
            }
          } while (0);
        }
      } while (0);
      $pred = $sp;
      $sp = $next3;
    } else {
      if ($nsegs > 4294967295) {
        var $cond262 = $nsegs;
      } else {
        var $cond262 = -1;
      }
      var $cond262;
      HEAP32[$m_addr$s2 + 8] = $cond262;
      return $released;
    }
  }
  return null;
}

_release_unused_segments["X"] = 1;

function _mmap_resize($m, $oldp, $nb) {
  var $newp$s2;
  var $m_addr$s2;
  var $retval;
  var $m_addr;
  var $oldp_addr;
  var $nb_addr;
  var $oldsize;
  var $offset;
  var $oldmmsize;
  var $newmmsize;
  var $cp;
  var $newp;
  var $psize;
  $m_addr = $m;
  $m_addr$s2 = $m_addr >> 2;
  $oldp_addr = $oldp;
  $nb_addr = $nb;
  $oldsize = HEAP32[$oldp_addr + 4 >> 2] & -8;
  var $cmp = $nb_addr >>> 3 < 32;
  $_$56 : do {
    if ($cmp) {
      $retval = 0;
    } else {
      var $cmp1 = $oldsize >= $nb_addr + 4;
      do {
        if ($cmp1) {
          if (!($oldsize - $nb_addr <= HEAP32[_mparams + 8 >> 2] << 1)) {
            break;
          }
          $retval = $oldp_addr;
          break $_$56;
        }
      } while (0);
      $offset = HEAP32[$oldp_addr >> 2];
      $oldmmsize = $oldsize + ($offset + 16);
      $newmmsize = $nb_addr + (HEAP32[_mparams + 4 >> 2] - 1) + 31 & (HEAP32[_mparams + 4 >> 2] - 1 ^ -1);
      $cp = -1;
      if ($cp != -1) {
        $newp = $cp + $offset;
        $newp$s2 = $newp >> 2;
        $psize = $newmmsize - $offset - 16;
        HEAP32[$newp$s2 + 1] = $psize;
        HEAP32[($psize + 4 >> 2) + $newp$s2] = 7;
        HEAP32[($psize + 8 >> 2) + $newp$s2] = 0;
        if ($cp < HEAPU32[$m_addr$s2 + 4]) {
          HEAP32[$m_addr$s2 + 4] = $cp;
        }
        var $footprint = $m_addr + 432;
        var $add27 = HEAP32[$footprint >> 2] + ($newmmsize - $oldmmsize);
        HEAP32[$footprint >> 2] = $add27;
        if ($add27 > HEAPU32[$m_addr$s2 + 109]) {
          var $44 = HEAP32[$m_addr$s2 + 108];
          HEAP32[$m_addr$s2 + 109] = $44;
        }
        $retval = $newp;
      } else {
        $retval = 0;
      }
    }
  } while (0);
  return $retval;
  return null;
}

_mmap_resize["X"] = 1;

function _segment_holding($m, $addr) {
  var $retval;
  var $m_addr;
  var $addr_addr;
  var $sp;
  $m_addr = $m;
  $addr_addr = $addr;
  $sp = $m_addr + 444;
  $_$75 : while (1) {
    var $cmp = $addr_addr >= HEAPU32[$sp >> 2];
    do {
      if ($cmp) {
        if ($addr_addr >= HEAP32[$sp >> 2] + HEAP32[$sp + 4 >> 2]) {
          break;
        }
        $retval = $sp;
        break $_$75;
      }
    } while (0);
    var $11 = HEAP32[$sp + 8 >> 2];
    $sp = $11;
    if ($11 == 0) {
      $retval = 0;
      break;
    }
  }
  return $retval;
  return null;
}

function _init_top($m, $p, $psize) {
  var $m_addr$s2;
  var $m_addr;
  var $p_addr;
  var $psize_addr;
  var $offset;
  $m_addr = $m;
  $m_addr$s2 = $m_addr >> 2;
  $p_addr = $p;
  $psize_addr = $psize;
  if (($p_addr + 8 & 7) == 0) {
    var $cond = 0;
  } else {
    var $cond = 8 - ($p_addr + 8 & 7) & 7;
  }
  var $cond;
  $offset = $cond;
  var $9 = $p_addr + $offset;
  $p_addr = $9;
  var $sub5 = $psize_addr - $offset;
  $psize_addr = $sub5;
  HEAP32[$m_addr$s2 + 6] = $p_addr;
  HEAP32[$m_addr$s2 + 3] = $psize_addr;
  HEAP32[$p_addr + 4 >> 2] = $psize_addr | 1;
  HEAP32[$p_addr + ($psize_addr + 4) >> 2] = 40;
  var $22 = HEAP32[_mparams + 16 >> 2];
  HEAP32[$m_addr$s2 + 7] = $22;
  return;
  return;
}

_init_top["X"] = 1;

function _mmap_alloc($m, $nb) {
  var $p$s2;
  var $m_addr$s2;
  var __label__;
  var $retval;
  var $m_addr;
  var $nb_addr;
  var $mmsize;
  var $mm;
  var $offset;
  var $psize;
  var $p;
  $m_addr = $m;
  $m_addr$s2 = $m_addr >> 2;
  $nb_addr = $nb;
  $mmsize = $nb_addr + (HEAP32[_mparams + 4 >> 2] - 1) + 31 & (HEAP32[_mparams + 4 >> 2] - 1 ^ -1);
  var $cmp = $mmsize > $nb_addr;
  do {
    if ($cmp) {
      $mm = -1;
      if ($mm != -1) {
        if (($mm + 8 & 7) == 0) {
          var $cond = 0;
        } else {
          var $cond = 8 - ($mm + 8 & 7) & 7;
        }
        var $cond;
        $offset = $cond;
        $psize = $mmsize - $offset - 16;
        $p = $mm + $offset;
        $p$s2 = $p >> 2;
        HEAP32[$p$s2] = $offset;
        HEAP32[$p$s2 + 1] = $psize;
        HEAP32[($psize + 4 >> 2) + $p$s2] = 7;
        HEAP32[($psize + 8 >> 2) + $p$s2] = 0;
        var $cmp20 = HEAP32[$m_addr$s2 + 4] == 0;
        do {
          if ($cmp20) {
            __label__ = 9;
          } else {
            if ($mm < HEAPU32[$m_addr$s2 + 4]) {
              __label__ = 9;
              break;
            }
            __label__ = 10;
            break;
          }
        } while (0);
        if (__label__ == 9) {
          HEAP32[$m_addr$s2 + 4] = $mm;
        }
        var $footprint = $m_addr + 432;
        var $add25 = HEAP32[$footprint >> 2] + $mmsize;
        HEAP32[$footprint >> 2] = $add25;
        if ($add25 > HEAPU32[$m_addr$s2 + 109]) {
          var $40 = HEAP32[$m_addr$s2 + 108];
          HEAP32[$m_addr$s2 + 109] = $40;
        }
        $retval = $p + 8;
        __label__ = 15;
        break;
      }
      __label__ = 14;
      break;
    } else {
      __label__ = 14;
    }
  } while (0);
  if (__label__ == 14) {
    $retval = 0;
  }
  return $retval;
  return null;
}

_mmap_alloc["X"] = 1;

function _init_bins($m) {
  var $m_addr;
  var $i;
  var $bin;
  $m_addr = $m;
  $i = 0;
  while (1) {
    if ($i >= 32) {
      break;
    }
    $bin = ($i << 3) + $m_addr + 40;
    var $5 = $bin;
    HEAP32[$bin + 12 >> 2] = $5;
    HEAP32[$bin + 8 >> 2] = $5;
    var $inc = $i + 1;
    $i = $inc;
  }
  return;
  return;
}

function _internal_realloc($m, $oldmem, $bytes) {
  var $oldp$s2;
  var $m_addr$s2;
  var __label__;
  var $retval;
  var $m_addr;
  var $oldmem_addr;
  var $bytes_addr;
  var $oldp;
  var $oldsize;
  var $next;
  var $newp;
  var $extra;
  var $nb;
  var $rsize;
  var $remainder;
  var $newsize;
  var $newtopsize;
  var $newtop;
  var $newmem;
  var $oc;
  $m_addr = $m;
  $m_addr$s2 = $m_addr >> 2;
  $oldmem_addr = $oldmem;
  $bytes_addr = $bytes;
  if ($bytes_addr >= 4294967232) {
    var $call = ___errno();
    HEAP32[$call >> 2] = 12;
    $retval = 0;
  } else {
    $oldp = $oldmem_addr - 8;
    $oldp$s2 = $oldp >> 2;
    $oldsize = HEAP32[$oldp$s2 + 1] & -8;
    $next = $oldp + $oldsize;
    $newp = 0;
    $extra = 0;
    var $cmp2 = $oldp >= HEAPU32[$m_addr$s2 + 4];
    do {
      if ($cmp2) {
        if ((HEAP32[$oldp$s2 + 1] & 3) == 1) {
          var $21 = 0;
          break;
        }
        if ($oldp >= $next) {
          var $21 = 0;
          break;
        }
        var $21 = (HEAP32[$next + 4 >> 2] & 1) != 0;
      } else {
        var $21 = 0;
      }
    } while (0);
    var $21;
    if ($21 == 1 != 0) {
      if ($bytes_addr < 11) {
        var $cond = 16;
      } else {
        var $cond = $bytes_addr + 11 & -8;
      }
      var $cond;
      $nb = $cond;
      if ((HEAP32[$oldp$s2 + 1] & 3) == 0) {
        var $call19 = _mmap_resize($m_addr, $oldp, $nb);
        $newp = $call19;
      } else {
        if ($oldsize >= $nb) {
          $rsize = $oldsize - $nb;
          $newp = $oldp;
          if ($rsize >= 16) {
            $remainder = $newp + $nb;
            var $or27 = HEAP32[$newp + 4 >> 2] & 1 | $nb | 2;
            HEAP32[$newp + 4 >> 2] = $or27;
            var $head30 = $newp + ($nb + 4);
            var $or31 = HEAP32[$head30 >> 2] | 1;
            HEAP32[$head30 >> 2] = $or31;
            HEAP32[$remainder + 4 >> 2] = $rsize | 1 | 2;
            var $head36 = $remainder + ($rsize + 4);
            var $or37 = HEAP32[$head36 >> 2] | 1;
            HEAP32[$head36 >> 2] = $or37;
            $extra = $remainder + 8;
          } else {
            __label__ = 17;
          }
        } else {
          var $cmp41 = $next == HEAP32[$m_addr$s2 + 6];
          do {
            if ($cmp41) {
              if ($oldsize + HEAP32[$m_addr$s2 + 3] <= $nb) {
                break;
              }
              $newsize = $oldsize + HEAP32[$m_addr$s2 + 3];
              $newtopsize = $newsize - $nb;
              $newtop = $oldp + $nb;
              var $or53 = HEAP32[$oldp$s2 + 1] & 1 | $nb | 2;
              HEAP32[$oldp$s2 + 1] = $or53;
              var $head56 = $oldp + ($nb + 4);
              var $or57 = HEAP32[$head56 >> 2] | 1;
              HEAP32[$head56 >> 2] = $or57;
              HEAP32[$newtop + 4 >> 2] = $newtopsize | 1;
              HEAP32[$m_addr$s2 + 6] = $newtop;
              HEAP32[$m_addr$s2 + 3] = $newtopsize;
              $newp = $oldp;
            } else {
              __label__ = 21;
            }
          } while (0);
        }
      }
      if ($newp != 0) {
        if ($extra != 0) {
          _free($extra);
        }
        $retval = $newp + 8;
      } else {
        var $call74 = _malloc($bytes_addr);
        $newmem = $call74;
        if ($newmem != 0) {
          var $cond80 = (HEAP32[$oldp$s2 + 1] & 3) == 0 ? 8 : 4;
          $oc = $oldsize - $cond80;
          if ($oc < $bytes_addr) {
            var $cond86 = $oc;
          } else {
            var $cond86 = $bytes_addr;
          }
          var $cond86;
          _memcpy($newmem, $oldmem_addr, $cond86, 1);
          _free($oldmem_addr);
        }
        $retval = $newmem;
      }
    } else {
      _abort();
      throw "Reached an unreachable!";
    }
  }
  return $retval;
  return null;
}

_internal_realloc["X"] = 1;

function _init_mparams() {
  var $magic;
  var $psize;
  var $gsize;
  var $cmp = HEAP32[_mparams >> 2] == 0;
  $_$48 : do {
    if ($cmp) {
      var $call = _sysconf(8);
      $psize = $call;
      $gsize = $psize;
      var $cmp1 = ($gsize & $gsize - 1) != 0;
      do {
        if (!$cmp1) {
          if (($psize & $psize - 1) != 0) {
            break;
          }
          HEAP32[_mparams + 8 >> 2] = $gsize;
          HEAP32[_mparams + 4 >> 2] = $psize;
          HEAP32[_mparams + 12 >> 2] = -1;
          HEAP32[_mparams + 16 >> 2] = 2097152;
          HEAP32[_mparams + 20 >> 2] = 0;
          var $8 = HEAP32[_mparams + 20 >> 2];
          HEAP32[__gm_ + 440 >> 2] = $8;
          var $call6 = _time(0);
          $magic = $call6 ^ 1431655765;
          var $or = $magic | 8;
          $magic = $or;
          var $and7 = $magic & -8;
          $magic = $and7;
          HEAP32[_mparams >> 2] = $magic;
          break $_$48;
        }
      } while (0);
      _abort();
      throw "Reached an unreachable!";
    }
  } while (0);
  return 1;
  return null;
}

function _prepend_alloc($m, $newbase, $oldbase, $nb) {
  var $C$s2;
  var $TP235$s2;
  var $B205$s2;
  var $XP$s2;
  var $TP$s2;
  var $q$s2;
  var $m_addr$s2;
  var __label__;
  var $m_addr;
  var $newbase_addr;
  var $oldbase_addr;
  var $nb_addr;
  var $p;
  var $oldfirst;
  var $psize;
  var $q;
  var $qsize;
  var $tsize;
  var $dsize;
  var $nsize;
  var $F;
  var $B;
  var $I;
  var $TP;
  var $XP;
  var $R;
  var $F63;
  var $RP;
  var $CP;
  var $H;
  var $C0;
  var $C1;
  var $I203;
  var $B205;
  var $F209;
  var $TP235;
  var $H236;
  var $I237;
  var $X;
  var $Y;
  var $N;
  var $K;
  var $T;
  var $K290;
  var $C;
  var $F328;
  $m_addr = $m;
  $m_addr$s2 = $m_addr >> 2;
  $newbase_addr = $newbase;
  $oldbase_addr = $oldbase;
  $nb_addr = $nb;
  if (($newbase_addr + 8 & 7) == 0) {
    var $cond = 0;
  } else {
    var $cond = 8 - ($newbase_addr + 8 & 7) & 7;
  }
  var $cond;
  $p = $newbase_addr + $cond;
  if (($oldbase_addr + 8 & 7) == 0) {
    var $cond15 = 0;
  } else {
    var $cond15 = 8 - ($oldbase_addr + 8 & 7) & 7;
  }
  var $cond15;
  $oldfirst = $oldbase_addr + $cond15;
  $psize = $oldfirst - $p;
  $q = $p + $nb_addr;
  $q$s2 = $q >> 2;
  $qsize = $psize - $nb_addr;
  HEAP32[$p + 4 >> 2] = $nb_addr | 1 | 2;
  if ($oldfirst == HEAP32[$m_addr$s2 + 6]) {
    var $topsize = $m_addr + 12;
    var $add = HEAP32[$topsize >> 2] + $qsize;
    HEAP32[$topsize >> 2] = $add;
    $tsize = $add;
    HEAP32[$m_addr$s2 + 6] = $q;
    HEAP32[$q$s2 + 1] = $tsize | 1;
  } else {
    if ($oldfirst == HEAP32[$m_addr$s2 + 5]) {
      var $dvsize = $m_addr + 8;
      var $add26 = HEAP32[$dvsize >> 2] + $qsize;
      HEAP32[$dvsize >> 2] = $add26;
      $dsize = $add26;
      HEAP32[$m_addr$s2 + 5] = $q;
      HEAP32[$q$s2 + 1] = $dsize | 1;
      HEAP32[($dsize >> 2) + $q$s2] = $dsize;
    } else {
      if ((HEAP32[$oldfirst + 4 >> 2] & 3) == 1) {
        $nsize = HEAP32[$oldfirst + 4 >> 2] & -8;
        if ($nsize >>> 3 < 32) {
          $F = HEAP32[$oldfirst + 8 >> 2];
          $B = HEAP32[$oldfirst + 12 >> 2];
          $I = $nsize >>> 3;
          if ($F == $B) {
            var $smallmap = $m_addr;
            var $and43 = HEAP32[$smallmap >> 2] & (1 << $I ^ -1);
            HEAP32[$smallmap >> 2] = $and43;
          } else {
            var $cmp46 = $F == ($I << 3) + $m_addr + 40;
            do {
              if ($cmp46) {
                __label__ = 18;
              } else {
                if ($F >= HEAPU32[$m_addr$s2 + 4]) {
                  __label__ = 18;
                  break;
                }
                var $83 = 0;
                __label__ = 21;
                break;
              }
            } while (0);
            if (__label__ == 18) {
              if ($B == ($I << 3) + $m_addr + 40) {
                var $82 = 1;
              } else {
                var $82 = $B >= HEAPU32[$m_addr$s2 + 4];
              }
              var $82;
              var $83 = $82;
            }
            var $83;
            if ($83 == 1 != 0) {
              HEAP32[$F + 12 >> 2] = $B;
              HEAP32[$B + 8 >> 2] = $F;
            } else {
              _abort();
              throw "Reached an unreachable!";
            }
          }
        } else {
          $TP = $oldfirst;
          $TP$s2 = $TP >> 2;
          $XP = HEAP32[$TP$s2 + 6];
          $XP$s2 = $XP >> 2;
          if (HEAP32[$TP$s2 + 3] != $TP) {
            $F63 = HEAP32[$TP$s2 + 2];
            $R = HEAP32[$TP$s2 + 3];
            if ($F63 >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
              HEAP32[$F63 + 12 >> 2] = $R;
              HEAP32[$R + 8 >> 2] = $F63;
            } else {
              _abort();
              throw "Reached an unreachable!";
            }
          } else {
            var $arrayidx76 = $TP + 20;
            $RP = $arrayidx76;
            var $108 = HEAP32[$arrayidx76 >> 2];
            $R = $108;
            var $cmp77 = $108 != 0;
            do {
              if ($cmp77) {
                __label__ = 33;
              } else {
                var $arrayidx81 = $TP + 16;
                $RP = $arrayidx81;
                var $110 = HEAP32[$arrayidx81 >> 2];
                $R = $110;
                if ($110 != 0) {
                  __label__ = 33;
                  break;
                }
                __label__ = 42;
                break;
              }
            } while (0);
            if (__label__ == 33) {
              while (1) {
                var $arrayidx86 = $R + 20;
                $CP = $arrayidx86;
                if (HEAP32[$arrayidx86 >> 2] != 0) {
                  var $115 = 1;
                } else {
                  var $arrayidx91 = $R + 16;
                  $CP = $arrayidx91;
                  var $115 = HEAP32[$arrayidx91 >> 2] != 0;
                }
                var $115;
                if (!$115) {
                  break;
                }
                var $116 = $CP;
                $RP = $116;
                $R = HEAP32[$116 >> 2];
              }
              if ($RP >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                HEAP32[$RP >> 2] = 0;
              } else {
                _abort();
                throw "Reached an unreachable!";
              }
            }
          }
          if ($XP != 0) {
            $H = (HEAP32[$TP$s2 + 7] << 2) + $m_addr + 304;
            if ($TP == HEAP32[$H >> 2]) {
              var $130 = $R;
              HEAP32[$H >> 2] = $130;
              if ($130 == 0) {
                var $treemap = $m_addr + 4;
                var $and118 = HEAP32[$treemap >> 2] & (1 << HEAP32[$TP$s2 + 7] ^ -1);
                HEAP32[$treemap >> 2] = $and118;
              } else {
                __label__ = 47;
              }
            } else {
              if ($XP >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                if (HEAP32[$XP$s2 + 4] == $TP) {
                  HEAP32[$XP$s2 + 4] = $R;
                } else {
                  HEAP32[$XP$s2 + 5] = $R;
                }
              } else {
                _abort();
                throw "Reached an unreachable!";
              }
            }
            if ($R != 0) {
              if ($R >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                HEAP32[$R + 24 >> 2] = $XP;
                var $155 = HEAP32[$TP$s2 + 4];
                $C0 = $155;
                if ($155 != 0) {
                  if ($C0 >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                    HEAP32[$R + 16 >> 2] = $C0;
                    HEAP32[$C0 + 24 >> 2] = $R;
                  } else {
                    _abort();
                    throw "Reached an unreachable!";
                  }
                }
                var $165 = HEAP32[$TP$s2 + 5];
                $C1 = $165;
                if ($165 != 0) {
                  if ($C1 >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                    HEAP32[$R + 20 >> 2] = $C1;
                    HEAP32[$C1 + 24 >> 2] = $R;
                  } else {
                    _abort();
                    throw "Reached an unreachable!";
                  }
                } else {
                  __label__ = 67;
                }
              } else {
                _abort();
                throw "Reached an unreachable!";
              }
            } else {
              __label__ = 70;
            }
          } else {
            __label__ = 71;
          }
        }
        var $177 = $oldfirst + $nsize;
        $oldfirst = $177;
        var $add191 = $qsize + $nsize;
        $qsize = $add191;
      }
      var $head193 = $oldfirst + 4;
      var $and194 = HEAP32[$head193 >> 2] & -2;
      HEAP32[$head193 >> 2] = $and194;
      HEAP32[$q$s2 + 1] = $qsize | 1;
      HEAP32[($qsize >> 2) + $q$s2] = $qsize;
      if ($qsize >>> 3 < 32) {
        $I203 = $qsize >>> 3;
        $B205 = ($I203 << 3) + $m_addr + 40;
        $B205$s2 = $B205 >> 2;
        $F209 = $B205;
        if ((HEAP32[$m_addr$s2] & 1 << $I203) != 0) {
          if (HEAP32[$B205$s2 + 2] >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
            $F209 = HEAP32[$B205$s2 + 2];
          } else {
            _abort();
            throw "Reached an unreachable!";
          }
        } else {
          var $smallmap216 = $m_addr;
          var $or217 = HEAP32[$smallmap216 >> 2] | 1 << $I203;
          HEAP32[$smallmap216 >> 2] = $or217;
        }
        HEAP32[$B205$s2 + 2] = $q;
        HEAP32[$F209 + 12 >> 2] = $q;
        HEAP32[$q$s2 + 2] = $F209;
        HEAP32[$q$s2 + 3] = $B205;
      } else {
        $TP235 = $q;
        $TP235$s2 = $TP235 >> 2;
        $X = $qsize >>> 8;
        if ($X == 0) {
          $I237 = 0;
        } else {
          if ($X > 65535) {
            $I237 = 31;
          } else {
            $Y = $X;
            $N = $Y - 256 >>> 16 & 8;
            var $shl250 = $Y << $N;
            $Y = $shl250;
            $K = $shl250 - 4096 >>> 16 & 4;
            var $add254 = $N + $K;
            $N = $add254;
            var $shl255 = $Y << $K;
            $Y = $shl255;
            var $and258 = $shl255 - 16384 >>> 16 & 2;
            $K = $and258;
            var $add259 = $N + $and258;
            $N = $add259;
            var $shl261 = $Y << $K;
            $Y = $shl261;
            var $add263 = 14 - $N + ($shl261 >>> 15);
            $K = $add263;
            $I237 = ($K << 1) + ($qsize >>> $K + 7 & 1);
          }
        }
        $H236 = ($I237 << 2) + $m_addr + 304;
        HEAP32[$TP235$s2 + 7] = $I237;
        HEAP32[$TP235$s2 + 5] = 0;
        HEAP32[$TP235$s2 + 4] = 0;
        if ((HEAP32[$m_addr$s2 + 1] & 1 << $I237) != 0) {
          $T = HEAP32[$H236 >> 2];
          if ($I237 == 31) {
            var $cond300 = 0;
          } else {
            var $cond300 = 31 - (($I237 >>> 1) + 8 - 2);
          }
          var $cond300;
          $K290 = $qsize << $cond300;
          while (1) {
            if ((HEAP32[$T + 4 >> 2] & -8) != $qsize) {
              $C = (($K290 >>> 31 & 1) << 2) + $T + 16;
              $C$s2 = $C >> 2;
              var $shl311 = $K290 << 1;
              $K290 = $shl311;
              if (HEAP32[$C$s2] != 0) {
                $T = HEAP32[$C$s2];
              } else {
                if ($C >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                  HEAP32[$C$s2] = $TP235;
                  HEAP32[$TP235$s2 + 6] = $T;
                  var $280 = $TP235;
                  HEAP32[$TP235$s2 + 3] = $280;
                  HEAP32[$TP235$s2 + 2] = $280;
                  break;
                }
                _abort();
                throw "Reached an unreachable!";
              }
            } else {
              $F328 = HEAP32[$T + 8 >> 2];
              if ($T >= HEAPU32[$m_addr$s2 + 4]) {
                var $293 = $F328 >= HEAPU32[$m_addr$s2 + 4];
              } else {
                var $293 = 0;
              }
              var $293;
              if ($293 == 1 != 0) {
                var $294 = $TP235;
                HEAP32[$F328 + 12 >> 2] = $294;
                HEAP32[$T + 8 >> 2] = $294;
                HEAP32[$TP235$s2 + 2] = $F328;
                HEAP32[$TP235$s2 + 3] = $T;
                HEAP32[$TP235$s2 + 6] = 0;
                break;
              }
              _abort();
              throw "Reached an unreachable!";
            }
          }
        } else {
          var $treemap284 = $m_addr + 4;
          var $or285 = HEAP32[$treemap284 >> 2] | 1 << $I237;
          HEAP32[$treemap284 >> 2] = $or285;
          HEAP32[$H236 >> 2] = $TP235;
          HEAP32[$TP235$s2 + 6] = $H236;
          var $254 = $TP235;
          HEAP32[$TP235$s2 + 3] = $254;
          HEAP32[$TP235$s2 + 2] = $254;
        }
      }
    }
  }
  return $p + 8;
  return null;
}

_prepend_alloc["X"] = 1;

function __ZdlPv($ptr) {
  var $ptr_addr;
  $ptr_addr = $ptr;
  if ($ptr_addr != 0) {
    _free($ptr_addr);
  }
  return;
  return;
}

function _add_segment($m, $tbase, $tsize, $mmapped) {
  var $40$s2;
  var $39$s2;
  var $C$s2;
  var $TP$s2;
  var $B$s2;
  var $q$s2;
  var $m_addr$s2;
  var $m_addr;
  var $tbase_addr;
  var $tsize_addr;
  var $mmapped_addr;
  var $old_top;
  var $oldsp;
  var $old_end;
  var $ssize;
  var $rawsp;
  var $offset;
  var $asp;
  var $csp;
  var $sp;
  var $ss;
  var $tnext;
  var $p;
  var $nfences;
  var $nextp;
  var $q;
  var $psize;
  var $tn;
  var $I;
  var $B;
  var $F;
  var $TP;
  var $H;
  var $I57;
  var $X;
  var $Y;
  var $N;
  var $K;
  var $T;
  var $K105;
  var $C;
  var $F144;
  $m_addr = $m;
  $m_addr$s2 = $m_addr >> 2;
  $tbase_addr = $tbase;
  $tsize_addr = $tsize;
  $mmapped_addr = $mmapped;
  $old_top = HEAP32[$m_addr$s2 + 6];
  var $call = _segment_holding($m_addr, $old_top);
  $oldsp = $call;
  $old_end = HEAP32[$oldsp >> 2] + HEAP32[$oldsp + 4 >> 2];
  $ssize = 24;
  $rawsp = $old_end + -($ssize + 23);
  if (($rawsp + 8 & 7) == 0) {
    var $cond = 0;
  } else {
    var $cond = 8 - ($rawsp + 8 & 7) & 7;
  }
  var $cond;
  $offset = $cond;
  $asp = $rawsp + $offset;
  if ($asp < $old_top + 16) {
    var $cond13 = $old_top;
  } else {
    var $cond13 = $asp;
  }
  var $cond13;
  $csp = $cond13;
  $sp = $csp;
  $ss = $sp + 8;
  $tnext = $sp + $ssize;
  $p = $tnext;
  $nfences = 0;
  _init_top($m_addr, $tbase_addr, $tsize_addr - 40);
  HEAP32[$sp + 4 >> 2] = $ssize | 1 | 2;
  var $39$s2 = $ss >> 2;
  var $40$s2 = $m_addr + 444 >> 2;
  HEAP32[$39$s2] = HEAP32[$40$s2];
  HEAP32[$39$s2 + 1] = HEAP32[$40$s2 + 1];
  HEAP32[$39$s2 + 2] = HEAP32[$40$s2 + 2];
  HEAP32[$39$s2 + 3] = HEAP32[$40$s2 + 3];
  HEAP32[$m_addr$s2 + 111] = $tbase_addr;
  HEAP32[$m_addr$s2 + 112] = $tsize_addr;
  HEAP32[$m_addr$s2 + 114] = $mmapped_addr;
  HEAP32[$m_addr$s2 + 113] = $ss;
  while (1) {
    $nextp = $p + 4;
    HEAP32[$p + 4 >> 2] = 7;
    var $inc = $nfences + 1;
    $nfences = $inc;
    if ($nextp + 4 >= $old_end) {
      break;
    }
    $p = $nextp;
  }
  if ($csp != $old_top) {
    $q = $old_top;
    $q$s2 = $q >> 2;
    $psize = $csp - $old_top;
    $tn = $q + $psize;
    var $head31 = $tn + 4;
    var $and32 = HEAP32[$head31 >> 2] & -2;
    HEAP32[$head31 >> 2] = $and32;
    HEAP32[$q$s2 + 1] = $psize | 1;
    HEAP32[($psize >> 2) + $q$s2] = $psize;
    if ($psize >>> 3 < 32) {
      $I = $psize >>> 3;
      $B = ($I << 3) + $m_addr + 40;
      $B$s2 = $B >> 2;
      $F = $B;
      if ((HEAP32[$m_addr$s2] & 1 << $I) != 0) {
        if (HEAP32[$B$s2 + 2] >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
          $F = HEAP32[$B$s2 + 2];
        } else {
          _abort();
          throw "Reached an unreachable!";
        }
      } else {
        var $smallmap43 = $m_addr;
        var $or44 = HEAP32[$smallmap43 >> 2] | 1 << $I;
        HEAP32[$smallmap43 >> 2] = $or44;
      }
      HEAP32[$B$s2 + 2] = $q;
      HEAP32[$F + 12 >> 2] = $q;
      HEAP32[$q$s2 + 2] = $F;
      HEAP32[$q$s2 + 3] = $B;
    } else {
      $TP = $q;
      $TP$s2 = $TP >> 2;
      $X = $psize >>> 8;
      if ($X == 0) {
        $I57 = 0;
      } else {
        if ($X > 65535) {
          $I57 = 31;
        } else {
          $Y = $X;
          $N = $Y - 256 >>> 16 & 8;
          var $shl70 = $Y << $N;
          $Y = $shl70;
          $K = $shl70 - 4096 >>> 16 & 4;
          var $add74 = $N + $K;
          $N = $add74;
          var $shl75 = $Y << $K;
          $Y = $shl75;
          var $and78 = $shl75 - 16384 >>> 16 & 2;
          $K = $and78;
          var $add79 = $N + $and78;
          $N = $add79;
          var $shl81 = $Y << $K;
          $Y = $shl81;
          var $add83 = 14 - $N + ($shl81 >>> 15);
          $K = $add83;
          $I57 = ($K << 1) + ($psize >>> $K + 7 & 1);
        }
      }
      $H = ($I57 << 2) + $m_addr + 304;
      HEAP32[$TP$s2 + 7] = $I57;
      HEAP32[$TP$s2 + 5] = 0;
      HEAP32[$TP$s2 + 4] = 0;
      if ((HEAP32[$m_addr$s2 + 1] & 1 << $I57) != 0) {
        $T = HEAP32[$H >> 2];
        if ($I57 == 31) {
          var $cond115 = 0;
        } else {
          var $cond115 = 31 - (($I57 >>> 1) + 8 - 2);
        }
        var $cond115;
        $K105 = $psize << $cond115;
        while (1) {
          if ((HEAP32[$T + 4 >> 2] & -8) != $psize) {
            $C = (($K105 >>> 31 & 1) << 2) + $T + 16;
            $C$s2 = $C >> 2;
            var $shl127 = $K105 << 1;
            $K105 = $shl127;
            if (HEAP32[$C$s2] != 0) {
              $T = HEAP32[$C$s2];
            } else {
              if ($C >= HEAPU32[$m_addr$s2 + 4] == 1 != 0) {
                HEAP32[$C$s2] = $TP;
                HEAP32[$TP$s2 + 6] = $T;
                var $168 = $TP;
                HEAP32[$TP$s2 + 3] = $168;
                HEAP32[$TP$s2 + 2] = $168;
                break;
              }
              _abort();
              throw "Reached an unreachable!";
            }
          } else {
            $F144 = HEAP32[$T + 8 >> 2];
            if ($T >= HEAPU32[$m_addr$s2 + 4]) {
              var $181 = $F144 >= HEAPU32[$m_addr$s2 + 4];
            } else {
              var $181 = 0;
            }
            var $181;
            if ($181 == 1 != 0) {
              var $182 = $TP;
              HEAP32[$F144 + 12 >> 2] = $182;
              HEAP32[$T + 8 >> 2] = $182;
              HEAP32[$TP$s2 + 2] = $F144;
              HEAP32[$TP$s2 + 3] = $T;
              HEAP32[$TP$s2 + 6] = 0;
              break;
            }
            _abort();
            throw "Reached an unreachable!";
          }
        }
      } else {
        var $treemap100 = $m_addr + 4;
        var $or101 = HEAP32[$treemap100 >> 2] | 1 << $I57;
        HEAP32[$treemap100 >> 2] = $or101;
        HEAP32[$H >> 2] = $TP;
        HEAP32[$TP$s2 + 6] = $H;
        var $142 = $TP;
        HEAP32[$TP$s2 + 3] = $142;
        HEAP32[$TP$s2 + 2] = $142;
      }
    }
  }
  return;
  return;
}

_add_segment["X"] = 1;

var i64Math = null;

var _llvm_dbg_declare;

var ERRNO_CODES = {
  E2BIG: 7,
  EACCES: 13,
  EADDRINUSE: 98,
  EADDRNOTAVAIL: 99,
  EAFNOSUPPORT: 97,
  EAGAIN: 11,
  EALREADY: 114,
  EBADF: 9,
  EBADMSG: 74,
  EBUSY: 16,
  ECANCELED: 125,
  ECHILD: 10,
  ECONNABORTED: 103,
  ECONNREFUSED: 111,
  ECONNRESET: 104,
  EDEADLK: 35,
  EDESTADDRREQ: 89,
  EDOM: 33,
  EDQUOT: 122,
  EEXIST: 17,
  EFAULT: 14,
  EFBIG: 27,
  EHOSTUNREACH: 113,
  EIDRM: 43,
  EILSEQ: 84,
  EINPROGRESS: 115,
  EINTR: 4,
  EINVAL: 22,
  EIO: 5,
  EISCONN: 106,
  EISDIR: 21,
  ELOOP: 40,
  EMFILE: 24,
  EMLINK: 31,
  EMSGSIZE: 90,
  EMULTIHOP: 72,
  ENAMETOOLONG: 36,
  ENETDOWN: 100,
  ENETRESET: 102,
  ENETUNREACH: 101,
  ENFILE: 23,
  ENOBUFS: 105,
  ENODATA: 61,
  ENODEV: 19,
  ENOENT: 2,
  ENOEXEC: 8,
  ENOLCK: 37,
  ENOLINK: 67,
  ENOMEM: 12,
  ENOMSG: 42,
  ENOPROTOOPT: 92,
  ENOSPC: 28,
  ENOSR: 63,
  ENOSTR: 60,
  ENOSYS: 38,
  ENOTCONN: 107,
  ENOTDIR: 20,
  ENOTEMPTY: 39,
  ENOTRECOVERABLE: 131,
  ENOTSOCK: 88,
  ENOTSUP: 95,
  ENOTTY: 25,
  ENXIO: 6,
  EOVERFLOW: 75,
  EOWNERDEAD: 130,
  EPERM: 1,
  EPIPE: 32,
  EPROTO: 71,
  EPROTONOSUPPORT: 93,
  EPROTOTYPE: 91,
  ERANGE: 34,
  EROFS: 30,
  ESPIPE: 29,
  ESRCH: 3,
  ESTALE: 116,
  ETIME: 62,
  ETIMEDOUT: 110,
  ETXTBSY: 26,
  EWOULDBLOCK: 11,
  EXDEV: 18
};

function ___setErrNo(value) {
  if (!___setErrNo.ret) ___setErrNo.ret = allocate([ 0 ], "i32", ALLOC_STATIC);
  HEAP32[___setErrNo.ret >> 2] = value;
  return value;
}

var _stdin = 0;

var _stdout = 0;

var _stderr = 0;

var __impure_ptr = 0;

var FS = {
  currentPath: "/",
  nextInode: 2,
  streams: [ null ],
  ignorePermissions: true,
  absolutePath: (function(relative, base) {
    if (typeof relative !== "string") return null;
    if (base === undefined) base = FS.currentPath;
    if (relative && relative[0] == "/") base = "";
    var full = base + "/" + relative;
    var parts = full.split("/").reverse();
    var absolute = [ "" ];
    while (parts.length) {
      var part = parts.pop();
      if (part == "" || part == ".") {} else if (part == "..") {
        if (absolute.length > 1) absolute.pop();
      } else {
        absolute.push(part);
      }
    }
    return absolute.length == 1 ? "/" : absolute.join("/");
  }),
  analyzePath: (function(path, dontResolveLastLink, linksVisited) {
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null
    };
    path = FS.absolutePath(path);
    if (path == "/") {
      ret.isRoot = true;
      ret.exists = ret.parentExists = true;
      ret.name = "/";
      ret.path = ret.parentPath = "/";
      ret.object = ret.parentObject = FS.root;
    } else if (path !== null) {
      linksVisited = linksVisited || 0;
      path = path.slice(1).split("/");
      var current = FS.root;
      var traversed = [ "" ];
      while (path.length) {
        if (path.length == 1 && current.isFolder) {
          ret.parentExists = true;
          ret.parentPath = traversed.length == 1 ? "/" : traversed.join("/");
          ret.parentObject = current;
          ret.name = path[0];
        }
        var target = path.shift();
        if (!current.isFolder) {
          ret.error = ERRNO_CODES.ENOTDIR;
          break;
        } else if (!current.read) {
          ret.error = ERRNO_CODES.EACCES;
          break;
        } else if (!current.contents.hasOwnProperty(target)) {
          ret.error = ERRNO_CODES.ENOENT;
          break;
        }
        current = current.contents[target];
        if (current.link && !(dontResolveLastLink && path.length == 0)) {
          if (linksVisited > 40) {
            ret.error = ERRNO_CODES.ELOOP;
            break;
          }
          var link = FS.absolutePath(current.link, traversed.join("/"));
          ret = FS.analyzePath([ link ].concat(path).join("/"), dontResolveLastLink, linksVisited + 1);
          return ret;
        }
        traversed.push(target);
        if (path.length == 0) {
          ret.exists = true;
          ret.path = traversed.join("/");
          ret.object = current;
        }
      }
    }
    return ret;
  }),
  findObject: (function(path, dontResolveLastLink) {
    FS.ensureRoot();
    var ret = FS.analyzePath(path, dontResolveLastLink);
    if (ret.exists) {
      return ret.object;
    } else {
      ___setErrNo(ret.error);
      return null;
    }
  }),
  createObject: (function(parent, name, properties, canRead, canWrite) {
    if (!parent) parent = "/";
    if (typeof parent === "string") parent = FS.findObject(parent);
    if (!parent) {
      ___setErrNo(ERRNO_CODES.EACCES);
      throw new Error("Parent path must exist.");
    }
    if (!parent.isFolder) {
      ___setErrNo(ERRNO_CODES.ENOTDIR);
      throw new Error("Parent must be a folder.");
    }
    if (!parent.write && !FS.ignorePermissions) {
      ___setErrNo(ERRNO_CODES.EACCES);
      throw new Error("Parent folder must be writeable.");
    }
    if (!name || name == "." || name == "..") {
      ___setErrNo(ERRNO_CODES.ENOENT);
      throw new Error("Name must not be empty.");
    }
    if (parent.contents.hasOwnProperty(name)) {
      ___setErrNo(ERRNO_CODES.EEXIST);
      throw new Error("Can't overwrite object.");
    }
    parent.contents[name] = {
      read: canRead === undefined ? true : canRead,
      write: canWrite === undefined ? false : canWrite,
      timestamp: Date.now(),
      inodeNumber: FS.nextInode++
    };
    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        parent.contents[name][key] = properties[key];
      }
    }
    return parent.contents[name];
  }),
  createFolder: (function(parent, name, canRead, canWrite) {
    var properties = {
      isFolder: true,
      isDevice: false,
      contents: {}
    };
    return FS.createObject(parent, name, properties, canRead, canWrite);
  }),
  createPath: (function(parent, path, canRead, canWrite) {
    var current = FS.findObject(parent);
    if (current === null) throw new Error("Invalid parent.");
    path = path.split("/").reverse();
    while (path.length) {
      var part = path.pop();
      if (!part) continue;
      if (!current.contents.hasOwnProperty(part)) {
        FS.createFolder(current, part, canRead, canWrite);
      }
      current = current.contents[part];
    }
    return current;
  }),
  createFile: (function(parent, name, properties, canRead, canWrite) {
    properties.isFolder = false;
    return FS.createObject(parent, name, properties, canRead, canWrite);
  }),
  createDataFile: (function(parent, name, data, canRead, canWrite) {
    if (typeof data === "string") {
      var dataArray = new Array(data.length);
      for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
      data = dataArray;
    }
    var properties = {
      isDevice: false,
      contents: data
    };
    return FS.createFile(parent, name, properties, canRead, canWrite);
  }),
  createLazyFile: (function(parent, name, url, canRead, canWrite) {
    var properties = {
      isDevice: false,
      url: url
    };
    return FS.createFile(parent, name, properties, canRead, canWrite);
  }),
  createPreloadedFile: (function(parent, name, url, canRead, canWrite) {
    Browser.asyncLoad(url, (function(data) {
      FS.createDataFile(parent, name, data, canRead, canWrite);
    }));
  }),
  createLink: (function(parent, name, target, canRead, canWrite) {
    var properties = {
      isDevice: false,
      link: target
    };
    return FS.createFile(parent, name, properties, canRead, canWrite);
  }),
  createDevice: (function(parent, name, input, output) {
    if (!(input || output)) {
      throw new Error("A device must have at least one callback defined.");
    }
    var ops = {
      isDevice: true,
      input: input,
      output: output
    };
    return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
  }),
  forceLoadFile: (function(obj) {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
    var success = true;
    if (typeof XMLHttpRequest !== "undefined") {
      assert("Cannot do synchronous binary XHRs in modern browsers. Use --embed-file or --preload-file in emcc");
    } else if (Module["read"]) {
      try {
        obj.contents = intArrayFromString(Module["read"](obj.url), true);
      } catch (e) {
        success = false;
      }
    } else {
      throw new Error("Cannot load without read() or XMLHttpRequest.");
    }
    if (!success) ___setErrNo(ERRNO_CODES.EIO);
    return success;
  }),
  ensureRoot: (function() {
    if (FS.root) return;
    FS.root = {
      read: true,
      write: true,
      isFolder: true,
      isDevice: false,
      timestamp: Date.now(),
      inodeNumber: 1,
      contents: {}
    };
  }),
  init: (function(input, output, error) {
    assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
    FS.init.initialized = true;
    FS.ensureRoot();
    input = input || Module["stdin"];
    output = output || Module["stdout"];
    error = error || Module["stderr"];
    var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
    if (!input) {
      stdinOverridden = false;
      input = (function() {
        if (!input.cache || !input.cache.length) {
          var result;
          if (typeof window != "undefined" && typeof window.prompt == "function") {
            result = window.prompt("Input: ");
            if (result === null) result = String.fromCharCode(0);
          } else if (typeof readline == "function") {
            result = readline();
          }
          if (!result) result = "";
          input.cache = intArrayFromString(result + "\n", true);
        }
        return input.cache.shift();
      });
    }
    function simpleOutput(val) {
      if (val === null || val === "\n".charCodeAt(0)) {
        output.printer(output.buffer.join(""));
        output.buffer = [];
      } else {
        output.buffer.push(String.fromCharCode(val));
      }
    }
    if (!output) {
      stdoutOverridden = false;
      output = simpleOutput;
    }
    if (!output.printer) output.printer = Module["print"];
    if (!output.buffer) output.buffer = [];
    if (!error) {
      stderrOverridden = false;
      error = simpleOutput;
    }
    if (!error.printer) error.printer = Module["print"];
    if (!error.buffer) error.buffer = [];
    try {
      FS.createFolder("/", "tmp", true, true);
    } catch (e) {}
    var devFolder = FS.createFolder("/", "dev", true, true);
    var stdin = FS.createDevice(devFolder, "stdin", input);
    var stdout = FS.createDevice(devFolder, "stdout", null, output);
    var stderr = FS.createDevice(devFolder, "stderr", null, error);
    FS.createDevice(devFolder, "tty", input, output);
    FS.streams[1] = {
      path: "/dev/stdin",
      object: stdin,
      position: 0,
      isRead: true,
      isWrite: false,
      isAppend: false,
      isTerminal: !stdinOverridden,
      error: false,
      eof: false,
      ungotten: []
    };
    FS.streams[2] = {
      path: "/dev/stdout",
      object: stdout,
      position: 0,
      isRead: false,
      isWrite: true,
      isAppend: false,
      isTerminal: !stdoutOverridden,
      error: false,
      eof: false,
      ungotten: []
    };
    FS.streams[3] = {
      path: "/dev/stderr",
      object: stderr,
      position: 0,
      isRead: false,
      isWrite: true,
      isAppend: false,
      isTerminal: !stderrOverridden,
      error: false,
      eof: false,
      ungotten: []
    };
    _stdin = allocate([ 1 ], "void*", ALLOC_STATIC);
    _stdout = allocate([ 2 ], "void*", ALLOC_STATIC);
    _stderr = allocate([ 3 ], "void*", ALLOC_STATIC);
    FS.createPath("/", "dev/shm/tmp", true, true);
    FS.streams[_stdin] = FS.streams[1];
    FS.streams[_stdout] = FS.streams[2];
    FS.streams[_stderr] = FS.streams[3];
    __impure_ptr = allocate([ allocate([ 0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0 ], "void*", ALLOC_STATIC) ], "void*", ALLOC_STATIC);
  }),
  quit: (function() {
    if (!FS.init.initialized) return;
    if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output("\n".charCodeAt(0));
    if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output("\n".charCodeAt(0));
  }),
  standardizePath: (function(path) {
    if (path.substr(0, 2) == "./") path = path.substr(2);
    return path;
  }),
  deleteFile: (function(path) {
    var path = FS.analyzePath(path);
    if (!path.parentExists || !path.exists) {
      throw "Invalid path " + path;
    }
    delete path.parentObject.contents[path.name];
  })
};

function _pwrite(fildes, buf, nbyte, offset) {
  var stream = FS.streams[fildes];
  if (!stream || stream.object.isDevice) {
    ___setErrNo(ERRNO_CODES.EBADF);
    return -1;
  } else if (!stream.isWrite) {
    ___setErrNo(ERRNO_CODES.EACCES);
    return -1;
  } else if (stream.object.isFolder) {
    ___setErrNo(ERRNO_CODES.EISDIR);
    return -1;
  } else if (nbyte < 0 || offset < 0) {
    ___setErrNo(ERRNO_CODES.EINVAL);
    return -1;
  } else {
    var contents = stream.object.contents;
    while (contents.length < offset) contents.push(0);
    for (var i = 0; i < nbyte; i++) {
      contents[offset + i] = HEAPU8[buf + i];
    }
    stream.object.timestamp = Date.now();
    return i;
  }
}

function _write(fildes, buf, nbyte) {
  var stream = FS.streams[fildes];
  if (!stream) {
    ___setErrNo(ERRNO_CODES.EBADF);
    return -1;
  } else if (!stream.isWrite) {
    ___setErrNo(ERRNO_CODES.EACCES);
    return -1;
  } else if (nbyte < 0) {
    ___setErrNo(ERRNO_CODES.EINVAL);
    return -1;
  } else {
    if (stream.object.isDevice) {
      if (stream.object.output) {
        for (var i = 0; i < nbyte; i++) {
          try {
            stream.object.output(HEAP8[buf + i]);
          } catch (e) {
            ___setErrNo(ERRNO_CODES.EIO);
            return -1;
          }
        }
        stream.object.timestamp = Date.now();
        return i;
      } else {
        ___setErrNo(ERRNO_CODES.ENXIO);
        return -1;
      }
    } else {
      var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
      if (bytesWritten != -1) stream.position += bytesWritten;
      return bytesWritten;
    }
  }
}

function _fwrite(ptr, size, nitems, stream) {
  var bytesToWrite = nitems * size;
  if (bytesToWrite == 0) return 0;
  var bytesWritten = _write(stream, ptr, bytesToWrite);
  if (bytesWritten == -1) {
    if (FS.streams[stream]) FS.streams[stream].error = true;
    return -1;
  } else {
    return Math.floor(bytesWritten / size);
  }
}

function __formatString(format, varargs) {
  var textIndex = format;
  var argIndex = 0;
  function getNextArg(type) {
    var ret;
    if (type === "double") {
      ret = HEAPF32[varargs + argIndex >> 2];
    } else if (type == "i64") {
      ret = [ HEAP32[varargs + argIndex >> 2], HEAP32[varargs + (argIndex + 4) >> 2] ];
    } else {
      type = "i32";
      ret = HEAP32[varargs + argIndex >> 2];
    }
    argIndex += Runtime.getNativeFieldSize(type);
    return ret;
  }
  var ret = [];
  var curr, next, currArg;
  while (1) {
    var startTextIndex = textIndex;
    curr = HEAP8[textIndex];
    if (curr === 0) break;
    next = HEAP8[textIndex + 1];
    if (curr == "%".charCodeAt(0)) {
      var flagAlwaysSigned = false;
      var flagLeftAlign = false;
      var flagAlternative = false;
      var flagZeroPad = false;
      flagsLoop : while (1) {
        switch (next) {
         case "+".charCodeAt(0):
          flagAlwaysSigned = true;
          break;
         case "-".charCodeAt(0):
          flagLeftAlign = true;
          break;
         case "#".charCodeAt(0):
          flagAlternative = true;
          break;
         case "0".charCodeAt(0):
          if (flagZeroPad) {
            break flagsLoop;
          } else {
            flagZeroPad = true;
            break;
          }
         default:
          break flagsLoop;
        }
        textIndex++;
        next = HEAP8[textIndex + 1];
      }
      var width = 0;
      if (next == "*".charCodeAt(0)) {
        width = getNextArg("i32");
        textIndex++;
        next = HEAP8[textIndex + 1];
      } else {
        while (next >= "0".charCodeAt(0) && next <= "9".charCodeAt(0)) {
          width = width * 10 + (next - "0".charCodeAt(0));
          textIndex++;
          next = HEAP8[textIndex + 1];
        }
      }
      var precisionSet = false;
      if (next == ".".charCodeAt(0)) {
        var precision = 0;
        precisionSet = true;
        textIndex++;
        next = HEAP8[textIndex + 1];
        if (next == "*".charCodeAt(0)) {
          precision = getNextArg("i32");
          textIndex++;
        } else {
          while (1) {
            var precisionChr = HEAP8[textIndex + 1];
            if (precisionChr < "0".charCodeAt(0) || precisionChr > "9".charCodeAt(0)) break;
            precision = precision * 10 + (precisionChr - "0".charCodeAt(0));
            textIndex++;
          }
        }
        next = HEAP8[textIndex + 1];
      } else {
        var precision = 6;
      }
      var argSize;
      switch (String.fromCharCode(next)) {
       case "h":
        var nextNext = HEAP8[textIndex + 2];
        if (nextNext == "h".charCodeAt(0)) {
          textIndex++;
          argSize = 1;
        } else {
          argSize = 2;
        }
        break;
       case "l":
        var nextNext = HEAP8[textIndex + 2];
        if (nextNext == "l".charCodeAt(0)) {
          textIndex++;
          argSize = 8;
        } else {
          argSize = 4;
        }
        break;
       case "L":
       case "q":
       case "j":
        argSize = 8;
        break;
       case "z":
       case "t":
       case "I":
        argSize = 4;
        break;
       default:
        argSize = null;
      }
      if (argSize) textIndex++;
      next = HEAP8[textIndex + 1];
      if ([ "d", "i", "u", "o", "x", "X", "p" ].indexOf(String.fromCharCode(next)) != -1) {
        var signed = next == "d".charCodeAt(0) || next == "i".charCodeAt(0);
        argSize = argSize || 4;
        var currArg = getNextArg("i" + argSize * 8);
        var argText;
        if (argSize == 8) {
          currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == "u".charCodeAt(0));
        }
        if (argSize <= 4) {
          var limit = Math.pow(256, argSize) - 1;
          currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
        }
        var currAbsArg = Math.abs(currArg);
        var prefix = "";
        if (next == "d".charCodeAt(0) || next == "i".charCodeAt(0)) {
          argText = reSign(currArg, 8 * argSize, 1).toString(10);
        } else if (next == "u".charCodeAt(0)) {
          argText = unSign(currArg, 8 * argSize, 1).toString(10);
          currArg = Math.abs(currArg);
        } else if (next == "o".charCodeAt(0)) {
          argText = (flagAlternative ? "0" : "") + currAbsArg.toString(8);
        } else if (next == "x".charCodeAt(0) || next == "X".charCodeAt(0)) {
          prefix = flagAlternative ? "0x" : "";
          if (currArg < 0) {
            currArg = -currArg;
            argText = (currAbsArg - 1).toString(16);
            var buffer = [];
            for (var i = 0; i < argText.length; i++) {
              buffer.push((15 - parseInt(argText[i], 16)).toString(16));
            }
            argText = buffer.join("");
            while (argText.length < argSize * 2) argText = "f" + argText;
          } else {
            argText = currAbsArg.toString(16);
          }
          if (next == "X".charCodeAt(0)) {
            prefix = prefix.toUpperCase();
            argText = argText.toUpperCase();
          }
        } else if (next == "p".charCodeAt(0)) {
          if (currAbsArg === 0) {
            argText = "(nil)";
          } else {
            prefix = "0x";
            argText = currAbsArg.toString(16);
          }
        }
        if (precisionSet) {
          while (argText.length < precision) {
            argText = "0" + argText;
          }
        }
        if (flagAlwaysSigned) {
          if (currArg < 0) {
            prefix = "-" + prefix;
          } else {
            prefix = "+" + prefix;
          }
        }
        while (prefix.length + argText.length < width) {
          if (flagLeftAlign) {
            argText += " ";
          } else {
            if (flagZeroPad) {
              argText = "0" + argText;
            } else {
              prefix = " " + prefix;
            }
          }
        }
        argText = prefix + argText;
        argText.split("").forEach((function(chr) {
          ret.push(chr.charCodeAt(0));
        }));
      } else if ([ "f", "F", "e", "E", "g", "G" ].indexOf(String.fromCharCode(next)) != -1) {
        var currArg = getNextArg("double");
        var argText;
        if (isNaN(currArg)) {
          argText = "nan";
          flagZeroPad = false;
        } else if (!isFinite(currArg)) {
          argText = (currArg < 0 ? "-" : "") + "inf";
          flagZeroPad = false;
        } else {
          var isGeneral = false;
          var effectivePrecision = Math.min(precision, 20);
          if (next == "g".charCodeAt(0) || next == "G".charCodeAt(0)) {
            isGeneral = true;
            precision = precision || 1;
            var exponent = parseInt(currArg.toExponential(effectivePrecision).split("e")[1], 10);
            if (precision > exponent && exponent >= -4) {
              next = (next == "g".charCodeAt(0) ? "f" : "F").charCodeAt(0);
              precision -= exponent + 1;
            } else {
              next = (next == "g".charCodeAt(0) ? "e" : "E").charCodeAt(0);
              precision--;
            }
            effectivePrecision = Math.min(precision, 20);
          }
          if (next == "e".charCodeAt(0) || next == "E".charCodeAt(0)) {
            argText = currArg.toExponential(effectivePrecision);
            if (/[eE][-+]\d$/.test(argText)) {
              argText = argText.slice(0, -1) + "0" + argText.slice(-1);
            }
          } else if (next == "f".charCodeAt(0) || next == "F".charCodeAt(0)) {
            argText = currArg.toFixed(effectivePrecision);
          }
          var parts = argText.split("e");
          if (isGeneral && !flagAlternative) {
            while (parts[0].length > 1 && parts[0].indexOf(".") != -1 && (parts[0].slice(-1) == "0" || parts[0].slice(-1) == ".")) {
              parts[0] = parts[0].slice(0, -1);
            }
          } else {
            if (flagAlternative && argText.indexOf(".") == -1) parts[0] += ".";
            while (precision > effectivePrecision++) parts[0] += "0";
          }
          argText = parts[0] + (parts.length > 1 ? "e" + parts[1] : "");
          if (next == "E".charCodeAt(0)) argText = argText.toUpperCase();
          if (flagAlwaysSigned && currArg >= 0) {
            argText = "+" + argText;
          }
        }
        while (argText.length < width) {
          if (flagLeftAlign) {
            argText += " ";
          } else {
            if (flagZeroPad && (argText[0] == "-" || argText[0] == "+")) {
              argText = argText[0] + "0" + argText.slice(1);
            } else {
              argText = (flagZeroPad ? "0" : " ") + argText;
            }
          }
        }
        if (next < "a".charCodeAt(0)) argText = argText.toUpperCase();
        argText.split("").forEach((function(chr) {
          ret.push(chr.charCodeAt(0));
        }));
      } else if (next == "s".charCodeAt(0)) {
        var arg = getNextArg("i8*");
        var copiedString;
        if (arg) {
          copiedString = String_copy(arg);
          if (precisionSet && copiedString.length > precision) {
            copiedString = copiedString.slice(0, precision);
          }
        } else {
          copiedString = intArrayFromString("(null)", true);
        }
        if (!flagLeftAlign) {
          while (copiedString.length < width--) {
            ret.push(" ".charCodeAt(0));
          }
        }
        ret = ret.concat(copiedString);
        if (flagLeftAlign) {
          while (copiedString.length < width--) {
            ret.push(" ".charCodeAt(0));
          }
        }
      } else if (next == "c".charCodeAt(0)) {
        if (flagLeftAlign) ret.push(getNextArg("i8"));
        while (--width > 0) {
          ret.push(" ".charCodeAt(0));
        }
        if (!flagLeftAlign) ret.push(getNextArg("i8"));
      } else if (next == "n".charCodeAt(0)) {
        var ptr = getNextArg("i32*");
        HEAP32[ptr >> 2] = ret.length;
      } else if (next == "%".charCodeAt(0)) {
        ret.push(curr);
      } else {
        for (var i = startTextIndex; i < textIndex + 2; i++) {
          ret.push(HEAP8[i]);
        }
      }
      textIndex += 2;
    } else {
      ret.push(curr);
      textIndex += 1;
    }
  }
  return ret;
}

function _fprintf(stream, format, varargs) {
  var result = __formatString(format, varargs);
  var stack = Runtime.stackSave();
  var ret = _fwrite(allocate(result, "i8", ALLOC_STACK), 1, result.length, stream);
  Runtime.stackRestore(stack);
  return ret;
}

function _printf(format, varargs) {
  var stdout = HEAP32[_stdout >> 2];
  return _fprintf(stdout, format, varargs);
}

function __exit(status) {
  exitRuntime();
  ABORT = true;
  throw "exit(" + status + ") called, at " + (new Error).stack;
}

function _exit(status) {
  __exit(status);
}

var ___dirent_struct_layout = null;

function _open(path, oflag, varargs) {
  var mode = HEAP32[varargs >> 2];
  var accessMode = oflag & 3;
  var isWrite = accessMode != 0;
  var isRead = accessMode != 1;
  var isCreate = Boolean(oflag & 512);
  var isExistCheck = Boolean(oflag & 2048);
  var isTruncate = Boolean(oflag & 1024);
  var isAppend = Boolean(oflag & 8);
  var origPath = path;
  path = FS.analyzePath(Pointer_stringify(path));
  if (!path.parentExists) {
    ___setErrNo(path.error);
    return -1;
  }
  var target = path.object || null;
  var finalPath;
  if (target) {
    if (isCreate && isExistCheck) {
      ___setErrNo(ERRNO_CODES.EEXIST);
      return -1;
    }
    if ((isWrite || isCreate || isTruncate) && target.isFolder) {
      ___setErrNo(ERRNO_CODES.EISDIR);
      return -1;
    }
    if (isRead && !target.read || isWrite && !target.write) {
      ___setErrNo(ERRNO_CODES.EACCES);
      return -1;
    }
    if (isTruncate && !target.isDevice) {
      target.contents = [];
    } else {
      if (!FS.forceLoadFile(target)) {
        ___setErrNo(ERRNO_CODES.EIO);
        return -1;
      }
    }
    finalPath = path.path;
  } else {
    if (!isCreate) {
      ___setErrNo(ERRNO_CODES.ENOENT);
      return -1;
    }
    if (!path.parentObject.write) {
      ___setErrNo(ERRNO_CODES.EACCES);
      return -1;
    }
    target = FS.createDataFile(path.parentObject, path.name, [], mode & 256, mode & 128);
    finalPath = path.parentPath + "/" + path.name;
  }
  var id = FS.streams.length;
  if (target.isFolder) {
    var entryBuffer = 0;
    if (___dirent_struct_layout) {
      entryBuffer = _malloc(___dirent_struct_layout.__size__);
    }
    var contents = [];
    for (var key in target.contents) contents.push(key);
    FS.streams[id] = {
      path: finalPath,
      object: target,
      position: -2,
      isRead: true,
      isWrite: false,
      isAppend: false,
      error: false,
      eof: false,
      ungotten: [],
      contents: contents,
      currentEntry: entryBuffer
    };
  } else {
    FS.streams[id] = {
      path: finalPath,
      object: target,
      position: 0,
      isRead: isRead,
      isWrite: isWrite,
      isAppend: isAppend,
      error: false,
      eof: false,
      ungotten: []
    };
  }
  return id;
}

function _fopen(filename, mode) {
  var flags;
  mode = Pointer_stringify(mode);
  if (mode[0] == "r") {
    if (mode.indexOf("+") != -1) {
      flags = 2;
    } else {
      flags = 0;
    }
  } else if (mode[0] == "w") {
    if (mode.indexOf("+") != -1) {
      flags = 2;
    } else {
      flags = 1;
    }
    flags |= 512;
    flags |= 1024;
  } else if (mode[0] == "a") {
    if (mode.indexOf("+") != -1) {
      flags = 2;
    } else {
      flags = 1;
    }
    flags |= 512;
    flags |= 8;
  } else {
    ___setErrNo(ERRNO_CODES.EINVAL);
    return 0;
  }
  var ret = _open(filename, flags, allocate([ 511, 0, 0, 0 ], "i32", ALLOC_STACK));
  return ret == -1 ? 0 : ret;
}

function _close(fildes) {
  if (FS.streams[fildes]) {
    if (FS.streams[fildes].currentEntry) {
      _free(FS.streams[fildes].currentEntry);
    }
    delete FS.streams[fildes];
    return 0;
  } else {
    ___setErrNo(ERRNO_CODES.EBADF);
    return -1;
  }
}

function _fsync(fildes) {
  if (FS.streams[fildes]) {
    return 0;
  } else {
    ___setErrNo(ERRNO_CODES.EBADF);
    return -1;
  }
}

function _fclose(stream) {
  _fsync(stream);
  return _close(stream);
}

function _memcpy(dest, src, num, align) {
  if (num >= 20 && src % 2 == dest % 2) {
    if (src % 4 == dest % 4) {
      var stop = src + num;
      while (src % 4) {
        HEAP8[dest++] = HEAP8[src++];
      }
      var src4 = src >> 2, dest4 = dest >> 2, stop4 = stop >> 2;
      while (src4 < stop4) {
        HEAP32[dest4++] = HEAP32[src4++];
      }
      src = src4 << 2;
      dest = dest4 << 2;
      while (src < stop) {
        HEAP8[dest++] = HEAP8[src++];
      }
    } else {
      var stop = src + num;
      if (src % 2) {
        HEAP8[dest++] = HEAP8[src++];
      }
      var src2 = src >> 1, dest2 = dest >> 1, stop2 = stop >> 1;
      while (src2 < stop2) {
        HEAP16[dest2++] = HEAP16[src2++];
      }
      src = src2 << 1;
      dest = dest2 << 1;
      if (src < stop) {
        HEAP8[dest++] = HEAP8[src++];
      }
    }
  } else {
    while (num--) {
      HEAP8[dest++] = HEAP8[src++];
    }
  }
}

var _llvm_memcpy_p0i8_p0i8_i32 = _memcpy;

function _memset(ptr, value, num, align) {
  if (num >= 20) {
    var stop = ptr + num;
    while (ptr % 4) {
      HEAP8[ptr++] = value;
    }
    if (value < 0) value += 256;
    var ptr4 = ptr >> 2, stop4 = stop >> 2, value4 = value | value << 8 | value << 16 | value << 24;
    while (ptr4 < stop4) {
      HEAP32[ptr4++] = value4;
    }
    ptr = ptr4 << 2;
    while (ptr < stop) {
      HEAP8[ptr++] = value;
    }
  } else {
    while (num--) {
      HEAP8[ptr++] = value;
    }
  }
}

var _llvm_memset_p0i8_i32 = _memset;

function _tolower(chr) {
  if (chr >= "A".charCodeAt(0) && chr <= "Z".charCodeAt(0)) {
    return chr - "A".charCodeAt(0) + "a".charCodeAt(0);
  } else {
    return chr;
  }
}

function _strlen(ptr) {
  return String_len(ptr);
}

function _pread(fildes, buf, nbyte, offset) {
  var stream = FS.streams[fildes];
  if (!stream || stream.object.isDevice) {
    ___setErrNo(ERRNO_CODES.EBADF);
    return -1;
  } else if (!stream.isRead) {
    ___setErrNo(ERRNO_CODES.EACCES);
    return -1;
  } else if (stream.object.isFolder) {
    ___setErrNo(ERRNO_CODES.EISDIR);
    return -1;
  } else if (nbyte < 0 || offset < 0) {
    ___setErrNo(ERRNO_CODES.EINVAL);
    return -1;
  } else {
    var bytesRead = 0;
    while (stream.ungotten.length && nbyte > 0) {
      HEAP8[buf++] = stream.ungotten.pop();
      nbyte--;
      bytesRead++;
    }
    var contents = stream.object.contents;
    var size = Math.min(contents.length - offset, nbyte);
    for (var i = 0; i < size; i++) {
      HEAP8[buf + i] = contents[offset + i];
      bytesRead++;
    }
    return bytesRead;
  }
}

function _read(fildes, buf, nbyte) {
  var stream = FS.streams[fildes];
  if (!stream) {
    ___setErrNo(ERRNO_CODES.EBADF);
    return -1;
  } else if (!stream.isRead) {
    ___setErrNo(ERRNO_CODES.EACCES);
    return -1;
  } else if (nbyte < 0) {
    ___setErrNo(ERRNO_CODES.EINVAL);
    return -1;
  } else {
    var bytesRead;
    if (stream.object.isDevice) {
      if (stream.object.input) {
        bytesRead = 0;
        while (stream.ungotten.length && nbyte > 0) {
          HEAP8[buf++] = stream.ungotten.pop();
          nbyte--;
          bytesRead++;
        }
        for (var i = 0; i < nbyte; i++) {
          try {
            var result = stream.object.input();
          } catch (e) {
            ___setErrNo(ERRNO_CODES.EIO);
            return -1;
          }
          if (result === null || result === undefined) break;
          bytesRead++;
          HEAP8[buf + i] = result;
        }
        return bytesRead;
      } else {
        ___setErrNo(ERRNO_CODES.ENXIO);
        return -1;
      }
    } else {
      var ungotSize = stream.ungotten.length;
      bytesRead = _pread(fildes, buf, nbyte, stream.position);
      if (bytesRead != -1) {
        stream.position += stream.ungotten.length - ungotSize + bytesRead;
      }
      return bytesRead;
    }
  }
}

function _fgetc(stream) {
  if (!(stream in FS.streams)) return -1;
  var streamObj = FS.streams[stream];
  if (streamObj.eof || streamObj.error) return -1;
  var ret = _read(stream, _fgetc.ret, 1);
  if (ret == 0) {
    streamObj.eof = true;
    return -1;
  } else if (ret == -1) {
    streamObj.error = true;
    return -1;
  } else {
    return HEAP8[_fgetc.ret];
  }
}

function _fputc(c, stream) {
  var chr = unSign(c & 255);
  HEAP8[_fputc.ret] = chr;
  var ret = _write(stream, _fputc.ret, 1);
  if (ret == -1) {
    if (stream in FS.streams) FS.streams[stream].error = true;
    return -1;
  } else {
    return chr;
  }
}

function _lseek(fildes, offset, whence) {
  if (FS.streams[fildes] && !FS.streams[fildes].isDevice) {
    var stream = FS.streams[fildes];
    var position = offset;
    if (whence === 1) {
      position += stream.position;
    } else if (whence === 2) {
      position += stream.object.contents.length;
    }
    if (position < 0) {
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    } else {
      stream.ungotten = [];
      stream.position = position;
      return position;
    }
  } else {
    ___setErrNo(ERRNO_CODES.EBADF);
    return -1;
  }
}

function _fseek(stream, offset, whence) {
  var ret = _lseek(stream, offset, whence);
  if (ret == -1) {
    return -1;
  } else {
    FS.streams[stream].eof = false;
    return 0;
  }
}

function ___gxx_personality_v0() {}

var __ZSt9terminatev;

function ___cxa_pure_virtual() {
  ABORT = true;
  throw "Pure virtual function called!";
}

var __ZNSt9type_infoD2Ev;

var _llvm_memset_p0i8_i64 = _memset;

var _llvm_expect_i32;

function _abort() {
  ABORT = true;
  throw "abort() at " + (new Error).stack;
}

function _sysconf(name) {
  switch (name) {
   case 8:
    return PAGE_SIZE;
   case 54:
   case 56:
   case 21:
   case 61:
   case 63:
   case 22:
   case 67:
   case 23:
   case 24:
   case 25:
   case 26:
   case 27:
   case 69:
   case 28:
   case 101:
   case 70:
   case 71:
   case 29:
   case 30:
   case 199:
   case 75:
   case 76:
   case 32:
   case 43:
   case 44:
   case 80:
   case 46:
   case 47:
   case 45:
   case 48:
   case 49:
   case 42:
   case 82:
   case 33:
   case 7:
   case 108:
   case 109:
   case 107:
   case 112:
   case 119:
   case 121:
    return 200809;
   case 13:
   case 104:
   case 94:
   case 95:
   case 34:
   case 35:
   case 77:
   case 81:
   case 83:
   case 84:
   case 85:
   case 86:
   case 87:
   case 88:
   case 89:
   case 90:
   case 91:
   case 94:
   case 95:
   case 110:
   case 111:
   case 113:
   case 114:
   case 115:
   case 116:
   case 117:
   case 118:
   case 120:
   case 40:
   case 16:
   case 79:
   case 19:
    return -1;
   case 92:
   case 93:
   case 5:
   case 72:
   case 6:
   case 74:
   case 92:
   case 93:
   case 96:
   case 97:
   case 98:
   case 99:
   case 102:
   case 103:
   case 105:
    return 1;
   case 38:
   case 66:
   case 50:
   case 51:
   case 4:
    return 1024;
   case 15:
   case 64:
   case 41:
    return 32;
   case 55:
   case 37:
   case 17:
    return 2147483647;
   case 18:
   case 1:
    return 47839;
   case 59:
   case 57:
    return 99;
   case 68:
   case 58:
    return 2048;
   case 0:
    return 2097152;
   case 3:
    return 65536;
   case 14:
    return 32768;
   case 73:
    return 32767;
   case 39:
    return 16384;
   case 60:
    return 1e3;
   case 106:
    return 700;
   case 52:
    return 256;
   case 62:
    return 255;
   case 2:
    return 100;
   case 65:
    return 64;
   case 36:
    return 20;
   case 100:
    return 16;
   case 20:
    return 6;
   case 53:
    return 4;
  }
  ___setErrNo(ERRNO_CODES.EINVAL);
  return -1;
}

function _time(ptr) {
  var ret = Math.floor(Date.now() / 1e3);
  if (ptr) {
    HEAP32[ptr >> 2] = ret;
  }
  return ret;
}

function ___errno_location() {
  return ___setErrNo.ret;
}

var ___errno = ___errno_location;

function _sbrk(bytes) {
  var self = _sbrk;
  if (!self.called) {
    STATICTOP = alignMemoryPage(STATICTOP);
    self.called = true;
    _sbrk.DYNAMIC_START = STATICTOP;
  }
  var ret = STATICTOP;
  if (bytes != 0) Runtime.staticAlloc(bytes);
  return ret;
}

__ATINIT__.unshift({
  func: (function() {
    if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
  })
});

__ATMAIN__.push({
  func: (function() {
    FS.ignorePermissions = false;
  })
});

__ATEXIT__.push({
  func: (function() {
    FS.quit();
  })
});

___setErrNo(0);

_fgetc.ret = allocate([ 0 ], "i8", ALLOC_STATIC);

_fputc.ret = allocate([ 0 ], "i8", ALLOC_STATIC);

Module.callMain = function callMain(args) {
  var argc = args.length + 1;
  function pad() {
    for (var i = 0; i < 4 - 1; i++) {
      argv.push(0);
    }
  }
  var argv = [ allocate(intArrayFromString("/bin/this.program"), "i8", ALLOC_STATIC) ];
  pad();
  for (var i = 0; i < argc - 1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), "i8", ALLOC_STATIC));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, "i32", ALLOC_STATIC);
  return _main(argc, argv, 0);
};

var _dpi;

var _verbose;

var _warnings;

var _image;

var _bitmap;

var _stderr;

var _qwe_loadrender_djvu_calls;

var _qwe_djvu_width_var;

var _qwe_djvu_height_var;

var _temp;

var _alive_bitmap_counter;

var _artifact_sizes;

var __ZTV7Watcher;

var __ZTI7Watcher;

var __ZL10ZP_p_table;

var __ZL10ZP_m_table;

var __ZL6initer;

var __ZTV15ZPMemoryWatcher;

var __ZTI15ZPMemoryWatcher;

var __ZL12ZP_FFZ_table;

__ATINIT__ = __ATINIT__.concat([ {
  func: __GLOBAL__I_a
} ]);

var __ZTISt9type_info;

var __ZTIN10__cxxabiv116__shim_type_infoE;

var __ZTIN10__cxxabiv117__class_type_infoE;

var __ZTVN10__cxxabiv117__class_type_infoE;

var __ZTVN10__cxxabiv120__si_class_type_infoE;

var __ZTIN10__cxxabiv120__si_class_type_infoE;

var __gm_;

var _mparams;

var __ZN10JB2DecoderC1EP7__sFILEi;

var __ZN15ZPMemoryWatcherD1Ev;

var __ZN12ZPNumContextC1EiiP15ZPMemoryWatcher;

var __ZN12ZPNumContextD1Ev;

var __ZN9ZPDecoderC1EP7__sFILEi;

var __ZN10__cxxabiv117__class_type_infoD1Ev;

var __ZN10__cxxabiv117__class_type_infoD2Ev;

var __ZN10__cxxabiv120__si_class_type_infoD1Ev;

var __ZN10__cxxabiv120__si_class_type_infoD2Ev;

_dpi = allocate([ 300 ], [ "i32", 0, 0, 0, 0 ], ALLOC_STATIC);

_verbose = allocate(1, "i32", ALLOC_STATIC);

_warnings = allocate(1, "i32", ALLOC_STATIC);

_image = allocate(1, "%struct.MinidjvuImage*", ALLOC_STATIC);

_bitmap = allocate(1, "%struct.MinidjvuBitmap*", ALLOC_STATIC);

STRING_TABLE.__str = allocate([ 47, 98, 109, 112, 46, 98, 109, 112, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str1 = allocate([ 115, 97, 118, 105, 110, 103, 32, 116, 111, 32, 87, 105, 110, 100, 111, 119, 115, 32, 66, 77, 80, 32, 102, 105, 108, 101, 32, 96, 37, 115, 39, 10, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str2 = allocate([ 115, 97, 118, 105, 110, 103, 32, 116, 111, 32, 84, 73, 70, 70, 32, 102, 105, 108, 101, 32, 96, 37, 115, 39, 10, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str3 = allocate([ 115, 97, 118, 105, 110, 103, 32, 116, 111, 32, 80, 66, 77, 32, 102, 105, 108, 101, 32, 96, 37, 115, 39, 10, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str4 = allocate([ 37, 115, 58, 32, 37, 115, 10, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str5 = allocate([ 46, 116, 105, 102, 102, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str6 = allocate([ 46, 116, 105, 102, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str7 = allocate([ 46, 98, 109, 112, 0 ], "i8", ALLOC_STATIC);

_qwe_loadrender_djvu_calls = allocate(1, "i32", ALLOC_STATIC);

STRING_TABLE.__str8 = allocate([ 100, 106, 118, 117, 0 ], "i8", ALLOC_STATIC);

_qwe_djvu_width_var = allocate(1, "i32", ALLOC_STATIC);

_qwe_djvu_height_var = allocate(1, "i32", ALLOC_STATIC);

_temp = allocate(1, "i32", ALLOC_STATIC);

STRING_TABLE.__str9 = allocate([ 108, 111, 97, 100, 105, 110, 103, 32, 97, 32, 68, 106, 86, 117, 32, 112, 97, 103, 101, 32, 102, 114, 111, 109, 32, 96, 37, 115, 39, 10, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str10 = allocate([ 108, 111, 97, 100, 101, 100, 59, 32, 116, 104, 101, 32, 112, 97, 103, 101, 32, 104, 97, 115, 32, 37, 100, 32, 98, 105, 116, 109, 97, 112, 115, 32, 97, 110, 100, 32, 37, 100, 32, 98, 108, 105, 116, 115, 10, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str19 = allocate([ 117, 110, 97, 98, 108, 101, 32, 116, 111, 32, 119, 114, 105, 116, 101, 32, 116, 111, 32, 102, 105, 108, 101, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str120 = allocate([ 117, 110, 97, 98, 108, 101, 32, 116, 111, 32, 114, 101, 97, 100, 32, 102, 114, 111, 109, 32, 102, 105, 108, 101, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str221 = allocate([ 73, 47, 79, 32, 101, 114, 114, 111, 114, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str322 = allocate([ 98, 97, 100, 32, 80, 66, 77, 32, 102, 105, 108, 101, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str423 = allocate([ 98, 97, 100, 32, 87, 105, 110, 100, 111, 119, 115, 32, 66, 77, 80, 32, 102, 105, 108, 101, 32, 40, 112, 101, 114, 104, 97, 112, 115, 32, 105, 116, 32, 104, 97, 115, 32, 110, 111, 110, 45, 98, 105, 116, 111, 110, 97, 108, 32, 100, 97, 116, 97, 41, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str524 = allocate([ 98, 97, 100, 32, 68, 106, 86, 117, 32, 102, 105, 108, 101, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str625 = allocate([ 98, 97, 100, 32, 98, 105, 108, 101, 118, 101, 108, 32, 100, 97, 116, 97, 32, 105, 110, 32, 68, 106, 86, 117, 32, 102, 105, 108, 101, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str726 = allocate([ 98, 97, 100, 32, 84, 73, 70, 70, 32, 102, 105, 108, 101, 32, 40, 112, 101, 114, 104, 97, 112, 115, 32, 105, 116, 32, 104, 97, 115, 32, 110, 111, 110, 45, 98, 105, 116, 111, 110, 97, 108, 32, 100, 97, 116, 97, 41, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str827 = allocate([ 117, 110, 115, 117, 112, 112, 111, 114, 116, 101, 100, 32, 116, 121, 112, 101, 32, 111, 102, 32, 68, 106, 86, 117, 32, 102, 105, 108, 101, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str928 = allocate([ 98, 105, 108, 101, 118, 101, 108, 32, 100, 97, 116, 97, 32, 110, 111, 116, 32, 102, 111, 117, 110, 100, 32, 105, 110, 32, 68, 106, 86, 117, 32, 102, 105, 108, 101, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str1029 = allocate([ 115, 111, 109, 101, 104, 111, 119, 32, 112, 114, 111, 116, 111, 116, 121, 112, 101, 32, 114, 101, 102, 101, 114, 101, 110, 99, 101, 115, 32, 114, 101, 99, 117, 114, 115, 101, 100, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str1130 = allocate([ 109, 105, 110, 105, 100, 106, 118, 117, 32, 119, 97, 115, 32, 99, 111, 109, 112, 105, 108, 101, 100, 32, 119, 105, 116, 104, 111, 117, 116, 32, 84, 73, 70, 70, 32, 115, 117, 112, 112, 111, 114, 116, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str1231 = allocate([ 109, 105, 110, 105, 100, 106, 118, 117, 32, 119, 97, 115, 32, 99, 111, 109, 112, 105, 108, 101, 100, 32, 119, 105, 116, 104, 111, 117, 116, 32, 80, 78, 71, 32, 115, 117, 112, 112, 111, 114, 116, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str1332 = allocate([ 115, 111, 109, 101, 32, 119, 101, 105, 114, 100, 32, 101, 114, 114, 111, 114, 32, 104, 97, 112, 112, 101, 110, 101, 100, 44, 32, 112, 114, 111, 98, 97, 98, 108, 121, 32, 99, 97, 117, 115, 101, 100, 32, 98, 121, 32, 97, 32, 98, 117, 103, 32, 105, 110, 32, 109, 105, 110, 105, 100, 106, 118, 117, 0 ], "i8", ALLOC_STATIC);

_alive_bitmap_counter = allocate(1, "i32", ALLOC_STATIC);

_artifact_sizes = allocate([ 4, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 8, 0, 0, 0 ], [ "i32", 0, 0, 0, "i32", 0, 0, 0, "i32", 0, 0, 0, "i32", 0, 0, 0, "i32", 0, 0, 0, "i32", 0, 0, 0, "i32", 0, 0, 0 ], ALLOC_STATIC);

STRING_TABLE.__str97 = allocate([ 119, 98, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str99 = allocate([ 114, 98, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str115 = allocate([ 119, 98, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__str1116 = allocate([ 80, 52, 10, 37, 100, 32, 37, 100, 10, 0 ], "i8", ALLOC_STATIC);

__ZTV7Watcher = allocate([ 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 4, 0, 0, 0, 6, 0, 0, 0 ], [ "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0 ], ALLOC_STATIC);

allocate(1, "void*", ALLOC_STATIC);

STRING_TABLE.__ZTS7Watcher = allocate([ 55, 87, 97, 116, 99, 104, 101, 114, 0 ], "i8", ALLOC_STATIC);

__ZTI7Watcher = allocate(12, "*", ALLOC_STATIC);

__ZL10ZP_p_table = allocate([ -32768, 0, -32768, 0, -32768, 0, 27581, 0, 27581, 0, 23877, 0, 23877, 0, 20921, 0, 20921, 0, 18451, 0, 18451, 0, 16341, 0, 16341, 0, 14513, 0, 14513, 0, 12917, 0, 12917, 0, 11517, 0, 11517, 0, 10277, 0, 10277, 0, 9131, 0, 9131, 0, 8071, 0, 8071, 0, 7099, 0, 7099, 0, 6213, 0, 6213, 0, 5411, 0, 5411, 0, 4691, 0, 4691, 0, 4047, 0, 4047, 0, 3477, 0, 3477, 0, 2973, 0, 2973, 0, 2531, 0, 2531, 0, 2145, 0, 2145, 0, 1809, 0, 1809, 0, 1521, 0, 1521, 0, 1273, 0, 1273, 0, 1061, 0, 1061, 0, 881, 0, 881, 0, 729, 0, 729, 0, 601, 0, 601, 0, 493, 0, 493, 0, 403, 0, 403, 0, 329, 0, 329, 0, 267, 0, 267, 0, 213, 0, 213, 0, 165, 0, 165, 0, 123, 0, 123, 0, 87, 0, 87, 0, 59, 0, 59, 0, 35, 0, 35, 0, 19, 0, 19, 0, 7, 0, 7, 0, 1, 0, 1, 0, 22165, 0, 9454, 0, -32768, 0, 3376, 0, 18458, 0, 1153, 0, 13689, 0, 378, 0, 9455, 0, 123, 0, 6520, 0, 40, 0, 4298, 0, 13, 0, 2909, 0, 52, 0, 1930, 0, 160, 0, 1295, 0, 279, 0, 856, 0, 490, 0, 564, 0, 324, 0, 371, 0, 564, 0, 245, 0, 851, 0, 161, 0, 1477, 0, 282, 0, 975, 0, 426, 0, 645, 0, 646, 0, 427, 0, 979, 0, 282, 0, 1477, 0, 186, 0, 2221, 0, 122, 0, 3276, 0, 491, 0, 4866, 0, 742, 0, 7041, 0, 1118, 0, 9455, 0, 1680, 0, 10341, 0, 2526, 0, 14727, 0, 3528, 0, 11417, 0, 4298, 0, 15199, 0, 2909, 0, 22165, 0, 1930, 0, -32768, 0, 1295, 0, 9454, 0, 856, 0, 3376, 0, 564, 0, 1153, 0, 371, 0, 378, 0, 245, 0, 123, 0, 161, 0, 40, 0, 282, 0, 13, 0, 426, 0, 52, 0, 646, 0, 160, 0, 979, 0, 279, 0, 1477, 0, 490, 0, 2221, 0, 324, 0, 3276, 0, 564, 0, 4866, 0, 851, 0, 7041, 0, 1477, 0, 9455, 0, 975, 0, 11124, 0, 645, 0, 8221, 0, 427, 0, 5909, 0, 282, 0, 4023, 0, 186, 0, 2663, 0, 491, 0, 1767, 0, 742, 0, 1174, 0, 1118, 0, 781, 0, 1680, 0, 518, 0, 2526, 0, 341, 0, 3528, 0, 225, 0, 11124, 0, 148, 0, 8221, 0, 392, 0, 5909, 0, 594, 0, 4023, 0, 899, 0, 2663, 0, 1351, 0, 1767, 0, 2018, 0, 1174, 0, 3008, 0, 781, 0, 4472, 0, 518, 0, 6618, 0, 341, 0, 9455, 0, 225, 0, 12814, 0, 148, 0, 17194, 0, 392, 0, 17533, 0, 594, 0, 24270, 0, 899, 0, -32768, 0, 1351, 0, 18458, 0, 2018, 0, 13689, 0, 3008, 0, 9455, 0, 4472, 0, 6520, 0, 6618, 0, 10341, 0, 9455, 0, 14727, 0, 12814, 0, 11417, 0, 17194, 0, 15199, 0, 17533, 0, 22165, 0, 24270, 0, -32768, 0, -32768, 0, 22165, 0, 18458, 0, 18458, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0 ], ALLOC_STATIC);

__ZL10ZP_m_table = allocate([ 0, 0, 0, 0, 0, 0, 4261, 0, 4261, 0, 7976, 0, 7976, 0, 11219, 0, 11219, 0, 14051, 0, 14051, 0, 16524, 0, 16524, 0, 18685, 0, 18685, 0, 20573, 0, 20573, 0, 22224, 0, 22224, 0, 23665, 0, 23665, 0, 24923, 0, 24923, 0, 26021, 0, 26021, 0, 26978, 0, 26978, 0, 27810, 0, 27810, 0, 28532, 0, 28532, 0, 29158, 0, 29158, 0, 29700, 0, 29700, 0, 30166, 0, 30166, 0, 30568, 0, 30568, 0, 30914, 0, 30914, 0, 31210, 0, 31210, 0, 31463, 0, 31463, 0, 31678, 0, 31678, 0, 31861, 0, 31861, 0, 32015, 0, 32015, 0, 32145, 0, 32145, 0, 32254, 0, 32254, 0, 32346, 0, 32346, 0, 32422, 0, 32422, 0, 32486, 0, 32486, 0, 32538, 0, 32538, 0, 32581, 0, 32581, 0, 32619, 0, 32619, 0, 32653, 0, 32653, 0, 32682, 0, 32682, 0, 32707, 0, 32707, 0, 32727, 0, 32727, 0, 32743, 0, 32743, 0, 32754, 0, 32754, 0, 32762, 0, 32762, 0, 32767, 0, 32767, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0, "i16", 0 ], ALLOC_STATIC);

STRING_TABLE.__ZL11ZP_up_table = allocate([ 84, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 81, 82, 9, 86, 5, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 82, 99, 76, 101, 70, 103, 66, 105, 106, 107, 66, 109, 60, 111, 56, 69, 114, 65, 116, 61, 118, 57, 120, 53, 122, 49, 124, 43, 72, 39, 60, 33, 56, 29, 52, 23, 48, 23, 42, 137, 38, 21, 140, 15, 142, 9, 144, 141, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 70, 157, 66, 81, 62, 75, 58, 69, 54, 65, 50, 167, 44, 65, 40, 59, 34, 55, 30, 175, 24, 177, 178, 179, 180, 181, 182, 183, 184, 69, 186, 59, 188, 55, 190, 51, 192, 47, 194, 41, 196, 37, 198, 199, 72, 201, 62, 203, 58, 205, 54, 207, 50, 209, 46, 211, 40, 213, 36, 215, 30, 217, 26, 219, 20, 71, 14, 61, 14, 57, 8, 53, 228, 49, 230, 45, 232, 39, 234, 35, 138, 29, 24, 25, 240, 19, 22, 13, 16, 13, 10, 7, 244, 249, 10, 89, 230, 0, 0, 0, 0, 0 ], "i8", ALLOC_STATIC);

STRING_TABLE.__ZL11ZP_dn_table = allocate([ 145, 4, 3, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 85, 226, 6, 176, 143, 138, 141, 112, 135, 104, 133, 100, 129, 98, 127, 72, 125, 102, 123, 60, 121, 110, 119, 108, 117, 54, 115, 48, 113, 134, 59, 132, 55, 130, 51, 128, 47, 126, 41, 62, 37, 66, 31, 54, 25, 50, 131, 46, 17, 40, 15, 136, 7, 32, 139, 172, 9, 170, 85, 168, 248, 166, 247, 164, 197, 162, 95, 160, 173, 158, 165, 156, 161, 60, 159, 56, 71, 52, 163, 48, 59, 42, 171, 38, 169, 32, 53, 26, 47, 174, 193, 18, 191, 222, 189, 218, 187, 216, 185, 214, 61, 212, 53, 210, 49, 208, 45, 206, 39, 204, 195, 202, 31, 200, 243, 64, 239, 56, 237, 52, 235, 48, 233, 44, 231, 38, 229, 34, 227, 28, 225, 22, 223, 16, 221, 220, 63, 8, 55, 224, 51, 2, 47, 87, 43, 246, 37, 244, 33, 238, 27, 236, 21, 16, 15, 8, 241, 242, 7, 10, 245, 2, 1, 83, 250, 2, 143, 246, 0, 0, 0, 0, 0 ], "i8", ALLOC_STATIC);

__ZL6initer = allocate(1, "i8", ALLOC_STATIC);

__ZTV15ZPMemoryWatcher = allocate([ 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 10, 0, 0, 0, 12, 0, 0, 0 ], [ "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0 ], ALLOC_STATIC);

allocate(1, "void*", ALLOC_STATIC);

STRING_TABLE.__ZTS15ZPMemoryWatcher = allocate([ 49, 53, 90, 80, 77, 101, 109, 111, 114, 121, 87, 97, 116, 99, 104, 101, 114, 0 ], "i8", ALLOC_STATIC);

__ZTI15ZPMemoryWatcher = allocate(8, "*", ALLOC_STATIC);

__ZL12ZP_FFZ_table = allocate(256, "i8", ALLOC_STATIC);

STRING_TABLE.__ZTSN10__cxxabiv116__shim_type_infoE = allocate([ 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 49, 54, 95, 95, 115, 104, 105, 109, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0 ], "i8", ALLOC_STATIC);

__ZTIN10__cxxabiv116__shim_type_infoE = allocate(12, "*", ALLOC_STATIC);

STRING_TABLE.__ZTSN10__cxxabiv117__class_type_infoE = allocate([ 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 49, 55, 95, 95, 99, 108, 97, 115, 115, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0 ], "i8", ALLOC_STATIC);

__ZTIN10__cxxabiv117__class_type_infoE = allocate(12, "*", ALLOC_STATIC);

__ZTVN10__cxxabiv117__class_type_infoE = allocate([ 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 16, 0, 0, 0, 18, 0, 0, 0, 20, 0, 0, 0, 22, 0, 0, 0, 24, 0, 0, 0 ], [ "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0 ], ALLOC_STATIC);

allocate(1, "void*", ALLOC_STATIC);

__ZTVN10__cxxabiv120__si_class_type_infoE = allocate([ 0, 0, 0, 0, 0, 0, 0, 0, 26, 0, 0, 0, 28, 0, 0, 0, 18, 0, 0, 0, 30, 0, 0, 0, 32, 0, 0, 0, 34, 0, 0, 0 ], [ "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0 ], ALLOC_STATIC);

allocate(1, "void*", ALLOC_STATIC);

STRING_TABLE.__ZTSN10__cxxabiv120__si_class_type_infoE = allocate([ 78, 49, 48, 95, 95, 99, 120, 120, 97, 98, 105, 118, 49, 50, 48, 95, 95, 115, 105, 95, 99, 108, 97, 115, 115, 95, 116, 121, 112, 101, 95, 105, 110, 102, 111, 69, 0 ], "i8", ALLOC_STATIC);

__ZTIN10__cxxabiv120__si_class_type_infoE = allocate(12, "*", ALLOC_STATIC);

__gm_ = allocate(468, [ "i32", 0, 0, 0, "i32", 0, 0, 0, "i32", 0, 0, 0, "i32", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "i32", 0, 0, 0, "i32", 0, 0, 0, "i32", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "*", 0, 0, 0, "i32", 0, 0, 0, "i32", 0, 0, 0, "i32", 0, 0, 0, "*", 0, 0, 0, "i32", 0, 0, 0, "*", 0, 0, 0, "i32", 0, 0, 0, "*", 0, 0, 0, "i32", 0, 0, 0 ], ALLOC_STATIC);

_mparams = allocate(24, "i32", ALLOC_STATIC);

HEAP32[__ZTV7Watcher + 4 >> 2] = __ZTI7Watcher;

HEAP32[__ZTI7Watcher >> 2] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;

HEAP32[__ZTI7Watcher + 4 >> 2] = STRING_TABLE.__ZTS7Watcher;

HEAP32[__ZTI7Watcher + 8 >> 2] = __ZTI15ZPMemoryWatcher;

HEAP32[__ZTV15ZPMemoryWatcher + 4 >> 2] = __ZTI15ZPMemoryWatcher;

HEAP32[__ZTI15ZPMemoryWatcher >> 2] = __ZTVN10__cxxabiv117__class_type_infoE + 8;

HEAP32[__ZTI15ZPMemoryWatcher + 4 >> 2] = STRING_TABLE.__ZTS15ZPMemoryWatcher;

HEAP32[__ZTIN10__cxxabiv116__shim_type_infoE >> 2] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;

HEAP32[__ZTIN10__cxxabiv116__shim_type_infoE + 4 >> 2] = STRING_TABLE.__ZTSN10__cxxabiv116__shim_type_infoE;

HEAP32[__ZTIN10__cxxabiv116__shim_type_infoE + 8 >> 2] = __ZTISt9type_info;

HEAP32[__ZTIN10__cxxabiv117__class_type_infoE >> 2] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;

HEAP32[__ZTIN10__cxxabiv117__class_type_infoE + 4 >> 2] = STRING_TABLE.__ZTSN10__cxxabiv117__class_type_infoE;

HEAP32[__ZTIN10__cxxabiv117__class_type_infoE + 8 >> 2] = __ZTIN10__cxxabiv116__shim_type_infoE;

HEAP32[__ZTVN10__cxxabiv117__class_type_infoE + 4 >> 2] = __ZTIN10__cxxabiv117__class_type_infoE;

HEAP32[__ZTVN10__cxxabiv120__si_class_type_infoE + 4 >> 2] = __ZTIN10__cxxabiv120__si_class_type_infoE;

HEAP32[__ZTIN10__cxxabiv120__si_class_type_infoE >> 2] = __ZTVN10__cxxabiv120__si_class_type_infoE + 8;

HEAP32[__ZTIN10__cxxabiv120__si_class_type_infoE + 4 >> 2] = STRING_TABLE.__ZTSN10__cxxabiv120__si_class_type_infoE;

HEAP32[__ZTIN10__cxxabiv120__si_class_type_infoE + 8 >> 2] = __ZTIN10__cxxabiv117__class_type_infoE;

__ZN10JB2DecoderC1EP7__sFILEi = 36;

__ZN15ZPMemoryWatcherD1Ev = 38;

__ZN12ZPNumContextC1EiiP15ZPMemoryWatcher = 40;

__ZN12ZPNumContextD1Ev = 42;

__ZN9ZPDecoderC1EP7__sFILEi = 44;

__ZN10__cxxabiv117__class_type_infoD1Ev = 46;

__ZN10__cxxabiv117__class_type_infoD2Ev = 48;

__ZN10__cxxabiv120__si_class_type_infoD1Ev = 50;

__ZN10__cxxabiv120__si_class_type_infoD2Ev = 46;

FUNCTION_TABLE = [ 0, 0, __ZN7Watcher17handle_allocationEv, 0, __ZN7WatcherD1Ev, 0, __ZN7WatcherD0Ev, 0, ___cxa_pure_virtual, 0, __ZN15ZPMemoryWatcherD2Ev, 0, __ZN15ZPMemoryWatcherD0Ev, 0, __ZN10__cxxabiv116__shim_type_infoD2Ev, 0, __ZN10__cxxabiv117__class_type_infoD0Ev, 0, __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv, 0, __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i, 0, __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvi, 0, __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi, 0, __ZN10__cxxabiv116__shim_type_infoD2Ev, 0, __ZN10__cxxabiv120__si_class_type_infoD0Ev, 0, __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i, 0, __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvi, 0, __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi, 0, __ZN10JB2DecoderC2EP7__sFILEi, 0, __ZN15ZPMemoryWatcherD2Ev, 0, __ZN12ZPNumContextC2EiiP15ZPMemoryWatcher, 0, __ZN12ZPNumContextD2Ev, 0, __ZN9ZPDecoderC2EP7__sFILEi, 0, __ZN10__cxxabiv116__shim_type_infoD2Ev, 0, __ZN10__cxxabiv116__shim_type_infoD2Ev, 0, __ZN10__cxxabiv116__shim_type_infoD2Ev, 0 ];

Module["FUNCTION_TABLE"] = FUNCTION_TABLE;

function run(args) {
  args = args || Module["arguments"];
  if (Module["preRun"]) {
    Module["preRun"]();
    if (runDependencies > 0) {
      Module["preRun"] = null;
      return 0;
    }
  }
  function doRun() {
    var ret = 0;
    if (Module["_main"]) {
      preMain();
      ret = Module.callMain(args);
      if (!Module["noExitRuntime"]) {
        exitRuntime();
      }
    }
    if (Module["postRun"]) {
      Module["postRun"]();
    }
    return ret;
  }
  return doRun();
}

Module["run"] = run;

initRuntime();

addRunDependency();

if (Module["noInitialRun"]) {
  addRunDependency();
}

if (runDependencies == 0) {
  var ret = run();
}
// EMSCRIPTEN_GENERATED_FUNCTIONS: ["_qwe_djvu_height","_qwe_djvu_width","_mdjvu_get_error","_mdjvu_get_error_message","_mdjvu_bitmap_get_width","_mdjvu_bitmap_get_height","_mdjvu_bitmap_get_index","_mdjvu_bitmap_set_index","_mdjvu_bitmap_get_packed_row_size","_mdjvu_bitmap_access_packed_row","_mdjvu_bitmap_pack_row","_mdjvu_bitmap_unpack_row","_mdjvu_bitmap_unpack_row_0_or_1","_main","_qwe_save_djvu","_decide_if_bmp","_decide_if_tiff","_qwe_loadrender_djvu","_mdjvu_create_2d_array","_mdjvu_destroy_2d_array","_mdjvu_bitmap_create","_mdjvu_bitmap_destroy","_mdjvu_bitmap_clone","_mdjvu_bitmap_exchange","_mdjvu_bitmap_pack_all","_save_bitmap","_load_image","_column_is_empty","_row_is_empty","_mdjvu_image_get_width","_mdjvu_image_get_height","_mdjvu_image_get_bitmap_count","_mdjvu_image_get_blit_count","_mdjvu_bitmap_crop","_mdjvu_bitmap_get_bounding_box","_mdjvu_bitmap_remove_margins","_mdjvu_bitmap_get_mass","_mdjvu_image_create","_mdjvu_image_destroy","_mdjvu_image_disable_artifact","_mdjvu_image_get_bitmap","_mdjvu_image_get_blit_x","_mdjvu_image_get_blit_y","_mdjvu_image_set_blit_x","_mdjvu_image_set_blit_y","_mdjvu_image_get_blit_bitmap","_mdjvu_image_add_bitmap","_initialize_artifacts","_mdjvu_image_new_bitmap","_mdjvu_image_add_blit","_initialize_artifact","_my_strcasecmp","_ends_with_ignore_case","_mdjvu_render","_mdjvu_file_save_bmp","_mdjvu_disable_tiff_warnings","_skip_in_chunk","_write_bmp_header","_save_DIB_bytes","_mdjvu_save_bmp","_write_uint32","_write_uint16","_mdjvu_locate_jb2_chunk","_read_uint32_most_significant_byte_first","_get_child_chunk","_find_sibling_chunk","_mdjvu_file_load_djvu_page","_mdjvu_load_djvu_page","_skip_to_next_sibling_chunk","_mdjvu_save_pbm","_mdjvu_file_save_pbm","_mdjvu_save_tiff","__ZN16JB2BitmapDecoder8load_rowEP14MinidjvuBitmapiPh","__ZN12ZPBitContextC1Ev","__ZN16JB2BitmapDecoder17reset_numcontextsEv","__ZN16JB2BitmapDecoder17code_row_directlyEiPhS0_S0_S0_","__ZN16JB2BitmapDecoder10code_pixelER12ZPBitContextPhi","__ZN16JB2BitmapDecoder22code_row_by_refinementEiPhS0_S0_S0_S0_S0_","__ZN16JB2BitmapDecoder19code_image_directlyEP14MinidjvuBitmapS1_","__ZN16JB2BitmapDecoder8save_rowEP14MinidjvuBitmapiPhi","__ZN16JB2BitmapDecoderC2ER9ZPDecoderP15ZPMemoryWatcher","__ZN12ZPBitContextC2Ev","__ZN16JB2BitmapDecoder24code_image_by_refinementEP14MinidjvuBitmapS1_S1_","__ZN16JB2BitmapDecoder6decodeEP13MinidjvuImageP14MinidjvuBitmap","__ZN7WatcherC1Ev","__ZN7JB2RectC1Eiiii","__ZN7JB2RectC1Ev","__ZN7WatcherD1Ev","__ZN8JB2CoderC2Ev","__ZN7JB2RectC2Ev","__ZN15ZPMemoryWatcherC2Ev","__ZN7JB2RectC2Eiiii","__ZN7Watcher17handle_allocationEv","__ZN8JB2Coder17reset_numcontextsEv","__ZN10JB2Decoder25decode_character_positionERiS0_ii","__ZN10JB2Decoder11decode_blitEP13MinidjvuImagei","__ZN10JB2Decoder5resetEv","__ZN10JB2Decoder18decode_record_typeEv","__ZN7WatcherD2Ev","__ZN7WatcherC2Ev","__ZN7WatcherD0Ev","__ZN8JB2CoderD2Ev","__ZN10JB2DecoderC2EP7__sFILEi","__ZN16JB2BitmapDecoderD2Ev","__ZN15ZPMemoryWatcherD2Ev","__ZN12ZPNumContext4initEv","__ZL16decode_lib_shapeR10JB2DecoderP13MinidjvuImagebP14MinidjvuBitmap","__Z14append_to_listIP14MinidjvuBitmapEPT_RS3_RiS5_","__ZN10JB2DecoderD1Ev","__ZN15ZPMemoryWatcherD0Ev","__ZN12ZPNumContextC2EiiP15ZPMemoryWatcher","__ZN12ZPNumContextD2Ev","_mdjvu_file_load_jb2","__ZN10JB2DecoderD2Ev","__ZN12ZPNumContext12set_intervalEii","__ZN12ZPNumContext8get_leftEt","__ZN12ZPNumContext8new_nodeEv","__ZN12ZPNumContext9get_rightEt","__ZN12ZPNumContext5resetEv","___cxx_global_var_init","__ZN6IniterC1Ev","__ZN9ZPDecoderC2EP7__sFILEi","__ZN9ZPDecoder4openEv","__ZN9ZPDecoder9next_byteERh","__ZN9ZPDecoder7preloadEv","__ZN9ZPDecoder6decodeER12ZPNumContext","__ZN9ZPDecoder6decodeER12ZPBitContext","__ZN9ZPDecoder10decode_subER12ZPBitContextj","__ZN9ZPDecoder3ffzEj","__ZL14init_ffz_tablev","__ZL11init_tablesv","__ZNK10__cxxabiv117__class_type_info24process_found_base_classEPNS_19__dynamic_cast_infoEPvi","__ZNK10__cxxabiv117__class_type_info29process_static_type_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i","__ZNK10__cxxabiv117__class_type_info29process_static_type_below_dstEPNS_19__dynamic_cast_infoEPKvi","__ZN6IniterC2Ev","__ZL4initv","__GLOBAL__I_a","__ZN10__cxxabiv116__shim_type_infoD2Ev","__ZN10__cxxabiv117__class_type_infoD0Ev","__ZN10__cxxabiv120__si_class_type_infoD0Ev","__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv","__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi","__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi","___dynamic_cast","__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvi","__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvi","__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i","__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_i","_malloc","_tmalloc_small","_tmalloc_large","_sys_alloc","_free","_sys_trim","_calloc","_realloc","_release_unused_segments","_mmap_resize","_segment_holding","_init_top","_mmap_alloc","_init_bins","_internal_realloc","_init_mparams","_prepend_alloc","__ZdlPv","_add_segment"]

