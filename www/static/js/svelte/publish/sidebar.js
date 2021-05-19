!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("../../../../../../../../../static/js/svelte/publish.js")):"function"==typeof define&&define.amd?define(["../../../../../../../../../static/js/svelte/publish.js"],e):(t=t||self)["publish/sidebar"]=e(t.publish_js)}(this,(function(t){"use strict";function e(t,e,n){return t(n={path:e,exports:{},require:function(t,e){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==e&&n.path)}},n.exports),n.exports}var n=e((function(t){function e(n){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?t.exports=e=function(t){return typeof t}:t.exports=e=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(n)}t.exports=e}));var r=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t};function o(){}function i(t,e){for(var n in e)t[n]=e[n];return t}function c(t,e){for(var n in e)t[n]=1;return t}function s(t,e){t.appendChild(e)}function u(t,e,n){t.insertBefore(e,n)}function a(t){t.parentNode.removeChild(t)}function f(t,e){for(;t.nextSibling&&t.nextSibling!==e;)t.parentNode.removeChild(t.nextSibling)}function l(t,e){for(var n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function p(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function h(){return document.createComment("")}function m(t,e,n,r){t.addEventListener(e,n,r)}function v(t,e,n,r){t.removeEventListener(e,n,r)}function _(t,e,n){t.style.setProperty(e,n)}function b(t,e,n){t.classList[n?"add":"remove"](e)}function g(){return Object.create(null)}function y(t){t._lock=!0,x(t._beforecreate),x(t._oncreate),x(t._aftercreate),t._lock=!1}function w(t,e){t._handlers=g(),t._slots=g(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function x(t){for(;t&&t.length;)t.shift()()}function j(){this.store._remove(this)}var T={destroy:function(t){this.destroy=o,this.fire("destroy"),this.set=o,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:function(){return this._state},fire:function(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var r=0;r<n.length;r+=1){var o=n[r];if(!o.__calling)try{o.__calling=!0,o.call(this,e)}finally{o.__calling=!1}}},on:function(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}},set:function(t){this._set(i({},t)),this.root._lock||y(this.root)},_recompute:o,_set:function(t){var e=this._state,n={},r=!1;for(var o in t=i(this._staged,t),this._staged={},t)this._differs(t[o],e[o])&&(n[o]=r=!0);r&&(this._state=i(i({},e),t),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:e}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:e})))},_stage:function(t){i(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:function(t,e){return t!=t?e==e:t!==e||t&&"object"===n(t)||"function"==typeof t}},O={};function E(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(O[t]=window.__dw.vis.meta.locale||{}):O[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function S(t){var e=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(t=t.trim(),O[n]||E(n),!O[n][t])return"MISSING:"+t;var r=O[n][t];return"string"==typeof r&&arguments.length>2&&(r=r.replace(/\$(\d)/g,(function(t,n){return n=2+Number(n),void 0===e[n]?t:e[n]}))),r}var P=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},L=e((function(t){function e(n,r){return t.exports=e=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},e(n,r)}t.exports=e}));var N=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&L(t,e)};var k=function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t};var C=function(t,e){return!e||"object"!==n(e)&&"function"!=typeof e?k(t):e},H=e((function(t){function e(n){return t.exports=e=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},e(n)}t.exports=e}));var M=function(t){return-1!==Function.toString.call(t).indexOf("[native code]")};var A=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}},R=e((function(t){function e(n,r,o){return A()?t.exports=e=Reflect.construct:t.exports=e=function(t,e,n){var r=[null];r.push.apply(r,e);var o=new(Function.bind.apply(t,r));return n&&L(o,n.prototype),o},e.apply(null,arguments)}t.exports=e})),U=e((function(t){function e(n){var r="function"==typeof Map?new Map:void 0;return t.exports=e=function(t){if(null===t||!M(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(t))return r.get(t);r.set(t,e)}function e(){return R(t,arguments,H(this).constructor)}return e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),L(e,t)},e(n)}t.exports=e}));var D=function(t,e){if(null==t)return{};var n,r,o={},i=Object.keys(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||(o[n]=t[n]);return o};var q=function(t,e){if(null==t)return{};var n,r,o=D(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(o[n]=t[n])}return o},I=e((function(t,e){var n;n=function(){function t(){for(var t=0,e={};t<arguments.length;t++){var n=arguments[t];for(var r in n)e[r]=n[r]}return e}function e(t){return t.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function o(){}function i(e,n,i){if("undefined"!=typeof document){"number"==typeof(i=t({path:"/"},o.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var c=JSON.stringify(n);/^[\{\[]/.test(c)&&(n=c)}catch(t){}n=r.write?r.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var s="";for(var u in i)i[u]&&(s+="; "+u,!0!==i[u]&&(s+="="+i[u].split(";")[0]));return document.cookie=e+"="+n+s}}function c(t,n){if("undefined"!=typeof document){for(var o={},i=document.cookie?document.cookie.split("; "):[],c=0;c<i.length;c++){var s=i[c].split("="),u=s.slice(1).join("=");n||'"'!==u.charAt(0)||(u=u.slice(1,-1));try{var a=e(s[0]);if(u=(r.read||r)(u,a)||e(u),n)try{u=JSON.parse(u)}catch(t){}if(o[a]=u,t===a)break}catch(t){}}return t?o[t]:o}}return o.set=i,o.get=function(t){return c(t,!1)},o.getJSON=function(t){return c(t,!0)},o.remove=function(e,n){i(e,"",t(n,{expires:-1}))},o.defaults={},o.withConverter=n,o}((function(){}))},t.exports=n()}));function F(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=H(t);if(e){var o=H(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return C(this,n)}}function B(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function G(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?B(Object(n),!0).forEach((function(e){r(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):B(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}var J=new Set(["get","head","options","trace"]);function $(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!e.fetch)try{e.fetch=window.fetch}catch(t){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!e.baseUrl)try{e.baseUrl="//".concat(window.dw.backend.__api_domain)}catch(t){throw new Error("Neither options.baseUrl nor window.dw is defined.")}var n,r=G(G({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},e),{},{headers:G({"Content-Type":"application/json"},e.headers)}),o=r.payload,i=r.baseUrl,c=r.fetch,s=r.raw,u=q(r,["payload","baseUrl","fetch","raw"]),a="".concat(i.replace(/\/$/,""),"/").concat(t.replace(/^\//,""));if(o&&(u.body=JSON.stringify(o)),J.has(u.method.toLowerCase()))n=c(a,u);else{var f=I.get("crumb");f?(u.headers["X-CSRF-Token"]=f,n=c(a,u)):n=$("/v3/me",{fetch:c,baseUrl:i}).then((function(){var t=I.get("crumb");t&&(u.headers["X-CSRF-Token"]=t)})).catch((function(){})).then((function(){return c(a,u)}))}return n.then((function(t){if(s)return t;if(!t.ok)throw new z(t);if(204===t.status||!t.headers.get("content-type"))return t;var e=t.headers.get("content-type").split(";")[0];return"application/json"===e?t.json():"image/png"===e||"application/pdf"===e?t.blob():t.text()}))}$.get=Z("GET"),$.patch=Z("PATCH"),$.put=Z("PUT");var X=$.post=Z("POST");$.head=Z("HEAD");function Z(t){return function(e,n){if(n&&n.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(t.toLowerCase(),"()"));return $(e,G(G({},n),{},{method:t}))}}$.delete=Z("DELETE");var z=function(t){N(n,t);var e=F(n);function n(t){var r;return P(this,n),(r=e.call(this)).name="HttpReqError",r.status=t.status,r.statusText=t.statusText,r.message="[".concat(t.status,"] ").concat(t.statusText),r.response=t,r}return n}(U(Error));function K(t,e){var n;return{c:function(){(n=p("label")).className="control-label svelte-1nkiaxn"},m:function(t,r){u(t,n,r),n.innerHTML=e.label},p:function(t,e){t.label&&(n.innerHTML=e.label)},d:function(t){t&&a(n)}}}function Q(t,e){var n;return{c:function(){(n=p("div")).className="help success svelte-1nkiaxn"},m:function(t,r){u(t,n,r),n.innerHTML=e.success},p:function(t,e){t.success&&(n.innerHTML=e.success)},d:function(t){t&&a(n)}}}function V(t,e){var n;return{c:function(){(n=p("div")).className="help error svelte-1nkiaxn"},m:function(t,r){u(t,n,r),n.innerHTML=e.error},p:function(t,e){t.error&&(n.innerHTML=e.error)},d:function(t){t&&a(n)}}}function W(t,e){var n;return{c:function(){(n=p("div")).className="help svelte-1nkiaxn"},m:function(t,r){u(t,n,r),n.innerHTML=e.help},p:function(t,e){t.help&&(n.innerHTML=e.help)},d:function(t){t&&a(n)}}}function Y(t){var e,n,r,o,c,f,l,h,m,v,g,y,x;w(this,t),this._state=i({label:"",help:"",error:!1,success:!1,width:"auto"},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=(e=this,n=this._state,m=e._slotted.default,v=n.label&&K(0,n),g=n.success&&Q(0,n),y=n.error&&V(0,n),x=!n.success&&!n.error&&n.help&&W(0,n),{c:function(){r=p("div"),v&&v.c(),o=d("\n    "),c=p("div"),f=d("\n    "),g&&g.c(),l=d(" "),y&&y.c(),h=d(" "),x&&x.c(),c.className="form-controls svelte-1nkiaxn",r.className="form-block svelte-1nkiaxn",_(r,"width",n.width),b(r,"success",n.success),b(r,"error",n.error)},m:function(t,e){u(t,r,e),v&&v.m(r,null),s(r,o),s(r,c),m&&s(c,m),s(r,f),g&&g.m(r,null),s(r,l),y&&y.m(r,null),s(r,h),x&&x.m(r,null)},p:function(t,e){e.label?v?v.p(t,e):((v=K(0,e)).c(),v.m(r,o)):v&&(v.d(1),v=null),e.success?g?g.p(t,e):((g=Q(0,e)).c(),g.m(r,l)):g&&(g.d(1),g=null),e.error?y?y.p(t,e):((y=V(0,e)).c(),y.m(r,h)):y&&(y.d(1),y=null),e.success||e.error||!e.help?x&&(x.d(1),x=null):x?x.p(t,e):((x=W(0,e)).c(),x.m(r,null)),t.width&&_(r,"width",e.width),t.success&&b(r,"success",e.success),t.error&&b(r,"error",e.error)},d:function(t){t&&a(r),v&&v.d(),m&&function(t,e){for(;t.firstChild;)e.appendChild(t.firstChild)}(c,m),g&&g.d(),y&&y.d(),x&&x.d()}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function tt(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}function et(){}i(Y.prototype,T);var nt={createAccount:function(t){try{var e=this;return e.set({signedUp:!0}),n="Chart Editor",r="send-embed-code",window._paq&&window._paq.push(["trackEvent",n,r,o,i]),function(t){if(t&&t.then)return t.then(et)}(function(t,e){try{var n=t()}catch(t){return e(t)}return n&&n.then?n.then(void 0,e):n}((function(){return tt(X("/v3/auth/signup",{payload:{email:t,invitation:!0,chartId:window.chart.get().id}}),(function(t){e.get().fromSvelte?(e.set({signedUp:!1,error:""}),e.store.set({user:t})):window.location.reload()}))}),(function(t){return function(t){var e=t();if(e&&e.then)return e.then(et)}((function(){if("HttpReqError"===t.name)return tt(t.response.json(),(function(n){e.set({error:n.message||t})}));e.set({error:"Unknown error: ".concat(t)})}))})))}catch(t){return Promise.reject(t)}var n,r,o,i}};function rt(t,e,n){var r=Object.create(t);return r.text=e[n],r}function ot(t,e,n){var r=Object.create(t);return r.text=e[n],r}function it(t,e){var n,r,i,c=S("publish / guest / h1"),s=S("publish / guest / p");return{c:function(){n=p("h2"),r=d("\n\n            "),i=p("p")},m:function(t,e){u(t,n,e),n.innerHTML=c,u(t,r,e),u(t,i,e),i.innerHTML=s},p:o,d:function(t){t&&(a(n),a(r),a(i))}}}function ct(t,e){for(var n,r=e.guest_text_above,o=[],i=0;i<r.length;i+=1)o[i]=st(t,ot(e,r,i));return{c:function(){for(var t=0;t<o.length;t+=1)o[t].c();n=h()},m:function(t,e){for(var r=0;r<o.length;r+=1)o[r].m(t,e);u(t,n,e)},p:function(e,i){if(e.guest_text_above){r=i.guest_text_above;for(var c=0;c<r.length;c+=1){var s=ot(i,r,c);o[c]?o[c].p(e,s):(o[c]=st(t,s),o[c].c(),o[c].m(n.parentNode,n))}for(;c<o.length;c+=1)o[c].d(1);o.length=r.length}},d:function(t){l(o,t),t&&a(n)}}}function st(t,e){var n,r,o=e.text;return{c:function(){n=p("noscript"),r=p("noscript")},m:function(t,e){u(t,n,e),n.insertAdjacentHTML("afterend",o),u(t,r,e)},p:function(t,e){t.guest_text_above&&o!==(o=e.text)&&(f(n,r),n.insertAdjacentHTML("afterend",o))},d:function(t){t&&(f(n,r),a(n),a(r))}}}function ut(t,e){for(var n,r=e.guest_text_below,o=[],i=0;i<r.length;i+=1)o[i]=at(t,rt(e,r,i));return{c:function(){for(var t=0;t<o.length;t+=1)o[t].c();n=h()},m:function(t,e){for(var r=0;r<o.length;r+=1)o[r].m(t,e);u(t,n,e)},p:function(e,i){if(e.guest_text_below){r=i.guest_text_below;for(var c=0;c<r.length;c+=1){var s=rt(i,r,c);o[c]?o[c].p(e,s):(o[c]=at(t,s),o[c].c(),o[c].m(n.parentNode,n))}for(;c<o.length;c+=1)o[c].d(1);o.length=r.length}},d:function(t){l(o,t),t&&a(n)}}}function at(t,e){var n,r,o=e.text;return{c:function(){n=p("noscript"),r=p("noscript")},m:function(t,e){u(t,n,e),n.insertAdjacentHTML("afterend",o),u(t,r,e)},p:function(t,e){t.guest_text_below&&o!==(o=e.text)&&(f(n,r),n.insertAdjacentHTML("afterend",o))},d:function(t){t&&(f(n,r),a(n),a(r))}}}function ft(t,e){var n,r;return{c:function(){n=p("div"),r=d(e.error),n.className="alert alert-warning"},m:function(t,e){u(t,n,e),s(n,r)},p:function(t,e){t.error&&function(t,e){t.data=""+e}(r,e.error)},d:function(t){t&&a(n)}}}function lt(t){w(this,t),this._state=i({error:"",email:"",guest_text_above:[],guest_text_below:[],signedUp:!1},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,o,i,c,f,l,h,b,g,y,w,x,j,T,O,E,P,L,N,k=!1,C=S("publish / guest / cta"),H=S("publish / guest / back");function M(t){return t.guest_text_above?ct:it}var A=M(e),R=A(t,e);function U(){k=!0,t.set({email:f.value}),k=!1}function D(n){t.createAccount(e.email)}var q={label:S("publish / guest / e-mail"),help:S("publish / guest / example-email")},I=new Y({root:t.root,store:t.store,slots:{default:document.createDocumentFragment()},data:q}),F=e.guest_text_below&&ut(t,e),B=e.error&&ft(t,e);return{c:function(){var t,s,u;n=p("div"),r=p("div"),o=p("div"),R.c(),i=d("\n\n        "),c=p("div"),f=p("input"),l=d("\n\n                "),h=p("button"),b=p("i"),y=d("\n                      "),w=p("noscript"),I._fragment.c(),x=d("\n\n        "),F&&F.c(),j=d("\n\n        "),T=p("div"),O=p("button"),E=p("i"),P=d("   "),L=p("noscript"),N=d("\n\n            "),B&&B.c(),_(o,"margin-bottom","20px"),m(f,"input",U),t=f,s="type",null==(u="email")?t.removeAttribute(s):t.setAttribute(s,u),f.className="input-xlarge",b.className=g="fa "+(e.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"),m(h,"click",D),h.className="btn btn-save btn-primary",_(h,"white-space","nowrap"),_(h,"margin-left","10px"),_(c,"display","flex"),E.className="fa fa-chevron-left",O.className="btn btn-save btn-default btn-back",_(T,"margin-top","30px"),r.className="span5",n.className="row publish-signup"},m:function(t,a){u(t,n,a),s(n,r),s(r,o),R.m(o,null),s(r,i),s(I._slotted.default,c),s(c,f),f.value=e.email,s(c,l),s(c,h),s(h,b),s(h,y),s(h,w),w.insertAdjacentHTML("afterend",C),I._mount(r,null),s(r,x),F&&F.m(r,null),s(r,j),s(r,T),s(T,O),s(O,E),s(O,P),s(O,L),L.insertAdjacentHTML("afterend",H),s(T,N),B&&B.m(T,null)},p:function(n,i){A===(A=M(e=i))&&R?R.p(n,e):(R.d(1),(R=A(t,e)).c(),R.m(o,null)),!k&&n.email&&(f.value=e.email),n.signedUp&&g!==(g="fa "+(e.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"))&&(b.className=g),e.guest_text_below?F?F.p(n,e):((F=ut(t,e)).c(),F.m(r,j)):F&&(F.d(1),F=null),e.error?B?B.p(n,e):((B=ft(t,e)).c(),B.m(T,null)):B&&(B.d(1),B=null)},d:function(t){t&&a(n),R.d(),v(f,"input",U),v(h,"click",D),I.destroy(),F&&F.d(),B&&B.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),y(this))}function pt(){}i(lt.prototype,T),i(lt.prototype,nt);var dt={resendActivation:function(){try{var t=this;return t.set({status:"sending"}),function(t){if(t&&t.then)return t.then(pt)}(function(t,e){try{var n=t()}catch(t){return e(t)}return n&&n.then?n.then(void 0,e):n}((function(){return e=X("/v3/auth/resend-activation"),n=function(){t.set({status:"success"})},r?n?n(e):e:(e&&e.then||(e=Promise.resolve(e)),n?e.then(n):e);var e,n,r}),(function(){t.set({status:"error"})})))}catch(t){return Promise.reject(t)}}};function ht(t,e){var n,r,o,i,c,f=S("publish / pending-activation / resend");function l(e){t.resendActivation()}return{c:function(){n=p("button"),r=p("i"),i=d("\n             \n            "),c=p("noscript"),r.className=o="fa "+("sending"==e.status?"fa-spin fa-circle-o-notch":"fa-envelope"),m(n,"click",l),n.className="btn btn-primary"},m:function(t,e){u(t,n,e),s(n,r),s(n,i),s(n,c),c.insertAdjacentHTML("afterend",f)},p:function(t,e){t.status&&o!==(o="fa "+("sending"==e.status?"fa-spin fa-circle-o-notch":"fa-envelope"))&&(r.className=o)},d:function(t){t&&a(n),v(n,"click",l)}}}function mt(t,e){var n,r=S("publish / pending-activation / resend-error");return{c:function(){n=p("p")},m:function(t,e){u(t,n,e),n.innerHTML=r},p:o,d:function(t){t&&a(n)}}}function vt(t,e){var n,r=S("publish / pending-activation / resend-success");return{c:function(){n=p("p")},m:function(t,e){u(t,n,e),n.innerHTML=r},p:o,d:function(t){t&&a(n)}}}function _t(t){w(this,t),this._state=i({status:""},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,o,i,c,f,l=S("publish / pending-activation / h1"),h=S("publish / pending-activation / p");function m(t){return"success"==t.status?vt:"error"==t.status?mt:ht}var v=m(e),b=v(t,e);return{c:function(){n=p("div"),r=p("h2"),o=d("\n\n    "),i=p("p"),c=d("\n\n    "),f=p("div"),b.c(),_(f,"margin-top","20px")},m:function(t,e){u(t,n,e),s(n,r),r.innerHTML=l,s(n,o),s(n,i),i.innerHTML=h,s(n,c),s(n,f),b.m(f,null)},p:function(e,n){v===(v=m(n))&&b?b.p(e,n):(b.d(1),(b=v(t,n)).c(),b.m(f,null))},d:function(t){t&&a(n),b.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function bt(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new Promise((function(n,r){var o=document.createElement("script");o.src=t,o.onload=function(){e&&e(),n()},o.onerror=r,document.body.appendChild(o)}))}function gt(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return"string"==typeof t&&(t={src:t}),t.parentElement&&"function"==typeof t.parentElement.appendChild||(t.parentElement=document.head),new Promise((function(n,r){var o=document.createElement("link");o.rel="stylesheet",o.href=t.src,o.onload=function(){e&&e(),n()},o.onerror=r,t.parentElement.appendChild(o)}))}function yt(t){var e=this,n=t.current;if(t.changed.afterEmbed&&n.afterEmbed){var r=n.afterEmbed[0];Promise.all([gt(r.css),bt(r.js)]).then((function(){require([r.module],(function(t){e.set({beforeExport:t.App})}))}))}}function wt(e,n){var r={beforeExport:n.beforeExport,embed_templates:n.embedTemplates,embed_type:n.embedType,plugin_shareurls:n.pluginShareurls,shareurl_type:n.shareurlType},o=new t.Publish({root:e.root,store:e.store,data:r});return{c:function(){o._fragment.c()},m:function(t,e){o._mount(t,e)},p:function(t,e){var n={};t.beforeExport&&(n.beforeExport=e.beforeExport),t.embedTemplates&&(n.embed_templates=e.embedTemplates),t.embedType&&(n.embed_type=e.embedType),t.pluginShareurls&&(n.plugin_shareurls=e.pluginShareurls),t.shareurlType&&(n.shareurl_type=e.shareurlType),o._set(n)},d:function(t){o.destroy(t)}}}function xt(t,e){var n=new _t({root:t.root,store:t.store});return{c:function(){n._fragment.c()},m:function(t,e){n._mount(t,e)},p:o,d:function(t){n.destroy(t)}}}function jt(t,e){var n={fromSvelte:"true",guest_text_above:e.guest_text_above,guest_text_below:e.guest_text_below},r=new lt({root:t.root,store:t.store,data:n});return{c:function(){r._fragment.c()},m:function(t,e){r._mount(t,e)},p:function(t,e){var n={};t.guest_text_above&&(n.guest_text_above=e.guest_text_above),t.guest_text_below&&(n.guest_text_below=e.guest_text_below),r._set(n)},d:function(t){r.destroy(t)}}}function Tt(t){var e=this;w(this,t),this._state=i(i(this.store._init(["user"]),{embedTemplates:[],embedType:"responsive",pluginShareurls:[],shareurlType:"default",beforeExport:null,guest_text_above:"",guest_text_below:""}),t.data),this.store._add(this,["user"]),this._intro=!0,this._handlers.state=[yt],this._handlers.destroy=[j],yt.call(this,{changed:c({},this._state),current:this._state}),this._fragment=function(t,e){var n;function r(t){return t.$user.isGuest?jt:t.$user.isActivated?wt:xt}var o=r(e),i=o(t,e);return{c:function(){n=p("div"),i.c()},m:function(t,e){u(t,n,e),i.m(n,null)},p:function(e,c){o===(o=r(c))&&i?i.p(e,c):(i.d(1),(i=o(t,c)).c(),i.m(n,null))},d:function(t){t&&a(n),i.d()}}}(this,this._state),this.root._oncreate.push((function(){e.fire("update",{changed:c({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),y(this))}function Ot(t,e,n){var r=e.bind(this);return n&&!1===n.init||r(this.get()[t]),this.on(n&&n.defer?"update":"state",(function(e){var n=e.changed,o=e.current,i=e.previous;n[t]&&r(o[t],i&&i[t])}))}function Et(){var t=this;this.store.observe=Ot,this.store.observe("publishLogic",(function(e){e&&e.mod?(gt(e.css),bt(e.src,(function(){require([e.mod],(function(n){t.set({PublishLogic:n.App}),t.refs.publish.set(e.data)}))}))):(t.set({PublishLogic:Tt}),t.refs.publish.set(e.data))}))}function St(t){var e=this;w(this,t),this.refs={},this._state=i({PublishLogic:Tt},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,o=e.PublishLogic;function i(e){return{root:t.root,store:t.store}}if(o)var c=new o(i());return{c:function(){n=p("div"),r=p("div"),c&&c._fragment.c(),r.className="publish-step is-published",n.className="dw-create-publish"},m:function(e,o){u(e,n,o),s(n,r),c&&(c._mount(r,null),t.refs.publish=c)},p:function(e,n){o!==(o=n.PublishLogic)&&(c&&c.destroy(),o?((c=new o(i()))._fragment.c(),c._mount(r,null),t.refs.publish=c):(c=null,t.refs.publish===c&&(t.refs.publish=null)))},d:function(t){t&&a(n),c&&c.destroy()}}}(this,this._state),this.root._oncreate.push((function(){Et.call(e),e.fire("update",{changed:c({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),y(this))}return i(_t.prototype,T),i(_t.prototype,dt),i(Tt.prototype,T),i(St.prototype,T),{PublishSidebar:St}}));
