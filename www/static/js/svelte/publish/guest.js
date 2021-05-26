!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define("svelte/publish/guest",e):(t=t||self)["publish/guest"]=e()}(this,(function(){"use strict";function t(t,e,n){return t(n={path:e,exports:{},require:function(t,e){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==e&&n.path)}},n.exports),n.exports}var e=t((function(t){function e(n){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?t.exports=e=function(t){return typeof t}:t.exports=e=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(n)}t.exports=e}));var n=function(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t};function r(){}function o(t,e){for(var n in e)t[n]=e[n];return t}function i(t,e){t.appendChild(e)}function c(t,e,n){t.insertBefore(e,n)}function s(t){t.parentNode.removeChild(t)}function u(t,e){for(;t.nextSibling&&t.nextSibling!==e;)t.parentNode.removeChild(t.nextSibling)}function a(t,e){for(var n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function f(t){return document.createElement(t)}function l(t){return document.createTextNode(t)}function p(){return document.createComment("")}function d(t,e,n,r){t.addEventListener(e,n,r)}function h(t,e,n,r){t.removeEventListener(e,n,r)}function m(t,e,n){t.style.setProperty(e,n)}function v(t,e,n){t.classList[n?"add":"remove"](e)}function _(){return Object.create(null)}function g(t,n){return t!=t?n==n:t!==n||t&&"object"===e(t)||"function"==typeof t}function b(t,e){return t!=t?e==e:t!==e}function y(t,e){var n=t in this._handlers&&this._handlers[t].slice();if(n)for(var r=0;r<n.length;r+=1){var o=n[r];if(!o.__calling)try{o.__calling=!0,o.call(this,e)}finally{o.__calling=!1}}}function w(t){t._lock=!0,T(t._beforecreate),T(t._oncreate),T(t._aftercreate),t._lock=!1}function x(){return this._state}function O(t,e){t._handlers=_(),t._slots=_(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}function j(t,e){var n=this._handlers[t]||(this._handlers[t]=[]);return n.push(e),{cancel:function(){var t=n.indexOf(e);~t&&n.splice(t,1)}}}function T(t){for(;t&&t.length;)t.shift()()}var C={destroy:function(t){this.destroy=r,this.fire("destroy"),this.set=r,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:x,fire:y,on:j,set:function(t){this._set(o({},t)),this.root._lock||w(this.root)},_recompute:r,_set:function(t){var e=this._state,n={},r=!1;for(var i in t=o(this._staged,t),this._staged={},t)this._differs(t[i],e[i])&&(n[i]=r=!0);r&&(this._state=o(o({},e),t),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:e}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:e})))},_stage:function(t){o(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:g},E={};function S(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===t?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(E[t]=window.__dw.vis.meta.locale||{}):E[t]="core"===t?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[t])}function k(t){var e=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(t=t.trim(),E[n]||S(n),!E[n][t])return"MISSING:"+t;var r=E[n][t];return"string"==typeof r&&arguments.length>2&&(r=r.replace(/\$(\d)/g,(function(t,n){return n=2+Number(n),void 0===e[n]?t:e[n]}))),r}var P=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")},N=t((function(t){function e(n,r){return t.exports=e=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},e(n,r)}t.exports=e}));var L=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&N(t,e)};var R=function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t};var H=function(t,n){return!n||"object"!==e(n)&&"function"!=typeof n?R(t):n},U=t((function(t){function e(n){return t.exports=e=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},e(n)}t.exports=e}));var M=function(t){return-1!==Function.toString.call(t).indexOf("[native code]")};var D=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}},A=t((function(t){function e(n,r,o){return D()?t.exports=e=Reflect.construct:t.exports=e=function(t,e,n){var r=[null];r.push.apply(r,e);var o=new(Function.bind.apply(t,r));return n&&N(o,n.prototype),o},e.apply(null,arguments)}t.exports=e})),I=t((function(t){function e(n){var r="function"==typeof Map?new Map:void 0;return t.exports=e=function(t){if(null===t||!M(t))return t;if("function"!=typeof t)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(t))return r.get(t);r.set(t,e)}function e(){return A(t,arguments,U(this).constructor)}return e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),N(e,t)},e(n)}t.exports=e}));var q=function(t,e){if(null==t)return{};var n,r,o={},i=Object.keys(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||(o[n]=t[n]);return o};var F=function(t,e){if(null==t)return{};var n,r,o=q(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(o[n]=t[n])}return o},B=t((function(t,e){var n;n=function(){function t(){for(var t=0,e={};t<arguments.length;t++){var n=arguments[t];for(var r in n)e[r]=n[r]}return e}function e(t){return t.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent)}return function n(r){function o(){}function i(e,n,i){if("undefined"!=typeof document){"number"==typeof(i=t({path:"/"},o.defaults,i)).expires&&(i.expires=new Date(1*new Date+864e5*i.expires)),i.expires=i.expires?i.expires.toUTCString():"";try{var c=JSON.stringify(n);/^[\{\[]/.test(c)&&(n=c)}catch(t){}n=r.write?r.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=encodeURIComponent(String(e)).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent).replace(/[\(\)]/g,escape);var s="";for(var u in i)i[u]&&(s+="; "+u,!0!==i[u]&&(s+="="+i[u].split(";")[0]));return document.cookie=e+"="+n+s}}function c(t,n){if("undefined"!=typeof document){for(var o={},i=document.cookie?document.cookie.split("; "):[],c=0;c<i.length;c++){var s=i[c].split("="),u=s.slice(1).join("=");n||'"'!==u.charAt(0)||(u=u.slice(1,-1));try{var a=e(s[0]);if(u=(r.read||r)(u,a)||e(u),n)try{u=JSON.parse(u)}catch(t){}if(o[a]=u,t===a)break}catch(t){}}return t?o[t]:o}}return o.set=i,o.get=function(t){return c(t,!1)},o.getJSON=function(t){return c(t,!0)},o.remove=function(e,n){i(e,"",t(n,{expires:-1}))},o.defaults={},o.withConverter=n,o}((function(){}))},t.exports=n()}));function J(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=U(t);if(e){var o=U(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return H(this,n)}}function $(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function G(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?$(Object(r),!0).forEach((function(e){n(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):$(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}var X=new Set(["get","head","options","trace"]);function Z(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!e.fetch)try{e.fetch=window.fetch}catch(t){throw new Error("Neither options.fetch nor window.fetch is defined.")}if(!e.baseUrl)try{e.baseUrl="//".concat(window.dw.backend.__api_domain)}catch(t){throw new Error("Neither options.baseUrl nor window.dw is defined.")}var n,r=G(G({payload:null,raw:!1,method:"GET",mode:"cors",credentials:"include"},e),{},{headers:G({"Content-Type":"application/json"},e.headers)}),o=r.payload,i=r.baseUrl,c=r.fetch,s=r.raw,u=F(r,["payload","baseUrl","fetch","raw"]),a="".concat(i.replace(/\/$/,""),"/").concat(t.replace(/^\//,""));if(o&&(u.body=JSON.stringify(o)),X.has(u.method.toLowerCase()))n=c(a,u);else{var f=B.get("crumb");f?(u.headers["X-CSRF-Token"]=f,n=c(a,u)):n=Z("/v3/me",{fetch:c,baseUrl:i}).then((function(){var t=B.get("crumb");t&&(u.headers["X-CSRF-Token"]=t)})).catch((function(){})).then((function(){return c(a,u)}))}return n.then((function(t){if(s)return t;if(!t.ok)throw new Q(t);if(204===t.status||!t.headers.get("content-type"))return t;var e=t.headers.get("content-type").split(";")[0];return"application/json"===e?t.json():"image/png"===e||"application/pdf"===e?t.blob():t.text()}))}Z.get=K("GET"),Z.patch=K("PATCH"),Z.put=K("PUT");var z=Z.post=K("POST");Z.head=K("HEAD");function K(t){return function(e,n){if(n&&n.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(t.toLowerCase(),"()"));return Z(e,G(G({},n),{},{method:t}))}}Z.delete=K("DELETE");var Q=function(t){L(n,t);var e=J(n);function n(t){var r;return P(this,n),(r=e.call(this)).name="HttpReqError",r.status=t.status,r.statusText=t.statusText,r.message="[".concat(t.status,"] ").concat(t.statusText),r.response=t,r}return n}(I(Error));function V(t,e){var n;return{c:function(){(n=f("label")).className="control-label svelte-1nkiaxn"},m:function(t,r){c(t,n,r),n.innerHTML=e.label},p:function(t,e){t.label&&(n.innerHTML=e.label)},d:function(t){t&&s(n)}}}function W(t,e){var n;return{c:function(){(n=f("div")).className="help success svelte-1nkiaxn"},m:function(t,r){c(t,n,r),n.innerHTML=e.success},p:function(t,e){t.success&&(n.innerHTML=e.success)},d:function(t){t&&s(n)}}}function Y(t,e){var n;return{c:function(){(n=f("div")).className="help error svelte-1nkiaxn"},m:function(t,r){c(t,n,r),n.innerHTML=e.error},p:function(t,e){t.error&&(n.innerHTML=e.error)},d:function(t){t&&s(n)}}}function tt(t,e){var n;return{c:function(){(n=f("div")).className="help svelte-1nkiaxn"},m:function(t,r){c(t,n,r),n.innerHTML=e.help},p:function(t,e){t.help&&(n.innerHTML=e.help)},d:function(t){t&&s(n)}}}function et(t){var e,n,r,u,a,p,d,h,_,g,b,y,w;O(this,t),this._state=o({label:"",help:"",error:!1,success:!1,width:"auto"},t.data),this._intro=!0,this._slotted=t.slots||{},this._fragment=(e=this,n=this._state,_=e._slotted.default,g=n.label&&V(0,n),b=n.success&&W(0,n),y=n.error&&Y(0,n),w=!n.success&&!n.error&&n.help&&tt(0,n),{c:function(){r=f("div"),g&&g.c(),u=l("\n    "),a=f("div"),p=l("\n    "),b&&b.c(),d=l(" "),y&&y.c(),h=l(" "),w&&w.c(),a.className="form-controls svelte-1nkiaxn",r.className="form-block svelte-1nkiaxn",m(r,"width",n.width),v(r,"success",n.success),v(r,"error",n.error)},m:function(t,e){c(t,r,e),g&&g.m(r,null),i(r,u),i(r,a),_&&i(a,_),i(r,p),b&&b.m(r,null),i(r,d),y&&y.m(r,null),i(r,h),w&&w.m(r,null)},p:function(t,e){e.label?g?g.p(t,e):((g=V(0,e)).c(),g.m(r,u)):g&&(g.d(1),g=null),e.success?b?b.p(t,e):((b=W(0,e)).c(),b.m(r,d)):b&&(b.d(1),b=null),e.error?y?y.p(t,e):((y=Y(0,e)).c(),y.m(r,h)):y&&(y.d(1),y=null),e.success||e.error||!e.help?w&&(w.d(1),w=null):w?w.p(t,e):((w=tt(0,e)).c(),w.m(r,null)),t.width&&m(r,"width",e.width),t.success&&v(r,"success",e.success),t.error&&v(r,"error",e.error)},d:function(t){t&&s(r),g&&g.d(),_&&function(t,e){for(;t.firstChild;)e.appendChild(t.firstChild)}(a,_),b&&b.d(),y&&y.d(),w&&w.d()}}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function nt(t,e,n){return n?e?e(t):t:(t&&t.then||(t=Promise.resolve(t)),e?t.then(e):t)}function rt(){}o(et.prototype,C);var ot={createAccount:function(t){try{var e=this;return e.set({signedUp:!0}),n="Chart Editor",r="send-embed-code",window._paq&&window._paq.push(["trackEvent",n,r,o,i]),function(t){if(t&&t.then)return t.then(rt)}(function(t,e){try{var n=t()}catch(t){return e(t)}return n&&n.then?n.then(void 0,e):n}((function(){return nt(z("/v3/auth/signup",{payload:{email:t,invitation:!0,chartId:window.chart.get().id}}),(function(t){e.get().fromSvelte?(e.set({signedUp:!1,error:""}),e.store.set({user:t})):window.location.reload()}))}),(function(t){return function(t){var e=t();if(e&&e.then)return e.then(rt)}((function(){if("HttpReqError"===t.name)return nt(t.response.json(),(function(n){e.set({error:n.message||t})}));e.set({error:"Unknown error: ".concat(t)})}))})))}catch(t){return Promise.reject(t)}var n,r,o,i}};function it(t,e,n){var r=Object.create(t);return r.text=e[n],r}function ct(t,e,n){var r=Object.create(t);return r.text=e[n],r}function st(t,e){var n,o,i,u=k("publish / guest / h1"),a=k("publish / guest / p");return{c:function(){n=f("h2"),o=l("\n\n            "),i=f("p")},m:function(t,e){c(t,n,e),n.innerHTML=u,c(t,o,e),c(t,i,e),i.innerHTML=a},p:r,d:function(t){t&&(s(n),s(o),s(i))}}}function ut(t,e){for(var n,r=e.guest_text_above,o=[],i=0;i<r.length;i+=1)o[i]=at(t,ct(e,r,i));return{c:function(){for(var t=0;t<o.length;t+=1)o[t].c();n=p()},m:function(t,e){for(var r=0;r<o.length;r+=1)o[r].m(t,e);c(t,n,e)},p:function(e,i){if(e.guest_text_above){r=i.guest_text_above;for(var c=0;c<r.length;c+=1){var s=ct(i,r,c);o[c]?o[c].p(e,s):(o[c]=at(t,s),o[c].c(),o[c].m(n.parentNode,n))}for(;c<o.length;c+=1)o[c].d(1);o.length=r.length}},d:function(t){a(o,t),t&&s(n)}}}function at(t,e){var n,r,o=e.text;return{c:function(){n=f("noscript"),r=f("noscript")},m:function(t,e){c(t,n,e),n.insertAdjacentHTML("afterend",o),c(t,r,e)},p:function(t,e){t.guest_text_above&&o!==(o=e.text)&&(u(n,r),n.insertAdjacentHTML("afterend",o))},d:function(t){t&&(u(n,r),s(n),s(r))}}}function ft(t,e){for(var n,r=e.guest_text_below,o=[],i=0;i<r.length;i+=1)o[i]=lt(t,it(e,r,i));return{c:function(){for(var t=0;t<o.length;t+=1)o[t].c();n=p()},m:function(t,e){for(var r=0;r<o.length;r+=1)o[r].m(t,e);c(t,n,e)},p:function(e,i){if(e.guest_text_below){r=i.guest_text_below;for(var c=0;c<r.length;c+=1){var s=it(i,r,c);o[c]?o[c].p(e,s):(o[c]=lt(t,s),o[c].c(),o[c].m(n.parentNode,n))}for(;c<o.length;c+=1)o[c].d(1);o.length=r.length}},d:function(t){a(o,t),t&&s(n)}}}function lt(t,e){var n,r,o=e.text;return{c:function(){n=f("noscript"),r=f("noscript")},m:function(t,e){c(t,n,e),n.insertAdjacentHTML("afterend",o),c(t,r,e)},p:function(t,e){t.guest_text_below&&o!==(o=e.text)&&(u(n,r),n.insertAdjacentHTML("afterend",o))},d:function(t){t&&(u(n,r),s(n),s(r))}}}function pt(t,e){var n,r;return{c:function(){n=f("div"),r=l(e.error),n.className="alert alert-warning"},m:function(t,e){c(t,n,e),i(n,r)},p:function(t,e){t.error&&function(t,e){t.data=""+e}(r,e.error)},d:function(t){t&&s(n)}}}function dt(t){O(this,t),this._state=o({error:"",email:"",guest_text_above:[],guest_text_below:[],signedUp:!1},t.data),this._intro=!0,this._fragment=function(t,e){var n,r,o,u,a,p,v,_,g,b,y,w,x,O,j,T,C,E,S,P,N=!1,L=k("publish / guest / cta"),R=k("publish / guest / back");function H(t){return t.guest_text_above?ut:st}var U=H(e),M=U(t,e);function D(){N=!0,t.set({email:p.value}),N=!1}function A(n){t.createAccount(e.email)}var I={label:k("publish / guest / e-mail"),help:k("publish / guest / example-email")},q=new et({root:t.root,store:t.store,slots:{default:document.createDocumentFragment()},data:I}),F=e.guest_text_below&&ft(t,e),B=e.error&&pt(t,e);return{c:function(){var t,i,c;n=f("div"),r=f("div"),o=f("div"),M.c(),u=l("\n\n        "),a=f("div"),p=f("input"),v=l("\n\n                "),_=f("button"),g=f("i"),y=l("\n                      "),w=f("noscript"),q._fragment.c(),x=l("\n\n        "),F&&F.c(),O=l("\n\n        "),j=f("div"),T=f("button"),C=f("i"),E=l("   "),S=f("noscript"),P=l("\n\n            "),B&&B.c(),m(o,"margin-bottom","20px"),d(p,"input",D),t=p,i="type",null==(c="email")?t.removeAttribute(i):t.setAttribute(i,c),p.className="input-xlarge",g.className=b="fa "+(e.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"),d(_,"click",A),_.className="btn btn-save btn-primary",m(_,"white-space","nowrap"),m(_,"margin-left","10px"),m(a,"display","flex"),C.className="fa fa-chevron-left",T.className="btn btn-save btn-default btn-back",m(j,"margin-top","30px"),r.className="span5",n.className="row publish-signup"},m:function(t,s){c(t,n,s),i(n,r),i(r,o),M.m(o,null),i(r,u),i(q._slotted.default,a),i(a,p),p.value=e.email,i(a,v),i(a,_),i(_,g),i(_,y),i(_,w),w.insertAdjacentHTML("afterend",L),q._mount(r,null),i(r,x),F&&F.m(r,null),i(r,O),i(r,j),i(j,T),i(T,C),i(T,E),i(T,S),S.insertAdjacentHTML("afterend",R),i(j,P),B&&B.m(j,null)},p:function(n,i){U===(U=H(e=i))&&M?M.p(n,e):(M.d(1),(M=U(t,e)).c(),M.m(o,null)),!N&&n.email&&(p.value=e.email),n.signedUp&&b!==(b="fa "+(e.signedUp?"fa-circle-o-notch fa-spin":"fa-envelope"))&&(g.className=b),e.guest_text_below?F?F.p(n,e):((F=ft(t,e)).c(),F.m(r,O)):F&&(F.d(1),F=null),e.error?B?B.p(n,e):((B=pt(t,e)).c(),B.m(j,null)):B&&(B.d(1),B=null)},d:function(t){t&&s(n),M.d(),h(p,"input",D),h(_,"click",A),q.destroy(),F&&F.d(),B&&B.d()}}}(this,this._state),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),w(this))}function ht(t,e){this._handlers={},this._dependents=[],this._computed=_(),this._sortedComputedProperties=[],this._state=o({},t),this._differs=e&&e.immutable?b:g}return o(dt.prototype,C),o(dt.prototype,ot),o(ht.prototype,{_add:function(t,e){this._dependents.push({component:t,props:e})},_init:function(t){for(var e={},n=0;n<t.length;n+=1){var r=t[n];e["$"+r]=this._state[r]}return e},_remove:function(t){for(var e=this._dependents.length;e--;)if(this._dependents[e].component===t)return void this._dependents.splice(e,1)},_set:function(t,e){var n=this,r=this._state;this._state=o(o({},r),t);for(var i=0;i<this._sortedComputedProperties.length;i+=1)this._sortedComputedProperties[i].update(this._state,e);this.fire("state",{changed:e,previous:r,current:this._state}),this._dependents.filter((function(t){for(var r={},o=!1,i=0;i<t.props.length;i+=1){var c=t.props[i];c in e&&(r["$"+c]=n._state[c],o=!0)}if(o)return t.component._stage(r),!0})).forEach((function(t){t.component.set({})})),this.fire("update",{changed:e,previous:r,current:this._state})},_sortComputedProperties:function(){var t,e=this._computed,n=this._sortedComputedProperties=[],r=_();function o(i){var c=e[i];c&&(c.deps.forEach((function(e){if(e===t)throw new Error("Cyclical dependency detected between ".concat(e," <-> ").concat(i));o(e)})),r[i]||(r[i]=!0,n.push(c)))}for(var i in this._computed)o(t=i)},compute:function(t,e,n){var r,i=this,c={deps:e,update:function(o,c,s){var u=e.map((function(t){return t in c&&(s=!0),o[t]}));if(s){var a=n.apply(null,u);i._differs(a,r)&&(r=a,c[t]=!0,o[t]=r)}}};this._computed[t]=c,this._sortComputedProperties();var s=o({},this._state),u={};c.update(s,u,!0),this._set(s,u)},fire:y,get:x,on:j,set:function(t){var e=this._state,n=this._changed={},r=!1;for(var o in t){if(this._computed[o])throw new Error("'".concat(o,"' is a read-only computed property"));this._differs(t[o],e[o])&&(n[o]=r=!0)}r&&this._set(t,n)}}),{App:dt,store:new ht({})}}));
