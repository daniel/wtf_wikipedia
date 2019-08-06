var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var browserPonyfill = createCommonjsModule(function (module, exports) {
var __self__ = (function (root) {
function F() {
this.fetch = false;
this.DOMException = root.DOMException;
}
F.prototype = root;
return new F();
})(typeof self !== 'undefined' ? self : commonjsGlobal);
(function(self) {

var irrelevant = (function (exports) {
  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  return exports;

}({}));
})(__self__);
delete __self__.fetch.polyfill;
exports = __self__.fetch; // To enable: import fetch from 'cross-fetch'
exports.default = __self__.fetch; // For TypeScript consumers without esModuleInterop.
exports.fetch = __self__.fetch; // To enable: import {fetch} from 'cross-fetch'
exports.Headers = __self__.Headers;
exports.Request = __self__.Request;
exports.Response = __self__.Response;
module.exports = exports;
});
var browserPonyfill_1 = browserPonyfill.fetch;
var browserPonyfill_2 = browserPonyfill.Headers;
var browserPonyfill_3 = browserPonyfill.Request;
var browserPonyfill_4 = browserPonyfill.Response;

const request = function(url, options) {
  let params = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Api-User-Agent': options.userAgent || options['User-Agent'] || options['Api-User-Agent'] || 'Random user of the wtf_wikipedia library'
    },
  };
  return browserPonyfill(url, params).then((response) => {
    if (response.status !== 200) {
      throw response;
    }
    return response.json();
  }).catch(console.error);
};
var _request = request;

var site_map_1 = createCommonjsModule(function (module) {
//from https://en.wikipedia.org/w/api.php?action=sitematrix&format=json
const site_map = {
  aawiki: 'https://aa.wikipedia.org',
  aawikipedia: 'https://aa.wikipedia.org',
  aawiktionary: 'https://aa.wiktionary.org',
  aawikibooks: 'https://aa.wikibooks.org',
  abwiki: 'https://ab.wikipedia.org',
  abwikipedia: 'https://ab.wikipedia.org',
  abwiktionary: 'https://ab.wiktionary.org',
  acewiki: 'https://ace.wikipedia.org',
  acewikipedia: 'https://ace.wikipedia.org',
  adywiki: 'https://ady.wikipedia.org',
  adywikipedia: 'https://ady.wikipedia.org',
  afwiki: 'https://af.wikipedia.org',
  afwikipedia: 'https://af.wikipedia.org',
  afwiktionary: 'https://af.wiktionary.org',
  afwikibooks: 'https://af.wikibooks.org',
  afwikiquote: 'https://af.wikiquote.org',
  akwiki: 'https://ak.wikipedia.org',
  akwikipedia: 'https://ak.wikipedia.org',
  akwiktionary: 'https://ak.wiktionary.org',
  akwikibooks: 'https://ak.wikibooks.org',
  alswiki: 'https://als.wikipedia.org',
  alswikipedia: 'https://als.wikipedia.org',
  amwiki: 'https://am.wikipedia.org',
  amwikipedia: 'https://am.wikipedia.org',
  amwiktionary: 'https://am.wiktionary.org',
  amwikiquote: 'https://am.wikiquote.org',
  anwiki: 'https://an.wikipedia.org',
  anwikipedia: 'https://an.wikipedia.org',
  anwiktionary: 'https://an.wiktionary.org',
  angwiki: 'https://ang.wikipedia.org',
  angwikipedia: 'https://ang.wikipedia.org',
  angwiktionary: 'https://ang.wiktionary.org',
  angwikibooks: 'https://ang.wikibooks.org',
  angwikiquote: 'https://ang.wikiquote.org',
  angwikisource: 'https://ang.wikisource.org',
  arwiki: 'https://ar.wikipedia.org',
  arwikipedia: 'https://ar.wikipedia.org',
  arwiktionary: 'https://ar.wiktionary.org',
  arwikibooks: 'https://ar.wikibooks.org',
  arwikinews: 'https://ar.wikinews.org',
  arwikiquote: 'https://ar.wikiquote.org',
  arwikisource: 'https://ar.wikisource.org',
  arwikiversity: 'https://ar.wikiversity.org',
  arcwiki: 'https://arc.wikipedia.org',
  arcwikipedia: 'https://arc.wikipedia.org',
  arzwiki: 'https://arz.wikipedia.org',
  arzwikipedia: 'https://arz.wikipedia.org',
  aswiki: 'https://as.wikipedia.org',
  aswikipedia: 'https://as.wikipedia.org',
  aswiktionary: 'https://as.wiktionary.org',
  aswikibooks: 'https://as.wikibooks.org',
  aswikisource: 'https://as.wikisource.org',
  astwiki: 'https://ast.wikipedia.org',
  astwikipedia: 'https://ast.wikipedia.org',
  astwiktionary: 'https://ast.wiktionary.org',
  astwikibooks: 'https://ast.wikibooks.org',
  astwikiquote: 'https://ast.wikiquote.org',
  atjwiki: 'https://atj.wikipedia.org',
  atjwikipedia: 'https://atj.wikipedia.org',
  avwiki: 'https://av.wikipedia.org',
  avwikipedia: 'https://av.wikipedia.org',
  avwiktionary: 'https://av.wiktionary.org',
  aywiki: 'https://ay.wikipedia.org',
  aywikipedia: 'https://ay.wikipedia.org',
  aywiktionary: 'https://ay.wiktionary.org',
  aywikibooks: 'https://ay.wikibooks.org',
  azwiki: 'https://az.wikipedia.org',
  azwikipedia: 'https://az.wikipedia.org',
  azwiktionary: 'https://az.wiktionary.org',
  azwikibooks: 'https://az.wikibooks.org',
  azwikiquote: 'https://az.wikiquote.org',
  azwikisource: 'https://az.wikisource.org',
  azbwiki: 'https://azb.wikipedia.org',
  azbwikipedia: 'https://azb.wikipedia.org',
  bawiki: 'https://ba.wikipedia.org',
  bawikipedia: 'https://ba.wikipedia.org',
  bawikibooks: 'https://ba.wikibooks.org',
  barwiki: 'https://bar.wikipedia.org',
  barwikipedia: 'https://bar.wikipedia.org',
  bat_smgwiki: 'https://bat-smg.wikipedia.org',
  bat_smgwikipedia: 'https://bat-smg.wikipedia.org',
  bclwiki: 'https://bcl.wikipedia.org',
  bclwikipedia: 'https://bcl.wikipedia.org',
  bewiki: 'https://be.wikipedia.org',
  bewikipedia: 'https://be.wikipedia.org',
  bewiktionary: 'https://be.wiktionary.org',
  bewikibooks: 'https://be.wikibooks.org',
  bewikiquote: 'https://be.wikiquote.org',
  bewikisource: 'https://be.wikisource.org',
  be_x_oldwiki: 'https://be-tarask.wikipedia.org',
  be_x_oldwikipedia: 'https://be-tarask.wikipedia.org',
  bgwiki: 'https://bg.wikipedia.org',
  bgwikipedia: 'https://bg.wikipedia.org',
  bgwiktionary: 'https://bg.wiktionary.org',
  bgwikibooks: 'https://bg.wikibooks.org',
  bgwikinews: 'https://bg.wikinews.org',
  bgwikiquote: 'https://bg.wikiquote.org',
  bgwikisource: 'https://bg.wikisource.org',
  bhwiki: 'https://bh.wikipedia.org',
  bhwikipedia: 'https://bh.wikipedia.org',
  bhwiktionary: 'https://bh.wiktionary.org',
  biwiki: 'https://bi.wikipedia.org',
  biwikipedia: 'https://bi.wikipedia.org',
  biwiktionary: 'https://bi.wiktionary.org',
  biwikibooks: 'https://bi.wikibooks.org',
  bjnwiki: 'https://bjn.wikipedia.org',
  bjnwikipedia: 'https://bjn.wikipedia.org',
  bmwiki: 'https://bm.wikipedia.org',
  bmwikipedia: 'https://bm.wikipedia.org',
  bmwiktionary: 'https://bm.wiktionary.org',
  bmwikibooks: 'https://bm.wikibooks.org',
  bmwikiquote: 'https://bm.wikiquote.org',
  bnwiki: 'https://bn.wikipedia.org',
  bnwikipedia: 'https://bn.wikipedia.org',
  bnwiktionary: 'https://bn.wiktionary.org',
  bnwikibooks: 'https://bn.wikibooks.org',
  bnwikisource: 'https://bn.wikisource.org',
  bnwikivoyage: 'https://bn.wikivoyage.org',
  bowiki: 'https://bo.wikipedia.org',
  bowikipedia: 'https://bo.wikipedia.org',
  bowiktionary: 'https://bo.wiktionary.org',
  bowikibooks: 'https://bo.wikibooks.org',
  bpywiki: 'https://bpy.wikipedia.org',
  bpywikipedia: 'https://bpy.wikipedia.org',
  brwiki: 'https://br.wikipedia.org',
  brwikipedia: 'https://br.wikipedia.org',
  brwiktionary: 'https://br.wiktionary.org',
  brwikiquote: 'https://br.wikiquote.org',
  brwikisource: 'https://br.wikisource.org',
  bswiki: 'https://bs.wikipedia.org',
  bswikipedia: 'https://bs.wikipedia.org',
  bswiktionary: 'https://bs.wiktionary.org',
  bswikibooks: 'https://bs.wikibooks.org',
  bswikinews: 'https://bs.wikinews.org',
  bswikiquote: 'https://bs.wikiquote.org',
  bswikisource: 'https://bs.wikisource.org',
  bugwiki: 'https://bug.wikipedia.org',
  bugwikipedia: 'https://bug.wikipedia.org',
  bxrwiki: 'https://bxr.wikipedia.org',
  bxrwikipedia: 'https://bxr.wikipedia.org',
  cawiki: 'https://ca.wikipedia.org',
  cawikipedia: 'https://ca.wikipedia.org',
  cawiktionary: 'https://ca.wiktionary.org',
  cawikibooks: 'https://ca.wikibooks.org',
  cawikinews: 'https://ca.wikinews.org',
  cawikiquote: 'https://ca.wikiquote.org',
  cawikisource: 'https://ca.wikisource.org',
  cbk_zamwiki: 'https://cbk-zam.wikipedia.org',
  cbk_zamwikipedia: 'https://cbk-zam.wikipedia.org',
  cdowiki: 'https://cdo.wikipedia.org',
  cdowikipedia: 'https://cdo.wikipedia.org',
  cewiki: 'https://ce.wikipedia.org',
  cewikipedia: 'https://ce.wikipedia.org',
  cebwiki: 'https://ceb.wikipedia.org',
  cebwikipedia: 'https://ceb.wikipedia.org',
  chwiki: 'https://ch.wikipedia.org',
  chwikipedia: 'https://ch.wikipedia.org',
  chwiktionary: 'https://ch.wiktionary.org',
  chwikibooks: 'https://ch.wikibooks.org',
  chowiki: 'https://cho.wikipedia.org',
  chowikipedia: 'https://cho.wikipedia.org',
  chrwiki: 'https://chr.wikipedia.org',
  chrwikipedia: 'https://chr.wikipedia.org',
  chrwiktionary: 'https://chr.wiktionary.org',
  chywiki: 'https://chy.wikipedia.org',
  chywikipedia: 'https://chy.wikipedia.org',
  ckbwiki: 'https://ckb.wikipedia.org',
  ckbwikipedia: 'https://ckb.wikipedia.org',
  cowiki: 'https://co.wikipedia.org',
  cowikipedia: 'https://co.wikipedia.org',
  cowiktionary: 'https://co.wiktionary.org',
  cowikibooks: 'https://co.wikibooks.org',
  cowikiquote: 'https://co.wikiquote.org',
  crwiki: 'https://cr.wikipedia.org',
  crwikipedia: 'https://cr.wikipedia.org',
  crwiktionary: 'https://cr.wiktionary.org',
  crwikiquote: 'https://cr.wikiquote.org',
  crhwiki: 'https://crh.wikipedia.org',
  crhwikipedia: 'https://crh.wikipedia.org',
  cswiki: 'https://cs.wikipedia.org',
  cswikipedia: 'https://cs.wikipedia.org',
  cswiktionary: 'https://cs.wiktionary.org',
  cswikibooks: 'https://cs.wikibooks.org',
  cswikinews: 'https://cs.wikinews.org',
  cswikiquote: 'https://cs.wikiquote.org',
  cswikisource: 'https://cs.wikisource.org',
  cswikiversity: 'https://cs.wikiversity.org',
  csbwiki: 'https://csb.wikipedia.org',
  csbwikipedia: 'https://csb.wikipedia.org',
  csbwiktionary: 'https://csb.wiktionary.org',
  cuwiki: 'https://cu.wikipedia.org',
  cuwikipedia: 'https://cu.wikipedia.org',
  cvwiki: 'https://cv.wikipedia.org',
  cvwikipedia: 'https://cv.wikipedia.org',
  cvwikibooks: 'https://cv.wikibooks.org',
  cywiki: 'https://cy.wikipedia.org',
  cywikipedia: 'https://cy.wikipedia.org',
  cywiktionary: 'https://cy.wiktionary.org',
  cywikibooks: 'https://cy.wikibooks.org',
  cywikiquote: 'https://cy.wikiquote.org',
  cywikisource: 'https://cy.wikisource.org',
  dawiki: 'https://da.wikipedia.org',
  dawikipedia: 'https://da.wikipedia.org',
  dawiktionary: 'https://da.wiktionary.org',
  dawikibooks: 'https://da.wikibooks.org',
  dawikiquote: 'https://da.wikiquote.org',
  dawikisource: 'https://da.wikisource.org',
  dewiki: 'https://de.wikipedia.org',
  dewikipedia: 'https://de.wikipedia.org',
  dewiktionary: 'https://de.wiktionary.org',
  dewikibooks: 'https://de.wikibooks.org',
  dewikinews: 'https://de.wikinews.org',
  dewikiquote: 'https://de.wikiquote.org',
  dewikisource: 'https://de.wikisource.org',
  dewikiversity: 'https://de.wikiversity.org',
  dewikivoyage: 'https://de.wikivoyage.org',
  dinwiki: 'https://din.wikipedia.org',
  dinwikipedia: 'https://din.wikipedia.org',
  diqwiki: 'https://diq.wikipedia.org',
  diqwikipedia: 'https://diq.wikipedia.org',
  dsbwiki: 'https://dsb.wikipedia.org',
  dsbwikipedia: 'https://dsb.wikipedia.org',
  dtywiki: 'https://dty.wikipedia.org',
  dtywikipedia: 'https://dty.wikipedia.org',
  dvwiki: 'https://dv.wikipedia.org',
  dvwikipedia: 'https://dv.wikipedia.org',
  dvwiktionary: 'https://dv.wiktionary.org',
  dzwiki: 'https://dz.wikipedia.org',
  dzwikipedia: 'https://dz.wikipedia.org',
  dzwiktionary: 'https://dz.wiktionary.org',
  eewiki: 'https://ee.wikipedia.org',
  eewikipedia: 'https://ee.wikipedia.org',
  elwiki: 'https://el.wikipedia.org',
  elwikipedia: 'https://el.wikipedia.org',
  elwiktionary: 'https://el.wiktionary.org',
  elwikibooks: 'https://el.wikibooks.org',
  elwikinews: 'https://el.wikinews.org',
  elwikiquote: 'https://el.wikiquote.org',
  elwikisource: 'https://el.wikisource.org',
  elwikiversity: 'https://el.wikiversity.org',
  elwikivoyage: 'https://el.wikivoyage.org',
  emlwiki: 'https://eml.wikipedia.org',
  emlwikipedia: 'https://eml.wikipedia.org',
  enwiki: 'https://en.wikipedia.org',
  enwikipedia: 'https://en.wikipedia.org',
  enwiktionary: 'https://en.wiktionary.org',
  enwikibooks: 'https://en.wikibooks.org',
  enwikinews: 'https://en.wikinews.org',
  enwikiquote: 'https://en.wikiquote.org',
  enwikisource: 'https://en.wikisource.org',
  enwikiversity: 'https://en.wikiversity.org',
  enwikivoyage: 'https://en.wikivoyage.org',
  eowiki: 'https://eo.wikipedia.org',
  eowikipedia: 'https://eo.wikipedia.org',
  eowiktionary: 'https://eo.wiktionary.org',
  eowikibooks: 'https://eo.wikibooks.org',
  eowikinews: 'https://eo.wikinews.org',
  eowikiquote: 'https://eo.wikiquote.org',
  eowikisource: 'https://eo.wikisource.org',
  eswiki: 'https://es.wikipedia.org',
  eswikipedia: 'https://es.wikipedia.org',
  eswiktionary: 'https://es.wiktionary.org',
  eswikibooks: 'https://es.wikibooks.org',
  eswikinews: 'https://es.wikinews.org',
  eswikiquote: 'https://es.wikiquote.org',
  eswikisource: 'https://es.wikisource.org',
  eswikiversity: 'https://es.wikiversity.org',
  eswikivoyage: 'https://es.wikivoyage.org',
  etwiki: 'https://et.wikipedia.org',
  etwikipedia: 'https://et.wikipedia.org',
  etwiktionary: 'https://et.wiktionary.org',
  etwikibooks: 'https://et.wikibooks.org',
  etwikiquote: 'https://et.wikiquote.org',
  etwikisource: 'https://et.wikisource.org',
  euwiki: 'https://eu.wikipedia.org',
  euwikipedia: 'https://eu.wikipedia.org',
  euwiktionary: 'https://eu.wiktionary.org',
  euwikibooks: 'https://eu.wikibooks.org',
  euwikiquote: 'https://eu.wikiquote.org',
  euwikisource: 'https://eu.wikisource.org',
  extwiki: 'https://ext.wikipedia.org',
  extwikipedia: 'https://ext.wikipedia.org',
  fawiki: 'https://fa.wikipedia.org',
  fawikipedia: 'https://fa.wikipedia.org',
  fawiktionary: 'https://fa.wiktionary.org',
  fawikibooks: 'https://fa.wikibooks.org',
  fawikinews: 'https://fa.wikinews.org',
  fawikiquote: 'https://fa.wikiquote.org',
  fawikisource: 'https://fa.wikisource.org',
  fawikivoyage: 'https://fa.wikivoyage.org',
  ffwiki: 'https://ff.wikipedia.org',
  ffwikipedia: 'https://ff.wikipedia.org',
  fiwiki: 'https://fi.wikipedia.org',
  fiwikipedia: 'https://fi.wikipedia.org',
  fiwiktionary: 'https://fi.wiktionary.org',
  fiwikibooks: 'https://fi.wikibooks.org',
  fiwikinews: 'https://fi.wikinews.org',
  fiwikiquote: 'https://fi.wikiquote.org',
  fiwikisource: 'https://fi.wikisource.org',
  fiwikiversity: 'https://fi.wikiversity.org',
  fiwikivoyage: 'https://fi.wikivoyage.org',
  fiu_vrowiki: 'https://fiu-vro.wikipedia.org',
  fiu_vrowikipedia: 'https://fiu-vro.wikipedia.org',
  fjwiki: 'https://fj.wikipedia.org',
  fjwikipedia: 'https://fj.wikipedia.org',
  fjwiktionary: 'https://fj.wiktionary.org',
  fowiki: 'https://fo.wikipedia.org',
  fowikipedia: 'https://fo.wikipedia.org',
  fowiktionary: 'https://fo.wiktionary.org',
  fowikisource: 'https://fo.wikisource.org',
  frwiki: 'https://fr.wikipedia.org',
  frwikipedia: 'https://fr.wikipedia.org',
  frwiktionary: 'https://fr.wiktionary.org',
  frwikibooks: 'https://fr.wikibooks.org',
  frwikinews: 'https://fr.wikinews.org',
  frwikiquote: 'https://fr.wikiquote.org',
  frwikisource: 'https://fr.wikisource.org',
  frwikiversity: 'https://fr.wikiversity.org',
  frwikivoyage: 'https://fr.wikivoyage.org',
  frpwiki: 'https://frp.wikipedia.org',
  frpwikipedia: 'https://frp.wikipedia.org',
  frrwiki: 'https://frr.wikipedia.org',
  frrwikipedia: 'https://frr.wikipedia.org',
  furwiki: 'https://fur.wikipedia.org',
  furwikipedia: 'https://fur.wikipedia.org',
  fywiki: 'https://fy.wikipedia.org',
  fywikipedia: 'https://fy.wikipedia.org',
  fywiktionary: 'https://fy.wiktionary.org',
  fywikibooks: 'https://fy.wikibooks.org',
  gawiki: 'https://ga.wikipedia.org',
  gawikipedia: 'https://ga.wikipedia.org',
  gawiktionary: 'https://ga.wiktionary.org',
  gawikibooks: 'https://ga.wikibooks.org',
  gawikiquote: 'https://ga.wikiquote.org',
  gagwiki: 'https://gag.wikipedia.org',
  gagwikipedia: 'https://gag.wikipedia.org',
  ganwiki: 'https://gan.wikipedia.org',
  ganwikipedia: 'https://gan.wikipedia.org',
  gdwiki: 'https://gd.wikipedia.org',
  gdwikipedia: 'https://gd.wikipedia.org',
  gdwiktionary: 'https://gd.wiktionary.org',
  glwiki: 'https://gl.wikipedia.org',
  glwikipedia: 'https://gl.wikipedia.org',
  glwiktionary: 'https://gl.wiktionary.org',
  glwikibooks: 'https://gl.wikibooks.org',
  glwikiquote: 'https://gl.wikiquote.org',
  glwikisource: 'https://gl.wikisource.org',
  glkwiki: 'https://glk.wikipedia.org',
  glkwikipedia: 'https://glk.wikipedia.org',
  gnwiki: 'https://gn.wikipedia.org',
  gnwikipedia: 'https://gn.wikipedia.org',
  gnwiktionary: 'https://gn.wiktionary.org',
  gnwikibooks: 'https://gn.wikibooks.org',
  gomwiki: 'https://gom.wikipedia.org',
  gomwikipedia: 'https://gom.wikipedia.org',
  gorwiki: 'https://gor.wikipedia.org',
  gorwikipedia: 'https://gor.wikipedia.org',
  gotwiki: 'https://got.wikipedia.org',
  gotwikipedia: 'https://got.wikipedia.org',
  gotwikibooks: 'https://got.wikibooks.org',
  guwiki: 'https://gu.wikipedia.org',
  guwikipedia: 'https://gu.wikipedia.org',
  guwiktionary: 'https://gu.wiktionary.org',
  guwikibooks: 'https://gu.wikibooks.org',
  guwikiquote: 'https://gu.wikiquote.org',
  guwikisource: 'https://gu.wikisource.org',
  gvwiki: 'https://gv.wikipedia.org',
  gvwikipedia: 'https://gv.wikipedia.org',
  gvwiktionary: 'https://gv.wiktionary.org',
  hawiki: 'https://ha.wikipedia.org',
  hawikipedia: 'https://ha.wikipedia.org',
  hawiktionary: 'https://ha.wiktionary.org',
  hakwiki: 'https://hak.wikipedia.org',
  hakwikipedia: 'https://hak.wikipedia.org',
  hawwiki: 'https://haw.wikipedia.org',
  hawwikipedia: 'https://haw.wikipedia.org',
  hewiki: 'https://he.wikipedia.org',
  hewikipedia: 'https://he.wikipedia.org',
  hewiktionary: 'https://he.wiktionary.org',
  hewikibooks: 'https://he.wikibooks.org',
  hewikinews: 'https://he.wikinews.org',
  hewikiquote: 'https://he.wikiquote.org',
  hewikisource: 'https://he.wikisource.org',
  hewikivoyage: 'https://he.wikivoyage.org',
  hiwiki: 'https://hi.wikipedia.org',
  hiwikipedia: 'https://hi.wikipedia.org',
  hiwiktionary: 'https://hi.wiktionary.org',
  hiwikibooks: 'https://hi.wikibooks.org',
  hiwikiquote: 'https://hi.wikiquote.org',
  hiwikiversity: 'https://hi.wikiversity.org',
  hiwikivoyage: 'https://hi.wikivoyage.org',
  hifwiki: 'https://hif.wikipedia.org',
  hifwikipedia: 'https://hif.wikipedia.org',
  hifwiktionary: 'https://hif.wiktionary.org',
  howiki: 'https://ho.wikipedia.org',
  howikipedia: 'https://ho.wikipedia.org',
  hrwiki: 'https://hr.wikipedia.org',
  hrwikipedia: 'https://hr.wikipedia.org',
  hrwiktionary: 'https://hr.wiktionary.org',
  hrwikibooks: 'https://hr.wikibooks.org',
  hrwikiquote: 'https://hr.wikiquote.org',
  hrwikisource: 'https://hr.wikisource.org',
  hsbwiki: 'https://hsb.wikipedia.org',
  hsbwikipedia: 'https://hsb.wikipedia.org',
  hsbwiktionary: 'https://hsb.wiktionary.org',
  htwiki: 'https://ht.wikipedia.org',
  htwikipedia: 'https://ht.wikipedia.org',
  htwikisource: 'https://ht.wikisource.org',
  huwiki: 'https://hu.wikipedia.org',
  huwikipedia: 'https://hu.wikipedia.org',
  huwiktionary: 'https://hu.wiktionary.org',
  huwikibooks: 'https://hu.wikibooks.org',
  huwikinews: 'https://hu.wikinews.org',
  huwikiquote: 'https://hu.wikiquote.org',
  huwikisource: 'https://hu.wikisource.org',
  hywiki: 'https://hy.wikipedia.org',
  hywikipedia: 'https://hy.wikipedia.org',
  hywiktionary: 'https://hy.wiktionary.org',
  hywikibooks: 'https://hy.wikibooks.org',
  hywikiquote: 'https://hy.wikiquote.org',
  hywikisource: 'https://hy.wikisource.org',
  hzwiki: 'https://hz.wikipedia.org',
  hzwikipedia: 'https://hz.wikipedia.org',
  iawiki: 'https://ia.wikipedia.org',
  iawikipedia: 'https://ia.wikipedia.org',
  iawiktionary: 'https://ia.wiktionary.org',
  iawikibooks: 'https://ia.wikibooks.org',
  idwiki: 'https://id.wikipedia.org',
  idwikipedia: 'https://id.wikipedia.org',
  idwiktionary: 'https://id.wiktionary.org',
  idwikibooks: 'https://id.wikibooks.org',
  idwikiquote: 'https://id.wikiquote.org',
  idwikisource: 'https://id.wikisource.org',
  iewiki: 'https://ie.wikipedia.org',
  iewikipedia: 'https://ie.wikipedia.org',
  iewiktionary: 'https://ie.wiktionary.org',
  iewikibooks: 'https://ie.wikibooks.org',
  igwiki: 'https://ig.wikipedia.org',
  igwikipedia: 'https://ig.wikipedia.org',
  iiwiki: 'https://ii.wikipedia.org',
  iiwikipedia: 'https://ii.wikipedia.org',
  ikwiki: 'https://ik.wikipedia.org',
  ikwikipedia: 'https://ik.wikipedia.org',
  ikwiktionary: 'https://ik.wiktionary.org',
  ilowiki: 'https://ilo.wikipedia.org',
  ilowikipedia: 'https://ilo.wikipedia.org',
  inhwiki: 'https://inh.wikipedia.org',
  inhwikipedia: 'https://inh.wikipedia.org',
  iowiki: 'https://io.wikipedia.org',
  iowikipedia: 'https://io.wikipedia.org',
  iowiktionary: 'https://io.wiktionary.org',
  iswiki: 'https://is.wikipedia.org',
  iswikipedia: 'https://is.wikipedia.org',
  iswiktionary: 'https://is.wiktionary.org',
  iswikibooks: 'https://is.wikibooks.org',
  iswikiquote: 'https://is.wikiquote.org',
  iswikisource: 'https://is.wikisource.org',
  itwiki: 'https://it.wikipedia.org',
  itwikipedia: 'https://it.wikipedia.org',
  itwiktionary: 'https://it.wiktionary.org',
  itwikibooks: 'https://it.wikibooks.org',
  itwikinews: 'https://it.wikinews.org',
  itwikiquote: 'https://it.wikiquote.org',
  itwikisource: 'https://it.wikisource.org',
  itwikiversity: 'https://it.wikiversity.org',
  itwikivoyage: 'https://it.wikivoyage.org',
  iuwiki: 'https://iu.wikipedia.org',
  iuwikipedia: 'https://iu.wikipedia.org',
  iuwiktionary: 'https://iu.wiktionary.org',
  jawiki: 'https://ja.wikipedia.org',
  jawikipedia: 'https://ja.wikipedia.org',
  jawiktionary: 'https://ja.wiktionary.org',
  jawikibooks: 'https://ja.wikibooks.org',
  jawikinews: 'https://ja.wikinews.org',
  jawikiquote: 'https://ja.wikiquote.org',
  jawikisource: 'https://ja.wikisource.org',
  jawikiversity: 'https://ja.wikiversity.org',
  jamwiki: 'https://jam.wikipedia.org',
  jamwikipedia: 'https://jam.wikipedia.org',
  jbowiki: 'https://jbo.wikipedia.org',
  jbowikipedia: 'https://jbo.wikipedia.org',
  jbowiktionary: 'https://jbo.wiktionary.org',
  jvwiki: 'https://jv.wikipedia.org',
  jvwikipedia: 'https://jv.wikipedia.org',
  jvwiktionary: 'https://jv.wiktionary.org',
  kawiki: 'https://ka.wikipedia.org',
  kawikipedia: 'https://ka.wikipedia.org',
  kawiktionary: 'https://ka.wiktionary.org',
  kawikibooks: 'https://ka.wikibooks.org',
  kawikiquote: 'https://ka.wikiquote.org',
  kaawiki: 'https://kaa.wikipedia.org',
  kaawikipedia: 'https://kaa.wikipedia.org',
  kabwiki: 'https://kab.wikipedia.org',
  kabwikipedia: 'https://kab.wikipedia.org',
  kbdwiki: 'https://kbd.wikipedia.org',
  kbdwikipedia: 'https://kbd.wikipedia.org',
  kbpwiki: 'https://kbp.wikipedia.org',
  kbpwikipedia: 'https://kbp.wikipedia.org',
  kgwiki: 'https://kg.wikipedia.org',
  kgwikipedia: 'https://kg.wikipedia.org',
  kiwiki: 'https://ki.wikipedia.org',
  kiwikipedia: 'https://ki.wikipedia.org',
  kjwiki: 'https://kj.wikipedia.org',
  kjwikipedia: 'https://kj.wikipedia.org',
  kkwiki: 'https://kk.wikipedia.org',
  kkwikipedia: 'https://kk.wikipedia.org',
  kkwiktionary: 'https://kk.wiktionary.org',
  kkwikibooks: 'https://kk.wikibooks.org',
  kkwikiquote: 'https://kk.wikiquote.org',
  klwiki: 'https://kl.wikipedia.org',
  klwikipedia: 'https://kl.wikipedia.org',
  klwiktionary: 'https://kl.wiktionary.org',
  kmwiki: 'https://km.wikipedia.org',
  kmwikipedia: 'https://km.wikipedia.org',
  kmwiktionary: 'https://km.wiktionary.org',
  kmwikibooks: 'https://km.wikibooks.org',
  knwiki: 'https://kn.wikipedia.org',
  knwikipedia: 'https://kn.wikipedia.org',
  knwiktionary: 'https://kn.wiktionary.org',
  knwikibooks: 'https://kn.wikibooks.org',
  knwikiquote: 'https://kn.wikiquote.org',
  knwikisource: 'https://kn.wikisource.org',
  kowiki: 'https://ko.wikipedia.org',
  kowikipedia: 'https://ko.wikipedia.org',
  kowiktionary: 'https://ko.wiktionary.org',
  kowikibooks: 'https://ko.wikibooks.org',
  kowikinews: 'https://ko.wikinews.org',
  kowikiquote: 'https://ko.wikiquote.org',
  kowikisource: 'https://ko.wikisource.org',
  kowikiversity: 'https://ko.wikiversity.org',
  koiwiki: 'https://koi.wikipedia.org',
  koiwikipedia: 'https://koi.wikipedia.org',
  krwiki: 'https://kr.wikipedia.org',
  krwikipedia: 'https://kr.wikipedia.org',
  krwikiquote: 'https://kr.wikiquote.org',
  krcwiki: 'https://krc.wikipedia.org',
  krcwikipedia: 'https://krc.wikipedia.org',
  kswiki: 'https://ks.wikipedia.org',
  kswikipedia: 'https://ks.wikipedia.org',
  kswiktionary: 'https://ks.wiktionary.org',
  kswikibooks: 'https://ks.wikibooks.org',
  kswikiquote: 'https://ks.wikiquote.org',
  kshwiki: 'https://ksh.wikipedia.org',
  kshwikipedia: 'https://ksh.wikipedia.org',
  kuwiki: 'https://ku.wikipedia.org',
  kuwikipedia: 'https://ku.wikipedia.org',
  kuwiktionary: 'https://ku.wiktionary.org',
  kuwikibooks: 'https://ku.wikibooks.org',
  kuwikiquote: 'https://ku.wikiquote.org',
  kvwiki: 'https://kv.wikipedia.org',
  kvwikipedia: 'https://kv.wikipedia.org',
  kwwiki: 'https://kw.wikipedia.org',
  kwwikipedia: 'https://kw.wikipedia.org',
  kwwiktionary: 'https://kw.wiktionary.org',
  kwwikiquote: 'https://kw.wikiquote.org',
  kywiki: 'https://ky.wikipedia.org',
  kywikipedia: 'https://ky.wikipedia.org',
  kywiktionary: 'https://ky.wiktionary.org',
  kywikibooks: 'https://ky.wikibooks.org',
  kywikiquote: 'https://ky.wikiquote.org',
  lawiki: 'https://la.wikipedia.org',
  lawikipedia: 'https://la.wikipedia.org',
  lawiktionary: 'https://la.wiktionary.org',
  lawikibooks: 'https://la.wikibooks.org',
  lawikiquote: 'https://la.wikiquote.org',
  lawikisource: 'https://la.wikisource.org',
  ladwiki: 'https://lad.wikipedia.org',
  ladwikipedia: 'https://lad.wikipedia.org',
  lbwiki: 'https://lb.wikipedia.org',
  lbwikipedia: 'https://lb.wikipedia.org',
  lbwiktionary: 'https://lb.wiktionary.org',
  lbwikibooks: 'https://lb.wikibooks.org',
  lbwikiquote: 'https://lb.wikiquote.org',
  lbewiki: 'https://lbe.wikipedia.org',
  lbewikipedia: 'https://lbe.wikipedia.org',
  lezwiki: 'https://lez.wikipedia.org',
  lezwikipedia: 'https://lez.wikipedia.org',
  lfnwiki: 'https://lfn.wikipedia.org',
  lfnwikipedia: 'https://lfn.wikipedia.org',
  lgwiki: 'https://lg.wikipedia.org',
  lgwikipedia: 'https://lg.wikipedia.org',
  liwiki: 'https://li.wikipedia.org',
  liwikipedia: 'https://li.wikipedia.org',
  liwiktionary: 'https://li.wiktionary.org',
  liwikibooks: 'https://li.wikibooks.org',
  liwikiquote: 'https://li.wikiquote.org',
  liwikisource: 'https://li.wikisource.org',
  lijwiki: 'https://lij.wikipedia.org',
  lijwikipedia: 'https://lij.wikipedia.org',
  lmowiki: 'https://lmo.wikipedia.org',
  lmowikipedia: 'https://lmo.wikipedia.org',
  lnwiki: 'https://ln.wikipedia.org',
  lnwikipedia: 'https://ln.wikipedia.org',
  lnwiktionary: 'https://ln.wiktionary.org',
  lnwikibooks: 'https://ln.wikibooks.org',
  lowiki: 'https://lo.wikipedia.org',
  lowikipedia: 'https://lo.wikipedia.org',
  lowiktionary: 'https://lo.wiktionary.org',
  lrcwiki: 'https://lrc.wikipedia.org',
  lrcwikipedia: 'https://lrc.wikipedia.org',
  ltwiki: 'https://lt.wikipedia.org',
  ltwikipedia: 'https://lt.wikipedia.org',
  ltwiktionary: 'https://lt.wiktionary.org',
  ltwikibooks: 'https://lt.wikibooks.org',
  ltwikiquote: 'https://lt.wikiquote.org',
  ltwikisource: 'https://lt.wikisource.org',
  ltgwiki: 'https://ltg.wikipedia.org',
  ltgwikipedia: 'https://ltg.wikipedia.org',
  lvwiki: 'https://lv.wikipedia.org',
  lvwikipedia: 'https://lv.wikipedia.org',
  lvwiktionary: 'https://lv.wiktionary.org',
  lvwikibooks: 'https://lv.wikibooks.org',
  maiwiki: 'https://mai.wikipedia.org',
  maiwikipedia: 'https://mai.wikipedia.org',
  map_bmswiki: 'https://map-bms.wikipedia.org',
  map_bmswikipedia: 'https://map-bms.wikipedia.org',
  mdfwiki: 'https://mdf.wikipedia.org',
  mdfwikipedia: 'https://mdf.wikipedia.org',
  mgwiki: 'https://mg.wikipedia.org',
  mgwikipedia: 'https://mg.wikipedia.org',
  mgwiktionary: 'https://mg.wiktionary.org',
  mgwikibooks: 'https://mg.wikibooks.org',
  mhwiki: 'https://mh.wikipedia.org',
  mhwikipedia: 'https://mh.wikipedia.org',
  mhwiktionary: 'https://mh.wiktionary.org',
  mhrwiki: 'https://mhr.wikipedia.org',
  mhrwikipedia: 'https://mhr.wikipedia.org',
  miwiki: 'https://mi.wikipedia.org',
  miwikipedia: 'https://mi.wikipedia.org',
  miwiktionary: 'https://mi.wiktionary.org',
  miwikibooks: 'https://mi.wikibooks.org',
  minwiki: 'https://min.wikipedia.org',
  minwikipedia: 'https://min.wikipedia.org',
  mkwiki: 'https://mk.wikipedia.org',
  mkwikipedia: 'https://mk.wikipedia.org',
  mkwiktionary: 'https://mk.wiktionary.org',
  mkwikibooks: 'https://mk.wikibooks.org',
  mkwikisource: 'https://mk.wikisource.org',
  mlwiki: 'https://ml.wikipedia.org',
  mlwikipedia: 'https://ml.wikipedia.org',
  mlwiktionary: 'https://ml.wiktionary.org',
  mlwikibooks: 'https://ml.wikibooks.org',
  mlwikiquote: 'https://ml.wikiquote.org',
  mlwikisource: 'https://ml.wikisource.org',
  mnwiki: 'https://mn.wikipedia.org',
  mnwikipedia: 'https://mn.wikipedia.org',
  mnwiktionary: 'https://mn.wiktionary.org',
  mnwikibooks: 'https://mn.wikibooks.org',
  mrwiki: 'https://mr.wikipedia.org',
  mrwikipedia: 'https://mr.wikipedia.org',
  mrwiktionary: 'https://mr.wiktionary.org',
  mrwikibooks: 'https://mr.wikibooks.org',
  mrwikiquote: 'https://mr.wikiquote.org',
  mrwikisource: 'https://mr.wikisource.org',
  mrjwiki: 'https://mrj.wikipedia.org',
  mrjwikipedia: 'https://mrj.wikipedia.org',
  mswiki: 'https://ms.wikipedia.org',
  mswikipedia: 'https://ms.wikipedia.org',
  mswiktionary: 'https://ms.wiktionary.org',
  mswikibooks: 'https://ms.wikibooks.org',
  mtwiki: 'https://mt.wikipedia.org',
  mtwikipedia: 'https://mt.wikipedia.org',
  mtwiktionary: 'https://mt.wiktionary.org',
  muswiki: 'https://mus.wikipedia.org',
  muswikipedia: 'https://mus.wikipedia.org',
  mwlwiki: 'https://mwl.wikipedia.org',
  mwlwikipedia: 'https://mwl.wikipedia.org',
  mywiki: 'https://my.wikipedia.org',
  mywikipedia: 'https://my.wikipedia.org',
  mywiktionary: 'https://my.wiktionary.org',
  mywikibooks: 'https://my.wikibooks.org',
  myvwiki: 'https://myv.wikipedia.org',
  myvwikipedia: 'https://myv.wikipedia.org',
  mznwiki: 'https://mzn.wikipedia.org',
  mznwikipedia: 'https://mzn.wikipedia.org',
  nawiki: 'https://na.wikipedia.org',
  nawikipedia: 'https://na.wikipedia.org',
  nawiktionary: 'https://na.wiktionary.org',
  nawikibooks: 'https://na.wikibooks.org',
  nawikiquote: 'https://na.wikiquote.org',
  nahwiki: 'https://nah.wikipedia.org',
  nahwikipedia: 'https://nah.wikipedia.org',
  nahwiktionary: 'https://nah.wiktionary.org',
  nahwikibooks: 'https://nah.wikibooks.org',
  napwiki: 'https://nap.wikipedia.org',
  napwikipedia: 'https://nap.wikipedia.org',
  ndswiki: 'https://nds.wikipedia.org',
  ndswikipedia: 'https://nds.wikipedia.org',
  ndswiktionary: 'https://nds.wiktionary.org',
  ndswikibooks: 'https://nds.wikibooks.org',
  ndswikiquote: 'https://nds.wikiquote.org',
  nds_nlwiki: 'https://nds-nl.wikipedia.org',
  nds_nlwikipedia: 'https://nds-nl.wikipedia.org',
  newiki: 'https://ne.wikipedia.org',
  newikipedia: 'https://ne.wikipedia.org',
  newiktionary: 'https://ne.wiktionary.org',
  newikibooks: 'https://ne.wikibooks.org',
  newwiki: 'https://new.wikipedia.org',
  newwikipedia: 'https://new.wikipedia.org',
  ngwiki: 'https://ng.wikipedia.org',
  ngwikipedia: 'https://ng.wikipedia.org',
  nlwiki: 'https://nl.wikipedia.org',
  nlwikipedia: 'https://nl.wikipedia.org',
  nlwiktionary: 'https://nl.wiktionary.org',
  nlwikibooks: 'https://nl.wikibooks.org',
  nlwikinews: 'https://nl.wikinews.org',
  nlwikiquote: 'https://nl.wikiquote.org',
  nlwikisource: 'https://nl.wikisource.org',
  nlwikivoyage: 'https://nl.wikivoyage.org',
  nnwiki: 'https://nn.wikipedia.org',
  nnwikipedia: 'https://nn.wikipedia.org',
  nnwiktionary: 'https://nn.wiktionary.org',
  nnwikiquote: 'https://nn.wikiquote.org',
  nowiki: 'https://no.wikipedia.org',
  nowikipedia: 'https://no.wikipedia.org',
  nowiktionary: 'https://no.wiktionary.org',
  nowikibooks: 'https://no.wikibooks.org',
  nowikinews: 'https://no.wikinews.org',
  nowikiquote: 'https://no.wikiquote.org',
  nowikisource: 'https://no.wikisource.org',
  novwiki: 'https://nov.wikipedia.org',
  novwikipedia: 'https://nov.wikipedia.org',
  nrmwiki: 'https://nrm.wikipedia.org',
  nrmwikipedia: 'https://nrm.wikipedia.org',
  nsowiki: 'https://nso.wikipedia.org',
  nsowikipedia: 'https://nso.wikipedia.org',
  nvwiki: 'https://nv.wikipedia.org',
  nvwikipedia: 'https://nv.wikipedia.org',
  nywiki: 'https://ny.wikipedia.org',
  nywikipedia: 'https://ny.wikipedia.org',
  ocwiki: 'https://oc.wikipedia.org',
  ocwikipedia: 'https://oc.wikipedia.org',
  ocwiktionary: 'https://oc.wiktionary.org',
  ocwikibooks: 'https://oc.wikibooks.org',
  olowiki: 'https://olo.wikipedia.org',
  olowikipedia: 'https://olo.wikipedia.org',
  omwiki: 'https://om.wikipedia.org',
  omwikipedia: 'https://om.wikipedia.org',
  omwiktionary: 'https://om.wiktionary.org',
  orwiki: 'https://or.wikipedia.org',
  orwikipedia: 'https://or.wikipedia.org',
  orwiktionary: 'https://or.wiktionary.org',
  orwikisource: 'https://or.wikisource.org',
  oswiki: 'https://os.wikipedia.org',
  oswikipedia: 'https://os.wikipedia.org',
  pawiki: 'https://pa.wikipedia.org',
  pawikipedia: 'https://pa.wikipedia.org',
  pawiktionary: 'https://pa.wiktionary.org',
  pawikibooks: 'https://pa.wikibooks.org',
  pawikisource: 'https://pa.wikisource.org',
  pagwiki: 'https://pag.wikipedia.org',
  pagwikipedia: 'https://pag.wikipedia.org',
  pamwiki: 'https://pam.wikipedia.org',
  pamwikipedia: 'https://pam.wikipedia.org',
  papwiki: 'https://pap.wikipedia.org',
  papwikipedia: 'https://pap.wikipedia.org',
  pcdwiki: 'https://pcd.wikipedia.org',
  pcdwikipedia: 'https://pcd.wikipedia.org',
  pdcwiki: 'https://pdc.wikipedia.org',
  pdcwikipedia: 'https://pdc.wikipedia.org',
  pflwiki: 'https://pfl.wikipedia.org',
  pflwikipedia: 'https://pfl.wikipedia.org',
  piwiki: 'https://pi.wikipedia.org',
  piwikipedia: 'https://pi.wikipedia.org',
  piwiktionary: 'https://pi.wiktionary.org',
  pihwiki: 'https://pih.wikipedia.org',
  pihwikipedia: 'https://pih.wikipedia.org',
  plwiki: 'https://pl.wikipedia.org',
  plwikipedia: 'https://pl.wikipedia.org',
  plwiktionary: 'https://pl.wiktionary.org',
  plwikibooks: 'https://pl.wikibooks.org',
  plwikinews: 'https://pl.wikinews.org',
  plwikiquote: 'https://pl.wikiquote.org',
  plwikisource: 'https://pl.wikisource.org',
  plwikivoyage: 'https://pl.wikivoyage.org',
  pmswiki: 'https://pms.wikipedia.org',
  pmswikipedia: 'https://pms.wikipedia.org',
  pmswikisource: 'https://pms.wikisource.org',
  pnbwiki: 'https://pnb.wikipedia.org',
  pnbwikipedia: 'https://pnb.wikipedia.org',
  pnbwiktionary: 'https://pnb.wiktionary.org',
  pntwiki: 'https://pnt.wikipedia.org',
  pntwikipedia: 'https://pnt.wikipedia.org',
  pswiki: 'https://ps.wikipedia.org',
  pswikipedia: 'https://ps.wikipedia.org',
  pswiktionary: 'https://ps.wiktionary.org',
  pswikibooks: 'https://ps.wikibooks.org',
  pswikivoyage: 'https://ps.wikivoyage.org',
  ptwiki: 'https://pt.wikipedia.org',
  ptwikipedia: 'https://pt.wikipedia.org',
  ptwiktionary: 'https://pt.wiktionary.org',
  ptwikibooks: 'https://pt.wikibooks.org',
  ptwikinews: 'https://pt.wikinews.org',
  ptwikiquote: 'https://pt.wikiquote.org',
  ptwikisource: 'https://pt.wikisource.org',
  ptwikiversity: 'https://pt.wikiversity.org',
  ptwikivoyage: 'https://pt.wikivoyage.org',
  quwiki: 'https://qu.wikipedia.org',
  quwikipedia: 'https://qu.wikipedia.org',
  quwiktionary: 'https://qu.wiktionary.org',
  quwikibooks: 'https://qu.wikibooks.org',
  quwikiquote: 'https://qu.wikiquote.org',
  rmwiki: 'https://rm.wikipedia.org',
  rmwikipedia: 'https://rm.wikipedia.org',
  rmwiktionary: 'https://rm.wiktionary.org',
  rmwikibooks: 'https://rm.wikibooks.org',
  rmywiki: 'https://rmy.wikipedia.org',
  rmywikipedia: 'https://rmy.wikipedia.org',
  rnwiki: 'https://rn.wikipedia.org',
  rnwikipedia: 'https://rn.wikipedia.org',
  rnwiktionary: 'https://rn.wiktionary.org',
  rowiki: 'https://ro.wikipedia.org',
  rowikipedia: 'https://ro.wikipedia.org',
  rowiktionary: 'https://ro.wiktionary.org',
  rowikibooks: 'https://ro.wikibooks.org',
  rowikinews: 'https://ro.wikinews.org',
  rowikiquote: 'https://ro.wikiquote.org',
  rowikisource: 'https://ro.wikisource.org',
  rowikivoyage: 'https://ro.wikivoyage.org',
  roa_rupwiki: 'https://roa-rup.wikipedia.org',
  roa_rupwikipedia: 'https://roa-rup.wikipedia.org',
  roa_rupwiktionary: 'https://roa-rup.wiktionary.org',
  roa_tarawiki: 'https://roa-tara.wikipedia.org',
  roa_tarawikipedia: 'https://roa-tara.wikipedia.org',
  ruwiki: 'https://ru.wikipedia.org',
  ruwikipedia: 'https://ru.wikipedia.org',
  ruwiktionary: 'https://ru.wiktionary.org',
  ruwikibooks: 'https://ru.wikibooks.org',
  ruwikinews: 'https://ru.wikinews.org',
  ruwikiquote: 'https://ru.wikiquote.org',
  ruwikisource: 'https://ru.wikisource.org',
  ruwikiversity: 'https://ru.wikiversity.org',
  ruwikivoyage: 'https://ru.wikivoyage.org',
  ruewiki: 'https://rue.wikipedia.org',
  ruewikipedia: 'https://rue.wikipedia.org',
  rwwiki: 'https://rw.wikipedia.org',
  rwwikipedia: 'https://rw.wikipedia.org',
  rwwiktionary: 'https://rw.wiktionary.org',
  sawiki: 'https://sa.wikipedia.org',
  sawikipedia: 'https://sa.wikipedia.org',
  sawiktionary: 'https://sa.wiktionary.org',
  sawikibooks: 'https://sa.wikibooks.org',
  sawikiquote: 'https://sa.wikiquote.org',
  sawikisource: 'https://sa.wikisource.org',
  sahwiki: 'https://sah.wikipedia.org',
  sahwikipedia: 'https://sah.wikipedia.org',
  sahwikiquote: 'https://sah.wikiquote.org',
  sahwikisource: 'https://sah.wikisource.org',
  satwiki: 'https://sat.wikipedia.org',
  satwikipedia: 'https://sat.wikipedia.org',
  scwiki: 'https://sc.wikipedia.org',
  scwikipedia: 'https://sc.wikipedia.org',
  scwiktionary: 'https://sc.wiktionary.org',
  scnwiki: 'https://scn.wikipedia.org',
  scnwikipedia: 'https://scn.wikipedia.org',
  scnwiktionary: 'https://scn.wiktionary.org',
  scowiki: 'https://sco.wikipedia.org',
  scowikipedia: 'https://sco.wikipedia.org',
  sdwiki: 'https://sd.wikipedia.org',
  sdwikipedia: 'https://sd.wikipedia.org',
  sdwiktionary: 'https://sd.wiktionary.org',
  sdwikinews: 'https://sd.wikinews.org',
  sewiki: 'https://se.wikipedia.org',
  sewikipedia: 'https://se.wikipedia.org',
  sewikibooks: 'https://se.wikibooks.org',
  sgwiki: 'https://sg.wikipedia.org',
  sgwikipedia: 'https://sg.wikipedia.org',
  sgwiktionary: 'https://sg.wiktionary.org',
  shwiki: 'https://sh.wikipedia.org',
  shwikipedia: 'https://sh.wikipedia.org',
  shwiktionary: 'https://sh.wiktionary.org',
  siwiki: 'https://si.wikipedia.org',
  siwikipedia: 'https://si.wikipedia.org',
  siwiktionary: 'https://si.wiktionary.org',
  siwikibooks: 'https://si.wikibooks.org',
  simplewiki: 'https://simple.wikipedia.org',
  simplewikipedia: 'https://simple.wikipedia.org',
  simplewiktionary: 'https://simple.wiktionary.org',
  simplewikibooks: 'https://simple.wikibooks.org',
  simplewikiquote: 'https://simple.wikiquote.org',
  skwiki: 'https://sk.wikipedia.org',
  skwikipedia: 'https://sk.wikipedia.org',
  skwiktionary: 'https://sk.wiktionary.org',
  skwikibooks: 'https://sk.wikibooks.org',
  skwikiquote: 'https://sk.wikiquote.org',
  skwikisource: 'https://sk.wikisource.org',
  slwiki: 'https://sl.wikipedia.org',
  slwikipedia: 'https://sl.wikipedia.org',
  slwiktionary: 'https://sl.wiktionary.org',
  slwikibooks: 'https://sl.wikibooks.org',
  slwikiquote: 'https://sl.wikiquote.org',
  slwikisource: 'https://sl.wikisource.org',
  slwikiversity: 'https://sl.wikiversity.org',
  smwiki: 'https://sm.wikipedia.org',
  smwikipedia: 'https://sm.wikipedia.org',
  smwiktionary: 'https://sm.wiktionary.org',
  snwiki: 'https://sn.wikipedia.org',
  snwikipedia: 'https://sn.wikipedia.org',
  snwiktionary: 'https://sn.wiktionary.org',
  sowiki: 'https://so.wikipedia.org',
  sowikipedia: 'https://so.wikipedia.org',
  sowiktionary: 'https://so.wiktionary.org',
  sqwiki: 'https://sq.wikipedia.org',
  sqwikipedia: 'https://sq.wikipedia.org',
  sqwiktionary: 'https://sq.wiktionary.org',
  sqwikibooks: 'https://sq.wikibooks.org',
  sqwikinews: 'https://sq.wikinews.org',
  sqwikiquote: 'https://sq.wikiquote.org',
  srwiki: 'https://sr.wikipedia.org',
  srwikipedia: 'https://sr.wikipedia.org',
  srwiktionary: 'https://sr.wiktionary.org',
  srwikibooks: 'https://sr.wikibooks.org',
  srwikinews: 'https://sr.wikinews.org',
  srwikiquote: 'https://sr.wikiquote.org',
  srwikisource: 'https://sr.wikisource.org',
  srnwiki: 'https://srn.wikipedia.org',
  srnwikipedia: 'https://srn.wikipedia.org',
  sswiki: 'https://ss.wikipedia.org',
  sswikipedia: 'https://ss.wikipedia.org',
  sswiktionary: 'https://ss.wiktionary.org',
  stwiki: 'https://st.wikipedia.org',
  stwikipedia: 'https://st.wikipedia.org',
  stwiktionary: 'https://st.wiktionary.org',
  stqwiki: 'https://stq.wikipedia.org',
  stqwikipedia: 'https://stq.wikipedia.org',
  suwiki: 'https://su.wikipedia.org',
  suwikipedia: 'https://su.wikipedia.org',
  suwiktionary: 'https://su.wiktionary.org',
  suwikibooks: 'https://su.wikibooks.org',
  suwikiquote: 'https://su.wikiquote.org',
  svwiki: 'https://sv.wikipedia.org',
  svwikipedia: 'https://sv.wikipedia.org',
  svwiktionary: 'https://sv.wiktionary.org',
  svwikibooks: 'https://sv.wikibooks.org',
  svwikinews: 'https://sv.wikinews.org',
  svwikiquote: 'https://sv.wikiquote.org',
  svwikisource: 'https://sv.wikisource.org',
  svwikiversity: 'https://sv.wikiversity.org',
  svwikivoyage: 'https://sv.wikivoyage.org',
  swwiki: 'https://sw.wikipedia.org',
  swwikipedia: 'https://sw.wikipedia.org',
  swwiktionary: 'https://sw.wiktionary.org',
  swwikibooks: 'https://sw.wikibooks.org',
  szlwiki: 'https://szl.wikipedia.org',
  szlwikipedia: 'https://szl.wikipedia.org',
  tawiki: 'https://ta.wikipedia.org',
  tawikipedia: 'https://ta.wikipedia.org',
  tawiktionary: 'https://ta.wiktionary.org',
  tawikibooks: 'https://ta.wikibooks.org',
  tawikinews: 'https://ta.wikinews.org',
  tawikiquote: 'https://ta.wikiquote.org',
  tawikisource: 'https://ta.wikisource.org',
  tcywiki: 'https://tcy.wikipedia.org',
  tcywikipedia: 'https://tcy.wikipedia.org',
  tewiki: 'https://te.wikipedia.org',
  tewikipedia: 'https://te.wikipedia.org',
  tewiktionary: 'https://te.wiktionary.org',
  tewikibooks: 'https://te.wikibooks.org',
  tewikiquote: 'https://te.wikiquote.org',
  tewikisource: 'https://te.wikisource.org',
  tetwiki: 'https://tet.wikipedia.org',
  tetwikipedia: 'https://tet.wikipedia.org',
  tgwiki: 'https://tg.wikipedia.org',
  tgwikipedia: 'https://tg.wikipedia.org',
  tgwiktionary: 'https://tg.wiktionary.org',
  tgwikibooks: 'https://tg.wikibooks.org',
  thwiki: 'https://th.wikipedia.org',
  thwikipedia: 'https://th.wikipedia.org',
  thwiktionary: 'https://th.wiktionary.org',
  thwikibooks: 'https://th.wikibooks.org',
  thwikinews: 'https://th.wikinews.org',
  thwikiquote: 'https://th.wikiquote.org',
  thwikisource: 'https://th.wikisource.org',
  tiwiki: 'https://ti.wikipedia.org',
  tiwikipedia: 'https://ti.wikipedia.org',
  tiwiktionary: 'https://ti.wiktionary.org',
  tkwiki: 'https://tk.wikipedia.org',
  tkwikipedia: 'https://tk.wikipedia.org',
  tkwiktionary: 'https://tk.wiktionary.org',
  tkwikibooks: 'https://tk.wikibooks.org',
  tkwikiquote: 'https://tk.wikiquote.org',
  tlwiki: 'https://tl.wikipedia.org',
  tlwikipedia: 'https://tl.wikipedia.org',
  tlwiktionary: 'https://tl.wiktionary.org',
  tlwikibooks: 'https://tl.wikibooks.org',
  tnwiki: 'https://tn.wikipedia.org',
  tnwikipedia: 'https://tn.wikipedia.org',
  tnwiktionary: 'https://tn.wiktionary.org',
  towiki: 'https://to.wikipedia.org',
  towikipedia: 'https://to.wikipedia.org',
  towiktionary: 'https://to.wiktionary.org',
  tpiwiki: 'https://tpi.wikipedia.org',
  tpiwikipedia: 'https://tpi.wikipedia.org',
  tpiwiktionary: 'https://tpi.wiktionary.org',
  trwiki: 'https://tr.wikipedia.org',
  trwikipedia: 'https://tr.wikipedia.org',
  trwiktionary: 'https://tr.wiktionary.org',
  trwikibooks: 'https://tr.wikibooks.org',
  trwikinews: 'https://tr.wikinews.org',
  trwikiquote: 'https://tr.wikiquote.org',
  trwikisource: 'https://tr.wikisource.org',
  tswiki: 'https://ts.wikipedia.org',
  tswikipedia: 'https://ts.wikipedia.org',
  tswiktionary: 'https://ts.wiktionary.org',
  ttwiki: 'https://tt.wikipedia.org',
  ttwikipedia: 'https://tt.wikipedia.org',
  ttwiktionary: 'https://tt.wiktionary.org',
  ttwikibooks: 'https://tt.wikibooks.org',
  ttwikiquote: 'https://tt.wikiquote.org',
  tumwiki: 'https://tum.wikipedia.org',
  tumwikipedia: 'https://tum.wikipedia.org',
  twwiki: 'https://tw.wikipedia.org',
  twwikipedia: 'https://tw.wikipedia.org',
  twwiktionary: 'https://tw.wiktionary.org',
  tywiki: 'https://ty.wikipedia.org',
  tywikipedia: 'https://ty.wikipedia.org',
  tyvwiki: 'https://tyv.wikipedia.org',
  tyvwikipedia: 'https://tyv.wikipedia.org',
  udmwiki: 'https://udm.wikipedia.org',
  udmwikipedia: 'https://udm.wikipedia.org',
  ugwiki: 'https://ug.wikipedia.org',
  ugwikipedia: 'https://ug.wikipedia.org',
  ugwiktionary: 'https://ug.wiktionary.org',
  ugwikibooks: 'https://ug.wikibooks.org',
  ugwikiquote: 'https://ug.wikiquote.org',
  ukwiki: 'https://uk.wikipedia.org',
  ukwikipedia: 'https://uk.wikipedia.org',
  ukwiktionary: 'https://uk.wiktionary.org',
  ukwikibooks: 'https://uk.wikibooks.org',
  ukwikinews: 'https://uk.wikinews.org',
  ukwikiquote: 'https://uk.wikiquote.org',
  ukwikisource: 'https://uk.wikisource.org',
  ukwikivoyage: 'https://uk.wikivoyage.org',
  urwiki: 'https://ur.wikipedia.org',
  urwikipedia: 'https://ur.wikipedia.org',
  urwiktionary: 'https://ur.wiktionary.org',
  urwikibooks: 'https://ur.wikibooks.org',
  urwikiquote: 'https://ur.wikiquote.org',
  uzwiki: 'https://uz.wikipedia.org',
  uzwikipedia: 'https://uz.wikipedia.org',
  uzwiktionary: 'https://uz.wiktionary.org',
  uzwikibooks: 'https://uz.wikibooks.org',
  uzwikiquote: 'https://uz.wikiquote.org',
  vewiki: 'https://ve.wikipedia.org',
  vewikipedia: 'https://ve.wikipedia.org',
  vecwiki: 'https://vec.wikipedia.org',
  vecwikipedia: 'https://vec.wikipedia.org',
  vecwiktionary: 'https://vec.wiktionary.org',
  vecwikisource: 'https://vec.wikisource.org',
  vepwiki: 'https://vep.wikipedia.org',
  vepwikipedia: 'https://vep.wikipedia.org',
  viwiki: 'https://vi.wikipedia.org',
  viwikipedia: 'https://vi.wikipedia.org',
  viwiktionary: 'https://vi.wiktionary.org',
  viwikibooks: 'https://vi.wikibooks.org',
  viwikiquote: 'https://vi.wikiquote.org',
  viwikisource: 'https://vi.wikisource.org',
  viwikivoyage: 'https://vi.wikivoyage.org',
  vlswiki: 'https://vls.wikipedia.org',
  vlswikipedia: 'https://vls.wikipedia.org',
  vowiki: 'https://vo.wikipedia.org',
  vowikipedia: 'https://vo.wikipedia.org',
  vowiktionary: 'https://vo.wiktionary.org',
  vowikibooks: 'https://vo.wikibooks.org',
  vowikiquote: 'https://vo.wikiquote.org',
  wawiki: 'https://wa.wikipedia.org',
  wawikipedia: 'https://wa.wikipedia.org',
  wawiktionary: 'https://wa.wiktionary.org',
  wawikibooks: 'https://wa.wikibooks.org',
  warwiki: 'https://war.wikipedia.org',
  warwikipedia: 'https://war.wikipedia.org',
  wowiki: 'https://wo.wikipedia.org',
  wowikipedia: 'https://wo.wikipedia.org',
  wowiktionary: 'https://wo.wiktionary.org',
  wowikiquote: 'https://wo.wikiquote.org',
  wuuwiki: 'https://wuu.wikipedia.org',
  wuuwikipedia: 'https://wuu.wikipedia.org',
  xalwiki: 'https://xal.wikipedia.org',
  xalwikipedia: 'https://xal.wikipedia.org',
  xhwiki: 'https://xh.wikipedia.org',
  xhwikipedia: 'https://xh.wikipedia.org',
  xhwiktionary: 'https://xh.wiktionary.org',
  xhwikibooks: 'https://xh.wikibooks.org',
  xmfwiki: 'https://xmf.wikipedia.org',
  xmfwikipedia: 'https://xmf.wikipedia.org',
  yiwiki: 'https://yi.wikipedia.org',
  yiwikipedia: 'https://yi.wikipedia.org',
  yiwiktionary: 'https://yi.wiktionary.org',
  yiwikisource: 'https://yi.wikisource.org',
  yowiki: 'https://yo.wikipedia.org',
  yowikipedia: 'https://yo.wikipedia.org',
  yowiktionary: 'https://yo.wiktionary.org',
  yowikibooks: 'https://yo.wikibooks.org',
  zawiki: 'https://za.wikipedia.org',
  zawikipedia: 'https://za.wikipedia.org',
  zawiktionary: 'https://za.wiktionary.org',
  zawikibooks: 'https://za.wikibooks.org',
  zawikiquote: 'https://za.wikiquote.org',
  zeawiki: 'https://zea.wikipedia.org',
  zeawikipedia: 'https://zea.wikipedia.org',
  zhwiki: 'https://zh.wikipedia.org',
  zhwikipedia: 'https://zh.wikipedia.org',
  zhwiktionary: 'https://zh.wiktionary.org',
  zhwikibooks: 'https://zh.wikibooks.org',
  zhwikinews: 'https://zh.wikinews.org',
  zhwikiquote: 'https://zh.wikiquote.org',
  zhwikisource: 'https://zh.wikisource.org',
  zhwikiversity: 'https://zh.wikiversity.org',
  zhwikivoyage: 'https://zh.wikivoyage.org',
  zh_classicalwiki: 'https://zh-classical.wikipedia.org',
  zh_classicalwikipedia: 'https://zh-classical.wikipedia.org',
  zh_min_nanwiki: 'https://zh-min-nan.wikipedia.org',
  zh_min_nanwikipedia: 'https://zh-min-nan.wikipedia.org',
  zh_min_nanwiktionary: 'https://zh-min-nan.wiktionary.org',
  zh_min_nanwikibooks: 'https://zh-min-nan.wikibooks.org',
  zh_min_nanwikiquote: 'https://zh-min-nan.wikiquote.org',
  zh_min_nanwikisource: 'https://zh-min-nan.wikisource.org',
  zh_yuewiki: 'https://zh-yue.wikipedia.org',
  zh_yuewikipedia: 'https://zh-yue.wikipedia.org',
  zuwiki: 'https://zu.wikipedia.org',
  zuwikipedia: 'https://zu.wikipedia.org',
  zuwiktionary: 'https://zu.wiktionary.org',
  zuwikibooks: 'https://zu.wikibooks.org'
};
if ( module.exports) {
  module.exports = site_map;
}
});

const isUrl = /^https?:\/\//;

function isArray(arr) {
  return arr.constructor.toString().indexOf('Array') > -1
}

const makeTitle = function(title = '') {
  //if given a url...
  if (isUrl.test(title) === true) {
    title = title.replace(/.*?\/wiki\//, '');
    title = title.replace(/\?.*/, '');
  }
  title = encodeURIComponent(title);
  return title
};

//construct a lookup-url for the wikipedia api
const makeUrl = function(title, lang, options) {
  lang = lang || 'en';
  let url = `https://${lang}.wikipedia.org/w/api.php`;
  if (site_map_1[lang]) {
    url = site_map_1[lang] + '/w/api.php';
  }
  if (options.wikiUrl) {
    url = options.wikiUrl;
  }
  //we use the 'revisions' api here, instead of the Raw api, for its CORS-rules..
  url +=
    '?action=query&prop=revisions&rvprop=content&maxlag=5&rvslots=main&origin=*&format=json';
  if (options.follow_redirects !== false) {
    url += '&redirects=true';
  }
  var lookup = 'titles';
  let pages = [];
  //support one, or many pages
  if (isArray(title) === false) {
    pages = [title];
  } else {
    pages = title;
  }
  //assume numbers mean pageid, and strings are titles (like '1984')
  if (typeof pages[0] === 'number') {
    lookup = 'pageids';
  } else {
    pages = pages.map(makeTitle);
  }
  pages = pages.filter(p => p !== '');
  pages = pages.join('|');
  url += '&' + lookup + '=' + pages;
  return url
};

var _url = makeUrl;

//allow quite! flexible params to fetch, category
// [lang], [options], [callback]
const getParams = function(a, b, c) {
  let options = {};
  let lang = 'en';
  let callback = null;
  if (typeof a === 'function') {
    callback = a;
  } else if (typeof a === 'object') {
    options = a;
  } else if (typeof a === 'string') {
    lang = a;
  }
  if (typeof b === 'function') {
    callback = b;
  } else if (typeof b === 'object') {
    options = b;
  }
  if (typeof c === 'function') {
    callback = c;
  }
  return {
    options: options,
    lang: lang,
    callback: callback
  };
};
var _params = getParams;

//helper for looping around all sections of a document
const sectionMap = function(doc, fn, clue) {
  let arr = [];
  doc.sections().forEach((sec) => {
    let list = [];
    if (typeof clue === 'string') {
      list = sec[fn](clue);
    } else {
      list = sec[fn]();
    }
    list.forEach((t) => {
      arr.push(t);
    });
  });
  if (typeof clue === 'number') {
    return arr[clue];
  }
  return arr;
};
var _sectionMap = sectionMap;

//
const setDefaults = function(options, defaults) {
  let obj = {};
  defaults = defaults || {};
  Object.keys(defaults).forEach((k) => {
    obj[k] = defaults[k];
  });
  options = options || {};
  Object.keys(options).forEach((k) => {
    obj[k] = options[k];
  });
  return obj;
};
var setDefaults_1 = setDefaults;

const defaults = {
  redirects: true,
  infoboxes: true,
  templates: true,
  sections: true,
};
// we should try to make this look like the wikipedia does, i guess.
const softRedirect = function(doc) {
  let link = doc.redirectTo();
  let href = link.page;
  href = './' + href.replace(/ /g, '_');
  if (link.anchor) {
    href += '#' + link.anchor;
  }
  return `↳ [${link.text}](${href})`;
};

//turn a Doc object into a markdown string
const toMarkdown = function(doc, options) {
  options = setDefaults_1(options, defaults);
  let data = doc.data;
  let md = '';
  //if it's a redirect page, give it a 'soft landing':
  if (options.redirects === true && doc.isRedirect() === true) {
    return softRedirect(doc); //end it here
  }
  //render infoboxes (up at the top)
  if (options.infoboxes === true && options.templates === true) {
    md += doc.infoboxes().map(infobox => infobox.markdown(options)).join('\n\n');
  }
  //render each section
  if (options.sections === true || options.paragraphs === true || options.sentences === true) {
    md += data.sections.map(s => s.markdown(options)).join('\n\n');
  }
  //default false
  if (options.citations === true) {
    md += '## References';
    md += doc.citations().map(c => c.json(options)).join('\n');

  }
  return md;
};
var toMarkdown_1 = toMarkdown;

const defaults$1 = {
  title: true,
  infoboxes: true,
  headers: true,
  sections: true,
  links: true,
};
// we should try to make this look like the wikipedia does, i guess.
const softRedirect$1 = function(doc) {
  let link = doc.redirectTo();
  let href = link.page;
  href = './' + href.replace(/ /g, '_');
  if (link.anchor) {
    href += '#' + link.anchor;
  }
  return `  <div class="redirect">
  ↳ <a class="link" href="./${href}">${link.text}</a>
  </div>`;
};

//turn a Doc object into a HTML string
const toHtml = function(doc, options) {
  options = setDefaults_1(options, defaults$1);
  let data = doc.data;
  let html = '';
  html += '<!DOCTYPE html>\n';
  html += '<html>\n';
  html += '<head>\n';
  //add page title
  if (options.title === true && data.title) {
    html += '<title>' + data.title + '</title>\n';
  }
  html += '</head>\n';
  html += '<body>\n';

  //if it's a redirect page, give it a 'soft landing':
  if (doc.isRedirect() === true) {
    html += softRedirect$1(doc);
    return html + '\n</body>\n</html>'; //end it here.
  }
  //render infoboxes (up at the top)
  if (options.infoboxes === true) {
    html += doc.infoboxes().map(i => i.html(options)).join('\n');
  }
  //render each section
  if (options.sections === true && (options.paragraphs === true || options.sentences === true)) {
    html += data.sections.map(s => s.html(options)).join('\n');
  }
  //default off
  if (options.references === true) {
    html += '<h2>References</h2>';
    html += doc.references().map((c) => c.json(options)).join('\n');
  }
  html += '</body>\n';
  html += '</html>';
  return html;
};
var toHtml_1 = toHtml;

const defaults$2 = {
  title: true,
  sections: true,
  pageID: true,
  categories: true,
};

//an opinionated output of the most-wanted data
const toJSON = function(doc, options) {
  options = setDefaults_1(options, defaults$2);
  let data = {};
  if (options.title) {
    data.title = doc.options.title || doc.title();
  }
  if (options.pageID && doc.options.pageID) {
    data.pageID = doc.options.pageID;
  }
  if (options.categories) {
    data.categories = doc.categories();
  }
  if (options.sections) {
    data.sections = doc.sections().map(i => i.json(options));
  }
  if (doc.isRedirect() === true) {
    data.isRedirect = true;
    data.redirectTo = doc.data.redirectTo;
    data.sections = [];
  }

  //these are default-off
  if (options.coordinates) {
    data.coordinates = doc.coordinates();
  }
  if (options.infoboxes) {
    data.infoboxes = doc.infoboxes().map(i => i.json(options));
  }
  if (options.images) {
    data.images = doc.images().map(i => i.json(options));
  }
  if (options.plaintext) {
    data.plaintext = doc.plaintext(options);
  }
  if (options.citations || options.references) {
    data.references = doc.references();
  }
  if (options.markdown) {
    data.markdown = doc.markdown(options);
  }
  if (options.html) {
    data.html = doc.html(options);
  }
  if (options.latex) {
    data.latex = doc.latex(options);
  }
  return data;
};
var toJson = toJSON;

const defaults$3 = {
  infoboxes: true,
  sections: true,
};

// we should try to make this look like the wikipedia does, i guess.
const softRedirect$2 = function(doc) {
  let link = doc.redirectTo();
  let href = link.page;
  href = './' + href.replace(/ /g, '_');
  //add anchor
  if (link.anchor) {
    href += '#' + link.anchor;
  }
  return '↳ \\href{' + href + '}{' + link.text + '}';
};

//
const toLatex = function(doc, options) {
  options = setDefaults_1(options, defaults$3);
  let out = '';
  //if it's a redirect page, give it a 'soft landing':
  if (doc.isRedirect() === true) {
    return softRedirect$2(doc); //end it here.
  }
  //render infoboxes (up at the top)
  if (options.infoboxes === true) {
    out += doc.infoboxes().map(i => i.latex(options)).join('\n');
  }
  //render each section
  if (options.sections === true || options.paragraphs === true || options.sentences === true) {
    out += doc.sections().map(s => s.latex(options)).join('\n');
  }
  //default off
  //render citations
  if (options.citations === true) {
    out += doc.citations().map(c => c.latex(options)).join('\n');
  }
  return out;
};
var toLatex_1 = toLatex;

//alternative names for methods in API
const aliasList = {
  toMarkdown: 'markdown',

  toHtml: 'html',
  HTML: 'html',

  toJSON: 'json',
  toJson: 'json',
  JSON: 'json',

  toLatex: 'latex',

  plaintext: 'text',

  wikiscript: 'wikitext',
  wiki: 'wikitext',
  original: 'wikitext'
};
var aliases = aliasList;

//markdown images are like this: ![alt text](href)
const doImage = (image) => {
  let alt = image.data.file.replace(/^(file|image):/i, '');
  alt = alt.replace(/\.(jpg|jpeg|png|gif|svg)/i, '');
  return '![' + alt + '](' + image.thumbnail() + ')';
};
var toMarkdown$1 = doImage;

const makeImage = (img) => {
  return '  <img src="' + img.thumbnail() + '" alt="' + img.alt() + '"/>';
};
var toHtml$1 = makeImage;

//
const toLatex$1 = function(image) {
  let alt = image.alt();
  var out = '\\begin{figure}';
  out += '\n\\includegraphics[width=\\linewidth]{' + image.thumb() + '}';
  out += '\n\\caption{' + alt + '}';
  // out += '\n%\\label{fig:myimage1}';
  out += '\n\\end{figure}';
  return out;
};
var toLatex_1$1 = toLatex$1;

const defaults$4 = {
  caption: true,
  alt: true,
  links: true,
  thumb: true,
  url: true,
};
//
const toJson$1 = function(img, options) {
  options = setDefaults_1(options, defaults$4);
  let json = {
    file: img.file(),
  };
  if (options.thumb !== false) {
    json.thumb = img.thumbnail();
  }
  if (options.url !== false) {
    json.url = img.url();
  }
  //add captions
  if (options.caption !== false && img.data.caption) {
    json.caption = img.caption();
    if (options.links !== false && img.data.caption.links()) {
      json.links = img.links();
    }
  }
  if (options.alt !== false && img.data.alt) {
    json.alt = img.alt();
  }
  return json;
};
var toJson_1 = toJson$1;

const server = 'https://wikipedia.org/wiki/Special:Redirect/file/';


const encodeTitle = function(file) {
  let title = file.replace(/^(image|file?)\:/i, '');
  //titlecase it
  title = title.charAt(0).toUpperCase() + title.substring(1);
  //spaces to underscores
  title = title.trim().replace(/ /g, '_');
  return title;
};

//the wikimedia image url is a little silly:
const makeSrc = function(file) {
  let title = encodeTitle(file);
  title = encodeURIComponent(title);
  return title;
};

//the class for our image generation functions
const Image = function(data) {
  Object.defineProperty(this, 'data', {
    enumerable: false,
    value: data
  });
};

const methods = {
  file() {
    return this.data.file || '';
  },
  alt() {
    let str = this.data.alt || this.data.file || '';
    str = str.replace(/^(file|image):/i, '');
    str = str.replace(/\.(jpg|jpeg|png|gif|svg)/i, '');
    return str.replace(/_/g, ' ');
  },
  caption() {
    if (this.data.caption) {
      return this.data.caption.text();
    }
    return '';
  },
  links() {
    if (this.data.caption) {
      return this.data.caption.links();
    }
    return [];
  },
  url() {
    return server + makeSrc(this.file());
  },
  thumbnail(size) {
    size = size || 300;
    let path = makeSrc(this.file());
    return server + path + '?width=' + size;
  },
  format() {
    let arr = this.file().split('.');
    if (arr[arr.length - 1]) {
      return arr[arr.length - 1].toLowerCase();
    }
    return null;
  },
  exists(callback) { //check if the image (still) exists
    return new Promise((cb) => {
      browserPonyfill(this.url(), {
        method: 'HEAD',
      }).then(function(res) {
        const exists = res.status === 200;
        //support callback non-promise form
        if (callback) {
          callback(exists);
        }
        cb(exists);
      });
    });
  },
  markdown : function(options) {
    return toMarkdown$1(this);
  },
  latex : function(options) {
    return toLatex_1$1(this);
  },
  html : function(options) {
    return toHtml$1(this);
  },
  json: function(options) {
    options = options || {};
    return toJson_1(this, options);
  },
  text: function() {
    return '';
  }
};

Object.keys(methods).forEach((k) => {
  Image.prototype[k] = methods[k];
});
//add alises, too
Object.keys(aliases).forEach((k) => {
  Image.prototype[k] = methods[aliases[k]];
});
Image.prototype.src = Image.prototype.url;
Image.prototype.thumb = Image.prototype.thumbnail;
var Image_1 = Image;

const defaults$5 = {
  tables: true,
  lists: true,
  paragraphs: true,
};

//
const Document = function(data, options) {
  this.options = options || {};
  Object.defineProperty(this, 'data', {
    enumerable: false,
    value: data
  });
};

const methods$1 = {
  title : function(str) {
    //use like a setter
    if (str !== undefined) {
      this.data.title = str;
      return str;
    }
    //few places this could be stored..
    if (this.data.title !== '') {
      return this.data.title;
    }
    if (this.options.title) {
      return this.options.title;
    }
    let guess = null;
    //guess the title of this page from first sentence bolding
    let sen = this.sentences(0);
    if (sen) {
      guess = sen.bolds(0);
    }
    return guess;
  },
  isRedirect : function() {
    return this.data.type === 'redirect';
  },
  redirectTo: function() {
    return this.data.redirectTo;
  },
  isDisambiguation : function() {
    return this.data.type === 'disambiguation';
  },
  categories : function(clue) {
    if (typeof clue === 'number') {
      return this.data.categories[clue];
    }
    return this.data.categories || [];
  },
  sections : function(clue) {
    let arr = this.data.sections || [];
    arr.forEach((sec) => sec.doc = this);
    //grab a specific section, by its title
    if (typeof clue === 'string') {
      let str = clue.toLowerCase().trim();
      return arr.find((s) => {
        return s.title().toLowerCase() === str;
      });
    }
    if (typeof clue === 'number') {
      return arr[clue];
    }
    return arr;
  },
  paragraphs : function(n) {
    let arr = [];
    this.data.sections.forEach((s) => {
      arr = arr.concat(s.paragraphs());
    });
    if (typeof n === 'number') {
      return arr[n];
    }
    return arr;
  },
  paragraph : function(n) {
    let arr = this.paragraphs() || [];
    if (typeof n === 'number') {
      return arr[n];
    }
    return arr[0];
  },
  sentences : function(n) {
    let arr = [];
    this.sections().forEach((sec) => {
      arr = arr.concat(sec.sentences());
    });
    if (typeof n === 'number') {
      return arr[n];
    }
    return arr;
  },
  images : function(clue) {
    let arr = _sectionMap(this, 'images', null);
    //grab image from infobox, first
    this.infoboxes().forEach((info) => {
      if (info.data.image) {
        arr.unshift(info.image()); //put it at the top
      }
    });
    //look for 'gallery' templates, too
    this.templates().forEach((obj) => {
      if (obj.template === 'gallery') {
        obj.images = obj.images || [];
        obj.images.forEach((img) => {
          if (img instanceof Image_1 === false) {
            img = new Image_1(img);
          }
          arr.push(img);
        });
      }
    });
    if (typeof clue === 'number') {
      return arr[clue];
    }
    return arr;
  },
  links : function(clue) {
    return _sectionMap(this, 'links', clue);
  },
  interwiki : function(clue) {
    return _sectionMap(this, 'interwiki', clue);
  },
  lists : function(clue) {
    return _sectionMap(this, 'lists', clue);
  },
  tables : function(clue) {
    return _sectionMap(this, 'tables', clue);
  },
  templates : function(clue) {
    return _sectionMap(this, 'templates', clue);
  },
  references : function(clue) {
    return _sectionMap(this, 'references', clue);
  },
  coordinates : function(clue) {
    return _sectionMap(this, 'coordinates', clue);
  },
  infoboxes : function(clue) {
    let arr = _sectionMap(this, 'infoboxes');
    //sort them by biggest-first
    arr = arr.sort((a, b) => {
      if (Object.keys(a.data).length > Object.keys(b.data).length) {
        return -1;
      }
      return 1;
    });
    if (typeof clue === 'number') {
      return arr[clue];
    }
    return arr;
  },
  text : function(options) {
    options = setDefaults_1(options, defaults$5);
    //nah, skip these.
    if (this.isRedirect() === true) {
      return '';
    }
    let arr = this.sections().map(sec => sec.text(options));
    return arr.join('\n\n');
  },
  markdown : function(options) {
    options = setDefaults_1(options, defaults$5);
    return toMarkdown_1(this, options);
  },
  latex : function(options) {
    options = setDefaults_1(options, defaults$5);
    return toLatex_1(this, options);
  },
  html : function(options) {
    options = setDefaults_1(options, defaults$5);
    return toHtml_1(this, options);
  },
  json : function(options) {
    options = setDefaults_1(options, defaults$5);
    return toJson(this, options);
  },
  debug: function() {
    console.log('\n');
    this.sections().forEach((sec) => {
      let indent = ' - ';
      for(let i = 0; i < sec.depth; i += 1) {
        indent = ' -' + indent;
      }
      console.log(indent + (sec.title() || '(Intro)'));
    });
    return this;
  }
};

//add alises
Object.keys(aliases).forEach((k) => {
  Document.prototype[k] = methods$1[aliases[k]];
});
//add singular-methods, too
let plurals = ['sections', 'infoboxes', 'sentences', 'citations', 'references', 'coordinates', 'tables', 'links', 'images', 'categories'];
plurals.forEach((fn) => {
  let sing = fn.replace(/ies$/, 'y');
  sing = sing.replace(/e?s$/, '');
  methods$1[sing] = function(n) {
    n = n || 0;
    return this[fn](n);
  };
});

Object.keys(methods$1).forEach((k) => {
  Document.prototype[k] = methods$1[k];
});

//alias these ones
Document.prototype.isDisambig = Document.prototype.isDisambiguation;
Document.prototype.citations = Document.prototype.references;
Document.prototype.redirectsTo = Document.prototype.redirectTo;
Document.prototype.redirect = Document.prototype.redirectTo;
Document.prototype.redirects = Document.prototype.redirectTo;

var Document_1 = Document;

var i18n_1 = createCommonjsModule(function (module) {
// wikipedia special terms lifted and augmented from parsoid parser april 2015
// (not even close to being complete)
let i18n = {
  files: [
    'файл',
    'fitxer',
    'soubor',
    'datei',
    'file',
    'archivo',
    'پرونده',
    'tiedosto',
    'mynd',
    'su\'wret',
    'fichier',
    'bestand',
    'датотека',
    'dosya',
    'fil',
    'ファイル',
    'चित्र'
  ],
  images: ['image', 'चित्र'],
  templates: [
    'шаблён',
    'plantilla',
    'šablona',
    'vorlage',
    'template',
    'الگو',
    'malline',
    'snið',
    'shablon',
    'modèle',
    'sjabloon',
    'шаблон',
    'şablon'
  ],
  categories: [
    'катэгорыя',
    'categoria',
    'kategorie',
    'category',
    'categoría',
    'رده',
    'luokka',
    'flokkur',
    'kategoriya',
    'catégorie',
    'categorie',
    'категорија',
    'kategori',
    'kategoria',
    'تصنيف',
    'श्रेणी'
  ],
  redirects: [
    'перанакіраваньне',
    'redirect',
    'přesměruj',
    'weiterleitung',
    'redirección',
    'redireccion',
    'تغییر_مسیر',
    'تغییرمسیر',
    'ohjaus',
    'uudelleenohjaus',
    'tilvísun',
    'aýdaw',
    'айдау',
    'redirection',
    'doorverwijzing',
    'преусмери',
    'преусмјери',
    'yönlendi̇rme',
    'yönlendi̇r',
    '重定向',
    'redirección',
    'redireccion',
    '重定向',
    'yönlendirm?e?',
    'تغییر_مسیر',
    'تغییرمسیر',
    'перанакіраваньне',
    'yönlendirme'
  ],
  specials: [
    'спэцыяльныя',
    'especial',
    'speciální',
    'spezial',
    'special',
    'ویژه',
    'toiminnot',
    'kerfissíða',
    'arnawlı',
    'spécial',
    'speciaal',
    'посебно',
    'özel',
    '特別'
  ],
  users: [
    'удзельнік',
    'usuari',
    'uživatel',
    'benutzer',
    'user',
    'usuario',
    'کاربر',
    'käyttäjä',
    'notandi',
    'paydalanıwshı',
    'utilisateur',
    'gebruiker',
    'корисник',
    'kullanıcı',
    '利用者'
  ],
  disambigs: [
    'disambig', //en
    'disambiguation', //en
    'dab', //en
    'disamb', //en
    'begriffsklärung', //de
    'ujednoznacznienie', //pl
    'doorverwijspagina', //nl
    '消歧义', //zh
    'desambiguación', //es
    'dubbelsinnig', //af
    'disambigua', //it
    'desambiguação', //pt
    'homonymie', //fr
    'неоднозначность', //ru
    'anlam ayrımı', //tr
    '曖昧さ回避' //ja
  ],
  infoboxes: [
    'infobox',
    'ficha',
    'канадский',
    'inligtingskas',
    'inligtingskas3', //af
    'لغة',
    'bilgi kutusu', //tr
    'yerleşim bilgi kutusu',
    'infoboks', //nn, no
    'ज्ञानसन्दूक'
  ],
  sources: [
    //blacklist these headings, as they're not plain-text
    'references',
    'see also',
    'external links',
    'further reading',
    'notes et références',
    'voir aussi',
    'liens externes',
    '参考文献', //references (ja)
    '脚注', //citations (ja)
    '関連項目', //see also (ja)
    '外部リンク' //external links (ja)
  ]
};

let dictionary = {};
Object.keys(i18n).forEach(k => {
  i18n[k].forEach(w => {
    dictionary[w] = true;
  });
});
i18n.dictionary = dictionary;

if ( module.exports) {
  module.exports = i18n;
}
});

var languages = {
  aa: {
    english_title: 'Afar',
    direction: 'ltr',
    local_title: 'Afar'
  },
  ab: {
    english_title: 'Abkhazian',
    direction: 'ltr',
    local_title: 'Аҧсуа'
  },
  af: {
    english_title: 'Afrikaans',
    direction: 'ltr',
    local_title: 'Afrikaans'
  },
  ak: {
    english_title: 'Akan',
    direction: 'ltr',
    local_title: 'Akana'
  },
  als: {
    english_title: 'Alemannic',
    direction: 'ltr',
    local_title: 'Alemannisch'
  },
  am: {
    english_title: 'Amharic',
    direction: 'ltr',
    local_title: 'አማርኛ'
  },
  an: {
    english_title: 'Aragonese',
    direction: 'ltr',
    local_title: 'Aragonés'
  },
  ang: {
    english_title: 'Anglo-Saxon',
    direction: 'ltr',
    local_title: 'Englisc'
  },
  ar: {
    english_title: 'Arabic',
    direction: 'rtl',
    local_title: 'العربية'
  },
  arc: {
    english_title: 'Aramaic',
    direction: 'rtl',
    local_title: 'ܣܘܪܬ'
  },
  as: {
    english_title: 'Assamese',
    direction: 'ltr',
    local_title: 'অসমীয়া'
  },
  ast: {
    english_title: 'Asturian',
    direction: 'ltr',
    local_title: 'Asturianu'
  },
  av: {
    english_title: 'Avar',
    direction: 'ltr',
    local_title: 'Авар'
  },
  ay: {
    english_title: 'Aymara',
    direction: 'ltr',
    local_title: 'Aymar'
  },
  az: {
    english_title: 'Azerbaijani',
    direction: 'ltr',
    local_title: 'Azərbaycanca'
  },
  ba: {
    english_title: 'Bashkir',
    direction: 'ltr',
    local_title: 'Башҡорт'
  },
  bar: {
    english_title: 'Bavarian',
    direction: 'ltr',
    local_title: 'Boarisch'
  },
  'bat-smg': {
    english_title: 'Samogitian',
    direction: 'ltr',
    local_title: 'Žemaitėška'
  },
  bcl: {
    english_title: 'Bikol',
    direction: 'ltr',
    local_title: 'Bikol'
  },
  be: {
    english_title: 'Belarusian',
    direction: 'ltr',
    local_title: 'Беларуская'
  },
  'be-x-old': {
    english_title: 'Belarusian',
    direction: '(Taraškievica)',
    local_title: 'ltr'
  },
  bg: {
    english_title: 'Bulgarian',
    direction: 'ltr',
    local_title: 'Български'
  },
  bh: {
    english_title: 'Bihari',
    direction: 'ltr',
    local_title: 'भोजपुरी'
  },
  bi: {
    english_title: 'Bislama',
    direction: 'ltr',
    local_title: 'Bislama'
  },
  bm: {
    english_title: 'Bambara',
    direction: 'ltr',
    local_title: 'Bamanankan'
  },
  bn: {
    english_title: 'Bengali',
    direction: 'ltr',
    local_title: 'বাংলা'
  },
  bo: {
    english_title: 'Tibetan',
    direction: 'ltr',
    local_title: 'བོད་ཡིག'
  },
  bpy: {
    english_title: 'Bishnupriya',
    direction: 'Manipuri',
    local_title: 'ltr'
  },
  br: {
    english_title: 'Breton',
    direction: 'ltr',
    local_title: 'Brezhoneg'
  },
  bs: {
    english_title: 'Bosnian',
    direction: 'ltr',
    local_title: 'Bosanski'
  },
  bug: {
    english_title: 'Buginese',
    direction: 'ltr',
    local_title: 'ᨅᨔ'
  },
  bxr: {
    english_title: 'Buriat',
    direction: '(Russia)',
    local_title: 'ltr'
  },
  ca: {
    english_title: 'Catalan',
    direction: 'ltr',
    local_title: 'Català'
  },
  cdo: {
    english_title: 'Min',
    direction: 'Dong',
    local_title: 'Chinese'
  },
  ce: {
    english_title: 'Chechen',
    direction: 'ltr',
    local_title: 'Нохчийн'
  },
  ceb: {
    english_title: 'Cebuano',
    direction: 'ltr',
    local_title: 'Sinugboanong'
  },
  ch: {
    english_title: 'Chamorro',
    direction: 'ltr',
    local_title: 'Chamoru'
  },
  cho: {
    english_title: 'Choctaw',
    direction: 'ltr',
    local_title: 'Choctaw'
  },
  chr: {
    english_title: 'Cherokee',
    direction: 'ltr',
    local_title: 'ᏣᎳᎩ'
  },
  chy: {
    english_title: 'Cheyenne',
    direction: 'ltr',
    local_title: 'Tsetsêhestâhese'
  },
  co: {
    english_title: 'Corsican',
    direction: 'ltr',
    local_title: 'Corsu'
  },
  cr: {
    english_title: 'Cree',
    direction: 'ltr',
    local_title: 'Nehiyaw'
  },
  cs: {
    english_title: 'Czech',
    direction: 'ltr',
    local_title: 'Česky'
  },
  csb: {
    english_title: 'Kashubian',
    direction: 'ltr',
    local_title: 'Kaszëbsczi'
  },
  cu: {
    english_title: 'Old',
    direction: 'Church',
    local_title: 'Slavonic'
  },
  cv: {
    english_title: 'Chuvash',
    direction: 'ltr',
    local_title: 'Чăваш'
  },
  cy: {
    english_title: 'Welsh',
    direction: 'ltr',
    local_title: 'Cymraeg'
  },
  da: {
    english_title: 'Danish',
    direction: 'ltr',
    local_title: 'Dansk'
  },
  de: {
    english_title: 'German',
    direction: 'ltr',
    local_title: 'Deutsch'
  },
  diq: {
    english_title: 'Dimli',
    direction: 'ltr',
    local_title: 'Zazaki'
  },
  dsb: {
    english_title: 'Lower',
    direction: 'Sorbian',
    local_title: 'ltr'
  },
  dv: {
    english_title: 'Divehi',
    direction: 'rtl',
    local_title: 'ދިވެހިބަސް'
  },
  dz: {
    english_title: 'Dzongkha',
    direction: 'ltr',
    local_title: 'ཇོང་ཁ'
  },
  ee: {
    english_title: 'Ewe',
    direction: 'ltr',
    local_title: 'Ɛʋɛ'
  },
  far: {
    english_title: 'Farsi',
    direction: 'ltr',
    local_title: 'فارسی'
  },
  el: {
    english_title: 'Greek',
    direction: 'ltr',
    local_title: 'Ελληνικά'
  },
  en: {
    english_title: 'English',
    direction: 'ltr',
    local_title: 'English'
  },
  eo: {
    english_title: 'Esperanto',
    direction: 'ltr',
    local_title: 'Esperanto'
  },
  es: {
    english_title: 'Spanish',
    direction: 'ltr',
    local_title: 'Español'
  },
  et: {
    english_title: 'Estonian',
    direction: 'ltr',
    local_title: 'Eesti'
  },
  eu: {
    english_title: 'Basque',
    direction: 'ltr',
    local_title: 'Euskara'
  },
  ext: {
    english_title: 'Extremaduran',
    direction: 'ltr',
    local_title: 'Estremeñu'
  },
  ff: {
    english_title: 'Peul',
    direction: 'ltr',
    local_title: 'Fulfulde'
  },
  fi: {
    english_title: 'Finnish',
    direction: 'ltr',
    local_title: 'Suomi'
  },
  'fiu-vro': {
    english_title: 'Võro',
    direction: 'ltr',
    local_title: 'Võro'
  },
  fj: {
    english_title: 'Fijian',
    direction: 'ltr',
    local_title: 'Na'
  },
  fo: {
    english_title: 'Faroese',
    direction: 'ltr',
    local_title: 'Føroyskt'
  },
  fr: {
    english_title: 'French',
    direction: 'ltr',
    local_title: 'Français'
  },
  frp: {
    english_title: 'Arpitan',
    direction: 'ltr',
    local_title: 'Arpitan'
  },
  fur: {
    english_title: 'Friulian',
    direction: 'ltr',
    local_title: 'Furlan'
  },
  fy: {
    english_title: 'West',
    direction: 'Frisian',
    local_title: 'ltr'
  },
  ga: {
    english_title: 'Irish',
    direction: 'ltr',
    local_title: 'Gaeilge'
  },
  gan: {
    english_title: 'Gan',
    direction: 'Chinese',
    local_title: 'ltr'
  },
  gd: {
    english_title: 'Scottish',
    direction: 'Gaelic',
    local_title: 'ltr'
  },
  gil: {
    english_title: 'Gilbertese',
    direction: 'ltr',
    local_title: 'Taetae'
  },
  gl: {
    english_title: 'Galician',
    direction: 'ltr',
    local_title: 'Galego'
  },
  gn: {
    english_title: 'Guarani',
    direction: 'ltr',
    local_title: "Avañe'ẽ"
  },
  got: {
    english_title: 'Gothic',
    direction: 'ltr',
    local_title: 'gutisk'
  },
  gu: {
    english_title: 'Gujarati',
    direction: 'ltr',
    local_title: 'ગુજરાતી'
  },
  gv: {
    english_title: 'Manx',
    direction: 'ltr',
    local_title: 'Gaelg'
  },
  ha: {
    english_title: 'Hausa',
    direction: 'rtl',
    local_title: 'هَوُسَ'
  },
  hak: {
    english_title: 'Hakka',
    direction: 'Chinese',
    local_title: 'ltr'
  },
  haw: {
    english_title: 'Hawaiian',
    direction: 'ltr',
    local_title: 'Hawai`i'
  },
  he: {
    english_title: 'Hebrew',
    direction: 'rtl',
    local_title: 'עברית'
  },
  hi: {
    english_title: 'Hindi',
    direction: 'ltr',
    local_title: 'हिन्दी'
  },
  ho: {
    english_title: 'Hiri',
    direction: 'Motu',
    local_title: 'ltr'
  },
  hr: {
    english_title: 'Croatian',
    direction: 'ltr',
    local_title: 'Hrvatski'
  },
  ht: {
    english_title: 'Haitian',
    direction: 'ltr',
    local_title: 'Krèyol'
  },
  hu: {
    english_title: 'Hungarian',
    direction: 'ltr',
    local_title: 'Magyar'
  },
  hy: {
    english_title: 'Armenian',
    direction: 'ltr',
    local_title: 'Հայերեն'
  },
  hz: {
    english_title: 'Herero',
    direction: 'ltr',
    local_title: 'Otsiherero'
  },
  ia: {
    english_title: 'Interlingua',
    direction: 'ltr',
    local_title: 'Interlingua'
  },
  id: {
    english_title: 'Indonesian',
    direction: 'ltr',
    local_title: 'Bahasa'
  },
  ie: {
    english_title: 'Interlingue',
    direction: 'ltr',
    local_title: 'Interlingue'
  },
  ig: {
    english_title: 'Igbo',
    direction: 'ltr',
    local_title: 'Igbo'
  },
  ii: {
    english_title: 'Sichuan',
    direction: 'Yi',
    local_title: 'ltr'
  },
  ik: {
    english_title: 'Inupiak',
    direction: 'ltr',
    local_title: 'Iñupiak'
  },
  ilo: {
    english_title: 'Ilokano',
    direction: 'ltr',
    local_title: 'Ilokano'
  },
  io: {
    english_title: 'Ido',
    direction: 'ltr',
    local_title: 'Ido'
  },
  is: {
    english_title: 'Icelandic',
    direction: 'ltr',
    local_title: 'Íslenska'
  },
  it: {
    english_title: 'Italian',
    direction: 'ltr',
    local_title: 'Italiano'
  },
  iu: {
    english_title: 'Inuktitut',
    direction: 'ltr',
    local_title: 'ᐃᓄᒃᑎᑐᑦ'
  },
  ja: {
    english_title: 'Japanese',
    direction: 'ltr',
    local_title: '日本語'
  },
  jbo: {
    english_title: 'Lojban',
    direction: 'ltr',
    local_title: 'Lojban'
  },
  jv: {
    english_title: 'Javanese',
    direction: 'ltr',
    local_title: 'Basa'
  },
  ka: {
    english_title: 'Georgian',
    direction: 'ltr',
    local_title: 'ქართული'
  },
  kg: {
    english_title: 'Kongo',
    direction: 'ltr',
    local_title: 'KiKongo'
  },
  ki: {
    english_title: 'Kikuyu',
    direction: 'ltr',
    local_title: 'Gĩkũyũ'
  },
  kj: {
    english_title: 'Kuanyama',
    direction: 'ltr',
    local_title: 'Kuanyama'
  },
  kk: {
    english_title: 'Kazakh',
    direction: 'ltr',
    local_title: 'Қазақша'
  },
  kl: {
    english_title: 'Greenlandic',
    direction: 'ltr',
    local_title: 'Kalaallisut'
  },
  km: {
    english_title: 'Cambodian',
    direction: 'ltr',
    local_title: 'ភាសាខ្មែរ'
  },
  kn: {
    english_title: 'Kannada',
    direction: 'ltr',
    local_title: 'ಕನ್ನಡ'
  },
  khw: {
    english_title: 'Khowar',
    direction: 'rtl',
    local_title: 'کھوار'
  },
  ko: {
    english_title: 'Korean',
    direction: 'ltr',
    local_title: '한국어'
  },
  kr: {
    english_title: 'Kanuri',
    direction: 'ltr',
    local_title: 'Kanuri'
  },
  ks: {
    english_title: 'Kashmiri',
    direction: 'rtl',
    local_title: 'कश्मीरी'
  },
  ksh: {
    english_title: 'Ripuarian',
    direction: 'ltr',
    local_title: 'Ripoarisch'
  },
  ku: {
    english_title: 'Kurdish',
    direction: 'rtl',
    local_title: 'Kurdî'
  },
  kv: {
    english_title: 'Komi',
    direction: 'ltr',
    local_title: 'Коми'
  },
  kw: {
    english_title: 'Cornish',
    direction: 'ltr',
    local_title: 'Kernewek'
  },
  ky: {
    english_title: 'Kirghiz',
    direction: 'ltr',
    local_title: 'Kırgızca'
  },
  la: {
    english_title: 'Latin',
    direction: 'ltr',
    local_title: 'Latina'
  },
  lad: {
    english_title: 'Ladino',
    direction: 'ltr',
    local_title: 'Dzhudezmo'
  },
  lan: {
    english_title: 'Lango',
    direction: 'ltr',
    local_title: 'Leb'
  },
  lb: {
    english_title: 'Luxembourgish',
    direction: 'ltr',
    local_title: 'Lëtzebuergesch'
  },
  lg: {
    english_title: 'Ganda',
    direction: 'ltr',
    local_title: 'Luganda'
  },
  li: {
    english_title: 'Limburgian',
    direction: 'ltr',
    local_title: 'Limburgs'
  },
  lij: {
    english_title: 'Ligurian',
    direction: 'ltr',
    local_title: 'Líguru'
  },
  lmo: {
    english_title: 'Lombard',
    direction: 'ltr',
    local_title: 'Lumbaart'
  },
  ln: {
    english_title: 'Lingala',
    direction: 'ltr',
    local_title: 'Lingála'
  },
  lo: {
    english_title: 'Laotian',
    direction: 'ltr',
    local_title: 'ລາວ'
  },
  lt: {
    english_title: 'Lithuanian',
    direction: 'ltr',
    local_title: 'Lietuvių'
  },
  lv: {
    english_title: 'Latvian',
    direction: 'ltr',
    local_title: 'Latviešu'
  },
  'map-bms': {
    english_title: 'Banyumasan',
    direction: 'ltr',
    local_title: 'Basa'
  },
  mg: {
    english_title: 'Malagasy',
    direction: 'ltr',
    local_title: 'Malagasy'
  },
  man: {
    english_title: 'Mandarin',
    direction: 'ltr',
    local_title: '官話'
  },
  mh: {
    english_title: 'Marshallese',
    direction: 'ltr',
    local_title: 'Kajin'
  },
  mi: {
    english_title: 'Maori',
    direction: 'ltr',
    local_title: 'Māori'
  },
  min: {
    english_title: 'Minangkabau',
    direction: 'ltr',
    local_title: 'Minangkabau'
  },
  mk: {
    english_title: 'Macedonian',
    direction: 'ltr',
    local_title: 'Македонски'
  },
  ml: {
    english_title: 'Malayalam',
    direction: 'ltr',
    local_title: 'മലയാളം'
  },
  mn: {
    english_title: 'Mongolian',
    direction: 'ltr',
    local_title: 'Монгол'
  },
  mo: {
    english_title: 'Moldovan',
    direction: 'ltr',
    local_title: 'Moldovenească'
  },
  mr: {
    english_title: 'Marathi',
    direction: 'ltr',
    local_title: 'मराठी'
  },
  ms: {
    english_title: 'Malay',
    direction: 'ltr',
    local_title: 'Bahasa'
  },
  mt: {
    english_title: 'Maltese',
    direction: 'ltr',
    local_title: 'bil-Malti'
  },
  mus: {
    english_title: 'Creek',
    direction: 'ltr',
    local_title: 'Muskogee'
  },
  my: {
    english_title: 'Burmese',
    direction: 'ltr',
    local_title: 'Myanmasa'
  },
  na: {
    english_title: 'Nauruan',
    direction: 'ltr',
    local_title: 'Dorerin'
  },
  nah: {
    english_title: 'Nahuatl',
    direction: 'ltr',
    local_title: 'Nahuatl'
  },
  nap: {
    english_title: 'Neapolitan',
    direction: 'ltr',
    local_title: 'Nnapulitano'
  },
  nd: {
    english_title: 'North',
    direction: 'Ndebele',
    local_title: 'ltr'
  },
  nds: {
    english_title: 'Low German',
    direction: 'ltr',
    local_title: 'Plattdüütsch'
  },
  'nds-nl': {
    english_title: 'Dutch',
    direction: 'Low',
    local_title: 'Saxon'
  },
  ne: {
    english_title: 'Nepali',
    direction: 'ltr',
    local_title: 'नेपाली'
  },
  new: {
    english_title: 'Newar',
    direction: 'ltr',
    local_title: 'नेपालभाषा'
  },
  ng: {
    english_title: 'Ndonga',
    direction: 'ltr',
    local_title: 'Oshiwambo'
  },
  nl: {
    english_title: 'Dutch',
    direction: 'ltr',
    local_title: 'Nederlands'
  },
  nn: {
    english_title: 'Norwegian',
    direction: 'Nynorsk',
    local_title: 'ltr'
  },
  no: {
    english_title: 'Norwegian',
    direction: 'ltr',
    local_title: 'Norsk'
  },
  nr: {
    english_title: 'South',
    direction: 'Ndebele',
    local_title: 'ltr'
  },
  nso: {
    english_title: 'Northern',
    direction: 'Sotho',
    local_title: 'ltr'
  },
  nrm: {
    english_title: 'Norman',
    direction: 'ltr',
    local_title: 'Nouormand'
  },
  nv: {
    english_title: 'Navajo',
    direction: 'ltr',
    local_title: 'Diné'
  },
  ny: {
    english_title: 'Chichewa',
    direction: 'ltr',
    local_title: 'Chi-Chewa'
  },
  oc: {
    english_title: 'Occitan',
    direction: 'ltr',
    local_title: 'Occitan'
  },
  oj: {
    english_title: 'Ojibwa',
    direction: 'ltr',
    local_title: 'ᐊᓂᔑᓈᐯᒧᐎᓐ'
  },
  om: {
    english_title: 'Oromo',
    direction: 'ltr',
    local_title: 'Oromoo'
  },
  or: {
    english_title: 'Oriya',
    direction: 'ltr',
    local_title: 'ଓଡ଼ିଆ'
  },
  os: {
    english_title: 'Ossetian',
    direction: 'ltr',
    local_title: 'Иронау'
  },
  pa: {
    english_title: 'Panjabi',
    direction: 'ltr',
    local_title: 'ਪੰਜਾਬੀ'
  },
  pag: {
    english_title: 'Pangasinan',
    direction: 'ltr',
    local_title: 'Pangasinan'
  },
  pam: {
    english_title: 'Kapampangan',
    direction: 'ltr',
    local_title: 'Kapampangan'
  },
  pap: {
    english_title: 'Papiamentu',
    direction: 'ltr',
    local_title: 'Papiamentu'
  },
  pdc: {
    english_title: 'Pennsylvania',
    direction: 'German',
    local_title: 'ltr'
  },
  pi: {
    english_title: 'Pali',
    direction: 'ltr',
    local_title: 'Pāli'
  },
  pih: {
    english_title: 'Norfolk',
    direction: 'ltr',
    local_title: 'Norfuk'
  },
  pl: {
    english_title: 'Polish',
    direction: 'ltr',
    local_title: 'Polski'
  },
  pms: {
    english_title: 'Piedmontese',
    direction: 'ltr',
    local_title: 'Piemontèis'
  },
  ps: {
    english_title: 'Pashto',
    direction: 'rtl',
    local_title: 'پښتو'
  },
  pt: {
    english_title: 'Portuguese',
    direction: 'ltr',
    local_title: 'Português'
  },
  qu: {
    english_title: 'Quechua',
    direction: 'ltr',
    local_title: 'Runa'
  },
  rm: {
    english_title: 'Raeto',
    direction: 'Romance',
    local_title: 'ltr'
  },
  rmy: {
    english_title: 'Romani',
    direction: 'ltr',
    local_title: 'Romani'
  },
  rn: {
    english_title: 'Kirundi',
    direction: 'ltr',
    local_title: 'Kirundi'
  },
  ro: {
    english_title: 'Romanian',
    direction: 'ltr',
    local_title: 'Română'
  },
  'roa-rup': {
    english_title: 'Aromanian',
    direction: 'ltr',
    local_title: 'Armâneashti'
  },
  ru: {
    english_title: 'Russian',
    direction: 'ltr',
    local_title: 'Русский'
  },
  rw: {
    english_title: 'Rwandi',
    direction: 'ltr',
    local_title: 'Kinyarwandi'
  },
  sa: {
    english_title: 'Sanskrit',
    direction: 'ltr',
    local_title: 'संस्कृतम्'
  },
  sc: {
    english_title: 'Sardinian',
    direction: 'ltr',
    local_title: 'Sardu'
  },
  scn: {
    english_title: 'Sicilian',
    direction: 'ltr',
    local_title: 'Sicilianu'
  },
  sco: {
    english_title: 'Scots',
    direction: 'ltr',
    local_title: 'Scots'
  },
  sd: {
    english_title: 'Sindhi',
    direction: 'ltr',
    local_title: 'सिनधि'
  },
  se: {
    english_title: 'Northern',
    direction: 'Sami',
    local_title: 'ltr'
  },
  sg: {
    english_title: 'Sango',
    direction: 'ltr',
    local_title: 'Sängö'
  },
  sh: {
    english_title: 'Serbo-Croatian',
    direction: 'ltr',
    local_title: 'Srpskohrvatski'
  },
  si: {
    english_title: 'Sinhalese',
    direction: 'ltr',
    local_title: 'සිංහල'
  },
  simple: {
    english_title: 'Simple',
    direction: 'English',
    local_title: 'ltr'
  },
  sk: {
    english_title: 'Slovak',
    direction: 'ltr',
    local_title: 'Slovenčina'
  },
  sl: {
    english_title: 'Slovenian',
    direction: 'ltr',
    local_title: 'Slovenščina'
  },
  sm: {
    english_title: 'Samoan',
    direction: 'ltr',
    local_title: 'Gagana'
  },
  sn: {
    english_title: 'Shona',
    direction: 'ltr',
    local_title: 'chiShona'
  },
  so: {
    english_title: 'Somalia',
    direction: 'ltr',
    local_title: 'Soomaaliga'
  },
  sq: {
    english_title: 'Albanian',
    direction: 'ltr',
    local_title: 'Shqip'
  },
  sr: {
    english_title: 'Serbian',
    direction: 'ltr',
    local_title: 'Српски'
  },
  ss: {
    english_title: 'Swati',
    direction: 'ltr',
    local_title: 'SiSwati'
  },
  st: {
    english_title: 'Southern',
    direction: 'Sotho',
    local_title: 'ltr'
  },
  su: {
    english_title: 'Sundanese',
    direction: 'ltr',
    local_title: 'Basa'
  },
  sv: {
    english_title: 'Swedish',
    direction: 'ltr',
    local_title: 'Svenska'
  },
  sw: {
    english_title: 'Swahili',
    direction: 'ltr',
    local_title: 'Kiswahili'
  },
  ta: {
    english_title: 'Tamil',
    direction: 'ltr',
    local_title: 'தமிழ்'
  },
  te: {
    english_title: 'Telugu',
    direction: 'ltr',
    local_title: 'తెలుగు'
  },
  tet: {
    english_title: 'Tetum',
    direction: 'ltr',
    local_title: 'Tetun'
  },
  tg: {
    english_title: 'Tajik',
    direction: 'ltr',
    local_title: 'Тоҷикӣ'
  },
  th: {
    english_title: 'Thai',
    direction: 'ltr',
    local_title: 'ไทย'
  },
  ti: {
    english_title: 'Tigrinya',
    direction: 'ltr',
    local_title: 'ትግርኛ'
  },
  tk: {
    english_title: 'Turkmen',
    direction: 'ltr',
    local_title: 'Туркмен'
  },
  tl: {
    english_title: 'Tagalog',
    direction: 'ltr',
    local_title: 'Tagalog'
  },
  tlh: {
    english_title: 'Klingon',
    direction: 'ltr',
    local_title: 'tlhIngan-Hol'
  },
  tn: {
    english_title: 'Tswana',
    direction: 'ltr',
    local_title: 'Setswana'
  },
  to: {
    english_title: 'Tonga',
    direction: 'ltr',
    local_title: 'Lea'
  },
  tpi: {
    english_title: 'Tok',
    direction: 'Pisin',
    local_title: 'ltr'
  },
  tr: {
    english_title: 'Turkish',
    direction: 'ltr',
    local_title: 'Türkçe'
  },
  ts: {
    english_title: 'Tsonga',
    direction: 'ltr',
    local_title: 'Xitsonga'
  },
  tt: {
    english_title: 'Tatar',
    direction: 'ltr',
    local_title: 'Tatarça'
  },
  tum: {
    english_title: 'Tumbuka',
    direction: 'ltr',
    local_title: 'chiTumbuka'
  },
  tw: {
    english_title: 'Twi',
    direction: 'ltr',
    local_title: 'Twi'
  },
  ty: {
    english_title: 'Tahitian',
    direction: 'ltr',
    local_title: 'Reo'
  },
  udm: {
    english_title: 'Udmurt',
    direction: 'ltr',
    local_title: 'Удмурт'
  },
  ug: {
    english_title: 'Uyghur',
    direction: 'ltr',
    local_title: 'Uyƣurqə'
  },
  uk: {
    english_title: 'Ukrainian',
    direction: 'ltr',
    local_title: 'Українська'
  },
  ur: {
    english_title: 'Urdu',
    direction: 'rtl',
    local_title: 'اردو'
  },
  uz: {
    english_title: 'Uzbek',
    direction: 'ltr',
    local_title: 'Ўзбек'
  },
  ve: {
    english_title: 'Venda',
    direction: 'ltr',
    local_title: 'Tshivenḓa'
  },
  vi: {
    english_title: 'Vietnamese',
    direction: 'ltr',
    local_title: 'Việtnam'
  },
  vec: {
    english_title: 'Venetian',
    direction: 'ltr',
    local_title: 'Vèneto'
  },
  vls: {
    english_title: 'West',
    direction: 'Flemish',
    local_title: 'ltr'
  },
  vo: {
    english_title: 'Volapük',
    direction: 'ltr',
    local_title: 'Volapük'
  },
  wa: {
    english_title: 'Walloon',
    direction: 'ltr',
    local_title: 'Walon'
  },
  war: {
    english_title: 'Waray-Waray',
    direction: 'ltr',
    local_title: 'Winaray'
  },
  wo: {
    english_title: 'Wolof',
    direction: 'ltr',
    local_title: 'Wollof'
  },
  xal: {
    english_title: 'Kalmyk',
    direction: 'ltr',
    local_title: 'Хальмг'
  },
  xh: {
    english_title: 'Xhosa',
    direction: 'ltr',
    local_title: 'isiXhosa'
  },
  yi: {
    english_title: 'Yiddish',
    direction: 'rtl',
    local_title: 'ייִדיש'
  },
  yo: {
    english_title: 'Yoruba',
    direction: 'ltr',
    local_title: 'Yorùbá'
  },
  za: {
    english_title: 'Zhuang',
    direction: 'ltr',
    local_title: 'Cuengh'
  },
  zh: {
    english_title: 'Chinese',
    direction: 'ltr',
    local_title: '中文'
  },
  'zh-classical': {
    english_title: 'Classical',
    direction: 'Chinese',
    local_title: 'ltr'
  },
  'zh-min-nan': {
    english_title: 'Minnan',
    direction: 'ltr',
    local_title: 'Bân-lâm-gú'
  },
  'zh-yue': {
    english_title: 'Cantonese',
    direction: 'ltr',
    local_title: '粵語'
  },
  zu: {
    english_title: 'Zulu',
    direction: 'ltr',
    local_title: 'isiZulu'
  }
};

//some colon symbols are valid links, like `America: That place`
//so we have to whitelist allowable interwiki links
const interwikis = [
  'wiktionary',
  'wikinews',
  'wikibooks',
  'wikiquote',
  'wikisource',
  'wikispecies',
  'wikiversity',
  'wikivoyage',
  'wikipedia',
  'wikimedia',
  'foundation',
  'meta',
  'metawikipedia',
  'w',
  'wikt',
  'n',
  'b',
  'q',
  's',
  'v',
  'voy',
  'wmf',
  'c',
  'm',
  'mw',
  'phab',
  'd',
];
let allowed = interwikis.reduce((h, wik) => {
  h[wik] = true;
  return h;
}, {});
//add language prefixes too..
Object.keys(languages).forEach((k) => allowed[k] = true);

//this is predictably very complicated.
// https://meta.wikimedia.org/wiki/Help:Interwiki_linking
const parseInterwiki = function(obj) {
  let str = obj.page || '';
  if (str.indexOf(':') !== -1) {
    let m = str.match(/^(.*):(.*)/);
    if (m === null) {
      return obj;
    }
    let site = m[1] || '';
    site = site.toLowerCase();
    //only allow interwikis to these specific places
    if (allowed.hasOwnProperty(site) === false) {
      return obj;
    }
    obj.wiki = site;
    obj.page = m[2];
  }
  return obj;
};
var interwiki = parseInterwiki;

// const helpers = require('../_lib/helpers');

const ignore_links = /^:?(category|catégorie|Kategorie|Categoría|Categoria|Categorie|Kategoria|تصنيف|image|file|image|fichier|datei|media):/i;
const external_link = /\[(https?|news|ftp|mailto|gopher|irc)(:\/\/[^\]\| ]{4,1500})([\| ].*?)?\]/g;
const link_reg = /\[\[(.{0,160}?)\]\]([a-z']+)?(\w{0,10})/gi; //allow dangling suffixes - "[[flanders]]'s"
// const i18n = require('../_data/i18n');
// const isFile = new RegExp('(' + i18n.images.concat(i18n.files).join('|') + '):', 'i');

const external_links = function(links, str) {
  str.replace(external_link, function(all, protocol, link, text) {
    text = text || '';
    links.push({
      type: 'external',
      site: protocol + link,
      text: text.trim()
    });
    return text;
  });
  return links;
};

const internal_links = function(links, str) {
  //regular links
  str.replace(link_reg, function(_, s, apostrophe) {
    var txt = null;
    //make a copy of original
    var link = s;
    if (s.match(/\|/)) {
      //replacement link [[link|text]]
      s = s.replace(/\[\[(.{2,100}?)\]\](\w{0,10})/g, '$1$2'); //remove ['s and keep suffix
      link = s.replace(/(.{2,100})\|.{0,200}/, '$1'); //replaced links
      txt = s.replace(/.{2,100}?\|/, '');
      //handle funky case of [[toronto|]]
      if (txt === null && link.match(/\|$/)) {
        link = link.replace(/\|$/, '');
        txt = link;
      }
    }
    //kill off non-wikipedia namespaces
    if (link.match(ignore_links)) {
      return s;
    }
    //kill off just these just-anchor links [[#history]]
    if (link.match(/^#/i)) {
      return s;
    }
    //remove anchors from end [[toronto#history]]
    var obj = {
      page: link,
    };
    obj.page = obj.page.replace(/#(.*)/, (a, b) => {
      obj.anchor = b;
      return '';
    });
    //grab any fr:Paris parts
    obj = interwiki(obj);
    if (txt !== null && txt !== obj.page) {
      obj.text = txt;
    }
    //finally, support [[link]]'s apostrophe
    if (apostrophe === '\'s') {
      obj.text = obj.text || obj.page;
      obj.text += apostrophe;
    }

    //titlecase it, if necessary
    if (obj.page && /^[A-Z]/.test(obj.page) === false) {
      if (!obj.text) {
        obj.text = obj.page;
      }
      obj.page = obj.page.charAt(0).toUpperCase() + obj.page.substring(1);
    }
    links.push(obj);
    return s;
  });
  return links;
};

//grab an array of internal links in the text
const parse_links = function(str) {
  let links = [];
  //first, parse external links
  links = external_links(links, str);
  //internal links
  links = internal_links(links, str);

  if (links.length === 0) {
    return undefined;
  }
  return links;
};
var links = parse_links;

//pulls target link out of redirect page
const REDIRECT_REGEX = new RegExp('^[ \n\t]*?#(' + i18n_1.redirects.join('|') + ') *?(\\[\\[.{2,180}?\\]\\])', 'i');

const isRedirect = function(wiki) {
  //too long to be a redirect?
  if (!wiki || wiki.length > 500) {
    return false;
  }
  return REDIRECT_REGEX.test(wiki);
};

const parse = function(wiki) {
  let m = wiki.match(REDIRECT_REGEX);
  if (m && m[2]) {
    let links$1 = links(m[2]) || [];
    return links$1[0];
  }
  return {};
};

var redirects = {
  isRedirect: isRedirect,
  parse: parse
};

const template_reg = new RegExp('\\{\\{ ?(' + i18n_1.disambigs.join('|') + ')(\\|[a-z, =]*?)? ?\\}\\}', 'i');

//special disambig-templates en-wikipedia uses
let d = ' disambiguation';
const english = [
  'airport',
  'biology' + d,
  'call sign' + d,
  'caselaw' + d,
  'chinese title' + d,
  'dab',
  'dab',
  'disamb',
  'disambig',
  'disambiguation cleanup',
  'genus' + d,
  'geodis',
  'hndis',
  'hospital' + d,
  'lake index',
  'letter' + d,
  'letter-number combination' + d,
  'mathematical' + d,
  'military unit' + d,
  'mountainindex',
  'number' + d,
  'phonetics' + d,
  'place name' + d,
  'place name' + d,
  'portal' + d,
  'road' + d,
  'school' + d,
  'setindex',
  'ship index',
  'species latin name abbreviation' + d,
  'species latin name' + d,
  'split dab',
  'sport index',
  'station' + d,
  'synagogue' + d,
  'taxonomic authority' + d,
  'taxonomy' + d,
  'wp disambig',
];
const enDisambigs = new RegExp('\\{\\{ ?(' + english.join('|') + ')(\\|[a-z, =]*?)? ?\\}\\}', 'i');

const isDisambig = function(wiki) {
  //test for {{disambiguation}} templates
  if (template_reg.test(wiki) === true) {
    return true;
  }
  //more english-centric disambiguation templates

  //{{hndis}}, etc
  if (enDisambigs.test(wiki) === true) {
    return true;
  }

  //try 'may refer to' on first line for en-wiki?
  // let firstLine = wiki.match(/^.+?\n/);
  // if (firstLine !== null && firstLine[0]) {
  //   if (/ may refer to/i.test(firstLine) === true) {
  //     return true;
  //   }
  // }
  return false;
};

var disambig = {
  isDisambig: isDisambig
};

//okay, i know you're not supposed to regex html, but...
//https://en.wikipedia.org/wiki/Help:HTML_in_wikitext

//these are things we throw-away
//these will mess-up if they're nested, but they're not usually.
const ignore = [
  'table',
  'code',
  'score',
  'data',
  'categorytree',
  'charinsert',
  'hiero',
  'imagemap',
  'inputbox',
  'nowiki',
  'poem',
  'references',
  'source',
  'syntaxhighlight',
  'timeline'
];
const openTag = `< ?(${ignore.join('|')}) ?[^>]{0,200}?>`;
const closeTag = `< ?/ ?(${ignore.join('|')}) ?>`;
const anyChar = '\\s\\S'; //including newline
const noThanks = new RegExp(`${openTag}[${anyChar}]+?${closeTag}`, 'ig');

const kill_xml = function(wiki) {
  //(<ref> tags are parsed in Section class) - luckily, refs can't be recursive.
  //types of html/xml that we want to trash completely.
  wiki = wiki.replace(noThanks, ' ');
  //some xml-like fragments we can also kill
  wiki = wiki.replace(/ ?< ?(span|div|table|data) [a-zA-Z0-9=%\.#:;'" ]{2,100}\/? ?> ?/g, ' '); //<ref name="asd">
  //only kill ref tags if they are selfclosing
  wiki = wiki.replace(/ ?< ?(ref) [a-zA-Z0-9=" ]{2,100}\/ ?> ?/g, ' '); //<ref name="asd"/>
  //some formatting xml, we'll keep their insides though
  wiki = wiki.replace(/ ?<[ \/]?(p|sub|sup|span|nowiki|div|table|br|tr|td|th|pre|pre2|hr)[ \/]?> ?/g, ' '); //<sub>, </sub>
  wiki = wiki.replace(/ ?<[ \/]?(abbr|bdi|bdo|blockquote|cite|del|dfn|em|i|ins|kbd|mark|q|s)[ \/]?> ?/g, ' '); //<abbr>, </abbr>
  wiki = wiki.replace(/ ?<[ \/]?h[0-9][ \/]?> ?/g, ' '); //<h2>, </h2>
  wiki = wiki.replace(/ ?< ?br ?\/> ?/g, '\n'); //<br />
  return wiki.trim();
};
var kill_xml_1 = kill_xml;

//this mostly-formatting stuff can be cleaned-up first, to make life easier
function preProcess(r, wiki, options) {
  //remove comments
  wiki = wiki.replace(/<!--[\s\S]{0,2000}?-->/g, '');
  wiki = wiki.replace(/__(NOTOC|NOEDITSECTION|FORCETOC|TOC)__/ig, '');
  //signitures
  wiki = wiki.replace(/~~{1,3}/g, '');
  //windows newlines
  wiki = wiki.replace(/\r/g, '');
  //japanese periods - '。'
  wiki = wiki.replace(/\u3002/g, '. ');
  //horizontal rule
  wiki = wiki.replace(/----/g, '');
  //formatting for templates-in-templates...
  wiki = wiki.replace(/\{\{\}\}/g, ' – ');
  wiki = wiki.replace(/\{\{\\\}\}/g, ' / ');
  //space
  wiki = wiki.replace(/&nbsp;/g, ' ');
  //give it the inglorious send-off it deserves..
  wiki = kill_xml_1(wiki);
  //({{template}},{{template}}) leaves empty parentheses
  wiki = wiki.replace(/\([,;: ]+?\)/g, '');
  //these templates just screw things up, too
  wiki = wiki.replace(/{{(baseball|basketball) (primary|secondary) (style|color).*?\}\}/i, '');
  return wiki;
}
var preProcess_1 = preProcess;

const defaults$6 = {
  headers: true,
  images: true,
  tables: true,
  lists: true,
  paragraphs: true,
};

const doSection = (section, options) => {
  options = setDefaults_1(options, defaults$6);
  let md = '';
  //make the header
  if (options.headers === true && section.title()) {
    let header = '##';
    for(let i = 0; i < section.depth; i += 1) {
      header += '#';
    }
    md += header + ' ' + section.title() + '\n';
  }
  //put any images under the header
  if (options.images === true) {
    let images = section.images();
    if (images.length > 0) {
      md += images.map((img) => img.markdown()).join('\n');
      md += '\n';
    }
  }
  //make a mardown table
  if (options.tables === true) {
    let tables = section.tables();
    if (tables.length > 0) {
      md += '\n';
      md += tables.map((table) => table.markdown(options)).join('\n');
      md += '\n';
    }
  }
  //make a mardown bullet-list
  if (options.lists === true) {
    let lists = section.lists();
    if (lists.length > 0) {
      md += lists.map((list) => list.markdown(options)).join('\n');
      md += '\n';
    }
  }
  //finally, write the sentence text.
  if (options.paragraphs === true || options.sentences === true) {
    md += section.paragraphs().map((p) => {
      return p.sentences().map(s => s.markdown(options)).join(' ');
    }).join('\n\n');
  }
  return md;
};
var toMarkdown$2 = doSection;

const defaults$7 = {
  headers: true,
  images: true,
  tables: true,
  lists: true,
  paragraphs: true,
};
const doSection$1 = (section, options) => {
  options = setDefaults_1(options, defaults$7);
  let html = '';
  //make the header
  if (options.headers === true && section.title()) {
    let num = 1 + section.depth;
    html += '  <h' + num + '>' + section.title() + '</h' + num + '>';
    html += '\n';
  }
  //put any images under the header
  if (options.images === true) {
    let imgs = section.images();
    if (imgs.length > 0) {
      html += imgs.map((image) => image.html(options)).join('\n');
    }
  }
  //make a html table
  if (options.tables === true) {
    html += section.tables().map((t) => t.html(options)).join('\n');
  }
  // //make a html bullet-list
  if (options.lists === true) {
    html += section.lists().map((list) => list.html(options)).join('\n');
  }
  //finally, write the sentence text.
  if (options.paragraphs === true && section.paragraphs().length > 0) {
    html += '  <div class="text">\n';
    section.paragraphs().forEach((p) => {
      html += '    <p class="paragraph">\n';
      html += '      ' + p.sentences().map((s) => s.html(options)).join(' ');
      html += '\n    </p>\n';
    });
    html += '  </div>\n';
  } else if (options.sentences === true) {
    html += '      ' + section.sentences().map((s) => s.html(options)).join(' ');
  }
  return '<div class="section">\n' + html + '</div>\n';
};
var toHtml$2 = doSection$1;

// dumpster-dive throws everything into mongodb  - github.com/spencermountain/dumpster-dive
// mongo has some opinions about what characters are allowed as keys and ids.
//https://stackoverflow.com/questions/12397118/mongodb-dot-in-key-name/30254815#30254815
const specialChar = /[\\\.$]/;

const encodeStr = function(str) {
  if (typeof str !== 'string') {
    str = '';
  }
  str = str.replace(/\\/g, '\\\\');
  str = str.replace(/^\$/, '\\u0024');
  str = str.replace(/\./g, '\\u002e');
  return str;
};

const encodeObj = function( obj = {} ) {
  let keys = Object.keys(obj);
  for(let i = 0; i < keys.length; i += 1) {
    if (specialChar.test(keys[i]) === true) {
      let str = encodeStr(keys[i]);
      if (str !== keys[i]) {
        obj[str] = obj[keys[i]];
        delete obj[keys[i]];
      }
    }
  }
  return obj;
};

var encode = {
  encodeObj: encodeObj
};

const defaults$8 = {
  headers: true,
  depth: true,
  paragraphs: true,
  images: true,
  tables: true,
  templates: true,
  infoboxes: true,
  lists: true,
  references: true
};
//
const toJSON$1 = function(section, options) {
  options = setDefaults_1(options, defaults$8);
  let data = {};
  if (options.headers === true) {
    data.title = section.title();
  }
  if (options.depth === true) {
    data.depth = section.depth;
  }
  //these return objects
  if (options.paragraphs === true) {
    let paragraphs = section.paragraphs().map(p => p.json(options));
    if (paragraphs.length > 0) {
      data.paragraphs = paragraphs;
    }
  }
  //image json data
  if (options.images === true) {
    let images = section.images().map(img => img.json(options));
    if (images.length > 0) {
      data.images = images;
    }
  }
  //table json data
  if (options.tables === true) {
    let tables = section.tables().map(t => t.json(options));
    if (tables.length > 0) {
      data.tables = tables;
    }
  }
  //template json data
  if (options.templates === true) {
    let templates = section.templates();
    if (templates.length > 0) {
      data.templates = templates;
      //encode them, for mongodb
      if (options.encode === true) {
        data.templates.forEach((t) => encode.encodeObj(t));
      }
    }
  }
  //infobox json data
  if (options.infoboxes === true) {
    let infoboxes = section.infoboxes().map(i => i.json(options));
    if (infoboxes.length > 0) {
      data.infoboxes = infoboxes;
    }
  }
  //list json data
  if (options.lists === true) {
    let lists = section.lists().map(list => list.json(options));
    if (lists.length > 0) {
      data.lists = lists;
    }
  }
  //list references - default true
  if (options.references === true || options.citations === true) {
    let references = section.references().map(ref => ref.json(options));
    if (references.length > 0) {
      data.references = references;
    }
  }
  //default off
  if (options.sentences === true) {
    data.sentences = section.sentences().map(s => s.json(options));
  }
  return data;
};
var toJson$2 = toJSON$1;

const defaults$9 = {
  headers: true,
  images: true,
  tables: true,
  lists: true,
  paragraphs: true,
};
//map '==' depth to 'subsection', 'subsubsection', etc
const doSection$2 = (section, options) => {
  options = setDefaults_1(options, defaults$9);
  let out = '';
  let num = 1;
  //make the header
  if (options.headers === true && section.title()) {
    num = 1 + section.depth;
    var vOpen = '\n';
    var vClose = '}';
    switch (num) {
      case 1:
        vOpen += '\\chapter{';
        break;
      case 2:
        vOpen += '\\section{';
        break;
      case 3:
        vOpen += '\\subsection{';
        break;
      case 4:
        vOpen += '\\subsubsection{';
        break;
      case 5:
        vOpen += '\\paragraph{';
        vClose = '} \\\\ \n';
        break;
      case 6:
        vOpen += '\\subparagraph{';
        vClose = '} \\\\ \n';
        break;
      default:
        vOpen += '\n% section with depth=' + num + ' undefined - use subparagraph instead\n\\subparagraph{';
        vClose = '} \\\\ \n';
    }
    out += vOpen + section.title() + vClose;
    out += '\n';
  }
  //put any images under the header
  if (options.images === true && section.images()) {
    out += section.images().map((img) => img.latex(options)).join('\n');
  //out += '\n';
  }
  //make a out tablew
  if (options.tables === true && section.tables()) {
    out += section.tables().map((t) => t.latex(options)).join('\n');
  }
  // //make a out bullet-list
  if (options.lists === true && section.lists()) {
    out += section.lists().map((list) => list.latex(options)).join('\n');
  }
  //finally, write the sentence text.
  if (options.paragraphs === true || options.sentences === true) {
    out += section.paragraphs().map((s) => s.latex(options)).join(' ');
    out += '\n';
  }
  // var title_tag = ' SECTION depth=' + num + ' - TITLE: ' + section.title + '\n';
  // wrap a section comment
  //out = '\n% BEGIN' + title_tag + out + '\n% END' + title_tag;
  return out;
};
var toLatex$2 = doSection$2;

const defaults$a = {
  tables: true,
  references: true,
  paragraphs: true,
  templates: true,
  infoboxes: true,
};

//the stuff between headings - 'History' section for example
const Section = function(data) {
  this.depth = data.depth;
  this.doc = null;
  this._title = data.title || '';
  Object.defineProperty(this, 'doc', {
    enumerable: false,
    value: null
  });
  Object.defineProperty(this, 'data', {
    enumerable: false,
    value: data
  });
};

const methods$2 = {
  title: function() {
    return this._title || '';
  },
  index: function() {
    if (!this.doc) {
      return null;
    }
    let index = this.doc.sections().indexOf(this);
    if (index === -1) {
      return null;
    }
    return index;
  },
  indentation: function() {
    return this.depth;
  },
  sentences: function(n) {
    let arr = this.paragraphs().reduce((list, p) => {
      return list.concat(p.sentences());
    }, []);
    if (typeof n === 'number') {
      return arr[n];
    }
    return arr || [];
  },
  paragraphs: function(n) {
    let arr = this.data.paragraphs || [];
    if (typeof n === 'number') {
      return arr[n];
    }
    return arr || [];
  },
  paragraph: function(n) {
    let arr = this.data.paragraphs || [];
    if (typeof n === 'number') {
      return arr[n];
    }
    return arr[0];
  },
  links: function(n) {
    let arr = [];
    this.infoboxes().forEach(templ => {
      templ.links(n).forEach(link => arr.push(link));
    });
    this.sentences().forEach(s => {
      s.links(n).forEach(link => arr.push(link));
    });
    this.tables().forEach(t => {
      t.links(n).forEach(link => arr.push(link));
    });
    this.lists().forEach(list => {
      list.links(n).forEach(link => arr.push(link));
    });
    if (typeof n === 'number') {
      return arr[n];
    } else if (typeof n === 'string') { //grab a link like .links('Fortnight')
      n = n.charAt(0).toUpperCase() + n.substring(1); //titlecase it
      let link = arr.find(o => o.page === n);
      return link === undefined ? [] : [link];
    }
    return arr;
  },
  tables: function(clue) {
    let arr = this.data.tables || [];
    if (typeof clue === 'number') {
      return arr[clue];
    }
    return arr;
  },
  templates: function(clue) {
    let arr = this.data.templates || [];
    if (typeof clue === 'number') {
      return arr[clue];
    }
    if (typeof clue === 'string') {
      clue = clue.toLowerCase();
      return arr.filter(o => o.template === clue || o.name === clue);
    }
    return arr;
  },
  infoboxes: function(clue) {
    let arr = this.data.infoboxes || [];
    if (typeof clue === 'number') {
      return arr[clue];
    }
    return arr;
  },
  coordinates: function(clue) {
    let arr = [].concat(this.templates('coord'), this.templates('coor'));
    if (typeof clue === 'number') {
      return arr[clue];
    }
    return arr;
  },
  lists: function(clue) {
    let arr = [];
    this.paragraphs().forEach((p) => {
      arr = arr.concat(p.lists());
    });
    if (typeof clue === 'number') {
      return arr[clue];
    }
    return arr;
  },
  interwiki(num) {
    let arr = [];
    this.paragraphs().forEach(p => {
      arr = arr.concat(p.interwiki());
    });
    if (typeof num === 'number') {
      return arr[num];
    }
    return arr || [];
  },
  images: function(clue) {
    let arr = [];
    this.paragraphs().forEach((p) => {
      arr = arr.concat(p.images());
    });
    if (typeof clue === 'number') {
      return arr[clue];
    }
    return arr || [];
  },
  references: function(clue) {
    let arr = this.data.references || [];
    if (typeof clue === 'number') {
      return arr[clue];
    }
    return arr;
  },

  //transformations
  remove: function() {
    if (!this.doc) {
      return null;
    }
    let bads = {};
    bads[this.title()] = true;
    //remove children too
    this.children().forEach(sec => (bads[sec.title()] = true));
    let arr = this.doc.data.sections;
    arr = arr.filter(sec => bads.hasOwnProperty(sec.title()) !== true);
    this.doc.data.sections = arr;
    return this.doc;
  },

  //move-around sections like in jquery
  nextSibling: function() {
    if (!this.doc) {
      return null;
    }
    let sections = this.doc.sections();
    let index = this.index();
    for (let i = index + 1; i < sections.length; i += 1) {
      if (sections[i].depth < this.depth) {
        return null;
      }
      if (sections[i].depth === this.depth) {
        return sections[i];
      }
    }
    return null;
  },
  lastSibling: function() {
    if (!this.doc) {
      return null;
    }
    let sections = this.doc.sections();
    let index = this.index();
    return sections[index - 1] || null;
  },
  children: function(n) {
    if (!this.doc) {
      return null;
    }

    let sections = this.doc.sections();
    let index = this.index();
    let children = [];
    //(immediately preceding sections with higher depth)
    if (sections[index + 1] && sections[index + 1].depth > this.depth) {
      for (let i = index + 1; i < sections.length; i += 1) {
        if (sections[i].depth > this.depth) {
          children.push(sections[i]);
        } else {
          break;
        }
      }
    }
    if (typeof n === 'string') {
      n = n.toLowerCase();
      // children.forEach((c) => console.log(c));
      return children.find(s => s.title().toLowerCase() === n);
    }
    if (typeof n === 'number') {
      return children[n];
    }
    return children;
  },
  parent: function() {
    if (!this.doc) {
      return null;
    }
    let sections = this.doc.sections();
    let index = this.index();
    for (let i = index; i >= 0; i -= 1) {
      if (sections[i] && sections[i].depth < this.depth) {
        return sections[i];
      }
    }
    return null;
  },

  markdown: function(options) {
    options = setDefaults_1(options, defaults$a);
    return toMarkdown$2(this, options);
  },
  html: function(options) {
    options = setDefaults_1(options, defaults$a);
    return toHtml$2(this, options);
  },
  text: function(options) {
    options = setDefaults_1(options, defaults$a);
    let pList = this.paragraphs();
    pList = pList.map(p => p.text(options));
    return pList.join('\n\n');
  },
  latex: function(options) {
    options = setDefaults_1(options, defaults$a);
    return toLatex$2(this, options);
  },
  json: function(options) {
    options = setDefaults_1(options, defaults$a);
    return toJson$2(this, options);
  }
};
//aliases
methods$2.next = methods$2.nextSibling;
methods$2.last = methods$2.lastSibling;
methods$2.previousSibling = methods$2.lastSibling;
methods$2.previous = methods$2.lastSibling;
methods$2.citations = methods$2.references;
methods$2.sections = methods$2.children;
Object.keys(methods$2).forEach(k => {
  Section.prototype[k] = methods$2[k];
});
//add alises, too
Object.keys(aliases).forEach(k => {
  Section.prototype[k] = methods$2[aliases[k]];
});
var Section_1 = Section;

var helpers = {
  capitalise: function(str) {
    if (str && typeof str === 'string') {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return '';
  },
  onlyUnique: function(value, index, self) {
    return self.indexOf(value) === index;
  },
  trim_whitespace: function(str) {
    if (str && typeof str === 'string') {
      str = str.replace(/^\s\s*/, '');
      str = str.replace(/\s\s*$/, '');
      str = str.replace(/ {2}/, ' ');
      str = str.replace(/\s, /, ', ');
      return str;
    }
    return '';
  }
};
var helpers_1 = helpers;

//handle the bold/italics
const formatting = function(obj) {
  let bolds = [];
  let italics = [];
  let wiki = obj.text || '';
  //bold and italics combined 5 's
  wiki = wiki.replace(/'''''(.{0,200}?)'''''/g, (a, b) => {
    bolds.push(b);
    italics.push(b);
    return b;
  });
  //''''four'''' → bold with quotes
  wiki = wiki.replace(/''''(.{0,200}?)''''/g, (a, b) => {
    bolds.push(`'${b}'`);
    return `'${b}'`;
  });
  //'''bold'''
  wiki = wiki.replace(/'''(.{0,200}?)'''/g, (a, b) => {
    bolds.push(b);
    return b;
  });
  //''italic''
  wiki = wiki.replace(/''(.{0,200}?)''/g, (a, b) => {
    italics.push(b);
    return b;
  });

  //pack it all up..
  obj.text = wiki;
  if (bolds.length > 0) {
    obj.fmt = obj.fmt || {};
    obj.fmt.bold = bolds;
  }
  if (italics.length > 0) {
    obj.fmt = obj.fmt || {};
    obj.fmt.italic = italics;
  }
  return obj;
};
var formatting_1 = formatting;

//escape a string like 'fun*2.Co' for a regExpr
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

//sometimes text-replacements can be ambiguous - words used multiple times..
const smartReplace = function(all, text, result) {
  if (!text || !all) {
    return all;
  }

  if (typeof all === 'number') {
    all = String(all);
  }
  text = escapeRegExp(text);
  //try a word-boundary replace
  let reg = new RegExp('\\b' + text + '\\b');
  if (reg.test(all) === true) {
    all = all.replace(reg, result);
  } else {
    //otherwise, fall-back to a much messier, dangerous replacement
    // console.warn('missing \'' + text + '\'');
    all = all.replace(text, result);
  }
  return all;
};

var smartReplace_1 = smartReplace;

const defaults$b = {
  links: true,
  formatting: true,
};
// create links, bold, italic in html
const doSentence = function(sentence, options) {
  options = setDefaults_1(options, defaults$b);
  let text = sentence.text();
  //turn links into <a href>
  if (options.links === true) {
    sentence.links().forEach((link) => {
      let href = '';
      let classNames = 'link';
      if (link.site) {
        //use an external link
        href = link.site;
        classNames += ' external';
      } else {
        //otherwise, make it a relative internal link
        href = helpers_1.capitalise(link.page);
        href = './' + href.replace(/ /g, '_');
        //add anchor
        if (link.anchor) {
          href += `#${link.anchor}`;
        }
      }
      let str = link.text || link.page;
      let tag = `<a class="${classNames}" href="${href}">${str}</a>`;
      text = smartReplace_1(text, str, tag);
    });
  }
  if (options.formatting === true) {
    //support bolds
    sentence.bold().forEach((str) => {
      let tag = '<b>' + str + '</b>';
      text = smartReplace_1(text, str, tag);
    });
    //do italics
    sentence.italic().forEach((str) => {
      let tag = '<i>' + str + '</i>';
      text = smartReplace_1(text, str, tag);
    });
  }
  return '<span class="sentence">' + text + '</span>';
};
var toHtml$3 = doSentence;

const defaults$c = {
  links: true,
  formatting: true,
};
// add `[text](href)` to the text
const doLink = function(md, link) {
  let href = '';
  //if it's an external link, we good
  if (link.site) {
    href = link.site;
  } else {
    //otherwise, make it a relative internal link
    href = helpers_1.capitalise(link.page);
    href = './' + href.replace(/ /g, '_');
    //add anchor
    if (link.anchor) {
      href += `#${link.anchor}`;
    }
  }
  let str = link.text || link.page;
  let mdLink = '[' + str + '](' + href + ')';
  md = smartReplace_1(md, str, mdLink);
  return md;
};

//create links, bold, italic in markdown
const toMarkdown$3 = (sentence, options) => {
  options = setDefaults_1(options, defaults$c);
  let md = sentence.text();
  //turn links back into links
  if (options.links === true) {
    sentence.links().forEach((link) => {
      md = doLink(md, link);
    });
  }
  //turn bolds into **bold**
  if (options.formatting === true) {
    sentence.bold().forEach((b) => {
      md = smartReplace_1(md, b, '**' + b + '**');
    });
    //support *italics*
    sentence.italic().forEach((i) => {
      md = smartReplace_1(md, i, '*' + i + '*');
    });
  }
  return md;
};
var toMarkdown_1$1 = toMarkdown$3;

const isNumber = /^[0-9,.]+$/;

const defaults$d = {
  text: true,
  links: true,
  formatting: true,
  dates: true,
  numbers: true,
};

const toJSON$2 = function(s, options) {
  options = setDefaults_1(options, defaults$d);
  let data = {};
  let text = s.plaintext();
  if (options.text === true) {
    data.text = text;
  }
  //add number field
  if (options.numbers === true && isNumber.test(text)) {
    let num = Number(text.replace(/,/g, ''));
    if (isNaN(num) === false) {
      data.number = num;
    }
  }
  if (options.links && s.links().length > 0) {
    data.links = s.links();
  }
  if (options.formatting && s.data.fmt) {
    data.formatting = s.data.fmt;
  }
  if (options.dates && s.data.dates !== undefined) {
    data.dates = s.data.dates;
  }
  return data;
};
var toJson$3 = toJSON$2;

const defaults$e = {
  links: true,
  formatting: true,
};
// create links, bold, italic in html
const toLatex$3 = function(sentence, options ) {
  options = setDefaults_1(options, defaults$e);
  let text = sentence.plaintext();
  //turn links back into links
  if (options.links === true && sentence.links().length > 0) {
    sentence.links().forEach((link) => {
      let href = '';
      if (link.site) {
        //use an external link
        href = link.site;
      } else {
        //otherwise, make it a relative internal link
        href = helpers_1.capitalise(link.page);
        href = './' + href.replace(/ /g, '_');
        //add anchor
        if (link.anchor) {
          href += `#${link.anchor}`;
        }
      }
      let str = link.text || link.page;
      let tag = '\\href{' + href + '}{' + str + '}';
      text = smartReplace_1(text, str, tag);
    });
  }
  if (options.formatting === true) {
    if (sentence.data.fmt) {
      if (sentence.data.fmt.bold) {
        sentence.data.fmt.bold.forEach((str) => {
          let tag = '\\textbf{' + str + '}';
          text = smartReplace_1(text, str, tag);
        });
      }
      if (sentence.data.fmt.italic) {
        sentence.data.fmt.italic.forEach((str) => {
          let tag = '\\textit{' + str + '}';
          text = smartReplace_1(text, str, tag);
        });
      }
    }
  }
  return text;
};
var toLatex_1$2 = toLatex$3;

//where we store the formatting, link, date information
const Sentence = function(data) {
  Object.defineProperty(this, 'data', {
    enumerable: false,
    value: data
  });
};

const methods$3 = {
  links: function(n) {
    let arr = this.data.links || [];
    if (typeof n === 'number') {
      return arr[n];
    } else if (typeof n === 'string') { //grab a link like .links('Fortnight')
      n = n.charAt(0).toUpperCase() + n.substring(1); //titlecase it
      let link = arr.find(o => o.page === n);
      return link === undefined ? [] : [link];
    }
    return arr;
  },
  interwiki: function(n) {
    let arr = this.links().filter(l => l.wiki !== undefined);
    if (typeof n === 'number') {
      return arr[n];
    }
    return arr;
  },
  bolds: function(n) {
    let arr = [];
    if (this.data && this.data.fmt && this.data.fmt.bold) {
      arr = this.data.fmt.bold || [];
    }
    if (typeof n === 'number') {
      return arr[n];
    }
    return arr;
  },
  italics: function(n) {
    let arr = [];
    if (this.data && this.data.fmt && this.data.fmt.italic) {
      arr = this.data.fmt.italic || [];
    }
    if (typeof n === 'number') {
      return arr[n];
    }
    return arr;
  },
  dates: function(n) {
    let arr = [];
    if (this.data && this.data.dates) {
      arr = this.data.dates || [];
    }
    if (typeof n === 'number') {
      return arr[n];
    }
    return arr;
  },
  markdown : function(options) {
    options = options || {};
    return toMarkdown_1$1(this, options);
  },
  html : function(options) {
    options = options || {};
    return toHtml$3(this, options);
  },
  text : function(str) {
    if (str !== undefined && typeof str === 'string') { //set the text?
      this.data.text = str;
    }
    return this.data.text || '';
  },
  json : function(options) {
    return toJson$3(this, options);
  },
  latex : function(options) {
    return toLatex_1$2(this, options);
  }
};

Object.keys(methods$3).forEach((k) => {
  Sentence.prototype[k] = methods$3[k];
});
//add alises, too
Object.keys(aliases).forEach((k) => {
  Sentence.prototype[k] = methods$3[aliases[k]];
});
Sentence.prototype.italic = Sentence.prototype.italics;
Sentence.prototype.bold = Sentence.prototype.bolds;
Sentence.prototype.plaintext = Sentence.prototype.text;

var Sentence_1 = Sentence;

//these are used for the sentence-splitter
var abbreviations = [
  'jr',
  'mr',
  'mrs',
  'ms',
  'dr',
  'prof',
  'sr',
  'sen',
  'corp',
  'calif',
  'rep',
  'gov',
  'atty',
  'supt',
  'det',
  'rev',
  'col',
  'gen',
  'lt',
  'cmdr',
  'adm',
  'capt',
  'sgt',
  'cpl',
  'maj',
  'dept',
  'univ',
  'assn',
  'bros',
  'inc',
  'ltd',
  'co',
  'corp',
  'arc',
  'al',
  'ave',
  'blvd',
  'cl',
  'ct',
  'cres',
  'exp',
  'rd',
  'st',
  'dist',
  'mt',
  'ft',
  'fy',
  'hwy',
  'la',
  'pd',
  'pl',
  'plz',
  'tce',
  'Ala',
  'Ariz',
  'Ark',
  'Cal',
  'Calif',
  'Col',
  'Colo',
  'Conn',
  'Del',
  'Fed',
  'Fla',
  'Ga',
  'Ida',
  'Id',
  'Ill',
  'Ind',
  'Ia',
  'Kan',
  'Kans',
  'Ken',
  'Ky',
  'La',
  'Me',
  'Md',
  'Mass',
  'Mich',
  'Minn',
  'Miss',
  'Mo',
  'Mont',
  'Neb',
  'Nebr',
  'Nev',
  'Mex',
  'Okla',
  'Ok',
  'Ore',
  'Penna',
  'Penn',
  'Pa',
  'Dak',
  'Tenn',
  'Tex',
  'Ut',
  'Vt',
  'Va',
  'Wash',
  'Wis',
  'Wisc',
  'Wy',
  'Wyo',
  'USAFA',
  'Alta',
  'Ont',
  'QuÔøΩ',
  'Sask',
  'Yuk',
  'jan',
  'feb',
  'mar',
  'apr',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
  'sept',
  'vs',
  'etc',
  'esp',
  'llb',
  'md',
  'bl',
  'phd',
  'ma',
  'ba',
  'miss',
  'misses',
  'mister',
  'sir',
  'esq',
  'mstr',
  'lit',
  'fl',
  'ex',
  'eg',
  'sep',
  'sept',
  '..'
];

//split text into sentences, using regex
//@spencermountain MIT

//(Rule-based sentence boundary segmentation) - chop given text into its proper sentences.
// Ignore periods/questions/exclamations used in acronyms/abbreviations/numbers, etc.
// @spencermountain 2015 MIT

const abbrev_reg = new RegExp('(^| |\')(' + abbreviations.join('|') + `)[.!?] ?$`, 'i');
const acronym_reg = new RegExp('[ |.][A-Z].? +?$', 'i');
const elipses_reg = new RegExp('\\.\\.\\.* +?$');
const hasWord = new RegExp('[a-zа-яぁ-ゟ][a-zа-яぁ-ゟ゠-ヿ]', 'iu');
// 3040-309F : hiragana
// 30A0-30FF : katakana

//turn a nested array into one array
const flatten = function(arr) {
  let all = [];
  arr.forEach(function(a) {
    all = all.concat(a);
  });
  return all;
};

const naiive_split = function(text) {
  //first, split by newline
  let splits = text.split(/(\n+)/);
  splits = splits.filter(s => s.match(/\S/));
  //split by period, question-mark, and exclamation-mark
  splits = splits.map(function(str) {
    return str.split(/(\S.+?[.!?]"?)(?=\s+|$)/g); //\u3002
  });
  return flatten(splits);
};

// if this looks like a period within a wikipedia link, return false
const isBalanced = function(str) {
  str = str || '';
  const open = str.split(/\[\[/) || [];
  const closed = str.split(/\]\]/) || [];
  if (open.length > closed.length) {
    return false;
  }
  //make sure quotes are closed too
  const quotes = str.match(/"/g);
  if (quotes && quotes.length % 2 !== 0 && str.length < 900) {
    return false;
  }
  return true;
};

const sentence_parser = function(text) {
  let sentences = [];
  //first do a greedy-split..
  let chunks = [];
  //ensure it 'smells like' a sentence
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return sentences;
  }
  // This was the splitter regex updated to fix quoted punctuation marks.
  // let splits = text.split(/(\S.+?[.\?!])(?=\s+|$|")/g);
  // todo: look for side effects in this regex replacement:
  let splits = naiive_split(text);
  //filter-out the grap ones
  for (let i = 0; i < splits.length; i++) {
    let s = splits[i];
    if (!s || s === '') {
      continue;
    }
    //this is meaningful whitespace
    if (!s.match(/\S/)) {
      //add it to the last one
      if (chunks[chunks.length - 1]) {
        chunks[chunks.length - 1] += s;
        continue;
      } else if (splits[i + 1]) {
        //add it to the next one
        splits[i + 1] = s + splits[i + 1];
        continue;
      }
    }
    chunks.push(s);
  }

  //detection of non-sentence chunks
  const isSentence = function(hmm) {
    if (hmm.match(abbrev_reg) || hmm.match(acronym_reg) || hmm.match(elipses_reg)) {
      return false;
    }
    //too short? - no consecutive letters
    if (hasWord.test(hmm) === false) {
      return false;
    }
    if (!isBalanced(hmm)) {
      return false;
    }
    return true;
  };
  //loop through these chunks, and join the non-sentence chunks back together..
  for (let i = 0; i < chunks.length; i++) {
    //should this chunk be combined with the next one?
    if (chunks[i + 1] && !isSentence(chunks[i])) {
      chunks[i + 1] = chunks[i] + (chunks[i + 1] || ''); //.replace(/ +/g, ' ');
    } else if (chunks[i] && chunks[i].length > 0) {
      //this chunk is a proper sentence..
      sentences.push(chunks[i]);
      chunks[i] = '';
    }
  }
  //if we never got a sentence, return the given text
  if (sentences.length === 0) {
    return [text];
  }
  return sentences;
};

var parse$1 = sentence_parser;

// const templates = require('./templates');


const cat_reg = new RegExp(
  '\\[\\[:?(' + i18n_1.categories.join('|') + '):[^\\]\\]]{2,80}\\]\\]',
  'gi'
);

//return only rendered text of wiki links
const resolve_links = function(line) {
  // categories, images, files
  line = line.replace(cat_reg, '');
  // [[Common links]]
  line = line.replace(/\[\[:?([^|]{1,80}?)\]\](\w{0,5})/g, '$1$2');
  // [[File:with|Size]]
  line = line.replace(/\[\[File:(.{2,80}?)\|([^\]]+?)\]\](\w{0,5})/g, '');
  // [[Replaced|Links]]
  line = line.replace(/\[\[:?(.{2,80}?)\|([^\]]+?)\]\](\w{0,5})/g, '$2$3');
  // External links
  line = line.replace(
    /\[(https?|news|ftp|mailto|gopher|irc):\/\/[^\]\| ]{4,1500}([\| ].*?)?\]/g,
    '$2'
  );
  return line;
};
// console.log(resolve_links("[http://www.whistler.ca www.whistler.ca]"))

function postprocess(line) {
  //fix links
  line = resolve_links(line);
  //remove empty parentheses (sometimes caused by removing templates)
  line = line.replace(/\([,;: ]*\)/g, '');
  //these semi-colons in parentheses are particularly troublesome
  line = line.replace(/\( *(; ?)+/g, '(');
  //dangling punctuation
  line = helpers_1.trim_whitespace(line);
  line = line.replace(/ +\.$/, '.');
  return line;
}

function oneSentence(str) {
  let obj = {
    text: postprocess(str)
  };
  //pull-out the [[links]]
  let links$1 = links(str);
  if (links$1) {
    obj.links = links$1;
  }
  //pull-out the bolds and ''italics''
  obj = formatting_1(obj);
  //pull-out things like {{start date|...}}
  // obj = templates(obj);
  return new Sentence_1(obj);
}

//turn a text into an array of sentence objects
const parseSentences = function(wiki) {
  let sentences = parse$1(wiki);
  sentences = sentences.map(oneSentence);

  //remove :indented first line, as it is often a disambiguation
  if (sentences[0] && sentences[0].text() && sentences[0].text()[0] === ':') {
    sentences = sentences.slice(1);
  }
  return sentences;
};

//used for consistency with other class-definitions
const addSentences = function(wiki, data) {
  data.sentences = parseSentences(wiki);
  return wiki;
};

var _04Sentence = {
  parseSentences: parseSentences,
  oneSentence: oneSentence,
  addSentences: addSentences
};

//remove the top/bottom off the template
const strip = function(tmpl) {
  tmpl = tmpl.replace(/^\{\{/, '');
  tmpl = tmpl.replace(/\}\}$/, '');
  return tmpl;
};
var _strip = strip;

//normalize template names
const fmtName = function(name) {
  name = (name || '').trim();
  name = name.toLowerCase();
  name = name.replace(/_/g, ' ');
  return name;
};
var _fmtName = fmtName;

//turn {{name|one|two|three}} into [name, one, two, three]
const pipeSplitter = function(tmpl) {
  //start with a naiive '|' split
  let arr = tmpl.split(/\n?\|/);
  //we've split by '|', which is pretty lame
  //look for broken-up links and fix them :/
  arr.forEach((a, i) => {
    if (a === null) {
      return;
    }
    //has '[[' but no ']]'
    if (/\[\[[^\]]+$/.test(a) || /\{\{[^\}]+$/.test(a)) {
      arr[i + 1] = arr[i] + '|' + arr[i + 1];
      arr[i] = null;
    }
  });
  //cleanup any mistakes we've made
  arr = arr.filter((a) => a !== null);
  arr = arr.map((a) => (a || '').trim());
  //remove empty fields, only at the end:
  for(let i = arr.length - 1; i >= 0; i -= 1) {
    if (arr[i] === '') {
      arr.pop();
    }
    break;
  }
  return arr;
};
var _01PipeSplitter = pipeSplitter;

// every value in {{tmpl|a|b|c}} needs a name
// here we come up with names for them
const hasKey = /^[a-z0-9\u00C0-\u00FF\._\- '()œ]+=/iu;

//templates with these properties are asking for trouble
const reserved = {
  template: true,
  list: true,
  prototype: true
};

//turn 'key=val' into {key:key, val:val}
const parseKey = function(str) {
  let parts = str.split('=');
  let key = parts[0] || '';
  key = key.toLowerCase().trim();
  let val = parts.slice(1).join('=');
  //don't let it be called 'template'..
  if (reserved.hasOwnProperty(key)) {
    key = '_' + key;
  }
  return {
    key: key,
    val: val.trim()
  }
};

//turn [a, b=v, c] into {'1':a, b:v, '2':c}
const keyMaker = function(arr, order) {
  let o = 0;
  return arr.reduce((h, str) => {
    str = (str || '').trim();
    //support named keys - 'foo=bar'
    if (hasKey.test(str) === true) {
      let res = parseKey(str);
      if (res.key) {
        h[res.key] = res.val;
        return h
      }
    }
    //try a key from given 'order' names
    if (order && order[o]) {
      let key = order[o]; //here goes!
      h[key] = str;
    } else {
      h.list = h.list || [];
      h.list.push(str);
    }
    o += 1;
    return h
  }, {})
};

var _02KeyMaker = keyMaker;

const whoCares = {
  'classname': true,
  'style': true,
  'align': true,
  'margin': true,
  'left': true,
  'break': true,
  'boxsize': true,
  'framestyle': true,
  'item_style': true,
  'collapsible': true,
  'list_style_type': true,
  'list-style-type': true,
  'colwidth': true
};

//remove wiki-cruft & some styling info from templates
const cleanup = function(obj) {
  Object.keys(obj).forEach((k) => {
    if (whoCares[k.toLowerCase()] === true) {
      delete obj[k];
    }
    //remove empty values, too
    if (obj[k] === null || obj[k] === '') {
      delete obj[k];
    }
  });
  return obj;
};
var _03Cleanup = cleanup;

//remove the top/bottom off the template


const parseSentence = _04Sentence.oneSentence;




// most templates just want plaintext...
const makeFormat = function(str, fmt) {
  let s = parseSentence(str);
  //support various output formats
  if (fmt === 'json') {
    return s.json();
  } else if (fmt === 'raw') {
    return s;
  }
  //default to flat text
  return s.text();
};

//
const parser = function(tmpl, order, fmt) {
  order = order || [];
  //renomove {{}}'s
  tmpl = _strip(tmpl || '');
  let arr = _01PipeSplitter(tmpl);
  //get template name
  let name = arr.shift();
  //name each value
  let obj = _02KeyMaker(arr, order);
  //remove wiki-junk
  obj = _03Cleanup(obj);
  //is this a infobox/reference?
  // let known = isKnown(obj);

  //using '|1=content' is an escaping-thing..
  if (obj['1'] && order[0] && obj.hasOwnProperty(order[0]) === false) {
    //move it over..
    obj[order[0]] = obj['1'];
    delete obj['1'];
  }

  Object.keys(obj).forEach((k) => {
    if (k === 'list') {
      obj[k] = obj[k].map((v) => makeFormat(v, fmt));
      return;
    }
    obj[k] = makeFormat(obj[k], fmt);
  });
  //add the template name
  if (name) {
    obj.template = _fmtName(name);
  }
  return obj;
};
var parse$2 = parser;

//not so impressive right now
const toLatex$4 = function(c) {
  let str = c.title();
  return '⌃ ' + str + '\n';
};
var toLatex_1$3 = toLatex$4;

//
const toHtml$4 = function(c, options) {
  if (c.data && c.data.url && c.data.title) {
    let str = c.data.title;
    if (options.links === true) {
      str = `<a href="${c.data.url}">${str}</a>`;
    }
    return `<div class="reference">⌃ ${str} </div>`;
  }
  if (c.data.encyclopedia) {
    return `<div class="reference">⌃ ${c.data.encyclopedia}</div>`;
  }
  if (c.data.title) { //cite book, etc
    let str = c.data.title;
    if (c.data.author) {
      str += c.data.author;
    }
    if (c.data.first && c.data.last) {
      str += c.data.first + ' ' + c.data.last;
    }
    return `<div class="reference">⌃ ${str}</div>`;
  }
  if (c.inline) {
    return `<div class="reference">⌃ ${c.inline.html()}</div>`;
  }
  return '';
};
var toHtml_1$1 = toHtml$4;

//
const toMarkdown$4 = function(c) {
  if (c.data && c.data.url && c.data.title) {
    return `⌃ [${c.data.title}](${c.data.url})`;
  } else if (c.data.encyclopedia) {
    return `⌃ ${c.data.encyclopedia}`;
  } else if (c.data.title) { //cite book, etc
    let str = c.data.title;
    if (c.data.author) {
      str += c.data.author;
    }
    if (c.data.first && c.data.last) {
      str += c.data.first + ' ' + c.data.last;
    }
    return `⌃ ${str}`;
  } else if (c.inline) {
    return `⌃ ${c.inline.markdown()}`;
  }
  return '';
};
var toMarkdown_1$2 = toMarkdown$4;

//
const toJson$4 = function(c) {
  return c.data;
};
var toJson_1$1 = toJson$4;

const defaults$f = {};

//also called 'citations'
const Reference = function(data) {
  Object.defineProperty(this, 'data', {
    enumerable: false,
    value: data
  });
};

const methods$4 = {
  title: function() {
    let data = this.data;
    return data.title || data.encyclopedia || data.author || '';
  },
  links: function(n) {
    let arr = [];
    if (typeof n === 'number') {
      return arr[n];
    }
    //grab a specific link..
    if (typeof n === 'number') {
      return arr[n];
    } else if (typeof n === 'string') { //grab a link like .links('Fortnight')
      n = n.charAt(0).toUpperCase() + n.substring(1); //titlecase it
      let link = arr.find(o => o.page === n);
      return link === undefined ? [] : [link];
    }
    return arr || [];
  },
  text: function() {
    return ''; //nah, skip these.
  },
  markdown: function(options) {
    options = setDefaults_1(options, defaults$f);
    return toMarkdown_1$2(this);
  },
  html: function(options) {
    options = setDefaults_1(options, defaults$f);
    return toHtml_1$1(this, options);
  },
  latex: function(options) {
    options = setDefaults_1(options, defaults$f);
    return toLatex_1$3(this);
  },
  json: function(options) {
    options = setDefaults_1(options, defaults$f);
    return toJson_1$1(this);
  }
};
Object.keys(methods$4).forEach((k) => {
  Reference.prototype[k] = methods$4[k];
});
var Reference_1 = Reference;

// const parse = require('../../templates/wikipedia/page').citation;
const parseSentence$1 = _04Sentence.oneSentence;


//structured Cite templates - <ref>{{Cite..</ref>
const hasCitation = function(str) {
  return /^ *?\{\{ *?(cite|citation)/i.test(str) && /\}\} *?$/.test(str) && /citation needed/i.test(str) === false;
};

const parseCitation = function(tmpl) {
  let obj = parse$2(tmpl);
  obj.type = obj.template.replace(/cite /, '');
  obj.template = 'citation';
  return obj;
};

//handle unstructured ones - <ref>some text</ref>
const parseInline = function(str) {
  let obj = parseSentence$1(str) || {};
  return {
    template: 'citation',
    type: 'inline',
    data: {},
    inline: obj
  };
};

// parse <ref></ref> xml tags
const parseRefs = function(wiki, data) {
  let references = [];
  wiki = wiki.replace(/ ?<ref>([\s\S]{0,1800}?)<\/ref> ?/gi, function(a, tmpl) {
    if (hasCitation(tmpl)) {
      let obj = parseCitation(tmpl);
      if (obj) {
        references.push(obj);
      }
      wiki = wiki.replace(tmpl, '');
    } else {
      references.push(parseInline(tmpl));
    }
    return ' ';
  });
  // <ref name=""/>
  wiki = wiki.replace(/ ?<ref [^>]{0,200}?\/> ?/gi, ' ');
  // <ref name=""></ref>
  wiki = wiki.replace(/ ?<ref [^>]{0,200}?>([\s\S]{0,1800}?)<\/ref> ?/gi, function(a, tmpl) {
    if (hasCitation(tmpl)) {
      let obj = parseCitation(tmpl);
      if (obj) {
        references.push(obj);
      }
      wiki = wiki.replace(tmpl, '');
    } else {
      references.push(parseInline(tmpl));
    }
    return ' ';
  });
  //now that we're done with xml, do a generic + dangerous xml-tag removal
  wiki = wiki.replace(/ ?<[ \/]?[a-z0-9]{1,8}[a-z0-9=" ]{2,20}[ \/]?> ?/g, ' '); //<samp name="asd">
  data.references = references.map(r => new Reference_1(r));
  return wiki;
};
var reference = parseRefs;

const parseSentence$2 = _04Sentence.oneSentence;

const heading_reg = /^(={1,5})(.{1,200}?)={1,5}$/;

//interpret depth, title of headings like '==See also=='
const parseHeading = function(data, str) {

  let heading = str.match(heading_reg);
  if (!heading) {
    data.title = '';
    data.depth = 0;
    return data;
  }
  let title = heading[2] || '';
  title = parseSentence$2(title).text();
  //amazingly, you can see inline {{templates}} in this text, too
  //... let's not think about that now.
  title = title.replace(/\{\{.+?\}\}/, '');
  //same for references (i know..)
  title = reference(title, {}); //TODO: this is ridiculous
  //trim leading/trailing whitespace
  title = helpers_1.trim_whitespace(title);
  let depth = 0;
  if (heading[1]) {
    depth = heading[1].length - 2;
  }
  data.title = title;
  data.depth = depth;
  return data;
};
var heading = parseHeading;

//remove top-bottoms
const cleanup$1 = function(lines) {
  lines = lines.filter(line => {
    //a '|+' row is a 'table caption', remove it.
    return line && /^\|\+/.test(line) !== true;
  });
  if (/^{\|/.test(lines[0]) === true) {
    lines.shift();
  }
  if (/^\|}/.test(lines[lines.length - 1]) === true) {
    lines.pop();
  }
  if (/^\|-/.test(lines[0]) === true) {
    lines.shift();
  }
  return lines;
};

//turn newline seperated into '|-' seperated
const findRows = function(lines) {
  let rows = [];
  let row = [];
  lines = cleanup$1(lines);
  for(let i = 0; i < lines.length; i += 1) {
    let line = lines[i];
    //'|-' is a row-seperator
    if (/^\|-/.test(line) === true) {
      //okay, we're done the row
      if (row.length > 0) {
        rows.push(row);
        row = [];
      }
    } else {
      //look for '||' inline row-splitter
      line = line.split(/(?:\|\||!!)/);
      //support newline -> '||'
      if (!line[0] && line[1]) {
        line.shift();
      }
      line.forEach((l) => {
        l = l.replace(/^\| */, '');
        l = l.trim();
        row.push(l);
      });
    }
  }
  //finish the last one
  if (row.length > 0) {
    rows.push(row);
  }
  return rows;
};
var _findRows = findRows;

const getRowSpan = /.*rowspan *?= *?["']?([0-9]+)["']?[ \|]*/;
const getColSpan = /.*colspan *?= *?["']?([0-9]+)["']?[ \|]*/;

//colspans stretch ←left/right→
const doColSpan = function(rows) {
  rows.forEach((row, r) => {
    row.forEach((str, c) => {
      let m = str.match(getColSpan);
      if (m !== null) {
        let num = parseInt(m[1], 10);

        //...maybe if num is so big, and centered, remove it?
        if (num > 3) {
          rows[r] = [];
          return;
        }
        //splice-in n empty columns right here
        row[c] = str.replace(getColSpan, '');
        for(let i = 1; i < num; i += 1) {
          row.splice(c + 1, 0, '');
        }
      }
    });
  });
  rows = rows.filter(r => r.length > 0);
  return rows;
};

//colspans stretch up/down
const doRowSpan = function(rows) {
  rows.forEach((row, r) => {
    row.forEach((str, c) => {
      let m = str.match(getRowSpan);
      if (m !== null) {
        let num = parseInt(m[1], 10);
        //copy this cell down n rows
        str = str.replace(getRowSpan, '');
        row[c] = str;
        for(let i = r + 1; i < r + num; i += 1) {
          if (!rows[i]) {
            break;
          }
          rows[i].splice(c, 0, str);
        }
      }
    });
  });
  return rows;
};

//
const handleSpans = function(rows) {
  rows = doRowSpan(rows);
  rows = doColSpan(rows);
  return rows;
};
var _spans = handleSpans;

const parseSentence$3 = _04Sentence.oneSentence;



//common ones
const headings = {
  name: true,
  age: true,
  born: true,
  date: true,
  year: true,
  city: true,
  country: true,
  population: true,
  count: true,
  number: true,
};

//additional table-cruft to remove before parseLine method
const cleanText = function(str) {
  str = parseSentence$3(str).text();
  //anything before a single-pipe is styling, so remove it
  if (str.match(/\|/)) {
    str = str.replace(/.+\| ?/, ''); //class="unsortable"|title
  }
  str = str.replace(/style=['"].*?["']/, '');
  //'!' is used as a highlighed-column
  str = str.replace(/^!/, '');
  str = str.trim();
  return str;
};

//'!' starts a header-row
const findHeaders = function( rows = [] ) {
  let headers = [];
  let first = rows[0];
  if (first && first[0] && /^!/.test(first[0]) === true) {
    headers = first.map((h) => {
      h = h.replace(/^\! */, '');
      h = cleanText(h);
      return h;
    });
    rows.shift();
  }
  //try the second row, too (overwrite first-row, if it exists)
  first = rows[0];
  if (first && first[0] && first[1] && /^!/.test(first[0]) && /^!/.test(first[1])) {
    first.forEach((h, i) => {
      h = h.replace(/^\! */, '');
      h = cleanText(h);
      if (Boolean(h) === true) {
        headers[i] = h;
      }
    });
    rows.shift();
  }
  return headers;
};

//turn headers, array into an object
const parseRow = function(arr, headers) {
  let row = {};
  arr.forEach((str, i) => {
    let h = headers[i] || 'col' + (i + 1);
    let s = parseSentence$3(str);
    s.text(cleanText(s.text()));
    row[h] = s;
  });
  return row;
};

//should we use the first row as a the headers?
const firstRowHeader = function(rows) {
  if (rows.length <= 3) {
    return [];
  }
  let headers = rows[0].slice(0);
  headers = headers.map((h) => {
    h = h.replace(/^\! */, '');
    h = parseSentence$3(h).text();
    h = cleanText(h);
    h = h.toLowerCase();
    return h;
  });
  for(let i = 0; i < headers.length; i += 1) {
    if (headings.hasOwnProperty(headers[i])) {
      rows.shift();
      return headers;
    }
  }
  return [];
};

//turn a {|...table string into an array of arrays
const parseTable = function(wiki) {
  let lines = wiki.replace(/\r/g, '').split(/\n/);
  lines = lines.map(l => l.trim());
  let rows = _findRows(lines);
  //support colspan, rowspan...
  rows = _spans(rows);
  //grab the header rows
  let headers = findHeaders(rows);
  if (!headers || headers.length <= 1) {
    headers = firstRowHeader(rows);
    let want = rows[rows.length - 1] || [];
    //try the second row
    if (headers.length <= 1 && want.length > 2) {
      headers = firstRowHeader(rows.slice(1));
      if (headers.length > 0) {
        rows = rows.slice(2); //remove them
      }
    }
  }
  //index each column by it's header
  let table = rows.map(arr => {
    return parseRow(arr, headers);
  });
  return table;
};

var parse$3 = parseTable;

//turn a json table into a html table
const toHtml$5 = function(table, options) {
  let html = '<table class="table">\n';
  //make header
  html += '  <thead>\n';
  html += '  <tr>\n';
  Object.keys(table[0]).forEach((k) => {
    if (/^col[0-9]/.test(k) !== true) {
      html += '    <td>' + k + '</td>\n';
    }
  });
  html += '  </tr>\n';
  html += '  </thead>\n';
  html += '  <tbody>\n';
  //make rows
  table.forEach((o) => {
    html += '  <tr>\n';
    Object.keys(o).forEach((k) => {
      let val = o[k].html(options);
      html += '    <td>' + val + '</td>\n';
    });
    html += '  </tr>\n';
  });
  html += '  </tbody>\n';
  html += '</table>\n';
  return html;
};
var toHtml_1$2 = toHtml$5;

//center-pad each cell, to make the table more legible
const pad = (str, cellWidth) => {
  str = str || '';
  str = String(str);
  cellWidth = cellWidth || 15;
  let diff = cellWidth - str.length;
  diff = Math.ceil(diff / 2);
  for(let i = 0; i < diff; i += 1) {
    str = ' ' + str;
    if (str.length < cellWidth) {
      str = str + ' ';
    }
  }
  return str;
};
var pad_1 = pad;

/* this is a markdown table:
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
*/

const makeRow = (arr) => {
  arr = arr.map(s => pad_1(s, 14));
  return '| ' + arr.join(' | ') + ' |';
};

//markdown tables are weird
const doTable = (table, options) => {
  let md = '';
  if (!table || table.length === 0) {
    return md;
  }
  let keys = Object.keys(table[0]);
  //first, grab the headers
  //remove auto-generated number keys
  let headers = keys.map((k) => {
    if (/^col[0-9]/.test(k) === true) {
      return '';
    }
    return k;
  });
  //draw the header (necessary!)
  md += makeRow(headers) + '\n';
  md += makeRow(headers.map(() => '---')) + '\n';
  //do each row..
  md += table.map((row) => {
    //each column..
    let arr = keys.map((k) => {
      if (!row[k]) {
        return '';
      }
      return row[k].markdown(options) || '';
    });
    //make it a nice padded row
    return makeRow(arr);
  }).join('\n');
  return md + '\n';
};
var toMarkdown$5 = doTable;

//create a formal LATEX table
const doTable$1 = function(table, options) {
  let out = '\n%\\vspace*{0.3cm}\n';
  out += '\n% BEGIN TABLE: only left align columns in LaTeX table with horizontal line separation between columns';
  out += '\n% Format Align Column: \'l\'=left \'r\'=right align, \'c\'=center, \'p{5cm}\'=block with column width 5cm ';
  out += '\n\\begin{tabular}{|';
  Object.keys(table[0]).forEach(() => {
    out += 'l|';
  });
  out += '} \n';
  out += '\n  \\hline  %horizontal line\n';
  //make header
  out += '\n  % BEGIN: Table Header';
  var vSep = '   ';
  Object.keys(table[0]).forEach((k) => {
    out += '\n    ' + vSep;

    if (k.indexOf('col-') === 0) {
      out += '\\textbf{' + k + '}';
    } else {
      out += '  ';
    }
    vSep = ' & ';
  });
  out += '\\\\ ';
  out += '\n  % END: Table Header';
  out += '\n  % BEGIN: Table Body';
  out += '\n  \\hline  % ----- table row -----';
  ////make rows
  table.forEach((o) => {
    vSep = ' ';
    out += '\n  % ----- table row -----';
    Object.keys(o).forEach((k) => {
      let s = o[k];
      let val = s.latex(options);
      out += '\n    ' + vSep + val + '';
      vSep = ' & ';
    });
    out += '  \\\\ '; // newline in latex table = two backslash \\
    out += '\n  \\hline  %horizontal line';
  });
  out += '\n    % END: Table Body';
  out += '\\end{tabular} \n';
  out += '\n\\vspace*{0.3cm}\n\n';
  return out;
};
var toLatex$5 = doTable$1;

//
const toJson$5 = function(tables, options) {
  return tables.map((table) => {
    let row = {};
    Object.keys(table).forEach((k) => {
      row[k] = table[k].json(); //(they're sentence objects)
    });
    //encode them, for mongodb
    if (options.encode === true) {
      row = encode.encodeObj(row);
    }
    return row;
  });
};
var toJson_1$2 = toJson$5;

const defaults$g = {};

const Table = function(data) {
  Object.defineProperty(this, 'data', {
    enumerable: false,
    value: data
  });
};

const methods$5 = {
  links(n) {
    let links = [];
    this.data.forEach((r) => {
      Object.keys(r).forEach((k) => {
        links = links.concat(r[k].links());
      });
    });
    //grab a specific link..
    if (typeof n === 'number') {
      return links[n];
    } else if (typeof n === 'string') { //grab a link like .links('Fortnight')
      n = n.charAt(0).toUpperCase() + n.substring(1); //titlecase it
      let link = links.find(o => o.page === n);
      return link === undefined ? [] : [link];
    }
    return links;
  },
  keyValue(options) {
    let rows = this.json(options);
    rows.forEach((row) => {
      Object.keys(row).forEach((k) => {
        row[k] = row[k].text;
      });
    });
    return rows;
  },
  json(options) {
    options = setDefaults_1(options, defaults$g);
    return toJson_1$2(this.data, options);
  },
  html(options) {
    options = setDefaults_1(options, defaults$g);
    return toHtml_1$2(this.data, options);
  },
  markdown(options) {
    options = setDefaults_1(options, defaults$g);
    return toMarkdown$5(this.data, options);
  },
  latex(options) {
    options = setDefaults_1(options, defaults$g);
    return toLatex$5(this.data, options);
  },
  text() {
    return '';
  }
};
methods$5.keyvalue = methods$5.keyValue;
methods$5.keyval = methods$5.keyValue;

Object.keys(methods$5).forEach((k) => {
  Table.prototype[k] = methods$5[k];
});
//add alises, too
Object.keys(aliases).forEach((k) => {
  Table.prototype[k] = methods$5[aliases[k]];
});
var Table_1 = Table;

// const table_reg = /\{\|[\s\S]+?\|\}/g; //the largest-cities table is ~70kchars.
const openReg = /^\s*{\|/;
const closeReg = /^\s*\|}/;

//tables can be recursive, so looky-here.
const findTables = function(section, wiki) {
  let list = [];
  let lines = wiki.split('\n');
  let stack = [];
  for (let i = 0; i < lines.length; i += 1) {
    //start a table
    if (openReg.test(lines[i]) === true) {
      stack.push(lines[i]);
      continue;
    }
    //close a table
    if (closeReg.test(lines[i]) === true) {
      stack[stack.length - 1] += '\n' + lines[i];
      let table = stack.pop();
      list.push(table);
      continue;
    }
    //keep-going on one
    if (stack.length > 0) {
      stack[stack.length - 1] += '\n' + lines[i];
    }
  }
  //work-em together for a Table class
  let tables = [];
  list.forEach(str => {
    if (str) {
      //also reremove a newline at the end of the table (awkward)
      wiki = wiki.replace(str + '\n', '');
      wiki = wiki.replace(str, '');
      let data = parse$3(str);
      if (data && data.length > 0) {
        tables.push(new Table_1(data));
      }
    }
  });

  if (tables.length > 0) {
    section.tables = tables;
  }
  return wiki;
};

var table = findTables;

const defaults$h = {
  sentences: true
};

const toJson$6 = function(p, options) {
  options = setDefaults_1(options, defaults$h);
  let data = {};
  if (options.sentences === true) {
    data.sentences = p.sentences().map(s => s.json(options));
  }
  return data;
};
var toJson_1$3 = toJson$6;

const defaults$i = {
  sentences: true
};

const toMarkdown$6 = function(p, options) {
  options = setDefaults_1(options, defaults$i);
  let md = '';
  if (options.sentences === true) {
    md += p.sentences().reduce((str, s) => {
      str += s.markdown(options) + '\n';
      return str;
    }, {});
  }
  return md;
};
var toMarkdown_1$3 = toMarkdown$6;

const defaults$j = {
  sentences: true
};

const toHtml$6 = function(p, options) {
  options = setDefaults_1(options, defaults$j);
  let html = '';
  if (options.sentences === true) {
    html += p.sentences().map(s => s.html(options)).join('\n');
  }
  return html;
};
var toHtml_1$3 = toHtml$6;

const defaults$k = {
  sentences: true
};

const toLatex$6 = function(p, options) {
  options = setDefaults_1(options, defaults$k);
  let out = '';
  if (options.sentences === true) {
    out += '\n\n% BEGIN Paragraph\n';
    out += p.sentences().reduce((str, s) => {
      str += s.latex(options) + '\n';
      return str;
    }, '');
    out += '% END Paragraph';
  }
  return out;
};
var toLatex_1$4 = toLatex$6;

const defaults$l = {
  sentences: true,
  lists: true,
  images: true,
};

const Paragraph = function(data) {
  Object.defineProperty(this, 'data', {
    enumerable: false,
    value: data
  });
};

const methods$6 = {
  sentences: function(num) {
    if (typeof num === 'number') {
      return this.data.sentences[num];
    }
    return this.data.sentences || [];
  },
  references: function(num) {
    if (typeof num === 'number') {
      return this.data.references[num];
    }
    return this.data.references;
  },
  lists: function(num) {
    if (typeof num === 'number') {
      return this.data.lists[num];
    }
    return this.data.lists;
  },
  images(num) {
    if (typeof num === 'number') {
      return this.data.images[num];
    }
    return this.data.images || [];
  },
  links: function(n) {
    let arr = [];
    this.sentences().forEach(s => {
      arr = arr.concat(s.links(n));
    });
    if (typeof n === 'number') {
      return arr[n];
    } else if (typeof n === 'string') { //grab a specific link like .links('Fortnight')
      n = n.charAt(0).toUpperCase() + n.substring(1); //titlecase it
      let link = arr.find(o => o.page === n);
      return link === undefined ? [] : [link];
    }
    return arr || [];
  },
  interwiki(num) {
    let arr = [];
    this.sentences().forEach(s => {
      arr = arr.concat(s.interwiki());
    });
    if (typeof num === 'number') {
      return arr[num];
    }
    return arr || [];
  },
  markdown: function(options) {
    options = setDefaults_1(options, defaults$l);
    return toMarkdown_1$3(this, options);
  },
  html: function(options) {
    options = setDefaults_1(options, defaults$l);
    return toHtml_1$3(this, options);
  },
  text: function(options) {
    options = setDefaults_1(options, defaults$l);
    let str = this.sentences()
      .map(s => s.text(options))
      .join(' ');
    this.lists().forEach((list) => {
      str += '\n' + list.text();
    });
    return str;
  },
  latex: function(options) {
    options = setDefaults_1(options, defaults$l);
    return toLatex_1$4(this, options);
  },
  json: function(options) {
    options = setDefaults_1(options, defaults$l);
    return toJson_1$3(this, options);
  }
};
methods$6.citations = methods$6.references;
Object.keys(methods$6).forEach(k => {
  Paragraph.prototype[k] = methods$6[k];
});
var Paragraph_1 = Paragraph;

//find all the pairs of '[[...[[..]]...]]' in the text
//used to properly root out recursive template calls, [[.. [[...]] ]]
//basically just adds open tags, and subtracts closing tags
function find_recursive(opener, closer, text) {
  var out = [];
  var last = [];
  const chars = text.split('');
  var open = 0;
  for (var i = 0; i < chars.length; i++) {
    const c = text[i];
    //increment open tag
    if (c === opener) {
      open += 1;
    }
    //decrement close tag
    else if (c === closer) {
      open -= 1;
      if (open < 0) {
        open = 0;
      }
    } else if (last.length === 0) {
      // If we're not inside of a pair of delimiters, we can discard the current letter.
      // The return of this function is only used to extract images.
      continue;
    }

    last.push(c);
    if (open === 0 && last.length > 0) {
      //first, fix botched parse
      var open_count = 0;
      var close_count = 0;
      for (var j = 0; j < last.length; j++) {
        if (last[j] === opener) {
          open_count++;
        } else if (last[j] === closer) {
          close_count++;
        }
      }
      //is it botched?
      if (open_count > close_count) {
        last.push(closer);
      }
      //looks good, keep it
      out.push(last.join(''));
      last = [];
    }
  }
  return out;
}
var recursive_match = find_recursive;

const parseSentence$4 = _04Sentence.oneSentence;
//regexes:
const isFile = new RegExp('(' + i18n_1.images.concat(i18n_1.files).join('|') + '):', 'i');
let fileNames = `(${i18n_1.images.concat(i18n_1.files).join('|')})`;
const file_reg = new RegExp(fileNames + ':(.+?)[\\||\\]]', 'iu');

//style directives for Wikipedia:Extended_image_syntax
const imgLayouts = {
  thumb: true,
  thumbnail: true,
  border: true,
  right: true,
  left: true,
  center: true,
  top: true,
  bottom: true,
  none: true,
  upright: true,
  baseline: true,
  middle: true,
  sub: true,
  super: true,
};

//images are usually [[image:my_pic.jpg]]
const oneImage = function(img) {
  let m = img.match(file_reg);
  if (m === null || !m[2]) {
    return null;
  }
  let file = `${m[1]}:${m[2] || ''}`;
  file = file.trim();
  //titlecase it
  let title = file.charAt(0).toUpperCase() + file.substring(1);
  //spaces to underscores
  title = title.replace(/ /g, '_');
  if (title) {
    let obj = {
      file: file
    };
    //try to grab other metadata, too
    img = img.replace(/^\[\[/, '');
    img = img.replace(/\]\]$/, '');

    //https://en.wikipedia.org/wiki/Wikipedia:Extended_image_syntax
    // - [[File:Name|Type|Border|Location|Alignment|Size|link=Link|alt=Alt|lang=Langtag|Caption]]
    let imgData = parse$2(img);
    let arr = imgData.list || [];
    //parse-out alt text, if explicitly given
    if (imgData.alt) {
      obj.alt = imgData.alt;
    }
    //remove 'thumb' and things
    arr = arr.filter((str) => imgLayouts.hasOwnProperty(str) === false);
    if (arr[arr.length - 1]) {
      obj.caption = parseSentence$4(arr[arr.length - 1]);
    }
    return new Image_1(obj, img);
  }
  return null;
};

const parseImages = function(matches, r, wiki) {
  matches.forEach(function(s) {
    if (isFile.test(s) === true) {
      r.images = r.images || [];
      let img = oneImage(s);
      if (img) {
        r.images.push(img);
      }
      wiki = wiki.replace(s, '');
    }
  });
  return wiki;
};
var image = parseImages;

//
const toJson$7 = function(p, options) {
  return p.lines().map(s => s.json(options));
};
var toJson_1$4 = toJson$7;

//
const toMarkdown$7 = (list, options) => {
  return list.lines().map((s) => {
    let str = s.markdown(options);
    return ' * ' + str;
  }).join('\n');
};
var toMarkdown_1$4 = toMarkdown$7;

//
const toHtml$7 = (list, options) => {
  let html = '  <ul class="list">\n';
  list.lines().forEach((s) => {
    html += '    <li>' + s.html(options) + '</li>\n';
  });
  html += '  </ul>\n';
  return html;
};
var toHtml_1$4 = toHtml$7;

//
const toLatex$7 = (list, options) => {
  let out = '\\begin{itemize}\n';
  list.lines().forEach((s) => {
    out += '  \\item ' + s.text(options) + '\n';
  });
  out += '\\end{itemize}\n';
  return out;
};
var toLatex_1$5 = toLatex$7;

const defaults$m = {};

const toText = (list, options) => {
  return list.map((s) => {
    let str = s.text(options);
    return ' * ' + str;
  }).join('\n');
};

const List = function(data) {
  Object.defineProperty(this, 'data', {
    enumerable: false,
    value: data
  });
};

const methods$7 = {
  lines() {
    return this.data;
  },
  links(n) {
    let links = [];
    this.lines().forEach((s) => {
      links = links.concat(s.links());
    });
    if (typeof n === 'number') {
      return links[n];
    } else if (typeof n === 'string') { //grab a link like .links('Fortnight')
      n = n.charAt(0).toUpperCase() + n.substring(1); //titlecase it
      let link = links.find(o => o.page === n);
      return link === undefined ? [] : [link];
    }
    return links;
  },
  markdown(options) {
    options = setDefaults_1(options, defaults$m);
    return toMarkdown_1$4(this, options);
  },
  html(options) {
    options = setDefaults_1(options, defaults$m);
    return toHtml_1$4(this, options);
  },
  latex(options) {
    options = setDefaults_1(options, defaults$m);
    return toLatex_1$5(this, options);
  },
  json(options) {
    options = setDefaults_1(options, defaults$m);
    return toJson_1$4(this, options);
  },
  text() {
    return toText(this.data);
  }
};

Object.keys(methods$7).forEach((k) => {
  List.prototype[k] = methods$7[k];
});
//add alises, too
Object.keys(aliases).forEach((k) => {
  List.prototype[k] = methods$7[aliases[k]];
});
var List_1 = List;

const parseSentence$5 = _04Sentence.oneSentence;
const list_reg = /^[#\*:;\|]+/;
const bullet_reg = /^\*+[^:,\|]{4}/;
const number_reg = /^ ?\#[^:,\|]{4}/;
const has_word = /[a-z_0-9\]\}]/i;

// does it start with a bullet point or something?
const isList = function(line) {
  return list_reg.test(line) || bullet_reg.test(line) || number_reg.test(line);
};

//make bullets/numbers into human-readable *'s
const cleanList = function(list) {
  let number = 1;
  list = list.filter(l => l);
  for (var i = 0; i < list.length; i++) {
    var line = list[i];
    //add # numberings formatting
    if (line.match(number_reg)) {
      line = line.replace(/^ ?#*/, number + ') ');
      line = line + '\n';
      number += 1;
    } else if (line.match(list_reg)) {
      number = 1;
      line = line.replace(list_reg, '');
    }
    list[i] = parseSentence$5(line);
  }
  return list;
};

const grabList = function(lines, i) {
  let sub = [];
  for (let o = i; o < lines.length; o++) {
    if (isList(lines[o])) {
      sub.push(lines[o]);
    } else {
      break;
    }
  }
  sub = sub.filter(a => a && has_word.test(a));
  sub = cleanList(sub);
  return sub;
};

const parseList = function(wiki, data) {
  let lines = wiki.split(/\n/g);
  // lines = lines.filter(l => has_word.test(l));
  let lists = [];
  let theRest = [];
  for (let i = 0; i < lines.length; i++) {
    if (isList(lines[i]) && lines[i + 1] && isList(lines[i + 1])) {
      let sub = grabList(lines, i);
      if (sub.length > 0) {
        lists.push(sub);
        i += sub.length - 1;
      }
    } else {
      theRest.push(lines[i]);
    }
  }
  data.lists = lists.map((l) => new List_1(l));
  wiki = theRest.join('\n');
  return wiki;
};
var list = parseList;

const parseSentences$1 = _04Sentence.addSentences;

const twoNewLines = /\r?\n\r?\n/;
const parse$4 = {
  image: image,
  list: list,
};

const parseParagraphs = function(wiki) {
  let pList = wiki.split(twoNewLines);
  //don't create empty paragraphs
  pList = pList.filter(p => p && p.trim().length > 0);
  pList = pList.map(str => {
    let data = {
      lists: [],
      sentences: [],
      images: []
    };
    //parse the lists
    str = parse$4.list(str, data);
    //parse+remove scary '[[ [[]] ]]' stuff
    let matches = recursive_match('[', ']', str);
    // parse images
    str = parse$4.image(matches, data, str);
    //parse the sentences
    parseSentences$1(str, data);
    return new Paragraph_1(data);
  });
  return {
    paragraphs: pList,
    wiki: wiki
  };
};
var _03Paragraph = parseParagraphs;

var _skipKeys = {
  image: true,
  caption: true,
  alt: true,
  signature: true,
  'signature alt': true,
};

const defaults$n = {
  images: true,
};

// render an infobox as a table with two columns, key + value
const doInfobox = function(obj, options) {
  options = setDefaults_1(options, defaults$n);
  let md = '|' + pad_1('', 35) + '|' + pad_1('', 30) + '|\n';
  md += '|' + pad_1('---', 35) + '|' + pad_1('---', 30) + '|\n';
  //todo: render top image here (somehow)
  Object.keys(obj.data).forEach((k) => {
    if (_skipKeys[k] === true) {
      return;
    }
    let key = '**' + k + '**';
    let s = obj.data[k];
    let val = s.markdown(options);
    //markdown is more newline-sensitive than wiki
    val = val.split(/\n/g).join(', ');
    md += '|' + pad_1(key, 35) + '|' + pad_1(val, 30) + ' |\n';
  });
  return md;
};
var toMarkdown$8 = doInfobox;

const defaults$o = {
  images: true,
};

//
const infobox = function(obj, options) {
  options = setDefaults_1(options, defaults$o);
  let html = '<table class="infobox">\n';
  html += '  <thead>\n';
  html += '  </thead>\n';
  html += '  <tbody>\n';
  //put image and caption on the top
  if (options.images === true && obj.data.image) {
    html += '    <tr>\n';
    html += '       <td colspan="2" style="text-align:center">\n';
    html += '       ' + obj.image().html() + '\n';
    html += '       </td>\n';
    if (obj.data.caption || obj.data.alt) {
      let caption = obj.data.caption ? obj.data.caption.html(options) : obj.data.alt.html(options);
      html += '       <td colspan="2" style="text-align:center">\n';
      html += '         ' + caption + '\n';
      html += '       </td>\n';
    }
    html += '    </tr>\n';
  }
  Object.keys(obj.data).forEach((k) => {
    if (_skipKeys[k] === true) {
      return;
    }
    let s = obj.data[k];
    let key = k.replace(/_/g, ' ');
    key = key.charAt(0).toUpperCase() + key.substring(1); //titlecase it
    let val = s.html(options);
    html += '    <tr>\n';
    html += '      <td>' + key + '</td>\n';
    html += '      <td>' + val + '</td>\n';
    html += '    </tr>\n';
  });
  html += '  </tbody>\n';
  html += '</table>\n';
  return html;
};
var toHtml$8 = infobox;

const defaults$p = {
  images: true,
};

//
const infobox$1 = function(obj, options) {
  options = setDefaults_1(options, defaults$p);
  let out = '\n \\vspace*{0.3cm} % Info Box\n\n';
  out += '\\begin{tabular}{|@{\\qquad}l|p{9.5cm}@{\\qquad}|} \n';
  out += '  \\hline  %horizontal line\n';
  //todo: render top image here
  Object.keys(obj.data).forEach((k) => {
    if (_skipKeys[k] === true) {
      return;
    }
    let s = obj.data[k];
    let val = s.latex(options);
    out += '  % ---------- \n';
    out += '      ' + k + ' & \n';
    out += '      ' + val + '\\\\ \n';
    out += '  \\hline  %horizontal line\n';
  });
  out += '\\end{tabular} \n';
  out += '\n\\vspace*{0.3cm}\n\n';
  return out;
};
var toLatex$8 = infobox$1;

//turn an infobox into some nice json
const toJson$8 = function(infobox, options) {
  let json = Object.keys(infobox.data).reduce((h, k) => {
    if (infobox.data[k]) {
      h[k] = infobox.data[k].json();
    }
    return h;
  }, {});

  //support mongo-encoding keys
  if (options.encode === true) {
    json = encode.encodeObj(json);
  }
  return json;
};
var toJson_1$5 = toJson$8;

//a formal key-value data table about a topic
const Infobox = function(obj) {
  this._type = obj.type;
  Object.defineProperty(this, 'data', {
    enumerable: false,
    value: obj.data
  });
};

const methods$8 = {
  type: function() {
    return this._type;
  },
  links: function(n) {
    let arr = [];
    Object.keys(this.data).forEach((k) => {
      this.data[k].links().forEach((l) => arr.push(l));
    });
    if (typeof n === 'number') {
      return arr[n];
    } else if (typeof n === 'string') { //grab a link like .links('Fortnight')
      n = n.charAt(0).toUpperCase() + n.substring(1); //titlecase it
      let link = arr.find(o => o.page === n);
      return link === undefined ? [] : [link];
    }
    return arr;
  },
  image: function() {
    let s = this.get('image');
    if (!s) {
      return null;
    }
    let obj = s.json();
    obj.file = obj.text;
    obj.text = '';
    return new Image_1(obj);
  },
  get : function( key = '' ) {
    key = key.toLowerCase();
    let keys = Object.keys(this.data);
    for(let i = 0; i < keys.length; i += 1) {
      let tmp = keys[i].toLowerCase().trim();
      if (key === tmp) {
        return this.data[keys[i]];
      }
    }
    return null;
  },
  markdown : function(options) {
    options = options || {};
    return toMarkdown$8(this, options);
  },
  html : function(options) {
    options = options || {};
    return toHtml$8(this, options);
  },
  latex : function(options) {
    options = options || {};
    return toLatex$8(this, options);
  },
  text : function() {
    return '';
  },
  json : function(options) {
    options = options || {};
    return toJson_1$5(this, options);
  },
  keyValue : function() {
    return Object.keys(this.data).reduce((h, k) => {
      if (this.data[k]) {
        h[k] = this.data[k].text();
      }
      return h;
    }, {});
  }
};
//aliases

Object.keys(methods$8).forEach((k) => {
  Infobox.prototype[k] = methods$8[k];
});
//add alises, too
Object.keys(aliases).forEach((k) => {
  Infobox.prototype[k] = methods$8[aliases[k]];
});
Infobox.prototype.data = Infobox.prototype.keyValue;
Infobox.prototype.template = Infobox.prototype.type;
Infobox.prototype.images = Infobox.prototype.image;
var Infobox_1 = Infobox;

const open = '{';
const close = '}';

//grab all first-level recursions of '{{...}}'
const findFlat = function(wiki) {
  let depth = 0;
  let list = [];
  let carry = [];
  for (var i = wiki.indexOf(open); i !== -1 && i < wiki.length; depth > 0 ? i++ : (i = wiki.indexOf(open, i + 1))) {
    let c = wiki[i];
    //open it
    if (c === open) {
      depth += 1;
    }
    //close it
    if (depth > 0) {
      if (c === close) {
        depth -= 1;
        if (depth === 0) {
          carry.push(c);
          let tmpl = carry.join('');
          carry = [];
          //last check
          if (/\{\{/.test(tmpl) && /\}\}/.test(tmpl)) {
            list.push(tmpl);
          }
          continue;
        }
      }
      //require two '{{' to open it
      if (depth === 1 && c !== open && c !== close) {
        depth = 0;
        carry = [];
        continue;
      }
      carry.push(c);
    }
  }
  return list;
};

//get all nested templates
const findNested = function(top) {
  let deep = [];
  top.forEach((str) => {
    if (/\{\{/.test(str.substr(2)) === true) {
      str = _strip(str);
      findFlat(str).forEach((o) => {
        if (o) {
          deep.push(o);
        }
      });
    }
  });
  return deep;
};

const getTemplates = function(wiki) {
  let list = findFlat(wiki);
  return {
    top: list,
    nested: findNested(list)
  };
};

var _getTemplates = getTemplates;

//we explicitly ignore these, because they sometimes have resolve some data
const list$1 = [
  //https://en.wikipedia.org/wiki/category:templates_with_no_visible_output
  'anchor',
  'defaultsort',
  'use list-defined references',
  'void',
  //https://en.wikipedia.org/wiki/Category:Protection_templates
  'pp',
  'pp-move-indef',
  'pp-semi-indef',
  'pp-vandalism',
  //https://en.wikipedia.org/wiki/Template:R
  'r',
  //out-of-scope still - https://en.wikipedia.org/wiki/Template:Tag
  '#tag',
  //https://en.wikipedia.org/wiki/Template:Navboxes
  'navboxes',
  'reflist',
  'ref-list',
  'div col',
  'authority control',
  //https://en.wikipedia.org/wiki/Template:Citation_needed
  // 'better source',
  // 'citation needed',
  // 'clarify',
  // 'cite quote',
  // 'dead link',
  // 'by whom',
  // 'dubious',
  // 'when',
  // 'who',
  // 'quantify',
  // 'refimprove',
  // 'weasel inline',
  //https://en.wikipedia.org/wiki/Template:End
  'pope list end',
  'shipwreck list end',
  'starbox end',
  'end box',
  'end',
  's-end'
];
const ignore$1 = list$1.reduce((h, str) => {
  h[str] = true;
  return h;
}, {});
var _ignore = ignore$1;

//get the name of the template
//templates are usually '{{name|stuff}}'
const getName = function(tmpl) {
  let name = null;
  //{{name|foo}}
  if (/^\{\{[^\n]+\|/.test(tmpl)) {
    name = (tmpl.match(/^\{\{(.+?)\|/) || [])[1];
  } else if (tmpl.indexOf('\n') !== -1) {
    // {{name \n...
    name = (tmpl.match(/^\{\{(.+?)\n/) || [])[1];
  } else {
    //{{name here}}
    name = (tmpl.match(/^\{\{(.+?)\}\}$/) || [])[1];
  }
  if (name) {
    name = name.replace(/:.*/, '');
    name = _fmtName(name);
  }
  return name || null;
};
// console.log(templateName('{{name|foo}}'));
// console.log(templateName('{{name here}}'));
// console.log(templateName('{{CITE book |title=the killer and the cartoons }}'));
// console.log(templateName(`{{name
// |key=val}}`));
var _getName = getName;

const i18nReg = new RegExp('^(subst.)?(' + i18n_1.infoboxes.join('|') + ')[: \n]', 'i');
//some looser ones
const startReg = /^infobox /i;
const endReg = / infobox$/i;
const yearIn = /$Year in [A-Z]/i;

//some known ones from
// https://en.wikipedia.org/wiki/Wikipedia:List_of_infoboxes
// and https://en.wikipedia.org/wiki/Category:Infobox_templates
const known = {
  'gnf protein box': true,
  'automatic taxobox': true,
  'chembox ': true,
  'editnotice': true,
  'geobox': true,
  'hybridbox': true,
  'ichnobox': true,
  'infraspeciesbox': true,
  'mycomorphbox': true,
  'oobox': true,
  'paraphyletic group': true,
  'speciesbox': true,
  'subspeciesbox': true,
  'starbox short': true,
  'taxobox': true,
  'nhlteamseason': true,
  'asian games bid': true,
  'canadian federal election results': true,
  'dc thomson comic strip': true,
  'daytona 24 races': true,
  'edencharacter': true,
  'moldova national football team results': true,
  'samurai': true,
  'protein': true,
  'sheet authority': true,
  'order-of-approx': true,
  'bacterial labs': true,
  'medical resources': true,
  'ordination': true,
  'hockey team coach': true,
  'hockey team gm': true,
  'hockey team player': true,
  'hockey team start': true,
  'mlbbioret': true,
};
//
const isInfobox = function(name) {
  // known
  if (known.hasOwnProperty(name) === true) {
    return true;
  }
  if (i18nReg.test(name)) {
    return true;
  }
  if (startReg.test(name) || endReg.test(name)) {
    return true;
  }
  //these are also infoboxes: 'Year in Belarus'
  if (yearIn.test(name)) {
    return true;
  }
  return false;
};

//turns template data into good inforbox data
const fmtInfobox = function( obj = {} ) {
  let m = obj.template.match(i18nReg);
  let type = obj.template;
  if (m && m[0]) {
    type = type.replace(m[0], '');
  }
  type = type.trim();
  let infobox = {
    template: 'infobox',
    type: type,
    data: obj
  };
  delete infobox.data.template; // already have this.
  delete infobox.data.list; //just in case!
  return infobox;
};

var _infobox = {
  isInfobox: isInfobox,
  format: fmtInfobox
};

let templates = {
  /* mostly wiktionary*/
  etyl: (tmpl) => {
    let order = ['lang', 'page'];
    return parse$2(tmpl, order).page || '';
  },
  mention: (tmpl) => {
    let order = ['lang', 'page'];
    return parse$2(tmpl, order).page || '';
  },
  link: (tmpl) => {
    let order = ['lang', 'page'];
    return parse$2(tmpl, order).page || '';
  },
  'la-verb-form': (tmpl) => {
    let order = ['word'];
    return parse$2(tmpl, order).word || '';
  },
  'la-ipa': (tmpl) => {
    let order = ['word'];
    return parse$2(tmpl, order).word || '';
  },
  //https://en.wikipedia.org/wiki/Template:Sortname
  sortname: (tmpl) => {
    let order = ['first', 'last', 'target', 'sort'];
    let obj = parse$2(tmpl, order);
    let name = `${obj.first || ''} ${obj.last || ''}`;
    name = name.trim();
    if (obj.nolink) {
      return obj.target || name;
    }
    if (obj.dab) {
      name += ` (${obj.dab})`;
      if (obj.target) {
        obj.target += ` (${obj.dab})`;
      }
    }
    if (obj.target) {
      return `[[${obj.target}|${name}]]`;
    }
    return `[[${name}]]`;
  }
};

//these are insane
// https://en.wikipedia.org/wiki/Template:Tl
const links$1 = [
  'lts',
  't',
  'tfd links',
  'tiw',
  'tltt',
  'tetl',
  'tsetl',
  'ti',
  'tic',
  'tiw',
  'tlt',
  'ttl',
  'twlh',
  'tl2',
  'tlu',
  'demo',
  'hatnote',
  'xpd',
  'para',
  'elc',
  'xtag',
  'mli',
  'mlix',
  '#invoke',
  'url' //https://en.wikipedia.org/wiki/Template:URL
];

//keyValues
links$1.forEach((k) => {
  templates[k] = (tmpl) => {
    let order = ['first', 'second'];
    let obj = parse$2(tmpl, order);
    return obj.second || obj.first;
  };
});
//aliases
templates.m = templates.mention;
templates['m-self'] = templates.mention;
templates.l = templates.link;
templates.ll = templates.link;
templates['l-self'] = templates.link;
var links_1 = templates;

const sisterProjects = {
  wikt: 'wiktionary',
  commons: 'commons',
  c: 'commons',
  commonscat: 'commonscat',
  n: 'wikinews',
  q: 'wikiquote',
  s: 'wikisource',
  a: 'wikiauthor',
  b: 'wikibooks',
  voy: 'wikivoyage',
  v: 'wikiversity',
  d: 'wikidata',
  species: 'wikispecies',
  m: 'meta',
  mw: 'mediawiki'
};

const parsers = {
  //same in every language.
  citation: (tmpl, r) => {
    let obj = parse$2(tmpl);
    r.templates.push(obj);
    return '';
  },
  //https://en.wikipedia.org/wiki/Template:Book_bar
  'book bar': (tmpl, r) => {
    let obj = parse$2(tmpl);
    r.templates.push(obj);
    return '';
  },
  //https://en.wikipedia.org/wiki/Template:Main
  main: (tmpl, r) => {
    let obj = parse$2(tmpl);
    r.templates.push(obj);
    return '';
  },
  'wide image': (tmpl, r) => {
    let obj = parse$2(tmpl, ['file', 'width', 'caption']);
    r.templates.push(obj);
    return '';
  },

  //https://en.wikipedia.org/wiki/Template:Redirect
  redirect: (tmpl, r) => {
    let data = parse$2(tmpl, ['redirect']);
    let list = data.list || [];
    let links = [];
    for(let i = 0; i < list.length; i += 2) {
      links.push({
        page: list[i + 1],
        desc: list[i]
      });
    }
    let obj = {
      template: 'redirect',
      redirect: data.redirect,
      links: links
    };
    r.templates.push(obj);
    return '';
  },

  //this one sucks - https://en.wikipedia.org/wiki/Template:GNIS
  'cite gnis': (tmpl, r) => {
    let order = ['id', 'name', 'type'];
    let obj = parse$2(tmpl, order);
    obj.type = 'gnis';
    obj.template = 'citation';
    r.templates.push(obj);
    return '';
  },
  'sfn': (tmpl, r) => {
    let order = ['author', 'year', 'location'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    return '';
  },
  'audio': (tmpl, r) => {
    let order = ['file', 'text', 'type'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    return '';
  },
  //https://en.wikipedia.org/wiki/Template:Portal
  'portal': (tmpl, r) => {
    let obj = parse$2(tmpl);
    r.templates.push(obj);
    return '';
  },
  'spoken wikipedia': (tmpl, r) => {
    let order = ['file', 'date'];
    let obj = parse$2(tmpl, order);
    obj.template = 'audio';
    r.templates.push(obj);
    return '';
  },

  //https://en.wikipedia.org/wiki/Template:Sister_project_links
  'sister project links': (tmpl, r) => {
    let data = parse$2(tmpl);
    //rename 'wd' to 'wikidata'
    let links = {};
    Object.keys(sisterProjects).forEach((k) => {
      if (data.hasOwnProperty(k) === true) {
        links[sisterProjects[k]] = data[k]; //.text();
      }
    });
    let obj = {
      template: 'sister project links',
      links: links
    };
    r.templates.push(obj);
    return '';
  },

  //https://en.wikipedia.org/wiki/Template:Subject_bar
  'subject bar': (tmpl, r) => {
    let data = parse$2(tmpl);
    Object.keys(data).forEach((k) => {
      //rename 'voy' to 'wikivoyage'
      if (sisterProjects.hasOwnProperty(k)) {
        data[sisterProjects[k]] = data[k];
        delete data[k];
      }
    });
    let obj = {
      template: 'subject bar',
      links: data
    };
    r.templates.push(obj);
    return '';
  },

  'short description': (tmpl, r) => {
    let data = parse$2(tmpl, ['description']);
    if (data['1']) {
      console.log(`~=~=~**here**~=~`);
      data.description = data['1'];
      delete data['1'];
    }
    r.templates.push(data);
    return '';
  },
  'good article': (tmpl, r) => {
    let obj = {
      template: 'Good article'
    };
    r.templates.push(obj);
    return '';
  },
  'coord missing': (tmpl, r) => {
    let obj = parse$2(tmpl, ['region']);
    r.templates.push(obj);
    return '';
  },
  //amazingly, this one does not obey any known patterns
  //https://en.wikipedia.org/wiki/Template:Gallery
  'gallery': (tmpl, r) => {
    let obj = parse$2(tmpl);
    let images = (obj.list || []).filter(line => /^ *File ?:/.test(line));
    images = images.map((file) => {
      let img = {
        file: file
      };
      return new Image_1(img).json();
    });
    obj = {
      template: 'gallery',
      images: images
    };
    r.templates.push(obj);
    return '';
  },
  //https://en.wikipedia.org/wiki/Template:See_also
  'see also': (tmpl, r) => {
    let data = parse$2(tmpl);
    r.templates.push(data);
    return '';
  },
  'italic title': (tmpl, r) => {
    r.templates.push({
      template: 'italic title'
    });
    return '';
  },
  'unreferenced': (tmpl, r) => {
    let obj = parse$2(tmpl, ['date']);
    r.templates.push(obj);
    return '';
  }
};
//aliases
parsers['cite'] = parsers.citation;
parsers['sfnref'] = parsers.sfn;
parsers['harvid'] = parsers.sfn;
parsers['harvnb'] = parsers.sfn;
parsers['unreferenced section'] = parsers.unreferenced;
parsers['redir'] = parsers.redirect;
parsers['sisterlinks'] = parsers['sister project links'];
parsers['main article'] = parsers['main'];

var page = parsers;

//random misc for inline wikipedia templates


const titlecase = (str) => {
  return str.charAt(0).toUpperCase() + str.substring(1);
};

//https://en.wikipedia.org/wiki/Template:Yes
let templates$1 = {};
let cells = [
  'rh',
  'rh2',
  'yes',
  'no',
  'maybe',
  'eliminated',
  'lost',
  'safe',
  'active',
  'site active',
  'coming soon',
  'good',
  'won',
  'nom',
  'sho',
  'longlisted',
  'tba',
  'success',
  'operational',
  'failure',
  'partial',
  'regional',
  'maybecheck',
  'partial success',
  'partial failure',
  'okay',
  'yes-no',
  'some',
  'nonpartisan',
  'pending',
  'unofficial',
  'unofficial2',
  'usually',
  'rarely',
  'sometimes',
  'any',
  'varies',
  'black',
  'non-album single',
  'unreleased',
  'unknown',
  'perhaps',
  'depends',
  'included',
  'dropped',
  'terminated',
  'beta',
  'table-experimental',
  'free',
  'proprietary',
  'nonfree',
  'needs',
  'nightly',
  'release-candidate',
  'planned',
  'scheduled',
  'incorrect',
  'no result',
  'cmain',
  'calso starring',
  'crecurring',
  'cguest',
  'not yet',
  'optional',
];
cells.forEach((str) => {
  templates$1[str] = (tmpl) => {
    let data = parse$2(tmpl, ['text']);
    return data.text || titlecase(data.template);
  };
});

//these ones have a text result
let moreCells = [
  ['active fire', 'Active'],
  ['site active', 'Active'],
  ['site inactive', 'Inactive'],
  ['yes2', ''],
  ['no2', ''],
  ['ya', '✅'],
  ['na', '❌'],
  ['nom', 'Nominated'],
  ['sho', 'Shortlisted'],
  ['tba', 'TBA'],
  ['maybecheck', '✔️'],
  ['okay', 'Neutral'],
  ['n/a', 'N/A'],
  ['sdash', '—'],
  ['dunno', '?'],
  ['draw', ''],
  ['cnone', ''],
  ['nocontest', ''],
];
moreCells.forEach((a) => {
  templates$1[a[0]] = (tmpl) => {
    let data = parse$2(tmpl, ['text']);
    return data.text || a[1];
  };
});

//this one's a little different
templates$1.won = (tmpl) => {
  let data = parse$2(tmpl, ['text']);
  return data.place || data.text || titlecase(data.template);
};

var tableCell = templates$1;

var wikipedia = Object.assign({},
  links_1,
  page,
  tableCell
);

//this format seems to be a pattern for these
const generic = (tmpl, r) => {
  let obj = parse$2(tmpl, ['id', 'title', 'description', 'section']);
  r.templates.push(obj);
  return '';
};
const idName = (tmpl, r) => {
  let obj = parse$2(tmpl, ['id', 'name']);
  r.templates.push(obj);
  return '';
};

//https://en.wikipedia.org/wiki/Category:External_link_templates
const externals = {

  //https://en.wikipedia.org/wiki/Template:IMDb_title
  'imdb title': generic,
  'imdb name': generic,
  'imdb episode': generic,
  'imdb event': generic,
  'afi film': generic,
  'allmovie title': generic,
  'allgame': generic,
  'tcmdb title': generic,
  'discogs artist': generic,
  'discogs label': generic,
  'discogs release': generic,
  'discogs master': generic,
  'librivox author': generic,
  'musicbrainz artist': generic,
  'musicbrainz label': generic,
  'musicbrainz recording': generic,
  'musicbrainz release': generic,
  'musicbrainz work': generic,
  'youtube': generic,
  'goodreads author': idName,
  'goodreads book': generic,
  'twitter': idName,
  'facebook': idName,
  'instagram': idName,
  'tumblr': idName,
  'pinterest': idName,
  'espn nfl': idName,
  'espn nhl': idName,
  'espn fc': idName,
  'hockeydb': idName,
  'fifa player': idName,
  'worldcat': idName,
  'worldcat id': idName,
  'nfl player': idName,
  'ted speaker': idName,
  'playmate': idName,
  //https://en.wikipedia.org/wiki/Template:DMOZ
  dmoz: generic,

  'find a grave': (tmpl, r) => {
    let order = ['id', 'name', 'work', 'last', 'first', 'date', 'accessdate'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    return '';
  },
  'congbio': (tmpl, r) => {
    let order = ['id', 'name', 'date'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    return '';
  },
  'hollywood walk of fame': (tmpl, r) => {
    let order = ['name'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    return '';
  },
};
//alias
externals.imdb = externals['imdb name'];
externals['imdb episodess'] = externals['imdb episode'];
var identities = externals;

var _months = [
  undefined, //1-based months.. :/
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

//assorted parsing methods for date/time templates


const monthName = _months.reduce((h, str, i) => {
  if (i === 0) {
    return h;
  }
  h[str.toLowerCase()] = i;
  return h;
}, {});

//parse year|month|date numbers
const ymd = function(arr) {
  let obj = {};
  let units = ['year', 'month', 'date', 'hour', 'minute', 'second'];
  //parse each unit in sequence..
  for(let i = 0; i < units.length; i += 1) {
    //skip it
    if (!arr[i] && arr[1] !== 0) {
      continue;
    }
    let num = parseInt(arr[i], 10);
    if (isNaN(num) === false) {
      obj[units[i]] = num; //we good.
    } else if (units[i] === 'month' && monthName.hasOwnProperty(arr[i])) { //try for month-name, like 'january
      let month = monthName[arr[i]];
      obj[units[i]] = month;
    } else { //we dead. so skip this unit
      delete obj[units[i]];
    }
  }
  //try for timezone,too ftw
  let last = arr[arr.length - 1] || '';
  last = String(last);
  if (last.toLowerCase() === 'z') {
    obj.tz = 'UTC';
  } else if (/[+-][0-9]+:[0-9]/.test(last)) {
    obj.tz = arr[6];
  }
  return obj;
};

//zero-pad a number
const pad$1 = function(num) {
  if (num < 10) {
    return '0' + num;
  }
  return String(num);
};

const toText$1 = function(date) {
  //eg '1995'
  let str = String(date.year || '');
  if (date.month !== undefined && _months.hasOwnProperty(date.month) === true) {
    if (date.date === undefined) {
      //January 1995
      str = `${_months[date.month]} ${date.year}`;
    } else {
      //January 5, 1995
      str = `${_months[date.month]} ${date.date}, ${date.year}`;
      //add times, if available
      if (date.hour !== undefined && date.minute !== undefined) {
        let time = `${pad$1(date.hour)}:${pad$1(date.minute)}`;
        if (date.second !== undefined) {
          time = time + ':' + pad$1(date.second);
        }
        str = time + ', ' + str;
      //add timezone, if there, at the end in brackets
      }
      if (date.tz) {
        str += ` (${date.tz})`;
      }
    }
  }
  return str;
};

var _format = {
  toText: toText$1,
  ymd: ymd,
};

const misc = {

  'reign': (tmpl) => {
    let order = ['start', 'end'];
    let obj = parse$2(tmpl, order);
    return `(r. ${obj.start} – ${obj.end})`;
  },
  'circa': (tmpl) => {
    let obj = parse$2(tmpl, ['year']);
    return `c. ${obj.year}`;
  },
  //we can't do timezones, so fake this one a little bit
  //https://en.wikipedia.org/wiki/Template:Time
  'time': () => {
    let d = new Date();
    let obj = _format.ymd([d.getFullYear(), d.getMonth(), d.getDate()]);
    return _format.toText(obj);
  },
  'monthname': (tmpl) => {
    let obj = parse$2(tmpl, ['num']);
    return _months[obj.num] || '';
  },
  //https://en.wikipedia.org/wiki/Template:OldStyleDate
  oldstyledate: (tmpl) => {
    let order = ['date', 'year'];
    let obj = parse$2(tmpl, order);
    let str = obj.date;
    if (obj.year) {
      str += ' ' + obj.year;
    }
    return str;
  }

};
var misc_1 = misc;

//this is allowed to be rough
const day = 1000 * 60 * 60 * 24;
const month = day * 30;
const year = day * 365;

const getEpoch = function(obj) {
  return new Date(`${obj.year}-${obj.month || 0}-${obj.date || 1}`).getTime();
};

//very rough!
const delta = function(from, to) {
  from = getEpoch(from);
  to = getEpoch(to);
  let diff = to - from;
  let obj = {};
  //get years
  let years = Math.floor(diff / year, 10);
  if (years > 0) {
    obj.years = years;
    diff -= (obj.years * year);
  }
  //get months
  let months = Math.floor(diff / month, 10);
  if (months > 0) {
    obj.months = months;
    diff -= (obj.months * month);
  }
  //get days
  let days = Math.floor(diff / day, 10);
  if (days > 0) {
    obj.days = days;
  // diff -= (obj.days * day);
  }
  return obj;
};

var _delta = delta;

const ymd$1 = _format.ymd;
const toText$2 = _format.toText;

//wrap it up as a template
const template = function(date) {
  return {
    template: 'date',
    data: date
  };
};

const getBoth = function(tmpl) {
  tmpl = _strip(tmpl);
  let arr = tmpl.split('|');
  let from = ymd$1(arr.slice(1, 4));
  let to = arr.slice(4, 7);
  //assume now, if 'to' is empty
  if (to.length === 0) {
    let d = new Date();
    to = [d.getFullYear(), d.getMonth(), d.getDate()];
  }
  to = ymd$1(to);
  return {
    from: from,
    to: to
  };
};

const parsers$1 = {

  //generic {{date|year|month|date}} template
  date: (tmpl, r) => {
    let order = ['year', 'month', 'date', 'hour', 'minute', 'second', 'timezone'];
    let obj = parse$2(tmpl, order);
    let data = ymd$1([obj.year, obj.month, obj.date || obj.day]);
    obj.text = toText$2(data); //make the replacement string
    if (obj.timezone) {
      if (obj.timezone === 'Z') {
        obj.timezone = 'UTC';
      }
      obj.text += ` (${obj.timezone})`;
    }
    if (obj.hour && obj.minute) {
      if (obj.second) {
        obj.text = `${obj.hour}:${obj.minute}:${obj.second}, ` + obj.text;
      } else {
        obj.text = `${obj.hour}:${obj.minute}, ` + obj.text;
      }
    }
    if (obj.text) {
      r.templates.push(template(obj));
    }
    return obj.text;
  },

  //support parsing of 'February 10, 1992'
  natural_date: (tmpl, r) => {
    let order = ['text'];
    let obj = parse$2(tmpl, order);
    let str = obj.text || '';
    // - just a year
    let date = {};
    if (/^[0-9]{4}$/.test(str)) {
      date.year = parseInt(str, 10);
    } else {
      //parse the date, using the js date object (for now?)
      let txt = str.replace(/[a-z]+\/[a-z]+/i, '');
      txt = txt.replace(/[0-9]+:[0-9]+(am|pm)?/i, '');
      let d = new Date(txt);
      if (isNaN(d.getTime()) === false) {
        date.year = d.getFullYear();
        date.month = d.getMonth() + 1;
        date.date = d.getDate();
      }
    }
    r.templates.push(template(date));
    return str.trim();
  },

  //just grab the first value, and assume it's a year
  one_year: (tmpl, r) => {
    let order = ['year'];
    let obj = parse$2(tmpl, order);
    let year = Number(obj.year);
    r.templates.push(template({
      year: year
    }));
    return String(year);
  },

  //assume 'y|m|d' | 'y|m|d' // {{BirthDeathAge|B|1976|6|6|1990|8|8}}
  two_dates: (tmpl, r) => {
    let order = ['b', 'birth_year', 'birth_month', 'birth_date', 'death_year', 'death_month', 'death_date'];
    let obj = parse$2(tmpl, order);
    //'b' means show birth-date, otherwise show death-date
    if (obj.b && obj.b.toLowerCase() === 'b') {
      let date = ymd$1([obj.birth_year, obj.birth_month, obj.birth_date]);
      r.templates.push(template(date));
      return toText$2(date);
    }
    let date = ymd$1([obj.death_year, obj.death_month, obj.death_date]);
    r.templates.push(template(date));
    return toText$2(date);
  },

  'age': (tmpl) => {
    let d = getBoth(tmpl);
    let diff = _delta(d.from, d.to);
    return diff.years || 0;
  },

  'diff-y': (tmpl) => {
    let d = getBoth(tmpl);
    let diff = _delta(d.from, d.to);
    if (diff.years === 1) {
      return diff.years + ' year';
    }
    return (diff.years || 0) + ' years';
  },
  'diff-ym': (tmpl) => {
    let d = getBoth(tmpl);
    let diff = _delta(d.from, d.to);
    let arr = [];
    if (diff.years === 1) {
      arr.push(diff.years + ' year');
    } else if (diff.years && diff.years !== 0) {
      arr.push(diff.years + ' years');
    }
    if (diff.months === 1) {
      arr.push('1 month');
    } else if (diff.months && diff.months !== 0) {
      arr.push(diff.months + ' months');
    }
    return arr.join(', ');
  },
  'diff-ymd': (tmpl) => {
    let d = getBoth(tmpl);
    let diff = _delta(d.from, d.to);
    let arr = [];
    if (diff.years === 1) {
      arr.push(diff.years + ' year');
    } else if (diff.years && diff.years !== 0) {
      arr.push(diff.years + ' years');
    }
    if (diff.months === 1) {
      arr.push('1 month');
    } else if (diff.months && diff.months !== 0) {
      arr.push(diff.months + ' months');
    }
    if (diff.days === 1) {
      arr.push('1 day');
    } else if (diff.days && diff.days !== 0) {
      arr.push(diff.days + ' days');
    }
    return arr.join(', ');
  },
  'diff-yd': (tmpl) => {
    let d = getBoth(tmpl);
    let diff = _delta(d.from, d.to);
    let arr = [];
    if (diff.years === 1) {
      arr.push(diff.years + ' year');
    } else if (diff.years && diff.years !== 0) {
      arr.push(diff.years + ' years');
    }
    //ergh...
    diff.days += (diff.months || 0) * 30;
    if (diff.days === 1) {
      arr.push('1 day');
    } else if (diff.days && diff.days !== 0) {
      arr.push(diff.days + ' days');
    }
    return arr.join(', ');
  },
  'diff-d': (tmpl) => {
    let d = getBoth(tmpl);
    let diff = _delta(d.from, d.to);
    let arr = [];
    //ergh...
    diff.days += (diff.years || 0) * 365;
    diff.days += (diff.months || 0) * 30;
    if (diff.days === 1) {
      arr.push('1 day');
    } else if (diff.days && diff.days !== 0) {
      arr.push(diff.days + ' days');
    }
    return arr.join(', ');
  },

};
var parsers_1 = parsers$1;

//not all too fancy - used in {{timesince}}
const timeSince = function(str) {
  let d = new Date(str);
  if (isNaN(d.getTime())) {
    return '';
  }
  let now = new Date();
  let delta = now.getTime() - d.getTime();
  let predicate = 'ago';
  if (delta < 0) {
    predicate = 'from now';
    delta = Math.abs(delta);
  }
  //figure out units
  let hours = delta / 1000 / 60 / 60;
  let days = hours / 24;
  if (days < 365) {
    return parseInt(days, 10) + ' days ' + predicate;
  }
  let years = days / 365;
  return parseInt(years, 10) + ' years ' + predicate;
};
var _timeSince = timeSince;

const date = parsers_1.date;
const natural_date = parsers_1.natural_date;

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//date- templates we support
let dateTmpl = Object.assign({}, misc_1, {
  currentday: () => {
    let d = new Date();
    return String(d.getDate());
  },
  currentdayname: () => {
    let d = new Date();
    return days[d.getDay()];
  },
  currentmonth: () => {
    let d = new Date();
    return months[d.getMonth()];
  },
  currentyear: () => {
    let d = new Date();
    return String(d.getFullYear());
  },
  monthyear: () => {
    let d = new Date();
    return months[d.getMonth()] + ' ' + d.getFullYear();
  },
  'monthyear-1': () => {
    let d = new Date();
    d.setMonth(d.getMonth() - 1);
    return months[d.getMonth()] + ' ' + d.getFullYear();
  },
  'monthyear+1': () => {
    let d = new Date();
    d.setMonth(d.getMonth() + 1);
    return months[d.getMonth()] + ' ' + d.getFullYear();
  },
  //Explictly-set dates - https://en.wikipedia.org/wiki/Template:Date
  date: (tmpl) => {
    let order = ['date', 'fmt'];
    return parse$2(tmpl, order).date;
  },
  'time ago': (tmpl) => {
    let order = ['date', 'fmt'];
    let time = parse$2(tmpl, order).date;
    return _timeSince(time);
  },
  //https://en.wikipedia.org/wiki/Template:Birth_date_and_age
  'birth date and age': (tmpl, r) => {
    let order = ['year', 'month', 'day'];
    let obj = parse$2(tmpl, order);
    //support 'one property' version
    if (obj.year && /[a-z]/i.test(obj.year)) {
      return natural_date(tmpl, r);
    }
    r.templates.push(obj);
    obj = _format.ymd([obj.year, obj.month, obj.day]);
    return _format.toText(obj);
  },
  'birth year and age': (tmpl, r) => {
    let order = ['birth_year', 'birth_month'];
    let obj = parse$2(tmpl, order);
    //support 'one property' version
    if (obj.death_year && /[a-z]/i.test(obj.death_year)) {
      return natural_date(tmpl, r);
    }
    r.templates.push(obj);
    let age = new Date().getFullYear() - parseInt(obj.birth_year, 10);
    obj = _format.ymd([obj.birth_year, obj.birth_month]);
    let str = _format.toText(obj);
    if (age) {
      str += ` (age ${age})`;
    }
    return str;
  },
  'death year and age': (tmpl, r) => {
    let order = ['death_year', 'birth_year', 'death_month'];
    let obj = parse$2(tmpl, order);
    //support 'one property' version
    if (obj.death_year && /[a-z]/i.test(obj.death_year)) {
      return natural_date(tmpl, r);
    }
    r.templates.push(obj);
    obj = _format.ymd([obj.death_year, obj.death_month]);
    return _format.toText(obj);
  },
  //https://en.wikipedia.org/wiki/Template:Birth_date_and_age2
  'birth date and age2': (tmpl, r) => {
    let order = ['at_year', 'at_month', 'at_day', 'birth_year', 'birth_month', 'birth_day'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    obj = _format.ymd([obj.birth_year, obj.birth_month, obj.birth_day]);
    return _format.toText(obj);
  },
  //https://en.wikipedia.org/wiki/Template:Birth_based_on_age_as_of_date
  'birth based on age as of date': (tmpl, r) => {
    let order = ['age', 'year', 'month', 'day'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    let age = parseInt(obj.age, 10);
    let year = parseInt(obj.year, 10);
    let born = year - age;
    if (born && age) {
      return `${born} (age ${obj.age})`;
    }
    return `(age ${obj.age})`;
  },
  //https://en.wikipedia.org/wiki/Template:Death_date_and_given_age
  'death date and given age': (tmpl, r) => {
    let order = ['year', 'month', 'day', 'age'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    obj = _format.ymd([obj.year, obj.month, obj.day]);
    let str = _format.toText(obj);
    if (obj.age) {
      str += ` (age ${obj.age})`;
    }
    return str;
  },
  //sortable dates -
  dts: (tmpl) => {
    //remove formatting stuff, ewww
    tmpl = tmpl.replace(/\|format=[ymd]+/i, '');
    tmpl = tmpl.replace(/\|abbr=(on|off)/i, '');
    let order = ['year', 'month', 'date', 'bc'];
    let obj = parse$2(tmpl, order);
    if (obj.date && obj.month && obj.year) {
      //render 'june 5 2018'
      if (/[a-z]/.test(obj.month) === true) {
        return [obj.month, obj.date, obj.year].join(' ');
      }
      return [obj.year, obj.month, obj.date].join('-');
    }
    if (obj.month && obj.year) {
      return [obj.year, obj.month].join('-');
    }
    if (obj.year) {
      if (obj.year < 0) {
        obj.year = Math.abs(obj.year) + ' BC';
      }
      return obj.year;
    }
    return '';
  },
  //date/age/time templates
  'start': date,
  'end': date,
  'birth': date,
  'death': date,
  'start date': date,
  'end date': date,
  'birth date': date,
  'death date': date,
  'start date and age': date,
  'end date and age': date,
  //this is insane (hyphen ones are different)
  'start-date': natural_date,
  'end-date': natural_date,
  'birth-date': natural_date,
  'death-date': natural_date,
  'birth-date and age': natural_date,
  'birth-date and given age': natural_date,
  'death-date and age': natural_date,
  'death-date and given age': natural_date,

  'birthdeathage': parsers_1.two_dates,
  'dob': date,
  // 'birth date and age2': date,

  'age': parsers_1.age,
  'age nts': parsers_1.age,
  'age in years': parsers_1['diff-y'],
  'age in years and months': parsers_1['diff-ym'],
  'age in years, months and days': parsers_1['diff-ymd'],
  'age in years and days': parsers_1['diff-yd'],
  'age in days': parsers_1['diff-d'],
  // 'age in years, months, weeks and days': true,
  // 'age as of date': true,

});
//aliases
dateTmpl.localday = dateTmpl.currentday;
dateTmpl.localdayname = dateTmpl.currentdayname;
dateTmpl.localmonth = dateTmpl.currentmonth;
dateTmpl.localyear = dateTmpl.currentyear;
dateTmpl.currentmonthname = dateTmpl.currentmonth;
dateTmpl.currentmonthabbrev = dateTmpl.currentmonth;
dateTmpl['death date and age'] = dateTmpl['birth date and age'];
dateTmpl.bda = dateTmpl['birth date and age'];
dateTmpl['birth date based on age at death'] = dateTmpl['birth based on age as of date'];
var dates = dateTmpl;

let templates$2 = {
  //a convulated way to make a xml tag - https://en.wikipedia.org/wiki/Template:Tag
  tag: tmpl => {
    let obj = parse$2(tmpl, ['tag', 'open']);
    const ignore = {
      span: true,
      div: true,
      p: true
    };
    //pair, empty, close, single
    if (!obj.open || obj.open === 'pair') {
      //just skip generating spans and things..
      if (ignore[obj.tag]) {
        return obj.content || ''
      }
      return `<${obj.tag} ${obj.attribs || ''}>${obj.content || ''}</${
        obj.tag
      }>`
    }
    return ''
  },
  //dumb inflector - https://en.wikipedia.org/wiki/Template:Plural
  plural: tmpl => {
    tmpl = tmpl.replace(/plural:/, 'plural|');
    let order = ['num', 'word'];
    let obj = parse$2(tmpl, order);
    let num = Number(obj.num);
    let word = obj.word;
    if (num !== 1) {
      if (/.y$/.test(word)) {
        word = word.replace(/y$/, 'ies');
      } else {
        word += 's';
      }
    }
    return num + ' ' + word
  },
  // https://en.wikipedia.org/wiki/Template:First_word
  'first word': tmpl => {
    let obj = parse$2(tmpl, ['text']);
    let str = obj.text;
    if (obj.sep) {
      return str.split(obj.sep)[0]
    }
    return str.split(' ')[0]
  },
  trunc: tmpl => {
    let order = ['str', 'len'];
    let obj = parse$2(tmpl, order);
    return obj.str.substr(0, obj.len)
  },
  'str mid': tmpl => {
    let order = ['str', 'start', 'end'];
    let obj = parse$2(tmpl, order);
    let start = parseInt(obj.start, 10) - 1;
    let end = parseInt(obj.end, 10);
    return obj.str.substr(start, end)
  },
  //grab the first, second or third pipe
  p1: tmpl => {
    let order = ['one'];
    return parse$2(tmpl, order).one
  },
  p2: tmpl => {
    let order = ['one', 'two'];
    return parse$2(tmpl, order).two
  },
  p3: tmpl => {
    let order = ['one', 'two', 'three'];
    return parse$2(tmpl, order).three
  },
  //formatting things - https://en.wikipedia.org/wiki/Template:Nobold
  braces: tmpl => {
    let obj = parse$2(tmpl, ['text']);
    let attrs = '';
    if (obj.list) {
      attrs = '|' + obj.list.join('|');
    }
    return '{{' + (obj.text || '') + attrs + '}}'
  },
  nobold: tmpl => {
    return parse$2(tmpl, ['text']).text || ''
  },
  noitalic: tmpl => {
    return parse$2(tmpl, ['text']).text || ''
  },
  nocaps: tmpl => {
    return parse$2(tmpl, ['text']).text || ''
  },
  syntaxhighlight: (tmpl, r) => {
    let obj = parse$2(tmpl);
    r.templates.push(obj);
    return obj.code || ''
  },
  samp: (tmpl, r) => {
    let obj = parse$2(tmpl, ['1']);
    r.templates.push(obj);
    return obj['1'] || ''
  },
  //https://en.wikipedia.org/wiki/Template:Visible_anchor
  vanchor: tmpl => {
    return parse$2(tmpl, ['text']).text || ''
  },
  //https://en.wikipedia.org/wiki/Template:Resize
  resize: tmpl => {
    return parse$2(tmpl, ['size', 'text']).text || ''
  },
  //https://en.wikipedia.org/wiki/Template:Ra
  ra: tmpl => {
    let obj = parse$2(tmpl, ['hours', 'minutes', 'seconds']);
    return [obj.hours || 0, obj.minutes || 0, obj.seconds || 0].join(':')
  },
  //https://en.wikipedia.org/wiki/Template:Deg2HMS
  deg2hms: tmpl => {
    //this template should do the conversion
    let obj = parse$2(tmpl, ['degrees']);
    return (obj.degrees || '') + '°'
  },
  hms2deg: tmpl => {
    //this template should do the conversion too
    let obj = parse$2(tmpl, ['hours', 'minutes', 'seconds']);
    return [obj.hours || 0, obj.minutes || 0, obj.seconds || 0].join(':')
  },
  decdeg: tmpl => {
    //this template should do the conversion too
    let obj = parse$2(tmpl, ['deg', 'min', 'sec', 'hem', 'rnd']);
    return (obj.deg || obj.degrees) + '°'
  },
  rnd: tmpl => {
    //this template should do the conversion too
    let obj = parse$2(tmpl, ['decimal']);
    return obj.decimal || ''
  },
  //https://en.wikipedia.org/wiki/Template:DEC
  dec: tmpl => {
    let obj = parse$2(tmpl, ['degrees', 'minutes', 'seconds']);
    let str = (obj.degrees || 0) + '°';
    if (obj.minutes) {
      str += obj.minutes + `′`;
    }
    if (obj.seconds) {
      str += obj.seconds + '″';
    }
    return str
  },
  //https://en.wikipedia.org/wiki/Template:Val
  val: tmpl => {
    let obj = parse$2(tmpl, ['number', 'uncertainty']);
    let str = obj.number || '';
    //prefix/suffix
    if (obj.p) {
      str = obj.p + str;
    }
    if (obj.s) {
      str = obj.s + str;
    }
    //add units, too
    if (obj.u || obj.ul || obj.upl) {
      str = str + ' ' + (obj.u || obj.ul || obj.upl);
    }
    return str
  }
};

//aliases
templates$2['rndfrac'] = templates$2.rnd;
templates$2['rndnear'] = templates$2.rnd;
templates$2['unité'] = templates$2.val;

//templates that we simply grab their insides as plaintext
let inline = [
  'nowrap',
  'nobr',
  'big',
  'cquote',
  'pull quote',
  'small',
  'smaller',
  'midsize',
  'larger',
  'big',
  'kbd',
  'bigger',
  'large',
  'mono',
  'strongbad',
  'stronggood',
  'huge',
  'xt',
  'xt2',
  '!xt',
  'xtn',
  'xtd',
  'dc',
  'dcr',
  'mxt',
  '!mxt',
  'mxtn',
  'mxtd',
  'bxt',
  '!bxt',
  'bxtn',
  'bxtd',
  'delink', //https://en.wikipedia.org/wiki/Template:Delink
  //half-supported
  'pre',
  'var',
  'mvar',
  'pre2',
  'code'
];
inline.forEach(k => {
  templates$2[k] = tmpl => {
    return parse$2(tmpl, ['text']).text || ''
  };
});

var format = templates$2;

const tmpls = {
  //a strange, newline-based list - https://en.wikipedia.org/wiki/Template:Plainlist
  plainlist: (tmpl) => {
    tmpl = _strip(tmpl);
    //remove the title
    let arr = tmpl.split('|');
    arr = arr.slice(1);
    tmpl = arr.join('|');
    //split on newline
    arr = tmpl.split(/\n ?\* ?/);
    arr = arr.filter(s => s);
    return arr.join('\n\n');
  },

  //show/hide: https://en.wikipedia.org/wiki/Template:Collapsible_list
  'collapsible list': (tmpl, r) => {
    let obj = parse$2(tmpl);
    r.templates.push(obj);
    let str = '';
    if (obj.title) {
      str += `'''${obj.title}'''` + '\n\n';
    }
    if (!obj.list) {
      obj.list = [];
      for(let i = 1; i < 10; i += 1) {
        if (obj[i]) {
          obj.list.push(obj[i]);
          delete obj[i];
        }
      }
    }
    obj.list = obj.list.filter(s => s);
    str += obj.list.join('\n\n');
    return str;
  },
  // https://en.wikipedia.org/wiki/Template:Ordered_list
  'ordered list': (tmpl, r) => {
    let obj = parse$2(tmpl);
    r.templates.push(obj);
    obj.list = obj.list || [];
    let lines = obj.list.map((str, i) => `${i + 1}. ${str}`);
    return lines.join('\n\n');
  },
  hlist: (tmpl) => {
    let obj = parse$2(tmpl);
    obj.list = obj.list || [];
    return obj.list.join(' · ');
  },
  'pagelist': (tmpl) => {
    let arr = parse$2(tmpl).list || [];
    return arr.join(', ');
  },
  //actually rendering these links removes the text.
  //https://en.wikipedia.org/wiki/Template:Catlist
  'catlist': (tmpl) => {
    let arr = parse$2(tmpl).list || [];
    return arr.join(', ');
  },
  //https://en.wikipedia.org/wiki/Template:Br_separated_entries
  'br separated entries': (tmpl) => {
    let arr = parse$2(tmpl).list || [];
    return arr.join('\n\n');
  },
  'comma separated entries': (tmpl) => {
    let arr = parse$2(tmpl).list || [];
    return arr.join(', ');
  },
  //https://en.wikipedia.org/wiki/Template:Bare_anchored_list
  'anchored list': (tmpl) => {
    let arr = parse$2(tmpl).list || [];
    arr = arr.map((str, i) => `${i + 1}. ${str}`);
    return arr.join('\n\n');
  },
  'bulleted list': (tmpl) => {
    let arr = parse$2(tmpl).list || [];
    arr = arr.filter((f) => f);
    arr = arr.map((str) => '• ' + str);
    return arr.join('\n\n');
  },
  //https://en.wikipedia.org/wiki/Template:Columns-list
  'columns-list': (tmpl, r) => {
    let arr = parse$2(tmpl).list || [];
    let str = arr[0] || '';
    let list = str.split(/\n/);
    list = list.filter((f) => f);
    list = list.map((s) => s.replace(/\*/, ''));
    r.templates.push({
      template: 'columns-list',
      list: list
    });
    list = list.map((s) => '• ' + s);
    return list.join('\n\n');
  },
// 'pagelist':(tmpl)=>{},
};
//aliases
tmpls.flatlist = tmpls.plainlist;
tmpls.ublist = tmpls.plainlist;
tmpls['unbulleted list'] = tmpls['collapsible list'];
tmpls['ubl'] = tmpls['collapsible list'];
tmpls['bare anchored list'] = tmpls['anchored list'];
tmpls['plain list'] = tmpls['plainlist'];
tmpls.cmn = tmpls['columns-list'];
tmpls.collist = tmpls['columns-list'];
tmpls['col-list'] = tmpls['columns-list'];
tmpls.columnslist = tmpls['columns-list'];
var lists = tmpls;

// okay, these just hurts my feelings
// https://www.mediawiki.org/wiki/Help:Magic_words#Other
let punctuation = [
  // https://en.wikipedia.org/wiki/Template:%C2%B7
  ['·', '·'],
  ['·', '·'],
  ['dot', '·'],
  ['middot', '·'],
  ['•', ' • '],
  //yup, oxford comma template
  [',', ','],
  ['1/2', '1⁄2'],
  ['1/3', '1⁄3'],
  ['2/3', '2⁄3'],
  ['1/4', '1⁄4'],
  ['3/4', '3⁄4'],
  ['–', '–'],
  ['ndash', '–'],
  ['en dash', '–'],
  ['spaced ndash', ' – '],

  ['—', '—'],
  ['mdash', '—'],
  ['em dash', '—'],

  ['number sign', '#'],
  ['ibeam', 'I'],
  ['&', '&'],
  [';', ';'],
  ['ampersand', '&'],
  ['snds', ' – '],
  // these '{{^}}' things are nuts, and used as some ilicit spacing thing.
  ['^', ' '],
  ['!', '|'],
  ['\\', ' /'],
  ['`', '`'],
  ['=', '='],
  ['bracket', '['],
  ['[', '['],
  ['*', '*'],
  ['asterisk', '*'],
  ['long dash', '———'],
  ['clear', '\n\n'],
  ['h.', 'ḥ'],
];
const templates$3 = {};
punctuation.forEach((a) => {
  templates$3[a[0]] = () => {
    return a[1];
  };
});
var punctuation_1 = templates$3;

const inline$1 = {
  //https://en.wikipedia.org/wiki/Template:Convert#Ranges_of_values
  convert: (tmpl) => {
    let order = ['num', 'two', 'three', 'four'];
    let obj = parse$2(tmpl, order);
    //todo: support plural units
    if (obj.two === '-' || obj.two === 'to' || obj.two === 'and') {
      if (obj.four) {
        return `${obj.num} ${obj.two} ${obj.three} ${obj.four}`;
      }
      return `${obj.num} ${obj.two} ${obj.three}`;
    }
    return `${obj.num} ${obj.two}`;
  },
  //https://en.wikipedia.org/wiki/Template:Term
  term: (tmpl) => {
    let obj = parse$2(tmpl, ['term']);
    return `${obj.term}:`;
  },
  defn: (tmpl) => {
    let obj = parse$2(tmpl, ['desc']);
    return obj.desc;
  },
  //https://en.wikipedia.org/wiki/Template:Linum
  lino: (tmpl) => {
    let obj = parse$2(tmpl, ['num']);
    return `${obj.num}`;
  },
  linum: (tmpl) => {
    let obj = parse$2(tmpl, ['num', 'text']);
    return `${obj.num}. ${obj.text}`;
  },
  //https://en.wikipedia.org/wiki/Template:Interlanguage_link
  ill: (tmpl) => {
    let order = ['text', 'lan1', 'text1', 'lan2', 'text2'];
    let obj = parse$2(tmpl, order);
    return obj.text;
  },
  //https://en.wikipedia.org/wiki/Template:Frac
  frac: (tmpl) => {
    let order = ['a', 'b', 'c'];
    let obj = parse$2(tmpl, order);
    if (obj.c) {
      return `${obj.a} ${obj.b}/${obj.c}`;
    }
    if (obj.b) {
      return `${obj.a}/${obj.b}`;
    }
    return `1/${obj.b}`;
  },
  //https://en.wikipedia.org/wiki/Template:Height - {{height|ft=6|in=1}}
  height: (tmpl, r) => {
    let obj = parse$2(tmpl);
    r.templates.push(obj);
    let result = [];
    let units = ['m', 'cm', 'ft', 'in']; //order matters
    units.forEach((unit) => {
      if (obj.hasOwnProperty(unit) === true) {
        result.push(obj[unit] + unit);
      }
    });
    return result.join(' ');
  },
  'block indent': (tmpl) => {
    let obj = parse$2(tmpl);
    if (obj['1']) {
      return '\n' + obj['1'] + '\n';
    }
    return '';
  },
  'quote': (tmpl, r) => {
    let order = ['text', 'author'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    //create plaintext version
    if (obj.text) {
      let str = `"${obj.text}"`;
      if (obj.author) {
        str += '\n\n';
        str += `    - ${obj.author}`;
      }
      return str + '\n';
    }
    return '';
  },

  //https://en.wikipedia.org/wiki/Template:Lbs
  lbs: (tmpl) => {
    let obj = parse$2(tmpl, ['text']);
    return `[[${obj.text} Lifeboat Station|${obj.text}]]`;
  },
  //Foo-class
  lbc: (tmpl) => {
    let obj = parse$2(tmpl, ['text']);
    return `[[${obj.text}-class lifeboat|${obj.text}-class]]`;
  },
  lbb: (tmpl) => {
    let obj = parse$2(tmpl, ['text']);
    return `[[${obj.text}-class lifeboat|${obj.text}]]`;
  },
  // https://en.wikipedia.org/wiki/Template:Own
  own: (tmpl) => {
    let obj = parse$2(tmpl, ['author']);
    let str = 'Own work';
    if (obj.author) {
      str += ' by ' + obj.author;
    }
    return str;
  },
  //https://en.wikipedia.org/wiki/Template:Sic
  sic: (tmpl, r) => {
    let obj = parse$2(tmpl, ['one', 'two', 'three']);
    let word = (obj.one || '') + (obj.two || '');
    //support '[sic?]'
    if (obj.one === '?') {
      word = (obj.two || '') + (obj.three || '');
    }
    r.templates.push({
      template: 'sic',
      word: word
    });
    if (obj.nolink === 'y') {
      return word;
    }
    return `${word} [sic]`;
  },
  //https://www.mediawiki.org/wiki/Help:Magic_words#Formatting
  formatnum: ( tmpl = '' ) => {
    tmpl = tmpl.replace(/:/, '|');
    let obj = parse$2(tmpl, ['number']);
    let str = obj.number || '';
    str = str.replace(/,/g, '');
    let num = Number(str);
    return num.toLocaleString() || '';
  },
  //https://www.mediawiki.org/wiki/Help:Magic_words#Formatting
  '#dateformat': ( tmpl = '' ) => {
    tmpl = tmpl.replace(/:/, '|');
    let obj = parse$2(tmpl, ['date', 'format']);
    return obj.date;
  },
  //https://www.mediawiki.org/wiki/Help:Magic_words#Formatting
  'lc': ( tmpl = '' ) => {
    tmpl = tmpl.replace(/:/, '|');
    let obj = parse$2(tmpl, ['text']);
    return (obj.text || '').toLowerCase();
  },
  'lcfirst': ( tmpl = '' ) => {
    tmpl = tmpl.replace(/:/, '|');
    let obj = parse$2(tmpl, ['text']);
    let text = obj.text;
    if (!text) {
      return '';
    }
    return text[0].toLowerCase() + text.substr(1);
  },
  //https://www.mediawiki.org/wiki/Help:Magic_words#Formatting
  'uc': ( tmpl = '' ) => {
    tmpl = tmpl.replace(/:/, '|');
    let obj = parse$2(tmpl, ['text']);
    return (obj.text || '').toUpperCase();
  },
  'ucfirst': ( tmpl = '' ) => {
    tmpl = tmpl.replace(/:/, '|');
    let obj = parse$2(tmpl, ['text']);
    let text = obj.text;
    if (!text) {
      return '';
    }
    return text[0].toUpperCase() + text.substr(1);
  },
  'padleft': ( tmpl = '' ) => {
    tmpl = tmpl.replace(/:/, '|');
    let obj = parse$2(tmpl, ['text', 'num']);
    let text = obj.text || '';
    return text.padStart(obj.num, obj.str || '0');
  },
  'padright': ( tmpl = '' ) => {
    tmpl = tmpl.replace(/:/, '|');
    let obj = parse$2(tmpl, ['text', 'num']);
    let text = obj.text || '';
    return text.padEnd(obj.num, obj.str || '0');
  },
  //abbreviation/meaning
  //https://en.wikipedia.org/wiki/Template:Abbr
  'abbr': ( tmpl = '' ) => {
    let obj = parse$2(tmpl, ['abbr', 'meaning', 'ipa']);
    return obj.abbr;
  },
  //https://en.wikipedia.org/wiki/Template:Abbrlink
  'abbrlink': ( tmpl = '' ) => {
    let obj = parse$2(tmpl, ['abbr', 'page']);
    if (obj.page) {
      return `[[${obj.page}|${obj.abbr}]]`;
    }
    return `[[${obj.abbr}]]`;
  },
  //https://en.wikipedia.org/wiki/Template:Hover_title
  //technically 'h:title'
  'h': ( tmpl = '' ) => {
    let obj = parse$2(tmpl, ['title', 'text']);
    return obj.text;
  },
  //https://en.wikipedia.org/wiki/Template:Finedetail
  'finedetail': ( tmpl = '' ) => {
    let obj = parse$2(tmpl, ['text', 'detail']); //technically references
    return obj.text;
  },
};

//aliases
inline$1['str left'] = inline$1.trunc;
inline$1['str crop'] = inline$1.trunc;
inline$1['tooltip'] = inline$1.abbr;
inline$1['abbrv'] = inline$1.abbr;
inline$1['define'] = inline$1.abbr;

var misc$1 = inline$1;

var formatting$1 = Object.assign({},
  format,
  lists,
  punctuation_1,
  misc$1
);

//converts DMS (decimal-minute-second) geo format to lat/lng format.
//major thank you to https://github.com/gmaclennan/parse-dms
//and https://github.com/WSDOT-GIS/dms-js 👏

//accepts an array of descending Degree, Minute, Second values, with a hemisphere at the end
//must have N/S/E/W as last thing
function parseDms(arr) {
  let hemisphere = arr.pop();
  var degrees = Number(arr[0] || 0);
  var minutes = Number(arr[1] || 0);
  var seconds = Number(arr[2] || 0);
  if (typeof hemisphere !== 'string' || isNaN(degrees)) {
    return null;
  }
  var sign = 1;
  if (/[SW]/i.test(hemisphere)) {
    sign = -1;
  }
  let decDeg = sign * (degrees + minutes / 60 + seconds / 3600);
  return decDeg;
}
var dmsFormat = parseDms;

const round = function (num) {
  if (typeof num !== 'number') {
    return num;
  }
  let places = 100000;
  return Math.round(num * places) / places;
};

//these hemispheres mean negative decimals
const negative = {
  s: true,
  w: true
};

const findLatLng = function (arr) {
  const types = arr.map((s) => typeof s).join('|');
  //support {{lat|lng}}
  if (arr.length === 2 && types === 'number|number') {
    return {
      lat: arr[0],
      lon: arr[1],
    };
  }
  //support {{dd|N/S|dd|E/W}}
  if (arr.length === 4 && types === 'number|string|number|string') {
    if (negative[arr[1].toLowerCase()]) {
      arr[0] *= -1;
    }
    if (arr[3].toLowerCase() === 'w') {
      arr[2] *= -1;
    }
    return {
      lat: arr[0],
      lon: arr[2],
    };
  }
  //support {{dd|mm|N/S|dd|mm|E/W}}
  if (arr.length === 6) {
    return {
      lat: dmsFormat(arr.slice(0, 3)),
      lon: dmsFormat(arr.slice(3)),
    };
  }
  //support {{dd|mm|ss|N/S|dd|mm|ss|E/W}}
  if (arr.length === 8) {
    return {
      lat: dmsFormat(arr.slice(0, 4)),
      lon: dmsFormat(arr.slice(4)),
    };
  }
  return {};
};

const parseParams = function(obj) {
  obj.list = obj.list || [];
  obj.list = obj.list.map((str) => {
    let num = Number(str);
    if (!isNaN(num)) {
      return num;
    }
    //these are weird
    let split = str.split(/:/);
    if (split.length > 1) {
      obj.props = obj.props || {};
      obj.props[split[0]] = split.slice(1).join(':');
      return null;
    }
    return str;
  });
  obj.list = obj.list.filter((s) => s !== null);
  return obj;
};

const parseCoor = function(tmpl) {
  let obj = parse$2(tmpl);
  obj = parseParams(obj);
  let tmp = findLatLng(obj.list);
  obj.lat = round(tmp.lat);
  obj.lon = round(tmp.lon);
  obj.template = 'coord';
  delete obj.list;
  return obj;
};

var coor = parseCoor;

const templates$4 = {
  coord: (tmpl, r) => {
    let obj = coor(tmpl);
    r.templates.push(obj);
    //display inline, by default
    if (!obj.display || obj.display.indexOf('inline') !== -1) {
      return `${obj.lat || ''}°N, ${obj.lon || ''}°W`;
    }
    return '';
  }
};
// {{coord|latitude|longitude|coordinate parameters|template parameters}}
// {{coord|dd|N/S|dd|E/W|coordinate parameters|template parameters}}
// {{coord|dd|mm|N/S|dd|mm|E/W|coordinate parameters|template parameters}}
// {{coord|dd|mm|ss|N/S|dd|mm|ss|E/W|coordinate parameters|template parameters}}
templates$4['coor'] = templates$4.coord;
// these are from the nl wiki
templates$4['coor title dms'] = templates$4.coord;
templates$4['coor title dec'] = templates$4.coord;
templates$4['coor dms'] = templates$4.coord;
templates$4['coor dm'] = templates$4.coord;
templates$4['coor dec'] = templates$4.coord;
var geo = templates$4;

const templates$5 = {

  lang: (tmpl) => {
    let order = ['lang', 'text'];
    let obj = parse$2(tmpl, order);
    return obj.text;
  },
  //this one has a million variants
  'lang-de': (tmpl) => {
    let order = ['text'];
    let obj = parse$2(tmpl, order);
    return obj.text;
  },
  'rtl-lang': (tmpl) => {
    let order = ['lang', 'text'];
    let obj = parse$2(tmpl, order);
    return obj.text;
  },
  //german keyboard letterscn
  taste: (tmpl) => {
    let obj = parse$2(tmpl, ['key']);
    return obj.key || '';
  },
  //https://en.wikipedia.org/wiki/Template:Nihongo
  nihongo: (tmpl, r) => {
    let obj = parse$2(tmpl, ['english', 'kanji', 'romaji', 'extra']);
    r.templates.push(obj);
    let str = obj.english || obj.romaji || '';
    if (obj.kanji) {
      str += ` (${obj.kanji})`;
    }
    return str;
  }
};
//https://en.wikipedia.org/wiki/Category:Lang-x_templates
Object.keys(languages).forEach((k) => {
  templates$5['lang-' + k] = templates$5['lang-de'];
});
templates$5['nihongo2'] = templates$5.nihongo;
templates$5['nihongo3'] = templates$5.nihongo;
templates$5['nihongo-s'] = templates$5.nihongo;
templates$5['nihongo foot'] = templates$5.nihongo;
var languages_1 = templates$5;

const getLang = function(name) {
  //grab the language from the template name - 'ipa-de'
  let lang = name.match(/ipac?-(.+)/);
  if (lang !== null) {
    if (languages.hasOwnProperty(lang[1]) === true) {
      return languages[lang[1]].english_title;
    }
    return lang[1];
  }
  return null;
};

// pronounciation info
const templates$6 = {
  // https://en.wikipedia.org/wiki/Template:IPA
  ipa: (tmpl, r) => {
    let obj = parse$2(tmpl, ['transcription', 'lang', 'audio']);
    obj.lang = getLang(obj.template);
    obj.template = 'ipa';
    r.templates.push(obj);
    return '';
  },
  //https://en.wikipedia.org/wiki/Template:IPAc-en
  ipac: (tmpl, r) => {
    let obj = parse$2(tmpl);
    obj.transcription = (obj.list || []).join(',');
    delete obj.list;
    obj.lang = getLang(obj.template);
    obj.template = 'ipac';
    r.templates.push(obj);
    return '';
  }
};
// - other languages -
// Polish, {{IPAc-pl}}	{{IPAc-pl|'|sz|cz|e|ć|i|n}} → [ˈʂt͡ʂɛt͡ɕin]
// Portuguese, {{IPAc-pt}}	{{IPAc-pt|p|o|<|r|t|u|'|g|a|l|lang=pt}} and {{IPAc-pt|b|r|a|'|s|i|l|lang=br}} → [puɾtuˈɣaɫ] and [bɾaˈsiw]
Object.keys(languages).forEach((lang) => {
  templates$6['ipa-' + lang] = templates$6.ipa;
  templates$6['ipac-' + lang] = templates$6.ipac;
});

var pronounce = templates$6;

// const strip = require('./_parsers/_strip');

//wiktionary... who knows. we should atleast try.
const templates$7 = {
  //{{inflection of|avoir||3|p|pres|ind|lang=fr}}
  //https://en.wiktionary.org/wiki/Template:inflection_of
  'inflection': (tmpl, r) => {
    let obj = parse$2(tmpl, ['lemma']);
    obj.tags = obj.list;
    delete obj.list;
    obj.type = 'form-of';
    r.templates.push(obj);
    return obj.lemma || '';
  },

  //latin verbs
  'la-verb-form': (tmpl, r) => {
    let obj = parse$2(tmpl, ['word']);
    r.templates.push(obj);
    return obj.word || '';
  },
  'feminine plural': (tmpl, r) => {
    let obj = parse$2(tmpl, ['word']);
    r.templates.push(obj);
    return obj.word || '';
  },
  'male plural': (tmpl, r) => {
    let obj = parse$2(tmpl, ['word']);
    r.templates.push(obj);
    return obj.word || '';
  },
  'rhymes': (tmpl, r) => {
    let obj = parse$2(tmpl, ['word']);
    r.templates.push(obj);
    return 'Rhymes: -' + (obj.word || '');
  },
};

//https://en.wiktionary.org/wiki/Category:Form-of_templates
let conjugations = [
  'abbreviation',
  'abessive plural',
  'abessive singular',
  'accusative plural',
  'accusative singular',
  'accusative',
  'acronym',
  'active participle',
  'agent noun',
  'alternative case form',
  'alternative form',
  'alternative plural',
  'alternative reconstruction',
  'alternative spelling',
  'alternative typography',
  'aphetic form',
  'apocopic form',
  'archaic form',
  'archaic spelling',
  'aspirate mutation',
  'associative plural',
  'associative singular',
  'attributive form',
  'attributive form',
  'augmentative',
  'benefactive plural',
  'benefactive singular',
  'causative plural',
  'causative singular',
  'causative',
  'clipping',
  'combining form',
  'comitative plural',
  'comitative singular',
  'comparative plural',
  'comparative singular',
  'comparative',
  'contraction',
  'dated form',
  'dated spelling',
  'dative plural definite',
  'dative plural indefinite',
  'dative plural',
  'dative singular',
  'dative',
  'definite',
  'deliberate misspelling',
  'diminutive',
  'distributive plural',
  'distributive singular',
  'dual',
  'early form',
  'eclipsis',
  'elative',
  'ellipsis',
  'equative',
  'euphemistic form',
  'euphemistic spelling',
  'exclusive plural',
  'exclusive singular',
  'eye dialect',
  'feminine noun',
  'feminine plural past participle',
  'feminine plural',
  'feminine singular past participle',
  'feminine singular',
  'feminine',
  'form',
  'former name',
  'frequentative',
  'future participle',
  'genitive plural definite',
  'genitive plural indefinite',
  'genitive plural',
  'genitive singular definite',
  'genitive singular indefinite',
  'genitive singular',
  'genitive',
  'gerund',
  'h-prothesis',
  'hard mutation',
  'harmonic variant',
  'imperative',
  'imperfective form',
  'inflected form',
  'inflection',
  'informal form',
  'informal spelling',
  'initialism',
  'ja-form',
  'jyutping reading',
  'late form',
  'lenition',
  'masculine plural past participle',
  'masculine plural',
  'medieval spelling',
  'misconstruction',
  'misromanization',
  'misspelling',
  'mixed mutation',
  'monotonic form',
  'mutation',
  'nasal mutation',
  'negative',
  'neuter plural past participle',
  'neuter plural',
  'neuter singular past participle',
  'neuter singular',
  'nominalization',
  'nominative plural',
  'nominative singular',
  'nonstandard form',
  'nonstandard spelling',
  'oblique plural',
  'oblique singular',
  'obsolete form',
  'obsolete spelling',
  'obsolete typography',
  'official form',
  'participle',
  'passive participle',
  'passive',
  'past active participle',
  'past participle',
  'past passive participle',
  'past tense',
  'perfective form',
  'plural definite',
  'plural indefinite',
  'plural',
  'polytonic form',
  'present active participle',
  'present participle',
  'present tense',
  'pronunciation spelling',
  'rare form',
  'rare spelling',
  'reflexive',
  'second-person singular past',
  'short for',
  'singular definite',
  'singular',
  'singulative',
  'soft mutation',
  'spelling',
  'standard form',
  'standard spelling',
  'substantivisation',
  'superlative',
  'superseded spelling',
  'supine',
  'syncopic form',
  'synonym',
  'terminative plural',
  'terminative singular',
  'uncommon form',
  'uncommon spelling',
  'verbal noun',
  'vocative plural',
  'vocative singular',
];
conjugations.forEach((name) => {
  templates$7[name + ' of'] = (tmpl, r) => {
    let obj = parse$2(tmpl, ['lemma']);
    obj.tags = obj.list;
    delete obj.list;
    obj.type = 'form-of';
    r.templates.push(obj);
    return obj.lemma || '';
  };
});
var wiktionary = templates$7;

var language = Object.assign({},
  languages_1,
  pronounce,
  wiktionary
);

const codes = {
  bdt: '৳', // https://en.wikipedia.org/wiki/Template:BDT
  a$: 'A$', // https://en.wikipedia.org/wiki/Template:AUD
  aud: 'A$', //https://en.wikipedia.org/wiki/Template:AUD
  au$: 'A$', //https://en.wikipedia.org/wiki/Template:AUD
  bdt: 'BDT', //https://en.wikipedia.org/wiki/Template:BDT
  brl: 'BRL', //https://en.wikipedia.org/wiki/Template:BRL
  r$: 'BRL', //https://en.wikipedia.org/wiki/Template:BRL
  ca$: 'CA$', // https://en.wikipedia.org/wiki/Template:CAD
  cad: 'CA$', // https://en.wikipedia.org/wiki/Template:CAD
  chf: 'CHF', // https://en.wikipedia.org/wiki/Template:CHF
  sfr: 'CHF', // https://en.wikipedia.org/wiki/Template:CHF
  cny: 'CN¥', // https://en.wikipedia.org/wiki/Template:CNY
  'cn¥': 'CN¥', // https://en.wikipedia.org/wiki/Template:CNY
  czk: 'czk', // https://en.wikipedia.org/wiki/Template:CZK
  dkk: 'dkk', // https://en.wikipedia.org/wiki/Template:DKK
  dkk2: 'dkk', // https://en.wikipedia.org/wiki/Template:DKK
  '€': '€', // https://en.wikipedia.org/wiki/Template:€
  euro: '€', // https://en.wikipedia.org/wiki/Template:€
  gbp: 'GB£', // https://en.wikipedia.org/wiki/Template:GBP
  'gb£': 'GB£', // https://en.wikipedia.org/wiki/Template:GBP
  '£': 'GB£', // https://en.wikipedia.org/wiki/Template:GBP
  hkd: 'HK$', // https://en.wikipedia.org/wiki/Template:HKD
  'hk$': 'HK$', // https://en.wikipedia.org/wiki/Template:HKD
  ils: 'ILS', // https://en.wikipedia.org/wiki/Template:ILS
  '₹': '₹', // https://en.wikipedia.org/wiki/Template:Indian_Rupee
  inr: '₹', // https://en.wikipedia.org/wiki/Template:Indian_Rupee
  'india rs': '₹', // https://en.wikipedia.org/wiki/Template:Indian_Rupee
  'indian rupee symbol': '₹', // https://en.wikipedia.org/wiki/Template:Indian_Rupee
  'indian rupees': '₹', // https://en.wikipedia.org/wiki/Template:Indian_Rupee
  'indian rupee': '₹', // https://en.wikipedia.org/wiki/Template:Indian_Rupee
  '¥': '¥', // https://en.wikipedia.org/wiki/Template:JPY
  jpy: '¥', // https://en.wikipedia.org/wiki/Template:JPY
  yen: '¥', // https://en.wikipedia.org/wiki/Template:JPY
  '₩': '₩', // https://en.wikipedia.org/wiki/Template:SK_won
  myr: 'MYR', // https://en.wikipedia.org/wiki/Template:MYR
  ils: 'ILS', // https://en.wikipedia.org/wiki/Template:ILS
  nis: 'ILS', // https://en.wikipedia.org/wiki/Template:ILS
  shekel: 'ILS', // https://en.wikipedia.org/wiki/Template:ILS
  sheqel: 'ILS', // https://en.wikipedia.org/wiki/Template:ILS
  nok: 'NOK', //https://en.wikipedia.org/wiki/Template:NOK
  nok2: 'NOK', //https://en.wikipedia.org/wiki/Template:NOK
  nz$: 'NZ$', //https://en.wikipedia.org/wiki/Template:NZD
  nzd: 'NZ$', //https://en.wikipedia.org/wiki/Template:NZD
  peso: 'peso', //https://en.wikipedia.org/wiki/Template:Peso
  '₱': '₱', // https://en.wikipedia.org/wiki/Template:Philippine_peso
  'philippine peso': '₱', // https://en.wikipedia.org/wiki/Template:Philippine_peso
  pkr: '₨', // https://en.wikipedia.org/wiki/Template:Pakistani_Rupee
  rmb: 'CN¥', // https://en.wikipedia.org/wiki/Template:CNY
  rub: '₽', // https://en.wikipedia.org/wiki/Template:RUB
  '₽': '₽', // https://en.wikipedia.org/wiki/Template:RUB
  ruble: '₽', // https://en.wikipedia.org/wiki/Template:Ruble
  rupee: '₹', // https://en.wikipedia.org/wiki/Template:Rupee
  'russian ruble': '₽', // https://en.wikipedia.org/wiki/Template:Russian_ruble
  sek: 'SEK', // https://en.wikipedia.org/wiki/Template:SEK
  sek2: 'SEK', // https://en.wikipedia.org/wiki/Template:SEK
  sgd: 'sgd', // https://en.wikipedia.org/wiki/Template:SGD
  's$': 'sgd', // https://en.wikipedia.org/wiki/Template:SGD
  'SK won': '₩', // https://en.wikipedia.org/wiki/Template:SK_won
  ttd: 'TTD', //https://en.wikipedia.org/wiki/Template:TTD
  'turkish lira': 'TRY', //https://en.wikipedia.org/wiki/Template:Turkish_lira
  us$: 'US$', // https://en.wikipedia.org/wiki/Template:US$
  usd: 'US$', // https://en.wikipedia.org/wiki/Template:US$
  zar: 'R' //https://en.wikipedia.org/wiki/Template:ZAR
};

const parseCurrency = (tmpl, r) => {
  let o = parse$2(tmpl, ['amount', 'code']);
  r.templates.push(o);
  let code = o.template || '';
  if (code === 'currency') {
	code = o.code;
	if (!code) {
		o.code = code = 'usd';//Special case when currency template has no code argument
	}
  }
  else if (code === '' || code === 'monnaie' || code === 'unité' || code === 'nombre' || code === 'nb') {
    code = o.code;
  }
  code = (code || '').toLowerCase();
    switch(code) {
      case 'us':
        o.code = code = 'usd';
        break;
      case 'uk':
        o.code = code = 'gbp';
        break;
    }
  let out = codes[code] || '';
  let str = `${out}${o.amount || ''}`;
  //support unknown currencies after the number - like '5 BTC'
  if (o.code && !codes[o.code.toLowerCase()]) {
    str += ' ' + o.code;
  }
  return str
};

const inrConvert = (tmpl, r) => {
  let o = parse$2(tmpl, ['rupee_value', 'currency_formatting']);
  r.templates.push(o);
  let formatting = o.currency_formatting;
  if (formatting) {
	let multiplier = 1;
    switch(formatting) {
      case 'k':
        multiplier = 1000;
        break;
      case 'm':
        multiplier = 1000000;
        break;
      case 'b':
        multiplier = 1000000000;
        break;
      case 't':
        multiplier = 1000000000000;
        break;
      case 'l':
        multiplier = 100000;
        break;
      case 'c':
        multiplier = 10000000;
        break;
      case 'lc':
        multiplier = 1000000000000;
        break;
    }
    o.rupee_value = o.rupee_value * multiplier;
	
  }
  let str = `inr ${o.rupee_value || ''}`;
  return str
};

const currencies = {
  //this one is generic https://en.wikipedia.org/wiki/Template:Currency
  currency: parseCurrency,
  monnaie: parseCurrency,
  unité: parseCurrency,
  nombre: parseCurrency,
  nb: parseCurrency,
  iso4217: parseCurrency,
  inrconvert: inrConvert
};
//the others fit the same pattern..
Object.keys(codes).forEach(k => {
  currencies[k] = parseCurrency;
});

var money = currencies;

const zeroPad = function(num) {
  num = String(num);
  if (num.length === 1) {
    num = '0' + num;
  }
  return num;
};

const parseTeam = function(obj, round, team) {
  if (obj[`rd${round}-team${zeroPad(team)}`]) {
    team = zeroPad(team);
  }
  let score = obj[`rd${round}-score${team}`];
  let num = Number(score);
  if (isNaN(num) === false) {
    score = num;
  }
  return {
    team: obj[`rd${round}-team${team}`],
    score: score,
    seed: obj[`rd${round}-seed${team}`],
  };
};

//these are weird.
const playoffBracket = function(tmpl) {
  let rounds = [];
  let obj = parse$2(tmpl);
  //try some rounds
  for(let i = 1; i < 7; i += 1) {
    let round = [];
    for(let t = 1; t < 16; t += 2) {
      let key = `rd${i}-team`;
      if (obj[key + t] || obj[key + zeroPad(t)]) {
        let one = parseTeam(obj, i, t);
        let two = parseTeam(obj, i, t + 1);
        round.push([one, two]);
      } else {
        break;
      }
    }
    if (round.length > 0) {
      rounds.push(round);
    }
  }
  return {
    template: 'playoffbracket',
    rounds: rounds
  };
};

let all = {
  //playoff brackets
  '4teambracket': function(tmpl, r) {
    let obj = playoffBracket(tmpl);
    r.templates.push(obj);
    return '';
  },
};

//a bunch of aliases for these ones:
// https://en.wikipedia.org/wiki/Category:Tournament_bracket_templates
const brackets = [
  '2teambracket',
  '4team2elimbracket',
  '8teambracket',
  '16teambracket',
  '32teambracket',

  'cwsbracket',
  'nhlbracket',
  'nhlbracket-reseed',
  '4teambracket-nhl',
  '4teambracket-ncaa',
  '4teambracket-mma',
  '4teambracket-mlb',

  '8teambracket-nhl',
  '8teambracket-mlb',
  '8teambracket-ncaa',
  '8teambracket-afc',
  '8teambracket-afl',
  '8teambracket-tennis3',
  '8teambracket-tennis5',

  '16teambracket-nhl',
  '16teambracket-nhl divisional',
  '16teambracket-nhl-reseed',
  '16teambracket-nba',
  '16teambracket-swtc',
  '16teambracket-afc',
  '16teambracket-tennis3',
  '16teambracket-tennis5',
];
brackets.forEach((key) => {
  all[key] = all['4teambracket'];
});

var brackets_1 = all;

var flags = [
  [
    '🇦🇩',
    'and',
    'andorra'
  ],
  [
    '🇦🇪',
    'are',
    'united arab emirates'
  ],
  [
    '🇦🇫',
    'afg',
    'afghanistan'
  ],
  [
    '🇦🇬',
    'atg',
    'antigua and barbuda'
  ],
  [
    '🇦🇮',
    'aia',
    'anguilla'
  ],
  [
    '🇦🇱',
    'alb',
    'albania'
  ],
  [
    '🇦🇲',
    'arm',
    'armenia'
  ],
  [
    '🇦🇴',
    'ago',
    'angola'
  ],
  [
    '🇦🇶',
    'ata',
    'antarctica'
  ],
  [
    '🇦🇷',
    'arg',
    'argentina'
  ],
  [
    '🇦🇸',
    'asm',
    'american samoa'
  ],
  [
    '🇦🇹',
    'aut',
    'austria'
  ],
  [
    '🇦🇺',
    'aus',
    'australia'
  ],
  [
    '🇦🇼',
    'abw',
    'aruba'
  ],
  [
    '🇦🇽',
    'ala',
    'åland islands'
  ],
  [
    '🇦🇿',
    'aze',
    'azerbaijan'
  ],
  [
    '🇧🇦',
    'bih',
    'bosnia and herzegovina'
  ],
  [
    '🇧🇧',
    'brb',
    'barbados'
  ],
  [
    '🇧🇩',
    'bgd',
    'bangladesh'
  ],
  [
    '🇧🇪',
    'bel',
    'belgium'
  ],
  [
    '🇧🇫',
    'bfa',
    'burkina faso'
  ],
  [
    '🇧🇬',
    'bgr',
    'bulgaria'
  ],
  [
    '🇧🇬',
    'bul', //dupe
    'bulgaria'
  ],
  [
    '🇧🇭',
    'bhr',
    'bahrain'
  ],
  [
    '🇧🇮',
    'bdi',
    'burundi'
  ],
  [
    '🇧🇯',
    'ben',
    'benin'
  ],
  [
    '🇧🇱',
    'blm',
    'saint barthélemy'
  ],
  [
    '🇧🇲',
    'bmu',
    'bermuda'
  ],
  [
    '🇧🇳',
    'brn',
    'brunei darussalam'
  ],
  [
    '🇧🇴',
    'bol',
    'bolivia'
  ],
  [
    '🇧🇶',
    'bes',
    'bonaire, sint eustatius and saba'
  ],
  [
    '🇧🇷',
    'bra',
    'brazil'
  ],
  [
    '🇧🇸',
    'bhs',
    'bahamas'
  ],
  [
    '🇧🇹',
    'btn',
    'bhutan'
  ],
  [
    '🇧🇻',
    'bvt',
    'bouvet island'
  ],
  [
    '🇧🇼',
    'bwa',
    'botswana'
  ],
  [
    '🇧🇾',
    'blr',
    'belarus'
  ],
  [
    '🇧🇿',
    'blz',
    'belize'
  ],
  [
    '🇨🇦',
    'can',
    'canada'
  ],
  [
    '🇨🇨',
    'cck',
    'cocos (keeling) islands'
  ],
  [
    '🇨🇩',
    'cod',
    'congo'
  ],
  [
    '🇨🇫',
    'caf',
    'central african republic'
  ],
  [
    '🇨🇬',
    'cog',
    'congo'
  ],
  [
    '🇨🇭',
    'che',
    'switzerland'
  ],
  [
    '🇨🇮',
    'civ',
    'côte d\'ivoire'
  ],
  [
    '🇨🇰',
    'cok',
    'cook islands'
  ],
  [
    '🇨🇱',
    'chl',
    'chile'
  ],
  [
    '🇨🇲',
    'cmr',
    'cameroon'
  ],
  [
    '🇨🇳',
    'chn',
    'china'
  ],
  [
    '🇨🇴',
    'col',
    'colombia'
  ],
  [
    '🇨🇷',
    'cri',
    'costa rica'
  ],
  [
    '🇨🇺',
    'cub',
    'cuba'
  ],
  [
    '🇨🇻',
    'cpv',
    'cape verde'
  ],
  [
    '🇨🇼',
    'cuw',
    'curaçao'
  ],
  [
    '🇨🇽',
    'cxr',
    'christmas island'
  ],
  [
    '🇨🇾',
    'cyp',
    'cyprus'
  ],
  [
    '🇨🇿',
    'cze',
    'czech republic'
  ],
  [
    '🇩🇪',
    'deu',
    'germany'
  ],
  [
    '🇩🇪',
    'ger', //alias
    'germany'
  ],
  [
    '🇩🇯',
    'dji',
    'djibouti'
  ],
  [
    '🇩🇰',
    'dnk',
    'denmark'
  ],
  [
    '🇩🇲',
    'dma',
    'dominica'
  ],
  [
    '🇩🇴',
    'dom',
    'dominican republic'
  ],
  [
    '🇩🇿',
    'dza',
    'algeria'
  ],
  [
    '🇪🇨',
    'ecu',
    'ecuador'
  ],
  [
    '🇪🇪',
    'est',
    'estonia'
  ],
  [
    '🇪🇬',
    'egy',
    'egypt'
  ],
  [
    '🇪🇭',
    'esh',
    'western sahara'
  ],
  [
    '🇪🇷',
    'eri',
    'eritrea'
  ],
  [
    '🇪🇸',
    'esp',
    'spain'
  ],
  [
    '🇪🇹',
    'eth',
    'ethiopia'
  ],
  [
    '🇫🇮',
    'fin',
    'finland'
  ],
  [
    '🇫🇯',
    'fji',
    'fiji'
  ],
  [
    '🇫🇰',
    'flk',
    'falkland islands (malvinas)'
  ],
  [
    '🇫🇲',
    'fsm',
    'micronesia'
  ],
  [
    '🇫🇴',
    'fro',
    'faroe islands'
  ],
  [
    '🇫🇷',
    'fra',
    'france'
  ],
  [
    '🇬🇦',
    'gab',
    'gabon'
  ],
  [
    '🇬🇧',
    'gbr',
    'united kingdom'
  ],
  [
    '🇬🇩',
    'grd',
    'grenada'
  ],
  [
    '🇬🇪',
    'geo',
    'georgia'
  ],
  [
    '🇬🇫',
    'guf',
    'french guiana'
  ],
  [
    '🇬🇬',
    'ggy',
    'guernsey'
  ],
  [
    '🇬🇭',
    'gha',
    'ghana'
  ],
  [
    '🇬🇮',
    'gib',
    'gibraltar'
  ],
  [
    '🇬🇱',
    'grl',
    'greenland'
  ],
  [
    '🇬🇲',
    'gmb',
    'gambia'
  ],
  [
    '🇬🇳',
    'gin',
    'guinea'
  ],
  [
    '🇬🇵',
    'glp',
    'guadeloupe'
  ],
  [
    '🇬🇶',
    'gnq',
    'equatorial guinea'
  ],
  [
    '🇬🇷',
    'grc',
    'greece'
  ],
  [
    '🇬🇸',
    'sgs',
    'south georgia'
  ],
  [
    '🇬🇹',
    'gtm',
    'guatemala'
  ],
  [
    '🇬🇺',
    'gum',
    'guam'
  ],
  [
    '🇬🇼',
    'gnb',
    'guinea-bissau'
  ],
  [
    '🇬🇾',
    'guy',
    'guyana'
  ],
  [
    '🇭🇰',
    'hkg',
    'hong kong'
  ],
  [
    '🇭🇲',
    'hmd',
    'heard island and mcdonald islands'
  ],
  [
    '🇭🇳',
    'hnd',
    'honduras'
  ],
  [
    '🇭🇷',
    'hrv',
    'croatia'
  ],
  [
    '🇭🇹',
    'hti',
    'haiti'
  ],
  [
    '🇭🇺',
    'hun',
    'hungary'
  ],
  [
    '🇮🇩',
    'idn',
    'indonesia'
  ],
  [
    '🇮🇪',
    'irl',
    'ireland'
  ],
  [
    '🇮🇱',
    'isr',
    'israel'
  ],
  [
    '🇮🇲',
    'imn',
    'isle of man'
  ],
  [
    '🇮🇳',
    'ind',
    'india'
  ],
  [
    '🇮🇴',
    'iot',
    'british indian ocean territory'
  ],
  [
    '🇮🇶',
    'irq',
    'iraq'
  ],
  [
    '🇮🇷',
    'irn',
    'iran'
  ],
  [
    '🇮🇸',
    'isl',
    'iceland'
  ],
  [
    '🇮🇹',
    'ita',
    'italy'
  ],
  [
    '🇯🇪',
    'jey',
    'jersey'
  ],
  [
    '🇯🇲',
    'jam',
    'jamaica'
  ],
  [
    '🇯🇴',
    'jor',
    'jordan'
  ],
  [
    '🇯🇵',
    'jpn',
    'japan'
  ],
  [
    '🇰🇪',
    'ken',
    'kenya'
  ],
  [
    '🇰🇬',
    'kgz',
    'kyrgyzstan'
  ],
  [
    '🇰🇭',
    'khm',
    'cambodia'
  ],
  [
    '🇰🇮',
    'kir',
    'kiribati'
  ],
  [
    '🇰🇲',
    'com',
    'comoros'
  ],
  [
    '🇰🇳',
    'kna',
    'saint kitts and nevis'
  ],
  [
    '🇰🇵',
    'prk',
    'north korea'
  ],
  [
    '🇰🇷',
    'kor',
    'south korea'
  ],
  [
    '🇰🇼',
    'kwt',
    'kuwait'
  ],
  [
    '🇰🇾',
    'cym',
    'cayman islands'
  ],
  [
    '🇰🇿',
    'kaz',
    'kazakhstan'
  ],
  [
    '🇱🇦',
    'lao',
    'lao people\'s democratic republic'
  ],
  [
    '🇱🇧',
    'lbn',
    'lebanon'
  ],
  [
    '🇱🇨',
    'lca',
    'saint lucia'
  ],
  [
    '🇱🇮',
    'lie',
    'liechtenstein'
  ],
  [
    '🇱🇰',
    'lka',
    'sri lanka'
  ],
  [
    '🇱🇷',
    'lbr',
    'liberia'
  ],
  [
    '🇱🇸',
    'lso',
    'lesotho'
  ],
  [
    '🇱🇹',
    'ltu',
    'lithuania'
  ],
  [
    '🇱🇺',
    'lux',
    'luxembourg'
  ],
  [
    '🇱🇻',
    'lva',
    'latvia'
  ],
  [
    '🇱🇾',
    'lby',
    'libya'
  ],
  [
    '🇲🇦',
    'mar',
    'morocco'
  ],
  [
    '🇲🇨',
    'mco',
    'monaco'
  ],
  [
    '🇲🇩',
    'mda',
    'moldova'
  ],
  [
    '🇲🇪',
    'mne',
    'montenegro'
  ],
  [
    '🇲🇫',
    'maf',
    'saint martin (french part)'
  ],
  [
    '🇲🇬',
    'mdg',
    'madagascar'
  ],
  [
    '🇲🇭',
    'mhl',
    'marshall islands'
  ],
  [
    '🇲🇰',
    'mkd',
    'macedonia'
  ],
  [
    '🇲🇱',
    'mli',
    'mali'
  ],
  [
    '🇲🇲',
    'mmr',
    'myanmar'
  ],
  [
    '🇲🇳',
    'mng',
    'mongolia'
  ],
  [
    '🇲🇴',
    'mac',
    'macao'
  ],
  [
    '🇲🇵',
    'mnp',
    'northern mariana islands'
  ],
  [
    '🇲🇶',
    'mtq',
    'martinique'
  ],
  [
    '🇲🇷',
    'mrt',
    'mauritania'
  ],
  [
    '🇲🇸',
    'msr',
    'montserrat'
  ],
  [
    '🇲🇹',
    'mlt',
    'malta'
  ],
  [
    '🇲🇺',
    'mus',
    'mauritius'
  ],
  [
    '🇲🇻',
    'mdv',
    'maldives'
  ],
  [
    '🇲🇼',
    'mwi',
    'malawi'
  ],
  [
    '🇲🇽',
    'mex',
    'mexico'
  ],
  [
    '🇲🇾',
    'mys',
    'malaysia'
  ],
  [
    '🇲🇿',
    'moz',
    'mozambique'
  ],
  [
    '🇳🇦',
    'nam',
    'namibia'
  ],
  [
    '🇳🇨',
    'ncl',
    'new caledonia'
  ],
  [
    '🇳🇪',
    'ner',
    'niger'
  ],
  [
    '🇳🇫',
    'nfk',
    'norfolk island'
  ],
  [
    '🇳🇬',
    'nga',
    'nigeria'
  ],
  [
    '🇳🇮',
    'nic',
    'nicaragua'
  ],
  [
    '🇳🇱',
    'nld',
    'netherlands'
  ],
  [
    '🇳🇴',
    'nor',
    'norway'
  ],
  [
    '🇳🇵',
    'npl',
    'nepal'
  ],
  [
    '🇳🇷',
    'nru',
    'nauru'
  ],
  [
    '🇳🇺',
    'niu',
    'niue'
  ],
  [
    '🇳🇿',
    'nzl',
    'new zealand'
  ],
  [
    '🇴🇲',
    'omn',
    'oman'
  ],
  [
    '🇵🇦',
    'pan',
    'panama'
  ],
  [
    '🇵🇪',
    'per',
    'peru'
  ],
  [
    '🇵🇫',
    'pyf',
    'french polynesia'
  ],
  [
    '🇵🇬',
    'png',
    'papua new guinea'
  ],
  [
    '🇵🇭',
    'phl',
    'philippines'
  ],
  [
    '🇵🇰',
    'pak',
    'pakistan'
  ],
  [
    '🇵🇱',
    'pol',
    'poland'
  ],
  [
    '🇵🇲',
    'spm',
    'saint pierre and miquelon'
  ],
  [
    '🇵🇳',
    'pcn',
    'pitcairn'
  ],
  [
    '🇵🇷',
    'pri',
    'puerto rico'
  ],
  [
    '🇵🇸',
    'pse',
    'palestinian territory'
  ],
  [
    '🇵🇹',
    'prt',
    'portugal'
  ],
  [
    '🇵🇼',
    'plw',
    'palau'
  ],
  [
    '🇵🇾',
    'pry',
    'paraguay'
  ],
  [
    '🇶🇦',
    'qat',
    'qatar'
  ],
  [
    '🇷🇪',
    'reu',
    'réunion'
  ],
  [
    '🇷🇴',
    'rou',
    'romania'
  ],
  [
    '🇷🇸',
    'srb',
    'serbia'
  ],
  [
    '🇷🇺',
    'rus',
    'russia'
  ],
  [
    '🇷🇼',
    'rwa',
    'rwanda'
  ],
  [
    '🇸🇦',
    'sau',
    'saudi arabia'
  ],
  [
    '🇸🇧',
    'slb',
    'solomon islands'
  ],
  [
    '🇸🇨',
    'syc',
    'seychelles'
  ],
  [
    '🇸🇩',
    'sdn',
    'sudan'
  ],
  [
    '🇸🇪',
    'swe',
    'sweden'
  ],
  [
    '🇸🇬',
    'sgp',
    'singapore'
  ],
  [
    '🇸🇭',
    'shn',
    'saint helena, ascension and tristan da cunha'
  ],
  [
    '🇸🇮',
    'svn',
    'slovenia'
  ],
  [
    '🇸🇯',
    'sjm',
    'svalbard and jan mayen'
  ],
  [
    '🇸🇰',
    'svk',
    'slovakia'
  ],
  [
    '🇸🇱',
    'sle',
    'sierra leone'
  ],
  [
    '🇸🇲',
    'smr',
    'san marino'
  ],
  [
    '🇸🇳',
    'sen',
    'senegal'
  ],
  [
    '🇸🇴',
    'som',
    'somalia'
  ],
  [
    '🇸🇷',
    'sur',
    'suriname'
  ],
  [
    '🇸🇸',
    'ssd',
    'south sudan'
  ],
  [
    '🇸🇹',
    'stp',
    'sao tome and principe'
  ],
  [
    '🇸🇻',
    'slv',
    'el salvador'
  ],
  [
    '🇸🇽',
    'sxm',
    'sint maarten (dutch part)'
  ],
  [
    '🇸🇾',
    'syr',
    'syrian arab republic'
  ],
  [
    '🇸🇿',
    'swz',
    'swaziland'
  ],
  [
    '🇹🇨',
    'tca',
    'turks and caicos islands'
  ],
  [
    '🇹🇩',
    'tcd',
    'chad'
  ],
  [
    '🇹🇫',
    'atf',
    'french southern territories'
  ],
  [
    '🇹🇬',
    'tgo',
    'togo'
  ],
  [
    '🇹🇭',
    'tha',
    'thailand'
  ],
  [
    '🇹🇯',
    'tjk',
    'tajikistan'
  ],
  [
    '🇹🇰',
    'tkl',
    'tokelau'
  ],
  [
    '🇹🇱',
    'tls',
    'timor-leste'
  ],
  [
    '🇹🇲',
    'tkm',
    'turkmenistan'
  ],
  [
    '🇹🇳',
    'tun',
    'tunisia'
  ],
  [
    '🇹🇴',
    'ton',
    'tonga'
  ],
  [
    '🇹🇷',
    'tur',
    'turkey'
  ],
  [
    '🇹🇹',
    'tto',
    'trinidad and tobago'
  ],
  [
    '🇹🇻',
    'tuv',
    'tuvalu'
  ],
  [
    '🇹🇼',
    'twn',
    'taiwan'
  ],
  [
    '🇹🇿',
    'tza',
    'tanzania'
  ],
  [
    '🇺🇦',
    'ukr',
    'ukraine'
  ],
  [
    '🇺🇬',
    'uga',
    'uganda'
  ],
  [
    '🇺🇲',
    'umi',
    'united states minor outlying islands'
  ],
  [
    '🇺🇸',
    'usa',
    'united states'
  ],
  [
    '🇺🇸',
    'us', //alias
    'united states'
  ],
  [
    '🇺🇾',
    'ury',
    'uruguay'
  ],
  [
    '🇺🇿',
    'uzb',
    'uzbekistan'
  ],
  [
    '🇻🇦',
    'vat',
    'vatican city'
  ],
  [
    '🇻🇨',
    'vct',
    'saint vincent and the grenadines'
  ],
  [
    '🇻🇪',
    'ven',
    'venezuela'
  ],
  [
    '🇻🇬',
    'vgb',
    'virgin islands, british'
  ],
  [
    '🇻🇮',
    'vir',
    'virgin islands, u.s.'
  ],
  [
    '🇻🇳',
    'vnm',
    'viet nam'
  ],
  [
    '🇻🇺',
    'vut',
    'vanuatu'
  ],
  [
    '',
    'win',
    'west indies'
  ],
  [
    '🇼🇫',
    'wlf',
    'wallis and futuna'
  ],
  [
    '🇼🇸',
    'wsm',
    'samoa'
  ],
  [
    '🇾🇪',
    'yem',
    'yemen'
  ],
  [
    '🇾🇹',
    'myt',
    'mayotte'
  ],
  [
    '🇿🇦',
    'zaf',
    'south africa'
  ],
  [
    '🇿🇲',
    'zmb',
    'zambia'
  ],
  [
    '🇿🇼 ',
    'zwe',
    'zimbabwe'
  ],
  //others (later unicode versions)
  ['🇺🇳', 'un', 'united nations'],
  ['🏴󠁧󠁢󠁥󠁮󠁧󠁿󠁧󠁢󠁥󠁮󠁧󠁿', 'eng', 'england'],
  ['🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'sct', 'scotland'],
  ['🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'wal', 'wales'],
];

let sports = {

  player: (tmpl, r) => {
    let res = parse$2(tmpl, ['number', 'country', 'name', 'dl']);
    r.templates.push(res);
    let str = `[[${res.name}]]`;
    if (res.country) {
      let country = (res.country || '').toLowerCase();
      let flag = flags.find((a) => country === a[1] || country === a[2]) || [];
      if (flag && flag[0]) {
        str = flag[0] + '  ' + str;
      }
    }
    if (res.number) {
      str = res.number + ' ' + str;
    }
    return str;
  },


  //https://en.wikipedia.org/wiki/Template:Goal
  goal: (tmpl, r) => {
    let res = parse$2(tmpl);
    let obj = {
      template: 'goal',
      data: []
    };
    let arr = res.list || [];
    for(let i = 0; i < arr.length; i += 2) {
      obj.data.push({
        min: arr[i],
        note: arr[i + 1] || '',
      });
    }
    r.templates.push(obj);
    //generate a little text summary
    let summary = '⚽ ';
    summary += obj.data.map((o) => {
      let note = o.note;
      if (note) {
        note = ` (${note})`;
      }
      return o.min + '\'' + note;
    }).join(', ');
    return summary;
  },
  //yellow card
  yel: (tmpl, r) => {
    let obj = parse$2(tmpl, ['min']);
    r.templates.push(obj);
    if (obj.min) {
      return `yellow: ${obj.min || ''}'`; //no yellow-card emoji
    }
    return '';
  },
  'subon': (tmpl, r) => {
    let obj = parse$2(tmpl, ['min']);
    r.templates.push(obj);
    if (obj.min) {
      return `sub on: ${obj.min || ''}'`; //no yellow-card emoji
    }
    return '';
  },
  'suboff': (tmpl, r) => {
    let obj = parse$2(tmpl, ['min']);
    r.templates.push(obj);
    if (obj.min) {
      return `sub off: ${obj.min || ''}'`; //no yellow-card emoji
    }
    return '';
  },
  'pengoal': (tmpl, r) => {
    r.templates.push({
      template: 'pengoal'
    });
    return '✅';
  },
  'penmiss': (tmpl, r) => {
    r.templates.push({
      template: 'penmiss'
    });
    return '❌';
  },
  //'red' card - {{sent off|cards|min1|min2}}
  'sent off': (tmpl, r) => {
    let obj = parse$2(tmpl, ['cards']);
    let result = {
      template: 'sent off',
      cards: obj.cards,
      minutes: obj.list || [],
    };
    r.templates.push(result);
    let mins = result.minutes.map(m => m + '\'').join(', ');
    return 'sent off: ' + mins;
  }
};
var soccer = sports;

const misc$2 = {
  'baseball secondary style': function(tmpl) {
    let obj = parse$2(tmpl, ['name']);
    return obj.name;
  },
  'mlbplayer': function(tmpl, r) {
    let obj = parse$2(tmpl, ['number', 'name', 'dl']);
    r.templates.push(obj);
    return obj.name;
  }

};


var sports$1 = Object.assign({},
  misc$2,
  brackets_1,
  soccer
);

const hasMonth = /^jan /i;
const isYear = /^year /i;

const monthList = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

const toNumber = function(str) {
  str = str.replace(/,/g, '');
  str = str.replace(/−/g, '-');
  let num = Number(str);
  if (isNaN(num)) {
    return str;
  }
  return num;
};

let templates$8 = {
  // this one is a handful!
  //https://en.wikipedia.org/wiki/Template:Weather_box
  'weather box': (tmpl, r) => {
    let obj = parse$2(tmpl);
    //collect all month-based data
    let byMonth = {};
    let properties = Object.keys(obj).filter(k => hasMonth.test(k));
    properties = properties.map((k) => k.replace(hasMonth, ''));
    properties.forEach((prop) => {
      byMonth[prop] = [];
      monthList.forEach((m) => {
        let key = `${m} ${prop}`;
        if (obj.hasOwnProperty(key)) {
          let num = toNumber(obj[key]);
          delete obj[key];
          byMonth[prop].push(num);
        }
      });
    });
    //add these to original
    obj.byMonth = byMonth;

    //collect year-based data
    let byYear = {};
    Object.keys(obj).forEach((k) => {
      if (isYear.test(k)) {
        let prop = k.replace(isYear, '');
        byYear[prop] = obj[k];
        delete obj[k];
      }
    });
    obj.byYear = byYear;

    r.templates.push(obj);
    return '';
  },

  //The 36 parameters are: 12 monthly highs (C), 12 lows (total 24) plus an optional 12 monthly rain/precipitation
  //https://en.wikipedia.org/wiki/Template:Weather_box/concise_C
  'weather box/concise c': (tmpl, r) => {
    let obj = parse$2(tmpl);
    obj.list = obj.list.map((s) => toNumber(s));
    obj.byMonth = {
      'high c' : obj.list.slice(0, 12),
      'low c' : obj.list.slice(12, 24),
      'rain mm' : obj.list.slice(24, 36)
    };
    delete obj.list;
    obj.template = 'weather box';
    r.templates.push(obj);
    return '';
  },
  'weather box/concise f': (tmpl, r) => {
    let obj = parse$2(tmpl);
    obj.list = obj.list.map((s) => toNumber(s));
    obj.byMonth = {
      'high f' : obj.list.slice(0, 12),
      'low f' : obj.list.slice(12, 24),
      'rain inch' : obj.list.slice(24, 36)
    };
    delete obj.list;
    obj.template = 'weather box';
    r.templates.push(obj);
    return '';
  },


  //https://en.wikipedia.org/wiki/Template:Climate_chart
  'climate chart': (tmpl, r) => {
    let list = parse$2(tmpl).list || [];
    let title = list[0];
    let source = list[38];
    list = list.slice(1);
    //amazingly, they use '−' symbol here instead of negatives...
    list = list.map((str) => {
      if (str && str[0] === '−') {
        str = str.replace(/−/, '-');
      }
      return str;
    });
    let months = [];
    //groups of three, for 12 months
    for(let i = 0; i < 36; i += 3) {
      months.push({
        low: toNumber(list[i]),
        high: toNumber(list[i + 1]),
        precip: toNumber(list[i + 2])
      });
    }
    let obj = {
      template: 'climate chart',
      data: {
        title: title,
        source: source,
        months: months
      }
    };
    r.templates.push(obj);
    return '';
  },
};

var weather = templates$8;

let templates$9 = {
  //https://en.wikipedia.org/wiki/Template:Taxon_info
  'taxon info': (tmpl, r) => {
    let order = ['taxon', 'item'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    return '';
  },

  //minor planet - https://en.wikipedia.org/wiki/Template:MPC
  mpc: (tmpl, r) => {
    let obj = parse$2(tmpl, ['number', 'text']);
    r.templates.push(obj);
    return `[https://minorplanetcenter.net/db_search/show_object?object_id=P/2011+NO1 ${obj.text || obj.number}]`;
  },
  //https://en.wikipedia.org/wiki/Template:Chem2
  chem2: (tmpl, r) => {
    let obj = parse$2(tmpl, ['equation']);
    r.templates.push(obj);
    return obj.equation;
  },
  //https://en.wikipedia.org/wiki/Template:Sky
  sky: (tmpl, r) => {
    let obj = parse$2(tmpl, ['asc_hours', 'asc_minutes', 'asc_seconds', 'dec_sign', 'dec_degrees', 'dec_minutes', 'dec_seconds', 'distance']);
    let template = {
      template: 'sky',
      ascension: {
        hours: obj.asc_hours,
        minutes: obj.asc_minutes,
        seconds: obj.asc_seconds,
      },
      declination: {
        sign: obj.dec_sign,
        degrees: obj.dec_degrees,
        minutes: obj.dec_minutes,
        seconds: obj.dec_seconds,
      },
      distance: obj.distance
    };
    r.templates.push(template);
    return '';
  },
};
var misc$3 = templates$9;

var science = Object.assign({},
  weather,
  misc$3
);

// const parseSentence = require('../../04-sentence').oneSentence;

//simply num/denom * 100
const percentage = function(obj) {
  if (!obj.numerator && !obj.denominator) {
    return null;
  }
  let perc = Number(obj.numerator) / Number(obj.denominator);
  perc *= 100;
  let dec = Number(obj.decimals);
  if (isNaN(dec)) {
    dec = 1;
  }
  perc = perc.toFixed(dec);
  return Number(perc);
};


let templates$a = {

  // https://en.wikipedia.org/wiki/Template:Math
  'math': (tmpl, r) => {
    let obj = parse$2(tmpl, ['formula']);
    r.templates.push(obj);
    return '\n\n' + (obj.formula || '') + '\n\n';
  },

  //fraction - https://en.wikipedia.org/wiki/Template:Sfrac
  'frac': (tmpl, r) => {
    let order = ['a', 'b', 'c'];
    let obj = parse$2(tmpl, order);
    let data = {
      template: 'sfrac',
    };
    if (obj.c) {
      data.integer = obj.a;
      data.numerator = obj.b;
      data.denominator = obj.c;
    } else if (obj.b) {
      data.numerator = obj.a;
      data.denominator = obj.b;
    } else {
      data.numerator = 1;
      data.denominator = obj.a;
    }
    r.templates.push(data);
    if (data.integer) {
      return `${data.integer} ${data.numerator}⁄${data.denominator}`;
    }
    return `${data.numerator}⁄${data.denominator}`;
  },
  //https://en.wikipedia.org/wiki/Template:Radic
  'radic': (tmpl) => {
    let order = ['after', 'before'];
    let obj = parse$2(tmpl, order);
    return `${obj.before || ''}√${obj.after || ''}`;
  },
  //{{percentage | numerator | denominator | decimals to round to (zero or greater) }}
  percentage: ( tmpl = '' ) => {
    let obj = parse$2(tmpl, ['numerator', 'denominator', 'decimals']);
    let num = percentage(obj);
    if (num === null) {
      return '';
    }
    return num + '%';
  },
  // {{Percent-done|done=N|total=N|digits=N}}
  'percent-done': ( tmpl = '' ) => {
    let obj = parse$2(tmpl, ['done', 'total', 'digits']);
    let num = percentage({
      numerator: obj.done,
      denominator: obj.total,
      decimals: obj.digits
    });
    if (num === null) {
      return '';
    }
    return `${obj.done} (${num}%) done`;
  },
  'winning percentage': ( tmpl = '' , r ) => {
    let obj = parse$2(tmpl, ['wins', 'losses', 'ties']);
    r.templates.push(obj);
    let wins = Number(obj.wins);
    let losses = Number(obj.losses);
    let ties = Number(obj.ties) || 0;
    let games = wins + losses + ties;
    if (obj.ignore_ties === 'y') {
      ties = 0;
    }
    if (ties) {
      wins += (ties / 2);
    }
    let num = percentage({
      numerator: wins,
      denominator: games,
      decimals: 1
    });
    if (num === null) {
      return '';
    }
    return `.${num * 10}`;
  },
  'winlosspct': ( tmpl = '' , r ) => {
    let obj = parse$2(tmpl, ['wins', 'losses']);
    r.templates.push(obj);
    let wins = Number(obj.wins);
    let losses = Number(obj.losses);
    let num = percentage({
      numerator: wins,
      denominator: wins + losses,
      decimals: 1
    });
    if (num === null) {
      return '';
    }
    num = `.${num * 10}`;
    return `${wins || 0} || ${losses || 0} || ${num || '-'}`;
  },
};
//aliases
templates$a['sfrac'] = templates$a.frac;
templates$a['sqrt'] = templates$a.radic;
templates$a['pct'] = templates$a.percentage;
templates$a['percent'] = templates$a.percentage;
templates$a['winpct'] = templates$a['winning percentage'];
templates$a['winperc'] = templates$a['winning percentage'];

var math = templates$a;

let templates$b = {
  //https://en.wikipedia.org/wiki/Template:Election_box
  'election box begin': (tmpl, r) => {
    let data = parse$2(tmpl);
    r.templates.push(data);
    return '';
  },
  'election box candidate': (tmpl, r) => {
    let data = parse$2(tmpl);
    r.templates.push(data);
    return '';
  },
  'election box hold with party link': (tmpl, r) => {
    let data = parse$2(tmpl);
    r.templates.push(data);
    return '';
  },
  'election box gain with party link': (tmpl, r) => {
    let data = parse$2(tmpl);
    r.templates.push(data);
    return '';
  }
};
//aliases
templates$b['election box begin no change'] = templates$b['election box begin'];
templates$b['election box begin no party'] = templates$b['election box begin'];
templates$b['election box begin no party no change'] = templates$b['election box begin'];
templates$b['election box inline begin'] = templates$b['election box begin'];
templates$b['election box inline begin no change'] = templates$b['election box begin'];

templates$b['election box candidate for alliance'] = templates$b['election box candidate'];
templates$b['election box candidate minor party'] = templates$b['election box candidate'];
templates$b['election box candidate no party link no change'] = templates$b['election box candidate'];
templates$b['election box candidate with party link'] = templates$b['election box candidate'];
templates$b['election box candidate with party link coalition 1918'] = templates$b['election box candidate'];
templates$b['election box candidate with party link no change'] = templates$b['election box candidate'];
templates$b['election box inline candidate'] = templates$b['election box candidate'];
templates$b['election box inline candidate no change'] = templates$b['election box candidate'];
templates$b['election box inline candidate with party link'] = templates$b['election box candidate'];
templates$b['election box inline candidate with party link no change'] = templates$b['election box candidate'];
templates$b['election box inline incumbent'] = templates$b['election box candidate'];
var elections = templates$b;

let templates$c = {
  //https://en.wikipedia.org/wiki/Template:Flag
  // {{flag|USA}} →  USA
  flag: (tmpl) => {
    let order = ['flag', 'variant'];
    let obj = parse$2(tmpl, order);
    let name = obj.flag || '';
    obj.flag = (obj.flag || '').toLowerCase();
    let found = flags.find((a) => obj.flag === a[1] || obj.flag === a[2]) || [];
    let flag = found[0] || '';
    return `${flag} [[${found[2]}|${name}]]`;
  },
  // {{flagcountry|USA}} →  United States
  flagcountry: (tmpl) => {
    let order = ['flag', 'variant'];
    let obj = parse$2(tmpl, order);
    obj.flag = (obj.flag || '').toLowerCase();
    let found = flags.find((a) => obj.flag === a[1] || obj.flag === a[2]) || [];
    let flag = found[0] || '';
    return `${flag} [[${found[2]}]]`;
  },
  // (unlinked flag-country)
  flagcu: (tmpl) => {
    let order = ['flag', 'variant'];
    let obj = parse$2(tmpl, order);
    obj.flag = (obj.flag || '').toLowerCase();
    let found = flags.find((a) => obj.flag === a[1] || obj.flag === a[2]) || [];
    let flag = found[0] || '';
    return `${flag} ${found[2]}`;
  },
  //https://en.wikipedia.org/wiki/Template:Flagicon
  // {{flagicon|USA}} → United States
  flagicon: (tmpl) => {
    let order = ['flag', 'variant'];
    let obj = parse$2(tmpl, order);
    obj.flag = (obj.flag || '').toLowerCase();
    let found = flags.find((a) => obj.flag === a[1] || obj.flag === a[2]);
    if (!found) {
      return '';
    }
    return `[[${found[2]}|${found[0]}]]`;
  },
  //unlinked flagicon
  flagdeco: (tmpl) => {
    let order = ['flag', 'variant'];
    let obj = parse$2(tmpl, order);
    obj.flag = (obj.flag || '').toLowerCase();
    let found = flags.find((a) => obj.flag === a[1] || obj.flag === a[2]) || [];
    return found[0] || '';
  },
  //same, but a soccer team
  fb: (tmpl) => {
    let order = ['flag', 'variant'];
    let obj = parse$2(tmpl, order);
    obj.flag = (obj.flag || '').toLowerCase();
    let found = flags.find((a) => obj.flag === a[1] || obj.flag === a[2]);
    if (!found) {
      return '';
    }
    return `${found[0]} [[${found[2]} national football team|${found[2]}]]`;
  },
  fbicon: (tmpl) => {
    let order = ['flag', 'variant'];
    let obj = parse$2(tmpl, order);
    obj.flag = (obj.flag || '').toLowerCase();
    let found = flags.find((a) => obj.flag === a[1] || obj.flag === a[2]);
    if (!found) {
      return '';
    }
    return ` [[${found[2]} national football team|${found[0]}]]`;
  },
};
//support {{can}}
flags.forEach((a) => {
  templates$c[a[1]] = () => {
    return a[0];
  };
});
//cricket
templates$c['cr'] = templates$c.flagcountry;
templates$c['cr-rt'] = templates$c.flagcountry;
templates$c['cricon'] = templates$c.flagicon;

var flags_1 = templates$c;

let templates$d = {
  //https://en.wikipedia.org/wiki/Template:Historical_populations
  'historical populations': (tmpl, r) => {
    let data = parse$2(tmpl);
    data.list = data.list || [];
    let years = [];
    for(let i = 0; i < data.list.length; i += 2) {
      let num = data.list[i + 1];
      years.push({
        year: data.list[i],
        val: Number(num) || num
      });
    }
    data.data = years;
    delete data.list;
    r.templates.push(data);
    return '';
  },
};
var population = templates$d;

var politics = Object.assign({},
  elections,
  flags_1,
  population
);

const codes$1 = {
  adx: 'adx', //https://en.wikipedia.org/wiki/Template:Abu_Dhabi_Securities_Exchange
  aim: 'aim', //https://en.wikipedia.org/wiki/Template:Alternative_Investment_Market
  bvpasa: 'bvpasa', //https://en.wikipedia.org/wiki/Template:BVPASA
  asx: 'asx', //https://en.wikipedia.org/wiki/Template:Australian_Securities_Exchange
  athex: 'athex', //https://en.wikipedia.org/wiki/Template:Athens_Exchange
  bhse: 'bhse', //https://en.wikipedia.org/wiki/Template:Bahrain_Bourse
  bvb: 'bvb', //https://en.wikipedia.org/wiki/Template:Bucharest_Stock_Exchange
  bbv: 'bbv', //https://en.wikipedia.org/wiki/Template:BBV
  bsx: 'bsx', //https://en.wikipedia.org/wiki/Template:Bermuda_Stock_Exchange
  b3: 'b3', //https://en.wikipedia.org/wiki/Template:BM%26F_Bovespa
  'bm&f': 'b3', //https://en.wikipedia.org/wiki/Template:BM%26F_Bovespa
  'bm&f bovespa': 'b3', //https://en.wikipedia.org/wiki/Template:BM%26F_Bovespa
  bwse: 'bwse', //https://en.wikipedia.org/wiki/Template:Botswana_Stock_Exchange
  'botswana stock exchange': 'botswana stock exchange', //https://en.wikipedia.org/wiki/Template:BM%26F_Bovespa
  bse: 'bse', //https://en.wikipedia.org/wiki/Template:Bombay_Stock_Exchange
  'bombay stock exchange': 'bombay stock exchange', //https://en.wikipedia.org/wiki/Template:Bombay_Stock_Exchange
  bpse: 'bpse', //https://en.wikipedia.org/wiki/Template:Budapest_Stock_Exchange
  bcba: 'bcba', //https://en.wikipedia.org/wiki/Template:Buenos_Aires_Stock_Exchange
  'canadian securities exchange': 'canadian securities exchange', //https://en.wikipedia.org/wiki/Template:Canadian_Securities_Exchange
  bvc: 'bvc', //https://en.wikipedia.org/wiki/Template:Colombian_Securities_Exchange
  cse: 'cse', //https://en.wikipedia.org/wiki/Template:Chittagong_Stock_Exchange
  darse: 'darse', //https://en.wikipedia.org/wiki/Template:Dar_es_Salaam_Stock_Exchange
  dse: 'dse', //https://en.wikipedia.org/wiki/Template:Dhaka_Stock_Exchange
  dfm: 'dfm', //https://en.wikipedia.org/wiki/Template:Dubai_Financial_Market
  euronext: 'euronext', //https://en.wikipedia.org/wiki/Template:Euronext
  fwb: 'fwb', //https://en.wikipedia.org/wiki/Template:Frankfurt_Stock_Exchange
  fse: 'fse', //https://en.wikipedia.org/wiki/Template:Fukuoka_Stock_Exchange
  gse: 'gse', //https://en.wikipedia.org/wiki/Template:Ghana_Stock_Exchange
  gtsm: 'gtsm', //https://en.wikipedia.org/wiki/Template:Gre_Tai_Securities_Market
  sehk: 'sehk', //https://en.wikipedia.org/wiki/Template:Hong_Kong_Stock_Exchange
  idx: 'idx', //https://en.wikipedia.org/wiki/Template:Indonesia_Stock_Exchange
  nse: 'nse', //https://en.wikipedia.org/wiki/Template:National_Stock_Exchange_of_India
  ise: 'ise', //https://en.wikipedia.org/wiki/Template:Irish_Stock_Exchange
  isin: 'isin', //https://en.wikipedia.org/wiki/Template:ISIN
  bist: 'bist', //https://en.wikipedia.org/wiki/Template:Borsa_Istanbul
  bit: 'bit', //https://en.wikipedia.org/wiki/Template:Borsa_Italiana
  jasdaq: 'jasdaq', //https://en.wikipedia.org/wiki/Template:JASDAQ
  jse: 'jse', //https://en.wikipedia.org/wiki/Template:Johannesburg_Stock_Exchange
  kase: 'kase', //https://en.wikipedia.org/wiki/Template:Kazakhstan_Stock_Exchange
  krx: 'krx', //https://en.wikipedia.org/wiki/Template:Korea_Exchange
  bvl: 'bvl', //https://en.wikipedia.org/wiki/Template:Lima_Stock_Exchange
  lse: 'lse', //https://en.wikipedia.org/wiki/Template:London_Stock_Exchange
  luxse: 'luxse', //https://en.wikipedia.org/wiki/Template:Luxembourg_Stock_Exchange
  bmad: 'bmad', //https://en.wikipedia.org/wiki/Template:Bolsa_de_Madrid
  myx: 'myx', //https://en.wikipedia.org/wiki/Template:Bursa_Malaysia
  bmv: 'bmv', //https://en.wikipedia.org/wiki/Template:Mexican_Stock_Exchange
  mcx: 'mcx', //https://en.wikipedia.org/wiki/Template:Moscow_Exchange
  mutf: 'mutf', //https://en.wikipedia.org/wiki/Template:Mutual_fund
  nag: 'nag', //https://en.wikipedia.org/wiki/Template:Nagoya_Stock_Exchange
  kn: 'kn', //https://en.wikipedia.org/wiki/Template:Nairobi_Securities_Exchange
  'nasdaq dubai': 'nasdaq dubai', //https://en.wikipedia.org/wiki/Template:NASDAQ_Dubai
  'nasdaq': 'nasdaq', //https://en.wikipedia.org/wiki/Template:NASDAQ
  neeq: 'neeq', //https://en.wikipedia.org/wiki/Template:NEEQ
  nepse: 'nepse', //https://en.wikipedia.org/wiki/Template:Nepal_Stock_Exchange
  nyse: 'nyse', //https://en.wikipedia.org/wiki/Template:New_York_Stock_Exchange
  nzx: 'nzx', //https://en.wikipedia.org/wiki/Template:New_Zealand_Exchange
  amex: 'amex', //https://en.wikipedia.org/wiki/Template:NYSE_American
  'nyse arca': 'nyse arca', //https://en.wikipedia.org/wiki/Template:NYSE_Arca
  omx: 'omx', //https://en.wikipedia.org/wiki/Template:OMX
  'omx baltic': 'omx baltic', //https://en.wikipedia.org/wiki/Template:OMX_Baltic
  ose: 'ose', //https://en.wikipedia.org/wiki/Template:Oslo_Stock_Exchange
  'otc pink': 'otc pink', //https://en.wikipedia.org/wiki/Template:OTC_Pink
  otcqb: 'otcqb', //https://en.wikipedia.org/wiki/Template:OTCQB
  otcqx: 'otcqx', //https://en.wikipedia.org/wiki/Template:OTCQX
  'philippine stock exchange': 'philippine stock exchange', //https://en.wikipedia.org/wiki/Template:Philippine_Stock_Exchange
  prse: 'prse', //https://en.wikipedia.org/wiki/Template:Prague_Stock_Exchange
  qe: 'qe', //https://en.wikipedia.org/wiki/Template:Qatar_Stock_Exchange
  bcs: 'bcs', //https://en.wikipedia.org/wiki/Template:Santiago_Stock_Exchange
  'saudi stock exchange': 'saudi stock exchange', //https://en.wikipedia.org/wiki/Template:Saudi_Stock_Exchange
  sgx: 'sgx', //https://en.wikipedia.org/wiki/Template:Singapore_Exchange
  sse: 'sse', //https://en.wikipedia.org/wiki/Template:Shanghai_Stock_Exchange
  szse: 'szse', //https://en.wikipedia.org/wiki/Template:Shenzhen_Stock_Exchange
  swx: 'swx', //https://en.wikipedia.org/wiki/Template:SIX_Swiss_Exchange
  set: 'set', //https://en.wikipedia.org/wiki/Template:Stock_Exchange_of_Thailand
  tase: 'tase', //https://en.wikipedia.org/wiki/Template:Tel_Aviv_Stock_Exchange
  tyo: 'tyo', //https://en.wikipedia.org/wiki/Template:Tokyo_Stock_Exchange
  tsx: 'tsx', //https://en.wikipedia.org/wiki/Template:Toronto_Stock_Exchange
  twse: 'twse', //https://en.wikipedia.org/wiki/Template:Taiwan_Stock_Exchange
  'tsx-v': 'tsx-v', //https://en.wikipedia.org/wiki/Template:TSX_Venture_Exchange
  'tsxv': 'tsxv', //https://en.wikipedia.org/wiki/Template:TSX_Venture_Exchange
  nex: 'nex', //https://en.wikipedia.org/wiki/Template:TSXV_NEX
  ttse: 'ttse', //https://en.wikipedia.org/wiki/Template:Trinidad_and_Tobago_Stock_Exchange
  'pfts ukraine stock exchange': 'pfts ukraine stock exchange', //https://en.wikipedia.org/wiki/Template:PFTS_Ukraine_Stock_Exchange
  wse: 'wse', //https://en.wikipedia.org/wiki/Template:Warsaw_Stock_Exchange
  wbag: 'wbag', //https://en.wikipedia.org/wiki/Template:Wiener_B%C3%B6rse
  zse: 'zse', //https://en.wikipedia.org/wiki/Template:Zagreb_Stock_Exchange
  'zagreb stock exchange': 'zagreb stock exchange', //https://en.wikipedia.org/wiki/Template:Zagreb_Stock_Exchange
  'zimbabwe stock exchange': 'zimbabwe stock exchange' //https://en.wikipedia.org/wiki/Template:Zimbabwe_Stock_Exchange
};

const parseStockExchange = (tmpl, r) => {
  let o = parse$2(tmpl, ['ticketnumber', 'code']);
  r.templates.push(o);
  let code = o.template || '';
  if (code === '') {
    code = o.code;
  }
  code = (code || '').toLowerCase();
  let out = codes$1[code] || '';
  let str = out;
  if (o.ticketnumber) {
    str = `${str}: ${o.ticketnumber}`;
  }
  if (o.code && !codes$1[o.code.toLowerCase()]) {
    str += ' ' + o.code;
  }
  return str
};

const currencies$1 = {
};
//the others fit the same pattern..
Object.keys(codes$1).forEach(k => {
  currencies$1[k] = parseStockExchange;
});

var stockexchange = currencies$1;

const misc$4 = {
  'timeline': (tmpl, r) => {
    let data = parse$2(tmpl);
    r.templates.push(data);
    return '';
  },
  'uss': (tmpl, r) => {
    let order = ['ship', 'id'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    return '';
  },
  'isbn': (tmpl, r) => {
    let order = ['id', 'id2', 'id3'];
    let obj = parse$2(tmpl, order);
    r.templates.push(obj);
    return 'ISBN: ' + (obj.id || '');
  },
  //https://en.wikipedia.org/wiki/Template:Marriage
  //this one creates a template, and an inline response
  marriage: (tmpl, r) => {
    let data = parse$2(tmpl, ['spouse', 'from', 'to', 'end']);
    r.templates.push(data);
    let str = `${data.spouse || ''}`;
    if (data.from) {
      if (data.to) {
        str += ` (m. ${data.from}-${data.to})`;
      } else {
        str += ` (m. ${data.from})`;
      }
    }
    return str;
  },
  //https://en.wikipedia.org/wiki/Template:Based_on
  'based on': (tmpl, r) => {
    let obj = parse$2(tmpl, ['title', 'author']);
    r.templates.push(obj);
    return `${obj.title} by ${obj.author || ''}`;
  },
  //https://en.wikipedia.org/wiki/Template:Video_game_release
  'video game release': (tmpl, r) => {
    let order = ['region', 'date', 'region2', 'date2', 'region3', 'date3', 'region4', 'date4'];
    let obj = parse$2(tmpl, order);
    let template = {
      template: 'video game release',
      releases: []
    };
    for(let i = 0; i < order.length; i += 2) {
      if (obj[order[i]]) {
        template.releases.push({
          region: obj[order[i]],
          date: obj[order[i + 1]],
        });
      }
    }
    r.templates.push(template);
    let str = template.releases.map((o) => `${o.region}: ${o.date || ''}`).join('\n\n');
    return '\n' + str + '\n';
  },
  //barrels of oil https://en.wikipedia.org/wiki/Template:Bbl_to_t
  'bbl to t': (tmpl, r) => {
    let obj = parse$2(tmpl, ['barrels']);
    r.templates.push(obj);
    if (obj.barrels === '0') {
      return obj.barrels + ' barrel';
    }
    return obj.barrels + ' barrels';
  },
};
var misc_1$1 = misc$4;

const templates$e = Object.assign({},
  wikipedia,
  identities,
  dates,
  formatting$1,
  geo,
  language,
  money,
  sports$1,
  science,
  math,
  politics,
  stockexchange,
  misc_1$1
);
// console.log(Object.keys(templates).length + ' Templates!');

//this gets all the {{template}} strings and decides how to parse them
const parseTemplate = function(tmpl, wiki, data) {
  let name = _getName(tmpl);
  //we explicitly ignore these templates
  if (_ignore.hasOwnProperty(name) === true) {
    wiki = wiki.replace(tmpl, '');
    return wiki;
  }

  //match any known template forms (~1,000!)
  if (templates$e.hasOwnProperty(name) === true) {
    let str = templates$e[name](tmpl, data);
    wiki = wiki.replace(tmpl, str);
    return wiki;
  }
  // {{infobox settlement...}}
  if (_infobox.isInfobox(name) === true) {
    let obj = parse$2(tmpl, data, 'raw');
    let infobox = _infobox.format(obj);
    data.templates.push(infobox);
    wiki = wiki.replace(tmpl, '');
    return wiki;
  }
  //cite book, cite arxiv...
  if (/^cite [a-z]/.test(name) === true) {
    let obj = parse$2(tmpl, data);
    data.templates.push(obj);
    wiki = wiki.replace(tmpl, '');
    return wiki;
  }
  //fallback parser
  let obj = parse$2(tmpl);
  if (obj !== null && Object.keys(obj).length > 0) {
    data.templates.push(obj);
  }
  wiki = wiki.replace(tmpl, '');
  return wiki;
};
var parse_1 = parseTemplate;

const isCitation = new RegExp('^(cite |citation)', 'i');
const citations = {
  citation: true,
  refn: true,
  harvnb: true,
};
//ensure references and infoboxes at least look valid
const isObject = function(x) {
  return (typeof x === 'object') && (x !== null) && x.constructor.toString().indexOf('Array') === -1;
};

//reduce the scary recursive situations
const parseTemplates = function(wiki, data, options) {
  let templates = _getTemplates(wiki);
  //first, do the nested (second level) ones
  templates.nested.forEach(tmpl => {
    wiki = parse_1(tmpl, wiki, data);
  });
  //then, reparse wiki for the top-level ones
  templates = _getTemplates(wiki);

  //okay if we have a 3-level-deep template, do it again (but no further)
  if (templates.nested.length > 0) {
    templates.nested.forEach(tmpl => {
      wiki = parse_1(tmpl, wiki, data);
    });
    templates = _getTemplates(wiki); //this is getting crazy.
  }
  //okay, top-level
  templates.top.forEach(tmpl => {
    wiki = parse_1(tmpl, wiki, data);
  });
  //lastly, move citations + infoboxes out of our templates list
  let clean = [];
  data.templates.forEach((o) => {
    //it's possible that we've parsed a reference, that we missed earlier
    if (citations[o.template] === true || isCitation.test(o.template) === true) {
      data.references = data.references || [];
      data.references.push(new Reference_1(o));
      return;
    }
    if (o.template === 'infobox' && o.data && isObject(o.data)) {
      data.infoboxes = data.infoboxes || [];
      data.infoboxes.push(new Infobox_1(o));
      return;
    }
    clean.push(o);
  });
  data.templates = clean;
  return wiki;
};

var templates$f = parseTemplates;

const parseSentence$6 = _04Sentence.oneSentence;

//okay, <gallery> is a xml-tag, with newline-seperated data, somehow pivoted by '|'...
//all deities help us. truly -> https://en.wikipedia.org/wiki/Help:Gallery_tag
// - not to be confused with https://en.wikipedia.org/wiki/Template:Gallery...
const parseGallery = function(wiki, section) {
  wiki = wiki.replace(/<gallery([^>]*?)>([\s\S]+?)<\/gallery>/g, (_, attrs, inside) => {
    let images = inside.split(/\n/g);
    images = images.filter(str => str && str.trim() !== '');
    //parse the line, which has an image and sometimes a caption
    images = images.map((str) => {
      let arr = str.split(/\|/);
      let obj = {
        file: arr[0].trim()
      };
      let img = new Image_1(obj).json();
      let caption = arr.slice(1).join('|');
      if (caption !== '') {
        img.caption = parseSentence$6(caption);
      }
      return img;
    });
    //add it to our templates list
    if (images.length > 0) {
      section.templates.push({
        template: 'gallery',
        images: images
      });
    }
    return '';
  });
  return wiki;
};
var gallery = parseGallery;

//this is a non-traditional template, for some reason
//https://en.wikipedia.org/wiki/Template:Election_box
const parseElection = function(wiki, section) {
  wiki = wiki.replace(/\{\{election box begin([\s\S]+?)\{\{election box end\}\}/gi, (tmpl) => {
    let data = {
      templates: []
    };
    //put it through our full template parser..
    templates$f(tmpl, data);
    //okay, pull it apart into something sensible..
    let start = data.templates.find((t) => t.template === 'election box') || {};
    let candidates = data.templates.filter((t) => t.template === 'election box candidate');
    let summary = data.templates.find((t) => t.template === 'election box gain' || t.template === 'election box hold') || {};
    if (candidates.length > 0 || summary) {
      section.templates.push({
        template: 'election box',
        title: start.title,
        candidates: candidates,
        summary: summary.data
      });
    }
    //remove it all
    return '';
  });
  return wiki;
};
var election = parseElection;

const keys = {
  coach: [
    'team',
    'year',
    'g',
    'w',
    'l',
    'w-l%',
    'finish',
    'pg',
    'pw',
    'pl',
    'pw-l%'
  ],
  player: [
    'year',
    'team',
    'gp',
    'gs',
    'mpg',
    'fg%',
    '3p%',
    'ft%',
    'rpg',
    'apg',
    'spg',
    'bpg',
    'ppg',
  ],
  roster: [
    'player',
    'gp',
    'gs',
    'mpg',
    'fg%',
    '3fg%',
    'ft%',
    'rpg',
    'apg',
    'spg',
    'bpg',
    'ppg'
  ],
};

//https://en.wikipedia.org/wiki/Template:NBA_player_statistics_start
const parseNBA = function(wiki, section) {
  wiki = wiki.replace(/\{\{nba (coach|player|roster) statistics start([\s\S]+?)\{\{s-end\}\}/gi, (tmpl, name) => {
    tmpl = tmpl.replace(/^\{\{.*?\}\}/, '');
    tmpl = tmpl.replace(/\{\{s-end\}\}/, '');
    name = name.toLowerCase().trim();
    let headers = '! ' + keys[name].join(' !! ');
    let table = '{|\n' + headers + '\n' + tmpl + '\n|}';
    let rows = parse$3(table);

    rows = rows.map((row) => {
      Object.keys(row).forEach((k) => {
        row[k] = row[k].text();
      });
      return row;
    });
    section.templates.push({
      template: 'NBA ' + name + ' statistics',
      data: rows
    });
    return '';
  });
  return wiki;
};
var nba = parseNBA;

//https://en.wikipedia.org/wiki/Template:MLB_game_log_section

//this is pretty nuts
const whichHeadings = function(tmpl) {
  let headings = ['#', 'date', 'opponent', 'score', 'win', 'loss', 'save', 'attendance', 'record'];
  if (/\|stadium=y/i.test(tmpl) === true) {
    headings.splice(7, 0, 'stadium'); //save, stadium, attendance
  }
  if (/\|time=y/i.test(tmpl) === true) {
    headings.splice(7, 0, 'time'); //save, time, stadium, attendance
  }
  if (/\|box=y/i.test(tmpl) === true) {
    headings.push('box'); //record, box
  }
  return headings;
};

const parseMlb = function(wiki, section) {
  wiki = wiki.replace(/\{\{mlb game log (section|month)[\s\S]+?\{\{mlb game log (section|month) end\}\}/gi, (tmpl) => {
    let headings = whichHeadings(tmpl);
    tmpl = tmpl.replace(/^\{\{.*?\}\}/, '');
    tmpl = tmpl.replace(/\{\{mlb game log (section|month) end\}\}/i, '');
    let headers = '! ' + headings.join(' !! ');
    let table = '{|\n' + headers + '\n' + tmpl + '\n|}';
    let rows = parse$3(table);
    rows = rows.map((row) => {
      Object.keys(row).forEach((k) => {
        row[k] = row[k].text();
      });
      return row;
    });
    section.templates.push({
      template: 'mlb game log section',
      data: rows
    });
    return '';
  });
  return wiki;
};
var mlb = parseMlb;

let headings$1 = ['res', 'record', 'opponent', 'method', 'event', 'date', 'round', 'time', 'location', 'notes'];

//https://en.wikipedia.org/wiki/Template:MMA_record_start
const parseMMA = function(wiki, section) {
  wiki = wiki.replace(/\{\{mma record start[\s\S]+?\{\{end\}\}/gi, (tmpl) => {
    tmpl = tmpl.replace(/^\{\{.*?\}\}/, '');
    tmpl = tmpl.replace(/\{\{end\}\}/i, '');
    let headers = '! ' + headings$1.join(' !! ');
    let table = '{|\n' + headers + '\n' + tmpl + '\n|}';
    let rows = parse$3(table);
    rows = rows.map((row) => {
      Object.keys(row).forEach((k) => {
        row[k] = row[k].text();
      });
      return row;
    });
    section.templates.push({
      template: 'mma record start',
      data: rows
    });
    return '';
  });
  return wiki;
};
var mma = parseMMA;

const parseSentence$7 = _04Sentence.oneSentence;
//xml <math>y=mx+b</math> support
//https://en.wikipedia.org/wiki/Help:Displaying_a_formula
const parseMath = function(wiki, section) {
  wiki = wiki.replace(/<math([^>]*?)>([\s\S]+?)<\/math>/g, (_, attrs, inside) => {
    //clean it up a little?
    let formula = parseSentence$7(inside).text();
    section.templates.push({
      template: 'math',
      formula: formula,
      raw: inside
    });
    //should we atleast try to render it in plaintext? :/
    if (formula && formula.length < 12) {
      return formula;
    }
    return '';
  });
  //try chemistry version too
  wiki = wiki.replace(/<chem([^>]*?)>([\s\S]+?)<\/chem>/g, (_, attrs, inside) => {
    section.templates.push({
      template: 'chem',
      data: inside,
    });
    return '';
  });
  return wiki;
};
var math$1 = parseMath;

// Most templates are '{{template}}', but then, some are '<template></template>'.
// ... others are {{start}}...{{end}}
// -> these are those ones.
const xmlTemplates = function(section, wiki) {
  wiki = gallery(wiki, section);
  wiki = election(wiki, section);
  wiki = math$1(wiki, section);
  wiki = nba(wiki, section);
  wiki = mma(wiki, section);
  wiki = mlb(wiki, section);
  return wiki;
};

var startToEnd = xmlTemplates;

const isReference = /^(references?|einzelnachweise|referencias|références|notes et références|脚注|referenser|bronnen|примечания):?/i; //todo support more languages
const section_reg = /(?:\n|^)(={2,5}.{1,200}?={2,5})/g;

//interpret ==heading== lines
const parse$5 = {
  heading: heading,
  table: table,
  paragraphs: _03Paragraph,
  templates: templates$f,
  references: reference,
  startEndTemplates: startToEnd
};

const oneSection = function( wiki, data, options) {
  wiki = parse$5.startEndTemplates(data, wiki, options);
  //parse-out the <ref></ref> tags
  wiki = parse$5.references(wiki, data);
  //parse-out all {{templates}}
  wiki = parse$5.templates(wiki, data, options);
  // //parse the tables
  wiki = parse$5.table(data, wiki);
  //now parse all double-newlines
  let res = parse$5.paragraphs(wiki, options);
  data.paragraphs = res.paragraphs;
  wiki = res.wiki;
  data = new Section_1(data, wiki);
  return data;
};

//we re-create this in html/markdown outputs
const removeReferenceSection = function(sections) {
  return sections.filter((s, i) => {
    if (isReference.test(s.title()) === true) {
      if (s.paragraphs().length > 0) {
        return true;
      }
      //does it have some wacky templates?
      if (s.templates().length > 0) {
        return true;
      }
      //what it has children? awkward
      if (sections[i + 1] && sections[i + 1].depth > s.depth) {
        sections[i + 1].depth -= 1; //move it up a level?...
      }
      return false;
    }
    return true;
  });
};

const parseSections = function(wiki, options) {
  let split = wiki.split(section_reg);
  let sections = [];
  for (let i = 0; i < split.length; i += 2) {
    let heading = split[i - 1] || '';
    let content = split[i] || '';
    if (content === '' && heading === '') { //usually an empty 'intro' section
      continue;
    }
    let data = {
      title: '',
      depth: null,
      templates: [],
      infoboxes: [],
      references: [],
    };
    //figure-out title/depth
    parse$5.heading(data, heading);
    //parse it up
    let s = oneSection(content, data, options);
    sections.push(s);
  }
  //remove empty references section
  sections = removeReferenceSection(sections);

  return sections;
};

var _02Section = parseSections;

const cat_reg$1 = new RegExp('\\[\\[:?(' + i18n_1.categories.join('|') + '):(.{2,178}?)]](w{0,10})', 'ig');
const cat_remove_reg = new RegExp('^\\[\\[:?(' + i18n_1.categories.join('|') + '):', 'ig');

const parse_categories = function(r, wiki) {
  r.categories = [];
  let tmp = wiki.match(cat_reg$1); //regular links
  if (tmp) {
    tmp.forEach(function(c) {
      c = c.replace(cat_remove_reg, '');
      c = c.replace(/\|?[ \*]?\]\]$/i, ''); //parse fancy onces..
      c = c.replace(/\|.*/, ''); //everything after the '|' is metadata
      if (c && !c.match(/[\[\]]/)) {
        r.categories.push(c.trim());
      }
    });
  }
  wiki = wiki.replace(cat_reg$1, '');
  return wiki;
};
var categories = parse_categories;

const parse$6 = {
  section: _02Section,
  categories: categories
};

//convert wikiscript markup lang to json
const main = function(wiki, options) {
  options = options || {};
  wiki = wiki || '';
  let data = {
    type: 'page',
    title: '',
    sections: [],
    categories: [],
    coordinates: [],
  };
  //detect if page is just redirect, and return it
  if (redirects.isRedirect(wiki) === true) {
    data.type = 'redirect';
    data.redirectTo = redirects.parse(wiki);
    parse$6.categories(data, wiki);
    return new Document_1(data, options);
  }
  //detect if page is just disambiguator page, and return
  if (disambig.isDisambig(wiki) === true) {
    data.type = 'disambiguation';
  }
  if (options.page_identifier) {
    data.page_identifier = options.page_identifier;
  }
  if (options.lang_or_wikiid) {
    data.lang_or_wikiid = options.lang_or_wikiid;
  }
  //give ourselves a little head-start
  wiki = preProcess_1(data, wiki);
  //pull-out [[category:whatevers]]
  wiki = parse$6.categories(data, wiki);
  //parse all the headings, and their texts/sentences
  data.sections = parse$6.section(wiki, options) || [];
  //all together now
  return new Document_1(data, options);
};

var _01Document = main;

//grab the content of any article, off the api




//num pages per request
const MAX_PAGES = 5;

//this data-format from mediawiki api is nutso
const postProcess = function(data) {
  let pages = Object.keys(data.query.pages);
  let docs = pages.map(id => {
    let page = data.query.pages[id] || {};
    if (page.hasOwnProperty('missing') || page.hasOwnProperty('invalid')) {
      return null;
    }
    let text = page.revisions[0]['*'];
    //us the 'generator' result format, for the random() method
    if (!text && page.revisions[0].slots) {
      text = page.revisions[0].slots.main['*'];
    }
    let opt = {
      title: page.title,
      pageID: page.pageid
    };
    try {
      return _01Document(text, opt);
    } catch (e) {
      console.error(e);
      throw e
    }
  });
  return docs;
};

//recursive fn to fetch groups of pages, serially
const doPages = function(pages, results, lang, options, cb) {
  let todo = pages.slice(0, MAX_PAGES);
  let url = _url(todo, lang, options);
  let p = _request(url, options);
  p.then((wiki) => {
    let res = postProcess(wiki);
    results = results.concat(res);
    let remain = pages.slice(MAX_PAGES);
    if (remain.length > 0) {
      return doPages(remain, results, lang, options, cb); //recursive
    }
    return cb(results);
  }).catch((e) => {
    console.error('wtf_wikipedia error: ' + e);
    cb(results);
  });
};

//grab a single, or list of pages (or ids)
const fetchPage = function( pages = [] , a, b, c) {
  if (typeof pages !== 'object') {
    pages = [pages];
  }
  let {lang, options, callback} = _params(a, b, c);
  return new Promise(function(resolve, reject) {
    // courtesy-check for spamming wp servers
    if (pages.length > 500) {
      console.error('wtf_wikipedia error: Requested ' + pages.length + ' pages.');
      reject('Requested too many pages, exiting.');
      return;
    }
    doPages(pages, [], lang, options, (docs) => {
      docs = docs.filter((d) => d !== null);
      //return the first doc, if we only asked for one
      if (pages.length === 1) {
        docs = docs[0];
      }
      docs = docs || null;
      //support 'err-back' format
      if (callback && typeof callback === 'function') {
        callback(null, docs);
      }
      resolve(docs);
    });
  });
};

var fetch = fetchPage;

const makeUrl$1 = function(lang) {
  let url = `https://${lang}.wikipedia.org/w/api.php`;
  if (site_map_1[lang]) {
    url = site_map_1[lang] + '/w/api.php';
  }
  url += `?format=json&action=query&generator=random&grnnamespace=0&prop=revisions&rvprop=content&grnlimit=1&rvslots=main&origin=*`;
  return url;
};

//this data-format from mediawiki api is nutso
const postProcess$1 = function(data, options) {
  let pages = Object.keys(data.query.pages);
  let id = pages[0];
  let page = data.query.pages[id] || {};
  if (page.hasOwnProperty('missing') || page.hasOwnProperty('invalid')) {
    return null;
  }
  //us the 'generator' result format, for the random() method
  let text = page.revisions[0].slots.main['*'];
  options.title = page.title;
  options.pageID = page.pageid;
  try {
    return _01Document(text, options);
  } catch (e) {
    console.error(e);
    throw e
  }
};

//fetch and parse a random page from the api
const getRandom = function(a, b, c) {
  let {lang, options, callback} = _params(a, b, c);
  let url = makeUrl$1(lang);
  return new Promise(function(resolve, reject) {
    let p = _request(url, options);
    p.then((res) => {
      return postProcess$1(res, options);
    }).then((doc) => {
      //support 'err-back' format
      if (typeof callback === 'function') {
        callback(null, doc);
      }
      resolve(doc);
    }).catch(reject);
  });
};
var random = getRandom;

const normalizeCategory = function( cat = '' ) {
  if (/^Category/i.test(cat) === false) {
    cat = 'Category:' + cat;
  }
  cat = cat.replace(/ /g, '_');
  return cat;
};

const makeUrl$2 = function(cat, lang, options) {
  cat = encodeURIComponent(cat);
  let url = `https://${lang}.wikipedia.org/w/api.php`;
  if (site_map_1[lang]) {
    url = site_map_1[lang] + '/w/api.php';
  }
  if (options.wikiUrl) {
    url = options.wikiUrl;
  }
  url += `?action=query&list=categorymembers&cmtitle=${cat}&cmlimit=500&format=json&origin=*&redirects=true&cmtype=page|subcat`;
  return url;
};


const addResult = function(body, out) {
  if (body.query && body.query.categorymembers) {
    let list = body.query.categorymembers;
    list.forEach((p) => {
      if (p.ns === 14) {
        out.categories.push(p);
      } else {
        out.pages.push(p);
      }
    });
    return out;
  }
  return out;
};



const getCategories = function(cat, a, b, c) {
  let {lang, options, callback} = _params(a, b, c);
  //cleanup cat name
  cat = normalizeCategory(cat);
  let url = makeUrl$2(cat, lang, options);
  let safety = 0;

  let output = {
    category: cat,
    pages: [],
    categories: []
  };

  const doit = function( cntd = '' , cb) {
    let myUrl = url + '&cmcontinue=' + cntd;
    let p = _request(myUrl, options);
    p.then((body) => {
      output = addResult(body, output);
      //should we do another?
      if (body.continue && body.continue.cmcontinue && body.continue.cmcontinue !== cntd && safety < 25) {
        safety += 1;
        doit(body.continue.cmcontinue, cb);
      } else {
        cb(null, output);
      }
    });
  };

  return new Promise(function(resolve, reject) {
    doit('', (err) => {
      if (typeof callback === 'function') {
        callback(err, output);
      }
      if (err) {
        reject(err);
      }
      resolve(output);
    });
  });
};

var category = getCategories;

var _version = '7.4.2';

//the main 'factory' exported method
const wtf = function(wiki, options) {
  return _01Document(wiki, options);
};
wtf.fetch = function(title, lang, options, cb) {
  return fetch(title, lang, options, cb);
};
wtf.random = function(lang, options, cb) {
  return random(lang, options, cb);
};
wtf.category = function(cat, lang, options, cb) {
  return category(cat, lang, options, cb);
};
wtf.version = _version;

var src = wtf;

export default src;
