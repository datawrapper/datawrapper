!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define("svelte/invite",e):(t=t||self).invite=e()}(this,(function(){"use strict";function t(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function e(t,e,r){return t(r={path:e,exports:{},require:function(t,e){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==e&&r.path)}},r.exports),r.exports}var r=e((function(t){function e(r){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?(t.exports=e=function(t){return typeof t},t.exports.default=t.exports,t.exports.__esModule=!0):(t.exports=e=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t.exports.default=t.exports,t.exports.__esModule=!0),e(r)}t.exports=e,t.exports.default=t.exports,t.exports.__esModule=!0})),o=t(r),n=e((function(t){t.exports=function(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,o=new Array(e);r<e;r++)o[r]=t[r];return o},t.exports.default=t.exports,t.exports.__esModule=!0}));t(n);var s=e((function(t){t.exports=function(t){if(Array.isArray(t))return n(t)},t.exports.default=t.exports,t.exports.__esModule=!0}));t(s);var a=e((function(t){t.exports=function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)},t.exports.default=t.exports,t.exports.__esModule=!0}));t(a);var i=e((function(t){t.exports=function(t,e){if(t){if("string"==typeof t)return n(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?n(t,e):void 0}},t.exports.default=t.exports,t.exports.__esModule=!0}));t(i);var c=e((function(t){t.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")},t.exports.default=t.exports,t.exports.__esModule=!0}));t(c),t(e((function(t){t.exports=function(t){return s(t)||a(t)||i(t)||c()},t.exports.default=t.exports,t.exports.__esModule=!0})));var p=t(e((function(t){t.exports=function(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t},t.exports.default=t.exports,t.exports.__esModule=!0})));function u(){}function d(t,e){for(var r in e)t[r]=e[r];return t}function f(t,e){t.appendChild(e)}function l(t,e,r){t.insertBefore(e,r)}function w(t){t.parentNode.removeChild(t)}function h(t){return document.createElement(t)}function v(t){return document.createTextNode(t)}function m(t,e,r,o){t.addEventListener(e,r,o)}function _(t,e,r,o){t.removeEventListener(e,r,o)}function g(t,e,r){null==r?t.removeAttribute(e):t.setAttribute(e,r)}function x(t,e,r){t.style.setProperty(e,r)}function y(t,e,r){t.classList[r?"add":"remove"](e)}function b(){return Object.create(null)}function S(t,e){return t!=t?e==e:t!==e||t&&"object"===o(t)||"function"==typeof t}function E(t,e){return t!=t?e==e:t!==e}function O(t,e){var r=t in this._handlers&&this._handlers[t].slice();if(r)for(var o=0;o<r.length;o+=1){var n=r[o];if(!n.__calling)try{n.__calling=!0,n.call(this,e)}finally{n.__calling=!1}}}function H(t){t._lock=!0,R(t._beforecreate),R(t._oncreate),R(t._aftercreate),t._lock=!1}function T(){return this._state}function k(t,e){t._handlers=b(),t._slots=b(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function M(t,e){var r=this._handlers[t]||(this._handlers[t]=[]);return r.push(e),{cancel:function(){var t=r.indexOf(e);~t&&r.splice(t,1)}}}function R(t){for(;t&&t.length;)t.shift()()}var j={destroy:function(t){this.destroy=u,this.fire("destroy"),this.set=u,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:T,fire:O,on:M,set:function(t){this._set(d({},t)),this.root._lock||H(this.root)},_recompute:u,_set:function(t){var e=this._state,r={},o=!1;for(var n in t=d(this._staged,t),this._staged={},t)this._differs(t[n],e[n])&&(r[n]=o=!0);o&&(this._state=d(d({},e),t),this._recompute(r,this._state),this._bind&&this._bind(r,this._state),this._fragment&&(this.fire("state",{changed:r,current:this._state,previous:e}),this._fragment.p(r,this._state),this.fire("update",{changed:r,current:this._state,previous:e})))},_stage:function(t){d(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:S},L={};function N(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(L[t]=window.__dw.vis.meta.locale||{}):L[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function P(t){var e=arguments,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(t=t.trim(),L[r]||N(r),!L[r][t])return"MISSING:"+t;var o=L[r][t];return"string"==typeof o&&arguments.length>2&&(o=o.replace(/\$(\d)/g,(function(t,r){return r=2+Number(r),void 0===e[r]?t:e[r]}))),o}var C=t(e((function(t){t.exports=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},t.exports.default=t.exports,t.exports.__esModule=!0}))),z=e((function(t){function e(r,o){return t.exports=e=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},t.exports.default=t.exports,t.exports.__esModule=!0,e(r,o)}t.exports=e,t.exports.default=t.exports,t.exports.__esModule=!0}));t(z);var q=t(e((function(t){t.exports=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&z(t,e)},t.exports.default=t.exports,t.exports.__esModule=!0}))),A=e((function(t){t.exports=function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t},t.exports.default=t.exports,t.exports.__esModule=!0}));t(A);var U=t(e((function(t){var e=r.default;t.exports=function(t,r){return!r||"object"!==e(r)&&"function"!=typeof r?A(t):r},t.exports.default=t.exports,t.exports.__esModule=!0}))),D=e((function(t){function e(r){return t.exports=e=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},t.exports.default=t.exports,t.exports.__esModule=!0,e(r)}t.exports=e,t.exports.default=t.exports,t.exports.__esModule=!0})),I=t(D),B=e((function(t){t.exports=function(t){return-1!==Function.toString.call(t).indexOf("[native code]")},t.exports.default=t.exports,t.exports.__esModule=!0}));t(B);var F=e((function(t){t.exports=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}},t.exports.default=t.exports,t.exports.__esModule=!0}));t(F);var $=e((function(t){function e(r,o,n){return F()?(t.exports=e=Reflect.construct,t.exports.default=t.exports,t.exports.__esModule=!0):(t.exports=e=function(t,e,r){var o=[null];o.push.apply(o,e);var n=new(Function.bind.apply(t,o));return r&&z(n,r.prototype),n},t.exports.default=t.exports,t.exports.__esModule=!0),e.apply(null,arguments)}t.exports=e,t.exports.default=t.exports,t.exports.__esModule=!0}));t($);var J=t(e((function(t){function e(r){var o="function"==typeof Map?new Map:void 0;return t.exports=e=function(t){if(null===t||!B(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==o){if(o.has(t))return o.get(t);o.set(t,e)}function e(){return $(t,arguments,D(this).constructor)}return e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),z(e,t)},t.exports.default=t.exports,t.exports.__esModule=!0,e(r)}t.exports=e,t.exports.default=t.exports,t.exports.__esModule=!0}))),G=e((function(t){t.exports=function(t,e){if(null==t)return{};var r,o,n={},s=Object.keys(t);for(o=0;o<s.length;o++)r=s[o],e.indexOf(r)>=0||(n[r]=t[r]);return n},t.exports.default=t.exports,t.exports.__esModule=!0}));t(G);var X=t(e((function(t){t.exports=function(t,e){if(null==t)return{};var r,o,n=G(t,e);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(t);for(o=0;o<s.length;o++)r=s[o],e.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(t,r)&&(n[r]=t[r])}return n},t.exports.default=t.exports,t.exports.__esModule=!0}))),V=e((function(t,e){var r;r=function(){function t(){for(var t=0,e={};t<arguments.length;t++){var r=arguments[t];for(var o in r)e[o]=r[o]}return e}function e(t){return t.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function r(o){function n(){}function s(e,r,s){if("undefined"!=typeof document){"number"==typeof(s=t({path:"/"},n.defaults,s)).expires&&(s.expires=new Date(1*new Date+864e5*s.expires)),s.expires=s.expires?s.expires.toUTCString():"";try{var a=JSON.stringify(r);/^[\{\[]/.test(a)&&(r=a)}catch(t){}r=o.write?o.write(r,e):encodeURIComponent(String(r)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var i="";for(var c in s)s[c]&&(i+="; "+c,!0!==s[c]&&(i+="="+s[c].split(";")[0]));return document.cookie=e+"="+r+i}}function a(t,r){if("undefined"!=typeof document){for(var n={},s=document.cookie?document.cookie.split("; "):[],a=0;a<s.length;a++){var i=s[a].split("="),c=i.slice(1).join("=");r||'"'!==c.charAt(0)||(c=c.slice(1,-1));try{var p=e(i[0]);if(c=(o.read||o)(c,p)||e(c),r)try{c=JSON.parse(c)}catch(t){}if(n[p]=c,t===p)break}catch(t){}}return t?n[t]:n}}return n.set=s,n.get=function(t){return a(t,!1)},n.getJSON=function(t){return a(t,!0)},n.remove=function(e,r){s(e,"",t(r,{expires:-1}))},n.defaults={},n.withConverter=r,n}((function(){}))},t.exports=r()}));function Z(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var r,o=I(t);if(e){var n=I(this).constructor;r=Reflect.construct(o,arguments,n)}else r=o.apply(this,arguments);return U(this,r)}}function K(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);e&&(o=o.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,o)}return r}function Q(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?K(Object(r),!0).forEach((function(e){p(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):K(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}var W=new Set(["get","head","options","trace"]);function Y(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!e.fetch)try{e.fetch=window.fetch}catch(t){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!e.baseUrl)try{e.baseUrl="//".concat(window.dw.backend.__api_domain)}catch(t){throw new Error("Neither options.baseUrl nor window.dw is defined.")}var r,o=Q(Q({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},e),{},{headers:Q({"Content-Type":"application/json"},e.headers)}),n=o.payload,s=o.baseUrl,a=o.fetch,i=o.raw,c=X(o,["payload","baseUrl","fetch","raw"]),p="".concat(s.replace(/\/$/,""),"/").concat(t.replace(/^\//,""));if(n&&(c.body=JSON.stringify(n)),W.has(c.method.toLowerCase()))r=a(p,c);else{var u=V.get("crumb");u?(c.headers["X-CSRF-Token"]=u,r=a(p,c)):r=Y("/v3/me",{fetch:a,baseUrl:s}).then((function(){var t=V.get("crumb");t&&(c.headers["X-CSRF-Token"]=t)})).catch((function(){})).then((function(){return a(p,c)}))}return r.then((function(t){if(i)return t;if(!t.ok)throw new rt(t);if(204===t.status||!t.headers.get("content-type"))return t;var e=t.headers.get("content-type").split(";")[0];return"application/json"===e?t.json():"image/png"===e||"application/pdf"===e?t.blob():t.text()}))}Y.get=tt("GET"),Y.patch=tt("PATCH"),Y.put=tt("PUT"),Y.post=tt("POST"),Y.head=tt("HEAD");function tt(t){return function(e,r){if(r&&r.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(t.toLowerCase(),"()"));return Y(e,Q(Q({},r),{},{method:t}))}}Y.delete=tt("DELETE");var et,rt=function(t){q(r,t);var e=Z(r);function r(t){var o;return C(this,r),(o=e.call(this)).name="HttpReqError",o.status=t.status,o.statusText=t.statusText,o.message="[".concat(t.status,"] ").concat(t.statusText),o.response=t,o}return r}(J(Error)),ot=!1;function nt(t){var e=t.password;return et?et(e):(!ot&&e.length>4&&(ot=!0,require(["zxcvbn"],(function(t){et=t}))),!1)}function st(t,e){var r,o=e.password.length>=8&&at();return{c:function(){o&&o.c(),r=document.createComment("")},m:function(t,e){o&&o.m(t,e),l(t,r,e)},p:function(t,e){e.password.length>=8?o||((o=at()).c(),o.m(r.parentNode,r)):o&&(o.d(1),o=null)},d:function(t){o&&o.d(t),t&&w(r)}}}function at(t,e){return{c:u,m:u,d:u}}function it(t){k(this,t),this._state=d({password:""},t.data),this._recompute({password:1,passwordStrength:1,passwordTooShort:1,passwordHelp:1},this._state),this._intro=!0,this._fragment=st(0,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function ct(){}function pt(t,e){if(!e)return t&&t.then?t.then(ct):Promise.resolve()}d(it.prototype,j),it.prototype._recompute=function(t,e){t.password&&(this._differs(e.passwordTooShort,e.passwordTooShort=e.password.length<8)&&(t.passwordTooShort=!0),this._differs(e.passwordStrength,e.passwordStrength=nt(e))&&(t.passwordStrength=!0)),(t.password||t.passwordStrength)&&this._differs(e.passwordHelp,e.passwordHelp=function(t){var e=t.password,r=t.passwordStrength;if(""===e||!r)return P("account / pwd-too-short").replace("%num",8);var o=["bad","weak","ok","good","excellent"][r.score];return P("account / password / ".concat(o))}(e))&&(t.passwordHelp=!0),(t.password||t.passwordTooShort||t.passwordStrength||t.passwordHelp)&&this._differs(e.passwordError,e.passwordError=function(t){var e=t.password,r=t.passwordTooShort,o=t.passwordStrength,n=t.passwordHelp;return!!e&&(r?P("account / pwd-too-short").replace("%num",8):!!(o&&o.score<2)&&n)}(e))&&(t.passwordError=!0),(t.passwordStrength||t.passwordHelp)&&this._differs(e.passwordSuccess,e.passwordSuccess=function(t){var e=t.passwordStrength,r=t.passwordHelp;return!!(e&&e.score>2)&&r}(e))&&(t.passwordSuccess=!0),(t.password||t.passwordTooShort)&&this._differs(e.passwordOk,e.passwordOk=function(t){var e=t.password,r=t.passwordTooShort;return e&&!r}(e))&&(t.passwordOk=!0)};var ut={doSignUp:function(){try{var t=this,e=window.location.pathname.split("/").pop(),r=t.get(),o=r.password,n=r.redirect,s=r.isPasswordReset;return t.set({loggingIn:!0}),function(t,e){return t&&t.then?t.then(e):e(t)}(function(t,e){try{var r=t()}catch(t){return e(t)}return r&&r.then?r.then(void 0,e):r}((function(){return r=function(){t.set({activateSuccess:"Password was set up successfully!"}),setTimeout((function(){window.location.href=n}),1e3)},(a=function(){return pt(s?Y.post("/v3/auth/change-password",{payload:{token:e,password:o}}):Y.post("/v3/auth/activate/".concat(e),{payload:{password:o}}))}())&&a.then?a.then(r):r(a);var r,a}),(function(e){return function(t){var e=t();if(e&&e.then)return e.then(ct)}((function(){if("HttpReqError"===e.name)return r=e.response.json(),o=function(r){t.set({activateError:r?r.message:e.message})},n?o?o(r):r:(r&&r.then||(r=Promise.resolve(r)),o?r.then(o):r);var r,o,n;t.set({activateError:e})}))})),(function(){t.set({loggingIn:!1})}))}catch(t){return Promise.reject(t)}}};function dt(t,e){var r,o,n,s,a,i,c,p,u,d,b,S,E,O,H,T,k,M,R,j,L,N,C,z,q,A,U,D,I,B,F=P("password"),$={},J=P("account / invite / password-clear-text");function G(e){t.set({windowHeight:this.innerHeight})}window.addEventListener("resize",G);var X=e.customLogo&&ft(t,e);function V(t){return t.clearText?wt:lt}var Z=V(e),K=Z(t,e),Q={};void 0!==e.password&&(Q.password=e.password,$.password=!0),void 0!==e.password&&(Q.passwordRepeat=e.password,$.passwordRepeat=!0),void 0!==e.passwordHelp&&(Q.passwordHelp=e.passwordHelp,$.passwordHelp=!0),void 0!==e.passwordSuccess&&(Q.passwordSuccess=e.passwordSuccess,$.passwordSuccess=!0),void 0!==e.passwordError&&(Q.passwordError=e.passwordError,$.passwordError=!0),void 0!==e.passwordRepeatError&&(Q.passwordRepeatError=e.passwordRepeatError,$.passwordRepeatError=!0),void 0!==e.passwordOk&&(Q.passwordOk=e.passwordOk,$.passwordOk=!0);var W=new it({root:t.root,store:t.store,data:Q,_bind:function(e,r){var o={};!$.password&&e.password&&(o.password=r.password),!$.passwordRepeat&&e.passwordRepeat&&(o.password=r.passwordRepeat),!$.passwordHelp&&e.passwordHelp&&(o.passwordHelp=r.passwordHelp),!$.passwordSuccess&&e.passwordSuccess&&(o.passwordSuccess=r.passwordSuccess),!$.passwordError&&e.passwordError&&(o.passwordError=r.passwordError),!$.passwordRepeatError&&e.passwordRepeatError&&(o.passwordRepeatError=r.passwordRepeatError),!$.passwordOk&&e.passwordOk&&(o.passwordOk=r.passwordOk),t._set(o),$={}}});function Y(t){return t.passwordError?mt:t.passwordSuccess?vt:t.passwordHelp?ht:void 0}t.root._beforecreate.push((function(){W._bind({password:1,passwordRepeat:1,passwordHelp:1,passwordSuccess:1,passwordError:1,passwordRepeatError:1,passwordOk:1},W.get())}));var tt=Y(e),et=tt&&tt(t,e);function rt(){t.set({clearText:R.checked})}var ot=e.activateError&&_t(t,e),nt=e.activateSuccess&&gt(t,e),st=e.email&&xt(t,e);function at(t){return t.signingUp?bt:yt}var ct=at(e),pt=ct(t,e);function ut(e){t.doSignUp()}function dt(){t.set({modalHeight:o.clientHeight})}return{c:function(){X&&X.c(),r=v("\n\n\n\n"),o=h("div"),n=h("div"),s=h("h3"),a=v("\n        "),i=h("p"),c=v("\n\n        "),p=h("div"),u=h("div"),d=h("div"),b=h("label"),S=v(F),E=v("\n                    "),K.c(),O=v("\n                    "),W._fragment.c(),H=v("\n                    "),et&&et.c(),T=v("\n            "),k=h("div"),M=h("label"),R=h("input"),j=v(" "),L=v(J),N=v("\n            "),ot&&ot.c(),C=v(" "),nt&&nt.c(),z=v(" "),st&&st.c(),q=v("\n\n        "),A=h("button"),U=h("noscript"),D=v("   "),pt.c(),s.className="svelte-1dqizzw",b.className="svelte-1dqizzw",d.className="controls",u.className="control-group svelte-1dqizzw",y(u,"warning",e.passwordError),y(u,"success",e.passwordSuccess),m(R,"change",rt),g(R,"type","checkbox"),R.className="pwd-clear",M.className="checkbox svelte-1dqizzw",k.className="control-group svelte-1dqizzw",p.className="login-form form-vertical",m(A,"click",ut),A.disabled=I=!e.passwordOk,A.className="btn btn-primary btn-large login",n.className="modal-body svelte-1dqizzw",t.root._aftercreate.push(dt),o.className="modal svelte-1dqizzw",x(o,"margin-top",e.marginTop+"px")},m:function(t,w){X&&X.m(t,w),l(t,r,w),l(t,o,w),f(o,n),f(n,s),s.innerHTML=e.headline,f(n,a),f(n,i),i.innerHTML=e.intro,f(n,c),f(n,p),f(p,u),f(u,d),f(d,b),f(b,S),f(d,E),K.m(d,null),f(d,O),W._mount(d,null),f(d,H),et&&et.m(d,null),f(p,T),f(p,k),f(k,M),f(M,R),R.checked=e.clearText,f(M,j),f(M,L),f(p,N),ot&&ot.m(p,null),f(p,C),nt&&nt.m(p,null),f(p,z),st&&st.m(p,null),f(n,q),f(n,A),f(A,U),U.insertAdjacentHTML("beforebegin",e.button),f(A,D),pt.m(A,null),B=function(t,e){"static"===getComputedStyle(t).position&&(t.style.position="relative");var r,o=document.createElement("object");return o.setAttribute("style","display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;"),o.type="text/html",o.onload=function(){(r=o.contentDocument.defaultView).addEventListener("resize",e)},/Trident/.test(navigator.userAgent)?(t.appendChild(o),o.data="about:blank"):(o.data="about:blank",t.appendChild(o)),{cancel:function(){r&&r.removeEventListener&&r.removeEventListener("resize",e),t.removeChild(o)}}}(o,dt)},p:function(n,a){(e=a).customLogo?X?X.p(n,e):((X=ft(t,e)).c(),X.m(r.parentNode,r)):X&&(X.d(1),X=null),n.headline&&(s.innerHTML=e.headline),n.intro&&(i.innerHTML=e.intro),Z===(Z=V(e))&&K?K.p(n,e):(K.d(1),(K=Z(t,e)).c(),K.m(d,O));var c={};!$.password&&n.password&&(c.password=e.password,$.password=void 0!==e.password),!$.passwordRepeat&&n.password&&(c.passwordRepeat=e.password,$.passwordRepeat=void 0!==e.password),!$.passwordHelp&&n.passwordHelp&&(c.passwordHelp=e.passwordHelp,$.passwordHelp=void 0!==e.passwordHelp),!$.passwordSuccess&&n.passwordSuccess&&(c.passwordSuccess=e.passwordSuccess,$.passwordSuccess=void 0!==e.passwordSuccess),!$.passwordError&&n.passwordError&&(c.passwordError=e.passwordError,$.passwordError=void 0!==e.passwordError),!$.passwordRepeatError&&n.passwordRepeatError&&(c.passwordRepeatError=e.passwordRepeatError,$.passwordRepeatError=void 0!==e.passwordRepeatError),!$.passwordOk&&n.passwordOk&&(c.passwordOk=e.passwordOk,$.passwordOk=void 0!==e.passwordOk),W._set(c),$={},tt===(tt=Y(e))&&et?et.p(n,e):(et&&et.d(1),(et=tt&&tt(t,e))&&et.c(),et&&et.m(d,null)),n.passwordError&&y(u,"warning",e.passwordError),n.passwordSuccess&&y(u,"success",e.passwordSuccess),n.clearText&&(R.checked=e.clearText),e.activateError?ot?ot.p(n,e):((ot=_t(t,e)).c(),ot.m(p,C)):ot&&(ot.d(1),ot=null),e.activateSuccess?nt?nt.p(n,e):((nt=gt(t,e)).c(),nt.m(p,z)):nt&&(nt.d(1),nt=null),e.email?st?st.p(n,e):((st=xt(t,e)).c(),st.m(p,null)):st&&(st.d(1),st=null),n.button&&(!function(t){for(;t.previousSibling;)t.parentNode.removeChild(t.previousSibling)}(U),U.insertAdjacentHTML("beforebegin",e.button)),ct!==(ct=at(e))&&(pt.d(1),(pt=ct(t,e)).c(),pt.m(A,null)),n.passwordOk&&I!==(I=!e.passwordOk)&&(A.disabled=I),n.marginTop&&x(o,"margin-top",e.marginTop+"px")},d:function(t){window.removeEventListener("resize",G),X&&X.d(t),t&&(w(r),w(o)),K.d(),W.destroy(),et&&et.d(),_(R,"change",rt),ot&&ot.d(),nt&&nt.d(),st&&st.d(),pt.d(),_(A,"click",ut),B.cancel()}}}function ft(t,e){var r,o,n;return{c:function(){r=h("div"),(o=h("img")).src=n="/static/custom/"+{customLogo:e.customLogo}+"}",x(o,"height","50px"),o.alt="logo",r.className="brand"},m:function(t,e){l(t,r,e),f(r,o)},p:function(t,e){t.customLogo&&n!==(n="/static/custom/"+{customLogo:e.customLogo}+"}")&&(o.src=n)},d:function(t){t&&w(r)}}}function lt(t,e){var r,o=!1;function n(){o=!0,t.set({password:r.value}),o=!1}return{c:function(){m(r=h("input"),"input",n),r.dataset.lpignore="true",r.className="login-pwd input-xlarge span3 svelte-1dqizzw",g(r,"type","password")},m:function(t,o){l(t,r,o),r.value=e.password},p:function(t,e){!o&&t.password&&(r.value=e.password)},d:function(t){t&&w(r),_(r,"input",n)}}}function wt(t,e){var r,o=!1;function n(){o=!0,t.set({password:r.value}),o=!1}return{c:function(){m(r=h("input"),"input",n),r.dataset.lpignore="true",r.className="login-pwd input-xlarge span3 svelte-1dqizzw",g(r,"type","text")},m:function(t,o){l(t,r,o),r.value=e.password},p:function(t,e){!o&&t.password&&(r.value=e.password)},d:function(t){t&&w(r),_(r,"input",n)}}}function ht(t,e){var r;return{c:function(){(r=h("p")).className="help muted svelte-1dqizzw"},m:function(t,o){l(t,r,o),r.innerHTML=e.passwordHelp},p:function(t,e){t.passwordHelp&&(r.innerHTML=e.passwordHelp)},d:function(t){t&&w(r)}}}function vt(t,e){var r;return{c:function(){(r=h("p")).className="help text-success svelte-1dqizzw"},m:function(t,o){l(t,r,o),r.innerHTML=e.passwordSuccess},p:function(t,e){t.passwordSuccess&&(r.innerHTML=e.passwordSuccess)},d:function(t){t&&w(r)}}}function mt(t,e){var r;return{c:function(){(r=h("p")).className="help text-warning svelte-1dqizzw"},m:function(t,o){l(t,r,o),r.innerHTML=e.passwordError},p:function(t,e){t.passwordError&&(r.innerHTML=e.passwordError)},d:function(t){t&&w(r)}}}function _t(t,e){var r;return{c:function(){(r=h("div")).className="alert alert-warning"},m:function(t,o){l(t,r,o),r.innerHTML=e.activateError},p:function(t,e){t.activateError&&(r.innerHTML=e.activateError)},d:function(t){t&&w(r)}}}function gt(t,e){var r;return{c:function(){(r=h("div")).className="alert alert-success"},m:function(t,o){l(t,r,o),r.innerHTML=e.activateSuccess},p:function(t,e){t.activateSuccess&&(r.innerHTML=e.activateSuccess)},d:function(t){t&&w(r)}}}function xt(t,e){var r,o=P("account / invite / your-login-is").replace("%s",'<span class="email"\n                    >'.concat(e.email,"</span\n                >"));return{c:function(){(r=h("div")).className="control-group login-help svelte-1dqizzw"},m:function(t,e){l(t,r,e),r.innerHTML=o},p:function(t,e){t.email&&o!==(o=P("account / invite / your-login-is").replace("%s",'<span class="email"\n                    >'.concat(e.email,"</span\n                >")))&&(r.innerHTML=o)},d:function(t){t&&w(r)}}}function yt(t,e){var r;return{c:function(){(r=h("i")).className="fa fa-fw fa-chevron-right"},m:function(t,e){l(t,r,e)},d:function(t){t&&w(r)}}}function bt(t,e){var r;return{c:function(){(r=h("i")).className="fa fa-fw fa-spinner fa-pulse"},m:function(t,e){l(t,r,e)},d:function(t){t&&w(r)}}}function St(t){k(this,t),this._state=d({redirect:"/",password:"",passwordOk:!1,passwordHelp:!1,passwordSuccess:!1,passwordError:!1,passwordRepeatError:!1,loggingIn:!1,activateSuccess:!1,activateError:!1,windowHeight:1e3,modalHeight:300,clearText:!1,headline:"",intro:"",email:"",button:"Set password",isPasswordReset:!1},t.data),this._state.windowHeight=window.innerHeight,this._recompute({windowHeight:1,modalHeight:1},this._state),this._intro=!0,this._fragment=dt(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),H(this))}function Et(t,e){this._handlers={},this._dependents=[],this._computed=b(),this._sortedComputedProperties=[],this._state=d({},t),this._differs=e&&e.immutable?E:S}d(St.prototype,j),d(St.prototype,ut),St.prototype._recompute=function(t,e){var r;(t.windowHeight||t.modalHeight)&&this._differs(e.marginTop,e.marginTop=.5*((r=e).windowHeight-r.modalHeight))&&(t.marginTop=!0)},d(Et.prototype,{_add:function(t,e){this._dependents.push({component:t,props:e})},_init:function(t){for(var e={},r=0;r<t.length;r+=1){var o=t[r];e["$"+o]=this._state[o]}return e},_remove:function(t){for(var e=this._dependents.length;e--;)if(this._dependents[e].component===t)return void this._dependents.splice(e,1)},_set:function(t,e){var r=this,o=this._state;this._state=d(d({},o),t);for(var n=0;n<this._sortedComputedProperties.length;n+=1)this._sortedComputedProperties[n].update(this._state,e);this.fire("state",{changed:e,previous:o,current:this._state}),this._dependents.filter((function(t){for(var o={},n=!1,s=0;s<t.props.length;s+=1){var a=t.props[s];a in e&&(o["$"+a]=r._state[a],n=!0)}if(n)return t.component._stage(o),!0})).forEach((function(t){t.component.set({})})),this.fire("update",{changed:e,previous:o,current:this._state})},_sortComputedProperties:function(){var t,e=this._computed,r=this._sortedComputedProperties=[],o=b();function n(s){var a=e[s];a&&(a.deps.forEach((function(e){if(e===t)throw new Error("Cyclical dependency detected between ".concat(e," <-> ").concat(s));n(e)})),o[s]||(o[s]=!0,r.push(a)))}for(var s in this._computed)n(t=s)},compute:function(t,e,r){var o,n=this,s={deps:e,update:function(s,a,i){var c=e.map((function(t){return t in a&&(i=!0),s[t]}));if(i){var p=r.apply(null,c);n._differs(p,o)&&(o=p,a[t]=!0,s[t]=o)}}};this._computed[t]=s,this._sortComputedProperties();var a=d({},this._state),i={};s.update(a,i,!0),this._set(a,i)},fire:O,get:T,on:M,set:function(t){var e=this._state,r=this._changed={},o=!1;for(var n in t){if(this._computed[n])throw new Error("'".concat(n,"' is a read-only computed property"));this._differs(t[n],e[n])&&(r[n]=o=!0)}o&&this._set(t,r)}});return{App:St,data:{},store:new Et({}),init:function(t){}}}));
