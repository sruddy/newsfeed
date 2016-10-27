// A collection of utility methods to help build the Simple Feed Viewer
//

(function (window) {

  // Creates a wrapper function in the global scope that is deleted after it is invoked
  // - This function should remain private to util.js
  function createGlobalCallback(fn) {
    var fnName = 'fn' + new Date().valueOf();
    window[fnName] = function() {
      fn.apply(this, arguments);

      try {
        delete window[fnName];
      } catch (e) {
        window[fnName] = null;
      }
    };

    return fnName;
  }

  // Makes a JSONP request to an API endpoint
  // - This function should remain private to util.js
  function makeJSONPRequest(options) {
    var head = document.getElementsByTagName('head')[0];
    var scriptEl = document.createElement('script');
    var src = options.url;

    options.data || (options.data = {});

    options.data.callback = createGlobalCallback(function (data) {
      if (data.status === 'fail') {
        options.error(data);

      } else if (data.status === 'ok') {
        options.success(data);
      }

      head.removeChild(scriptEl);
    });

    scriptEl.onerror = function (event) {
      options.error('{ status: "fail", mesg: "JSONP request failed to load" }');
      head.removeChild(scriptEl);
    };

    scriptEl.id = options.data.callback;
    scriptEl.async = true;
    scriptEl.src = src + '&' + util.param(options.data);

    head.appendChild(scriptEl);
  }

  // Public namespace for utility methods
  var util = {
    // Helper noop 
    noop: function() {},

    // Converts a JavaScript object to a querystring
    param: function (data) {
      var out = []; 
      var n;

      if (typeof data !== 'object') {
        throw new Error('util.param: data arugment is not an object');
      }

      for (n in data) {
        if (data.hasOwnProperty(n)) {
          out.push(n + '=' + data[n]);
        }
      }

      return out.join('&');
    },

    // Sends an asynchronous HTTP request.
    ajax: function(options) {
      var req;

      // Set some defaults for async requests
      options || (options = {});
      options.method = options.method || 'GET';
      options.success = options.success || util.noop;
      options.error = options.error || util.noop;

      // Our default dataType for this app is JSONP
      options.dataType = options.dataType || 'jsonp';

      if ( ! options.url) {
        throw new Error('util.xhr: missing options.url');
      }

      // JSONP request
      if (options.dataType === 'jsonp') {
        makeJSONPRequest(options);

      // GET method XHR
      } else {
        options.url = options.url + '&' + util.param(options.data);

        req = new XMLHttpRequest();
        req.open(options.method, options.url, true);
        req.onload = function (event) {
            var resp = JSON.parse(req.response);
            options.success(resp);
        };
        req.onerror = function (event) {
            var resp = req.response;
            options.error(resp, event);
        };
        req.send();
      }
    }
  };

  window.util = util;

})(this);
