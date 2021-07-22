!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("../../../../../../../../../../../../static/js/svelte/publish.js")):"function"==typeof define&&define.amd?define(["../../../../../../../../../../../../static/js/svelte/publish.js"],e):(t=t||self)["publish/sidebar"]=e(t.publish_js)}(this,(function(t){"use strict";function e(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function n(t,e,n){return t(n={path:e,exports:{},require:function(t,e){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==e&&n.path)}},n.exports),n.exports}var r=n((function(t){function e(n){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?(t.exports=e=function(t){return typeof t},t.exports.default=t.exports,t.exports.__esModule=!0):(t.exports=e=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t.exports.default=t.exports,t.exports.__esModule=!0),e(n)}t.exports=e,t.exports.default=t.exports,t.exports.__esModule=!0})),o=e(r),i=n((function(t){t.exports=function(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r},t.exports.default=t.exports,t.exports.__esModule=!0}));e(i);var s=n((function(t){t.exports=function(t){if(Array.isArray(t))return i(t)},t.exports.default=t.exports,t.exports.__esModule=!0}));e(s);var u=n((function(t){t.exports=function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)},t.exports.default=t.exports,t.exports.__esModule=!0}));e(u);var c=n((function(t){t.exports=function(t,e){if(t){if("string"==typeof t)return i(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?i(t,e):void 0}},t.exports.default=t.exports,t.exports.__esModule=!0}));e(c);var a=n((function(t){t.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")},t.exports.default=t.exports,t.exports.__esModule=!0}));e(a),e(n((function(t){t.exports=function(t){return s(t)||u(t)||c(t)||a()},t.exports.default=t.exports,t.exports.__esModule=!0})));var f=e(n((function(t){t.exports=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t},t.exports.default=t.exports,t.exports.__esModule=!0})));function l(){}function p(t,e){for(var n in e)t[n]=e[n];return t}function d(t,e){for(var n in e)t[n]=1;return t}function h(t,e){t.appendChild(e)}function _(t,e,n){t.insertBefore(e,n)}function m(t){t.parentNode.removeChild(t)}function v(t,e){for(;t.nextSibling&&t.nextSibling!==e;)t.parentNode.removeChild(t.nextSibling)}function b(t,e){for(var n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function g(t){return document.createElement(t)}function x(t){return document.createTextNode(t)}function y(){return document.createComment("")}function w(t,e,n,r){t.addEventListener(e,n,r)}function j(t,e,n,r){t.removeEventListener(e,n,r)}function M(t,e,n){t.style.setProperty(e,n)}function O(t,e,n){t.classList[n?"add":"remove"](e)}function T(){return Object.create(null)}function E(t){t._lock=!0,P(t._beforecreate),P(t._oncreate),P(t._aftercreate),t._lock=!1}function S(t,e){t._handlers=T(),t._slots=T(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function P(t){for(;t&&t.length;)t.shift()()}function L(){this.store._remove(this)}var N={destroy:function(t){this.destroy=l,this.fire("destroy"),this.set=l,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:function(){return this._state},fire:function(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var r=0;r<n.length;r+=1){var o=n[r];if(!o.__calling)try{o.__calling=!0,o.call(this,e)}finally{o.__calling=!1}}},on:function(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}},set:function(t){this._set(p({},t)),this.root._lock||E(this.root)},_recompute:l,_set:function(t){var e=this._state,n={},r=!1;for(var o in t=p(this._staged,t),this._staged={},t)this._differs(t[o],e[o])&&(n[o]=r=!0);r&&(this._state=p(p({},e),t),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:e}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:e})))},_stage:function(t){p(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:function(t,e){return t!=t?e==e:t!==e||t&&"object"===o(t)||"function"==typeof t}},k={};function C(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(k[t]=window.__dw.vis.meta.locale||{}):k[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function A(t){var e=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(t=t.trim(),k[n]||C(n),!k[n][t])return"MISSING:"+t;var r=k[n][t];return"string"==typeof r&&arguments.length>2&&(r=r.replace(/\$(\d)/g,(function(t,n){return n=2+Number(n),void 0===e[n]?t:e[n]}))),r}var H=e(n((function(t){t.exports=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},t.exports.default=t.exports,t.exports.__esModule=!0}))),R=n((function(t){function e(n,r){return t.exports=e=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},t.exports.default=t.exports,t.exports.__esModule=!0,e(n,r)}t.exports=e,t.exports.default=t.exports,t.exports.__esModule=!0}));e(R);var U=e(n((function(t){t.exports=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&R(t,e)},t.exports.default=t.exports,t.exports.__esModule=!0}))),D=n((function(t){t.exports=function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t},t.exports.default=t.exports,t.exports.__esModule=!0}));e(D);var I=e(n((function(t){var e=r.default;t.exports=function(t,n){return!n||"object"!==e(n)&&"function"!=typeof n?D(t):n},t.exports.default=t.exports,t.exports.__esModule=!0}))),q=n((function(t){function e(n){return t.exports=e=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},t.exports.default=t.exports,t.exports.__esModule=!0,e(n)}t.exports=e,t.exports.default=t.exports,t.exports.__esModule=!0})),B=e(q),F=n((function(t){t.exports=function(t){return-1!==Function.toString.call(t).indexOf("[native code]")},t.exports.default=t.exports,t.exports.__esModule=!0}));e(F);var $=n((function(t){t.exports=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}},t.exports.default=t.exports,t.exports.__esModule=!0}));e($);var G=n((function(t){function e(n,r,o){return $()?(t.exports=e=Reflect.construct,t.exports.default=t.exports,t.exports.__esModule=!0):(t.exports=e=function(t,e,n){var r=[null];r.push.apply(r,e);var o=new(Function.bind.apply(t,r));return n&&R(o,n.prototype),o},t.exports.default=t.exports,t.exports.__esModule=!0),e.apply(null,arguments)}t.exports=e,t.exports.default=t.exports,t.exports.__esModule=!0}));e(G);var J=e(n((function(t){function e(n){var r="function"==typeof Map?new Map:void 0;return t.exports=e=function(t){if(null===t||!F(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(t))return r.get(t);r.set(t,e)}function e(){return G(t,arguments,q(this).constructor)}return e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),R(e,t)},t.exports.default=t.exports,t.exports.__esModule=!0,e(n)}t.exports=e,t.exports.default=t.exports,t.exports.__esModule=!0}))),X=n((function(t){t.exports=function(t,e){if(null==t)return{};var n,r,o={},i=Object.keys(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||(o[n]=t[n]);return o},t.exports.default=t.exports,t.exports.__esModule=!0}));e(X);var Z=e(n((function(t){t.exports=function(t,e){if(null==t)return{};var n,r,o=X(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(o[n]=t[n])}return o},t.exports.default=t.exports,t.exports.__esModule=!0}))),z=n((function(t,e){var n;n=function(){function t(){for(var t=0,e={};t<arguments.length;t++){var n=arguments[t];for(var r in n)e[r]=n[r]}return e}function e(t){return t.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function o(){}function i(e,n,i){if("undefined"!=typeof document){"number"==typeof(i=t({path:"/"},o.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var s=JSON.stringify(n);/^[\{\[]/.test(s)&&(n=s)}catch(t){}n=r.write?r.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var u="";for(var c in i)i[c]&&(u+="; "+c,!0!==i[c]&&(u+="="+i[c].split(";")[0]));return document.cookie=e+"="+n+u}}function s(t,n){if("undefined"!=typeof document){for(var o={},i=document.cookie?document.cookie.split("; "):[],s=0;s<i.length;s++){var u=i[s].split("="),c=u.slice(1).join("=");n||'"'!==c.charAt(0)||(c=c.slice(1,-1));try{var a=e(u[0]);if(c=(r.read||r)(c,a)||e(c),n)try{c=JSON.parse(c)}catch(t){}if(o[a]=c,t===a)break}catch(t){}}return t?o[t]:o}}return o.set=i,o.get=function(t){return s(t,!1)},o.getJSON=function(t){return s(t,!0)},o.remove=function(e,n){i(e,"",t(n,{expires:-1}))},o.defaults={},o.withConverter=n,o}((function(){}))},t.exports=n()}));function K(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=B(t);if(e){var o=B(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return I(this,n)}}function Q(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function V(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?Q(Object(n),!0).forEach((function(e){f(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):Q(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}var W=new Set(["get","head","options","trace"]);function Y(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!e.fetch)try{e.fetch=window.fetch}catch(t){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!e.baseUrl)try{e.baseUrl="//".concat(window.dw.backend.__api_domain)}catch(t){throw new Error("Neither options.baseUrl nor window.dw is defined.")}var n,r=V(V({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},e),{},{headers:V({"Content-Type":"application/json"},e.headers)}),o=r.payload,i=r.baseUrl,s=r.fetch,u=r.raw,c=Z(r,["payload","baseUrl","fetch","raw"]),a="".concat(i.replace(/\/$/,""),"/").concat(t.replace(/^\//,""));if(o&&(c.body=JSON.stringify(o)),W.has(c.method.toLowerCase()))n=s(a,c);else{var f=z.get("crumb");f?(c.headers["X-CSRF-Token"]=f,n=s(a,c)):n=Y("/v3/me",{fetch:s,baseUrl:i}).then((function(){var t=z.get("crumb");t&&(c.headers["X-CSRF-Token"]=t)})).catch((function(){})).then((function(){return s(a,c)}))}return n.then((function(t){if(u)return t;if(!t.ok)throw new nt(t);if(204===t.status||!t.headers.get("content-type"))return t;var e=t.headers.get("content-type").split(";")[0];return"application/json"===e?t.json():"image/png"===e||"application/pdf"===e?t.blob():t.text()}))}Y.get=et("GET"),Y.patch=et("PATCH"),Y.put=et("PUT");var tt=Y.post=et("POST");Y.head=et("HEAD");function et(t){return function(e,n){if(n&&n.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(t.toLowerCase(),"()"));return Y(e,V(V({},n),{},{method:t}))}}Y.delete=et("DELETE");var nt=function(t){U(n,t);var e=K(n);function n(t){var r;return H(this,n),(r=e.call(this)).name="HttpReqError",r.status=t.status,r.statusText=t.statusText,r.message="[".concat(t.status,"] ").concat(t.statusText),r.response=t,r}return n}(J(Error));function rt(t,e){var n;return{c:function(){(n=g("label")).className="control-label svelte-1nkiaxn"},m:function(t,r){_(t,n,r),n.innerHTML=e.label},p:function(t,e){t.label&&(n.innerHTML=e.label)},d:function(t){t&&m(n)}}}function ot(t,e){var n;return{c:function(){(n=g("div")).className="help success svelte-1nkiaxn"},m:function(t,r){_(t,n,r),n.innerHTML=e.success},p:function(t,e){t.success&&(n.innerHTML=e.success)},d:function(t){t&&m(n)}}}function it(t,e){var n;return{c:function(){(n=g("div")).className="help error svelte-1nkiaxn"},m:function(t,r){_(t,n,r),n.innerHTML=e.error},p:function(t,e){t.error&&(n.innerHTML=e.error)},d:function(t){t&&m(n)}}}function st(t,e){var n;return{c:function(){(n=g("div")).className="help svelte-1nkiaxn"},m:function(t,r){_(t,n,r),n.innerHTML=e.help},p:function(t,e){t.help&&(n.innerHTML=e.help)},d:function(t){t&&m(n)}}}function ut(t){var e,n,r,o,i,s,u,c,a,f,l,d,v;S(this,t),this._state=p({label:"",help:"",error:!1,success:!1,width:"auto"},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=(e=this,n=this._state,a=e._slotted.default,f=n.label&&rt(0,n),l=n.success&&ot(0,n),d=n.error&&it(0,n),v=!n.success&&!n.error&&n.help&&st(0,n),{c:function(){r=g("div"),f&&f.c(),o=x("\n    "),i=g("div"),s=x("\n    "),l&&l.c(),u=x(" "),d&&d.c(),c=x(" "),v&&v.c(),i.className="form-controls svelte-1nkiaxn",r.className="form-block svelte-1nkiaxn",M(r,"width",n.width),O(r,"success",n.success),O(r,"error",n.error)},m:function(t,e){_(t,r,e),f&&f.m(r,null),h(r,o),h(r,i),a&&h(i,a),h(r,s),l&&l.m(r,null),h(r,u),d&&d.m(r,null),h(r,c),v&&v.m(r,null)},p:function(t,e){e.label?f?f.p(t,e):((f=rt(0,e)).c(),f.m(r,o)):f&&(f.d(1),f=null),e.success?l?l.p(t,e):((l=ot(0,e)).c(),l.m(r,u)):l&&(l.d(1),l=null),e.error?d?d.p(t,e):((d=it(0,e)).c(),d.m(r,c)):d&&(d.d(1),d=null),e.success||e.error||!e.help?v&&(v.d(1),v=null):v?v.p(t,e):((v=st(0,e)).c(),v.m(r,null)),t.width&&M(r,"width",e.width),t.success&&O(r,"success",e.success),t.error&&O(r,"error",e.error)},d:function(t){t&&m(r),f&&f.d(),a&&function(t,e){for(;t.firstChild;)e.appendChild(t.firstChild)}(i,a),l&&l.d(),d&&d.d(),v&&v.d()}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function ct(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}function at(){}p(ut.prototype,N);var ft={createAccount:function(t){try{var e=this;return e.set({signedUp:!0}),n="Chart Editor",r="send-embed-code",window._paq&&window._paq.push(["trackEvent",n,r,o,i]),function(t){if(t&&t.then)return t.then(at)}(function(t,e){try{var n=t()}catch(t){return e(t)}return n&&n.then?n.then(void 0,e):n}((function(){return ct(tt("/v3/auth/signup",{payload:{email:t,invitation:!0,chartId:window.chart.get().id}}),(function(t){e.get().fromSvelte?(e.set({signedUp:!1,error:""}),e.store.set({user:t})):window.location.reload()}))}),(function(t){return function(t){var e=t();if(e&&e.then)return e.then(at)}((function(){if("HttpReqError"===t.name)return ct(t.response.json(),(function(n){e.set({error:n.message||t})}));e.set({error:"Unknown error: ".concat(t)})}))})))}catch(t){return Promise.reject(t)}var n,r,o,i}};function lt(t,e,n){var r=Object.create(t);return r.text=e[n],r}function pt(t,e,n){var r=Object.create(t);return r.text=e[n],r}function dt(t,e){var n,r,o,i=A("publish / guest / h1"),s=A("publish / guest / p");return{c:function(){n=g("h2"),r=x("\n\n            "),o=g("p")},m:function(t,e){_(t,n,e),n.innerHTML=i,_(t,r,e),_(t,o,e),o.innerHTML=s},p:l,d:function(t){t&&(m(n),m(r),m(o))}}}function ht(t,e){for(var n,r=e.guest_text_above,o=[],i=0;i<r.length;i+=1)o[i]=_t(t,pt(e,r,i));return{c:function(){for(var t=0;t<o.length;t+=1)o[t].c();n=y()},m:function(t,e){for(var r=0;r<o.length;r+=1)o[r].m(t,e);_(t,n,e)},p:function(e,i){if(e.guest_text_above){r=i.guest_text_above;for(var s=0;s<r.length;s+=1){var u=pt(i,r,s);o[s]?o[s].p(e,u):(o[s]=_t(t,u),o[s].c(),o[s].m(n.parentNode,n))}for(;s<o.length;s+=1)o[s].d(1);o.length=r.length}},d:function(t){b(o,t),t&&m(n)}}}function _t(t,e){var n,r,o=e.text;return{c:function(){n=g("noscript"),r=g("noscript")},m:function(t,e){_(t,n,e),n.insertAdjacentHTML("afterend",o),_(t,r,e)},p:function(t,e){t.guest_text_above&&o!==(o=e.text)&&(v(n,r),n.insertAdjacentHTML("afterend",o))},d:function(t){t&&(v(n,r),m(n),m(r))}}}function mt(t,e){for(var n,r=e.guest_text_below,o=[],i=0;i<r.length;i+=1)o[i]=vt(t,lt(e,r,i));return{c:function(){for(var t=0;t<o.length;t+=1)o[t].c();n=y()},m:function(t,e){for(var r=0;r<o.length;r+=1)o[r].m(t,e);_(t,n,e)},p:function(e,i){if(e.guest_text_below){r=i.guest_text_below;for(var s=0;s<r.length;s+=1){var u=lt(i,r,s);o[s]?o[s].p(e,u):(o[s]=vt(t,u),o[s].c(),o[s].m(n.parentNode,n))}for(;s<o.length;s+=1)o[s].d(1);o.length=r.length}},d:function(t){b(o,t),t&&m(n)}}}function vt(t,e){var n,r,o=e.text;return{c:function(){n=g("noscript"),r=g("noscript")},m:function(t,e){_(t,n,e),n.insertAdjacentHTML("afterend",o),_(t,r,e)},p:function(t,e){t.guest_text_below&&o!==(o=e.text)&&(v(n,r),n.insertAdjacentHTML("afterend",o))},d:function(t){t&&(v(n,r),m(n),m(r))}}}function bt(t,e){var n,r;return{c:function(){n=g("div"),r=x(e.error),n.className="alert alert-warning"},m:function(t,e){_(t,n,e),h(n,r)},p:function(t,e){t.error&&function(t,e){t.data=""+e}(r,e.error)},d:function(t){t&&m(n)}}}function gt(t){S(this,t),this._state=p({error:"",email:"",guest_text_above:[],guest_text_below:[],signedUp:!1},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,o,i,s,u,c,a,f,l,p,d,v,b,y,O,T,E,S,P,L=!1,N=A("publish / guest / cta"),k=A("publish / guest / back");function C(t){return t.guest_text_above?ht:dt}var H=C(e),R=H(t,e);function U(){L=!0,t.set({email:u.value}),L=!1}function D(n){t.createAccount(e.email)}var I={label:A("publish / guest / e-mail"),help:A("publish / guest / example-email")},q=new ut({root:t.root,store:t.store,slots:{default:document.createDocumentFragment()},data:I}),B=e.guest_text_below&&mt(t,e),F=e.error&&bt(t,e);return{c:function(){var t,h,_;n=g("div"),r=g("div"),o=g("div"),R.c(),i=x("\n\n        "),s=g("div"),u=g("input"),c=x("\n\n                "),a=g("button"),f=g("i"),p=x("\n                      "),d=g("noscript"),q._fragment.c(),v=x("\n\n        "),B&&B.c(),b=x("\n\n        "),y=g("div"),O=g("button"),T=g("i"),E=x("   "),S=g("noscript"),P=x("\n\n            "),F&&F.c(),M(o,"margin-bottom","20px"),w(u,"input",U),t=u,h="type",null==(_="email")?t.removeAttribute(h):t.setAttribute(h,_),u.className="input-xlarge",f.className=l="fa "+(e.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"),w(a,"click",D),a.className="btn btn-save btn-primary",M(a,"white-space","nowrap"),M(a,"margin-left","10px"),M(s,"display","flex"),T.className="fa fa-chevron-left",O.className="btn btn-save btn-default btn-back",M(y,"margin-top","30px"),r.className="span5",n.className="row publish-signup"},m:function(t,l){_(t,n,l),h(n,r),h(r,o),R.m(o,null),h(r,i),h(q._slotted.default,s),h(s,u),u.value=e.email,h(s,c),h(s,a),h(a,f),h(a,p),h(a,d),d.insertAdjacentHTML("afterend",N),q._mount(r,null),h(r,v),B&&B.m(r,null),h(r,b),h(r,y),h(y,O),h(O,T),h(O,E),h(O,S),S.insertAdjacentHTML("afterend",k),h(y,P),F&&F.m(y,null)},p:function(n,i){H===(H=C(e=i))&&R?R.p(n,e):(R.d(1),(R=H(t,e)).c(),R.m(o,null)),!L&&n.email&&(u.value=e.email),n.signedUp&&l!==(l="fa "+(e.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"))&&(f.className=l),e.guest_text_below?B?B.p(n,e):((B=mt(t,e)).c(),B.m(r,b)):B&&(B.d(1),B=null),e.error?F?F.p(n,e):((F=bt(t,e)).c(),F.m(y,null)):F&&(F.d(1),F=null)},d:function(t){t&&m(n),R.d(),j(u,"input",U),j(a,"click",D),q.destroy(),B&&B.d(),F&&F.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),E(this))}function xt(){}p(gt.prototype,N),p(gt.prototype,ft);var yt={resendActivation:function(){try{var t=this;return t.set({status:"sending"}),function(t){if(t&&t.then)return t.then(xt)}(function(t,e){try{var n=t()}catch(t){return e(t)}return n&&n.then?n.then(void 0,e):n}((function(){return e=tt("/v3/auth/resend-activation"),n=function(){t.set({status:"success"})},r?n?n(e):e:(e&&e.then||(e=Promise.resolve(e)),n?e.then(n):e);var e,n,r}),(function(){t.set({status:"error"})})))}catch(t){return Promise.reject(t)}}};function wt(t,e){var n,r,o,i,s,u=A("publish / pending-activation / resend");function c(e){t.resendActivation()}return{c:function(){n=g("button"),r=g("i"),i=x("\n             \n            "),s=g("noscript"),r.className=o="fa "+("sending"==e.status?"fa-spin fa-circle-o-notch":"fa-envelope"),w(n,"click",c),n.className="btn btn-primary"},m:function(t,e){_(t,n,e),h(n,r),h(n,i),h(n,s),s.insertAdjacentHTML("afterend",u)},p:function(t,e){t.status&&o!==(o="fa "+("sending"==e.status?"fa-spin fa-circle-o-notch":"fa-envelope"))&&(r.className=o)},d:function(t){t&&m(n),j(n,"click",c)}}}function jt(t,e){var n,r=A("publish / pending-activation / resend-error");return{c:function(){n=g("p")},m:function(t,e){_(t,n,e),n.innerHTML=r},p:l,d:function(t){t&&m(n)}}}function Mt(t,e){var n,r=A("publish / pending-activation / resend-success");return{c:function(){n=g("p")},m:function(t,e){_(t,n,e),n.innerHTML=r},p:l,d:function(t){t&&m(n)}}}function Ot(t){S(this,t),this._state=p({status:""},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,o,i,s,u,c=A("publish / pending-activation / h1"),a=A("publish / pending-activation / p");function f(t){return"success"==t.status?Mt:"error"==t.status?jt:wt}var l=f(e),p=l(t,e);return{c:function(){n=g("div"),r=g("h2"),o=x("\n\n    "),i=g("p"),s=x("\n\n    "),u=g("div"),p.c(),M(u,"margin-top","20px")},m:function(t,e){_(t,n,e),h(n,r),r.innerHTML=c,h(n,o),h(n,i),i.innerHTML=a,h(n,s),h(n,u),p.m(u,null)},p:function(e,n){l===(l=f(n))&&p?p.p(e,n):(p.d(1),(p=l(t,n)).c(),p.m(u,null))},d:function(t){t&&m(n),p.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function Tt(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new Promise((function(n,r){var o=document.createElement("script");o.src=t,o.onload=function(){e&&e(),n()},o.onerror=r,document.body.appendChild(o)}))}function Et(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return"string"==typeof t&&(t={src:t}),t.parentElement&&"function"==typeof t.parentElement.appendChild||(t.parentElement=document.head),new Promise((function(n,r){var o=document.createElement("link");o.rel="stylesheet",o.href=t.src,o.onload=function(){e&&e(),n()},o.onerror=r,t.parentElement.appendChild(o)}))}function St(t){var e=this,n=t.current;if(t.changed.afterEmbed&&n.afterEmbed){var r=n.afterEmbed[0];Promise.all([Et(r.css),Tt(r.js)]).then((function(){require([r.module],(function(t){e.set({beforeExport:t.App})}))}))}}function Pt(e,n){var r={beforeExport:n.beforeExport,embed_templates:n.embedTemplates,embed_type:n.embedType,plugin_shareurls:n.pluginShareurls,shareurl_type:n.shareurlType},o=new t.Publish({root:e.root,store:e.store,data:r});return{c:function(){o._fragment.c()},m:function(t,e){o._mount(t,e)},p:function(t,e){var n={};t.beforeExport&&(n.beforeExport=e.beforeExport),t.embedTemplates&&(n.embed_templates=e.embedTemplates),t.embedType&&(n.embed_type=e.embedType),t.pluginShareurls&&(n.plugin_shareurls=e.pluginShareurls),t.shareurlType&&(n.shareurl_type=e.shareurlType),o._set(n)},d:function(t){o.destroy(t)}}}function Lt(t,e){var n=new Ot({root:t.root,store:t.store});return{c:function(){n._fragment.c()},m:function(t,e){n._mount(t,e)},p:l,d:function(t){n.destroy(t)}}}function Nt(t,e){var n={fromSvelte:"true",guest_text_above:e.guest_text_above,guest_text_below:e.guest_text_below},r=new gt({root:t.root,store:t.store,data:n});return{c:function(){r._fragment.c()},m:function(t,e){r._mount(t,e)},p:function(t,e){var n={};t.guest_text_above&&(n.guest_text_above=e.guest_text_above),t.guest_text_below&&(n.guest_text_below=e.guest_text_below),r._set(n)},d:function(t){r.destroy(t)}}}function kt(t){var e=this;S(this,t),this._state=p(p(this.store._init(["user"]),{embedTemplates:[],embedType:"responsive",pluginShareurls:[],shareurlType:"default",beforeExport:null,guest_text_above:"",guest_text_below:""}),t.data),this.store._add(this,["user"]),this._intro=!0,this._handlers.state=[St],this._handlers.destroy=[L],St.call(this,{changed:d({},this._state),current:this._state}),this._fragment=function(t,e){var n;function r(t){return t.$user.isGuest?Nt:t.$user.isActivated?Pt:Lt}var o=r(e),i=o(t,e);return{c:function(){n=g("div"),i.c()},m:function(t,e){_(t,n,e),i.m(n,null)},p:function(e,s){o===(o=r(s))&&i?i.p(e,s):(i.d(1),(i=o(t,s)).c(),i.m(n,null))},d:function(t){t&&m(n),i.d()}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),E(this))}function Ct(t,e,n){var r=e.bind(this);return n&&!1===n.init||r(this.get()[t]),this.on(n&&n.defer?"update":"state",(function(e){var n=e.changed,o=e.current,i=e.previous;n[t]&&r(o[t],i&&i[t])}))}function At(){var t=this;this.store.observe=Ct,this.store.observe("publishLogic",(function(e){e&&e.mod?(Et(e.css),Tt(e.src,(function(){require([e.mod],(function(n){t.set({PublishLogic:n.App}),t.refs.publish.set(e.data)}))}))):(t.set({PublishLogic:kt}),t.refs.publish.set(e.data))}))}function Ht(t){var e=this;S(this,t),this.refs={},this._state=p({PublishLogic:kt},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,o=e.PublishLogic;function i(e){return{root:t.root,store:t.store}}if(o)var s=new o(i());return{c:function(){n=g("div"),r=g("div"),s&&s._fragment.c(),r.className="publish-step is-published",n.className="dw-create-publish"},m:function(e,o){_(e,n,o),h(n,r),s&&(s._mount(r,null),t.refs.publish=s)},p:function(e,n){o!==(o=n.PublishLogic)&&(s&&s.destroy(),o?((s=new o(i()))._fragment.c(),s._mount(r,null),t.refs.publish=s):(s=null,t.refs.publish===s&&(t.refs.publish=null)))},d:function(t){t&&m(n),s&&s.destroy()}}}(this,this._state),this.root._oncreate.push((function(){At.call(e),e.fire("update",{changed:d({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),E(this))}return p(Ot.prototype,N),p(Ot.prototype,yt),p(kt.prototype,N),p(Ht.prototype,N),{PublishSidebar:Ht}}));
