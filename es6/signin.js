(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.bundle = factory());
}(this, function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  var API_URL = location.hostname.includes("localhost") ? "http://localhost:5000" : "https://api.districtr.org";

  var ApiClient =
  /*#__PURE__*/
  function () {
    function ApiClient(base_url, middleware) {
      _classCallCheck(this, ApiClient);

      if (base_url === undefined || base_url === null) {
        base_url = API_URL;
      }

      this.base_url = base_url;

      if (middleware === null || middleware === undefined) {
        middleware = [];
      }

      this.middleware = middleware;
    }

    _createClass(ApiClient, [{
      key: "request",
      value: function request(uri, method, body, headers) {
        var requestBody;

        if (body !== null && body !== undefined) {
          requestBody = JSON.stringify(body);
        }

        return fetch(this.base_url + uri, // Pass the request options to each middleware function for modification
        this.middleware.reduce(function (requestOptions, middleware) {
          return middleware(requestOptions);
        }, {
          method: method,
          body: requestBody,
          headers: _objectSpread({
            "Content-Type": "application/json"
          }, headers)
        }));
      }
    }, {
      key: "get",
      value: function get(uri, headers) {
        return this.request(uri, "GET", null, headers);
      }
    }, {
      key: "post",
      value: function post(uri, body) {
        return this.request(uri, "POST", body);
      }
    }, {
      key: "put",
      value: function put(uri, body) {
        return this.request(uri, "PUT", body);
      }
    }, {
      key: "delete",
      value: function _delete(uri, body) {
        return this.request(uri, "DELETE", body);
      }
    }, {
      key: "patch",
      value: function patch(uri, body) {
        return this.request(uri, "PATCH", body);
      }
    }]);

    return ApiClient;
  }();
  var client = new ApiClient(API_URL);

  function signInUser(_ref2) {
    var email = _ref2.email;
    return client.post("/signin/", {
      email: email
    });
  }

  function popupMessage(_ref) {
    var message = _ref.message,
        raw = _ref.raw;
    var messageElement = document.getElementById("popup-message");
    messageElement.classList.remove("hidden");

    if (raw === true) {
      messageElement.innerHTML = message;
    } else {
      messageElement.innerText = message;
    }

    return messageElement;
  }
  function errorMessage(message) {
    var element = popupMessage({
      message: message
    });
    element.classList.add("alert");
  }
  var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  function isEmail(value) {
    return value.match(emailRegex);
  }

  function onAllChanges(element, f) {
    element.onblur = f;
    element.onfocus = f;
    element.oninput = f;
  }

  function createForm(elementIds, formId, validate, onSubmit) {
    var elements = elementIds.reduce(function (lookup, elementId) {
      var element = document.getElementById(elementId);
      return _objectSpread({}, lookup, _defineProperty({}, elementId, element));
    }, {});
    elementIds.forEach(function (elementId) {
      onAllChanges(elements[elementId], function () {
        return validate(elements);
      });
    });
    var form = document.getElementById(formId);

    form.onsubmit = function (event) {
      event.preventDefault();

      if (!validate(elements)) {
        return;
      }

      onSubmit(elements);
    };
  }

  var routes = {
    "/": "/",
    "/new": "/new",
    "/edit": "/edit",
    "/register": "/register",
    "/request": "/request",
    "/signin": "/signin",
    "/signout": "/signout"
  };
  function navigateTo(route) {
    if (routes.hasOwnProperty(route)) {
      location.assign(routes[route]);
    } else {
      throw Error("The requested route does not exist: " + route);
    }
  }

  /**
   * Handle HTTP responses by providing handlers for HTTP status codes.
   *
   * The `handlers` object should have handlers for each status code you want
   * to handle (e.g. 200, 500) as well as a "default" handler for all other
   * cases.
   *
   * @param {object} handlers
   */

  function handleResponse(handlers) {
    handlers = _objectSpread({
      // eslint-disable-next-line no-console
      default: function _default(resp) {
        return console.error("Request failed", resp);
      }
    }, handlers);
    return function (response) {
      if (handlers.hasOwnProperty(response.status)) {
        return handlers[response.status](response);
      } else {
        return handlers.default(response);
      }
    };
  }

  var handlers = {
    201: function _() {
      document.getElementById("form").remove();
      document.getElementById("email-message").innerText = "Success! We sent you an email with a link to sign in.";
      window.setTimeout(function () {
        return navigateTo("/");
      }, 2000);
    },
    404: function _() {
      popupMessage({
        message: "It looks like you haven't created your Districtr account yet. " + '<a href="./register">Click here to create an account.</a>',
        raw: true
      });
    },
    default: function _default() {
      errorMessage("We're sorry. Signing in is currently unavailable.");
    }
  };

  function onSubmit(_ref) {
    var email = _ref.email;
    signInUser({
      email: email.value
    }).then(handleResponse(handlers)).catch(function () {
      errorMessage("We're having trouble accessing our sign-in service. " + "Are you connected to the internet?");
    });
  }

  function validate(_ref2) {
    var email = _ref2.email,
        submit = _ref2.submit;
    var valid = isEmail(email.value);
    submit.disabled = !valid;
    return valid;
  }

  function main() {
    createForm(["email", "submit"], "form", validate, onSubmit);
  }

  return main;

}));
