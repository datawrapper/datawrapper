!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define("svelte/publish_old",t):(e=e||self).publish=t()}(this,(function(){"use strict";function e(e,t,n){return e(n={path:t,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==t&&n.path)}},n.exports),n.exports}var t=e((function(e){function t(n){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?e.exports=t=function(e){return typeof e}:e.exports=t=function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},t(n)}e.exports=t}));var n=function(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e};function r(){}function i(e,t){for(var n in t)e[n]=t[n];return e}function s(e,t){for(var n in t)e[n]=1;return e}function a(e,t){e.appendChild(t)}function o(e,t,n){e.insertBefore(t,n)}function u(e){e.parentNode.removeChild(e)}function c(e){for(;e.nextSibling;)e.parentNode.removeChild(e.nextSibling)}function l(e,t){for(var n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function p(){return document.createDocumentFragment()}function h(e){return document.createElement(e)}function d(e){return document.createTextNode(e)}function f(e,t,n,r){e.addEventListener(t,n,r)}function b(e,t,n,r){e.removeEventListener(t,n,r)}function m(e,t,n){null==n?e.removeAttribute(t):e.setAttribute(t,n)}function _(e,t){e.data=""+t}function g(e,t,n){e.style.setProperty(t,n)}function v(e,t,n){e.classList[n?"add":"remove"](t)}function w(){return Object.create(null)}function y(e,n){return e!=e?n==n:e!==n||e&&"object"===t(e)||"function"==typeof e}function N(e,t){return e!=e?t==t:e!==t}function x(e,t){var n=e in this._handlers&&this._handlers[e].slice();if(n)for(var r=0;r<n.length;r+=1){var i=n[r];if(!i.__calling)try{i.__calling=!0,i.call(this,t)}finally{i.__calling=!1}}}function O(e){e._lock=!0,S(e._beforecreate),S(e._oncreate),S(e._aftercreate),e._lock=!1}function T(){return this._state}function j(e,t){e._handlers=w(),e._slots=w(),e._bind=t._bind,e._staged={},e.options=t,e.root=t.root||e,e.store=t.store||e.root.store,t.root||(e._beforecreate=[],e._oncreate=[],e._aftercreate=[])}function k(e,t){var n=this._handlers[e]||(this._handlers[e]=[]);return n.push(t),{cancel:function(){var e=n.indexOf(t);~e&&n.splice(e,1)}}}function S(e){for(;e&&e.length;)e.shift()()}var E={destroy:function(e){this.destroy=r,this.fire("destroy"),this.set=r,this._fragment.d(!1!==e),this._fragment=null,this._state={}},get:T,fire:x,on:k,set:function(e){this._set(i({},e)),this.root._lock||O(this.root)},_recompute:r,_set:function(e){var t=this._state,n={},r=!1;for(var s in e=i(this._staged,e),this._staged={},e)this._differs(e[s],t[s])&&(n[s]=r=!0);r&&(this._state=i(i({},t),e),this._recompute(n,this._state),this._bind&&this._bind(n,this._state),this._fragment&&(this.fire("state",{changed:n,current:this._state,previous:t}),this._fragment.p(n,this._state),this.fire("update",{changed:n,current:this._state,previous:t})))},_stage:function(e){i(this._staged,e)},_mount:function(e,t){this._fragment[this._fragment.i?"i":"m"](e,t||null)},_differs:y};var C={show:function(){var e=this,t=setTimeout((function(){e.set({visible:!0})}),400);this.set({t:t})},hide:function(){var e=this.get().t;clearTimeout(e),this.set({visible:!1})}};function L(e,t){var n,r,i,s,c=e._slotted.default;return{c:function(){n=h("div"),r=h("i"),i=d("\n        "),r.className="hat-icon im im-graduation-hat svelte-19xfki7",n.className="content svelte-19xfki7"},m:function(e,t){o(e,n,t),a(n,r),a(n,i),c&&(a(n,s||(s=document.createComment(""))),a(n,c))},d:function(e){e&&u(n),c&&function(e,t){for(;e.nextSibling;)t.appendChild(e.nextSibling)}(s,c)}}}function M(e){j(this,e),this._state=i({visible:!1},e.data),this._intro=!0,this._slotted=e.slots||{},this._fragment=function(e,t){var n,r,i,s=t.visible&&L(e);function c(t){e.show()}function l(t){e.hide()}return{c:function(){n=h("div"),(r=h("span")).textContent="?",i=d("\n    "),s&&s.c(),r.className="help-icon svelte-19xfki7",f(n,"mouseenter",c),f(n,"mouseleave",l),n.className="help svelte-19xfki7"},m:function(e,t){o(e,n,t),a(n,r),a(n,i),s&&s.m(n,null)},p:function(t,r){r.visible?s||((s=L(e)).c(),s.m(n,null)):s&&(s.d(1),s=null)},d:function(e){e&&u(n),s&&s.d(),b(n,"mouseenter",c),b(n,"mouseleave",l)}}}(this,this._state),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor))}i(M.prototype,E),i(M.prototype,C);var P={};function H(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===e?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(P[e]=window.__dw.vis.meta.locale||{}):P[e]="core"===e?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[e])}function U(e){var t=arguments,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(e=e.trim(),P[n]||H(n),!P[n][e])return"MISSING:"+e;var r=P[n][e];return"string"==typeof r&&arguments.length>2&&(r=r.replace(/\$(\d)/g,(function(e,n){return n=2+Number(n),void 0===t[n]?e:t[n]}))),r}var D=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")};var A=function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e};var G=function(e,n){return!n||"object"!==t(n)&&"function"!=typeof n?A(e):n},I=e((function(e){function t(n){return e.exports=t=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)},t(n)}e.exports=t})),R=e((function(e){function t(n,r){return e.exports=t=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},t(n,r)}e.exports=t}));var q=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&R(e,t)};var F=function(e){return-1!==Function.toString.call(e).indexOf("[native code]")};var W=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}},$=e((function(e){function t(n,r,i){return W()?e.exports=t=Reflect.construct:e.exports=t=function(e,t,n){var r=[null];r.push.apply(r,t);var i=new(Function.bind.apply(e,r));return n&&R(i,n.prototype),i},t.apply(null,arguments)}e.exports=t})),B=e((function(e){function t(n){var r="function"==typeof Map?new Map:void 0;return e.exports=t=function(e){if(null===e||!F(e))return e;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(e))return r.get(e);r.set(e,t)}function t(){return $(e,arguments,I(this).constructor)}return t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),R(t,e)},t(n)}e.exports=t}));var J=function(e,t){if(null==e)return{};var n,r,i={},s=Object.keys(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||(i[n]=e[n]);return i};var V=function(e,t){if(null==e)return{};var n,r,i=J(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i};function z(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function K(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?z(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):z(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function Q(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=K({payload:null,raw:!1,method:"GET",baseUrl:"//".concat(dw.backend.__api_domain),mode:"cors",credentials:"include"},t,{headers:K({"Content-Type":"application/json"},t.headers)}),r=n.payload,i=n.baseUrl,s=n.raw,a=V(n,["payload","baseUrl","raw"]),o="".concat(i.replace(/\/$/,""),"/").concat(e.replace(/^\//,""));return r&&(a.body=JSON.stringify(r)),window.fetch(o,a).then((function(e){if(s)return e;if(!e.ok)throw new Y(e);if(204===e.status||!e.headers.get("content-type"))return e;var t=e.headers.get("content-type").split(";")[0];return"application/json"===t?e.json():"image/png"===t||"application/pdf"===t?e.blob():e.text()}))}Q.get=X("GET"),Q.patch=X("PATCH"),Q.put=X("PUT"),Q.post=X("POST"),Q.head=X("HEAD");function X(e){return function(t,n){if(n&&n.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(e.toLowerCase(),"()"));return Q(t,K({},n,{method:e}))}}Q.delete=X("DELETE");var Y=function(e){function t(e){var n;return D(this,t),(n=G(this,I(t).call(this))).name="HttpReqError",n.status=e.status,n.statusText=e.statusText,n.message="[".concat(e.status,"] ").concat(e.statusText),n.response=e,n}return q(t,e),t}(B(Error));function Z(e,t,n,r){window._paq&&window._paq.push(["trackEvent",e,t,n,r])}var ee=[100,200,300,400,500,700,800,900,1e3];var te=!0;var ne={publish:function(){var e=this,t=this;if(window.chart.save){var n,r,i,s,a,o=t.get().chart;t.set({publishing:!0,publishStarted:(new Date).getTime(),now:(new Date).getTime(),progress:[],publish_error:!1}),o.metadata.publish["embed-heights"]=(t.get().embed_templates,n={},r=window.$,i=r(r("#iframe-vis")[0].contentDocument),s=r("h1",i).height()+r(".chart-intro",i).height()+r(".dw-chart-notes",i).height(),a=r("#iframe-vis").height(),ee.forEach((function(e){i.find("h1,.chart-intro,.dw-chart-notes").css("width",e+"px");var t=r("h1",i).height()+r(".chart-intro",i).height()+r(".dw-chart-notes",i).height();n[e]=a+(t-s)})),i.find("h1,.chart-intro,.dw-chart-notes").css("width","auto"),n),t.set({chart:o}),Z("Chart Editor","publish"),window.chart.attributes(o).save().then((function(n){e.set({statusUrl:"/v3/charts/".concat(o.id,"/publish/status/").concat(o.publicVersion)}),Q.post("/v3/charts/".concat(o.id,"/publish")).then((function(n){e.set({published:!0,progress:["done"]}),Q.get("/v3/charts/".concat(o.id)).then((function(e){Z("Chart Editor","publish-success"),t.publishFinished(e)}))})).catch((function(e){Z("Chart Editor","publish-error",e.message)})),setTimeout((function(){t.get().publishing&&t.updateStatus()}),1e3)}))}else setTimeout((function(){t.publish()}),100)},updateStatus:function(){var e=this,t=this.get().statusUrl;t&&Q.get(t).then((function(t){e.set({progress:t.progress||[],now:(new Date).getTime()}),e.get().publishing&&setTimeout((function(){e.updateStatus()}),500)}))},publishFinished:function(e){var t=this;this.set({progress:["done"],published:!0,publishStarted:0,needs_republish:!1}),setTimeout((function(){return t.set({publishing:!1})}),1e3),this.set({chart:e}),window.parent.postMessage({source:"datawrapper",type:"chart-publish",chartId:e.id},"*"),window.chart.attributes(e)},copy:function(e){var t=this;t.refs.embedInput.select();try{document.execCommand("copy")&&(Z("Chart Editor","embedcode-copy"),t.set({copy_success:!0}),setTimeout((function(){return t.set({copy_success:!1})}),300))}catch(e){}}};function re(e){var t=e.changed,n=e.current,r=window.dw&&window.dw.backend&&window.dw.backend.setUserData;if(t.embed_type&&r){var i=window.dw.backend.__userData;if(!n.embed_type||!i)return;i.embed_type=n.embed_type,window.dw.backend.setUserData(i)}if(t.shareurl_type&&r){var s=window.dw.backend.__userData;if(!n.shareurl_type||!s)return;s.shareurl_type=n.shareurl_type,window.dw.backend.setUserData(s)}t.published&&window.document.querySelector(".dw-create-publish .publish-step").classList[n.published?"add":"remove"]("is-published"),t.auto_publish&&n.auto_publish&&te&&(this.publish(),te=!1,window.history.replaceState("","",window.location.pathname))}function ie(e,t,n){var r=Object.create(e);return r.tpl=t[n],r}function se(e,t,n){var r=Object.create(e);return r.tpl=t[n],r}function ae(e,t,n){var r=Object.create(e);return r.tpl=t[n],r}function oe(e,t,n){var r=Object.create(e);return r.step=t[n],r.i=n,r}function ue(e,t){var n,r=U("publish / publish-intro");return{c:function(){g(n=h("p"),"margin-bottom","20px")},m:function(e,t){o(e,n,t),n.innerHTML=r},d:function(e){e&&u(n)}}}function ce(e,t){var n,r=U("publish / republish-intro");return{c:function(){n=h("p")},m:function(e,t){o(e,n,t),n.innerHTML=r},d:function(e){e&&u(n)}}}function le(e,t){var n,r,i,s,c,l,p=U("publish / publish-btn");return{c:function(){n=h("span"),r=h("i"),s=d("\n        "),c=h("span"),l=d(p),r.className=i="fa fa-fw "+(t.publishing?"fa-refresh fa-spin":"fa-cloud-upload")+" svelte-1wigpa8",c.className="title svelte-1wigpa8",n.className="publish"},m:function(e,t){o(e,n,t),a(n,r),a(n,s),a(n,c),a(c,l)},p:function(e,t){e.publishing&&i!==(i="fa fa-fw "+(t.publishing?"fa-refresh fa-spin":"fa-cloud-upload")+" svelte-1wigpa8")&&(r.className=i)},d:function(e){e&&u(n)}}}function pe(e,t){var n,r,i,s,c,l,p=U("publish / republish-btn");return{c:function(){n=h("span"),r=h("i"),s=d(" "),c=h("span"),l=d(p),r.className=i="fa fa-fw fa-refresh "+(t.publishing?"fa-spin":"")+" svelte-1wigpa8",c.className="title svelte-1wigpa8",n.className="re-publish"},m:function(e,t){o(e,n,t),a(n,r),a(n,s),a(n,c),a(c,l)},p:function(e,t){e.publishing&&i!==(i="fa fa-fw fa-refresh "+(t.publishing?"fa-spin":"")+" svelte-1wigpa8")&&(r.className=i)},d:function(e){e&&u(n)}}}function he(e,t){var n,r,i,s,c=U("publish / publish-btn-intro");return{c:function(){n=h("div"),(r=h("div")).innerHTML='<i class="fa fa-chevron-left"></i>',i=d("\n    "),s=h("div"),r.className="arrow svelte-1wigpa8",s.className="text svelte-1wigpa8",n.className="publish-intro svelte-1wigpa8"},m:function(e,t){o(e,n,t),a(n,r),a(n,i),a(n,s),s.innerHTML=c},d:function(e){e&&u(n)}}}function de(e,t){var n,r=U("publish / republish-alert");return{c:function(){(n=h("div")).className="btn-aside alert svelte-1wigpa8"},m:function(e,t){o(e,n,t),n.innerHTML=r},d:function(e){e&&u(n)}}}function fe(e,t){var n,r=U("publish / publish-success");return{c:function(){(n=h("div")).className="alert alert-success"},m:function(e,t){o(e,n,t),n.innerHTML=r},d:function(e){e&&u(n)}}}function be(e,t){var n;return{c:function(){(n=h("div")).className="alert alert-error"},m:function(e,r){o(e,n,r),n.innerHTML=t.publish_error},p:function(e,t){e.publish_error&&(n.innerHTML=t.publish_error)},d:function(e){e&&u(n)}}}function me(e,t){var n,r,i,s=U("publish / progress / please-wait"),c=t.publishWait>3e3&&_e(e,t);return{c:function(){n=h("div"),r=d(s),i=d(" "),c&&c.c(),n.className="alert alert-info publishing"},m:function(e,t){o(e,n,t),a(n,r),a(n,i),c&&c.m(n,null)},p:function(t,r){r.publishWait>3e3?c?c.p(t,r):((c=_e(e,r)).c(),c.m(n,null)):c&&(c.d(1),c=null)},d:function(e){e&&u(n),c&&c.d()}}}function _e(e,t){for(var n,r=t.progress,i=[],s=0;s<r.length;s+=1)i[s]=ge(e,oe(t,r,s));return{c:function(){n=h("ul");for(var e=0;e<i.length;e+=1)i[e].c();n.className="publish-progress unstyled svelte-1wigpa8"},m:function(e,t){o(e,n,t);for(var r=0;r<i.length;r+=1)i[r].m(n,null)},p:function(t,s){if(t.progress){r=s.progress;for(var a=0;a<r.length;a+=1){var o=oe(s,r,a);i[a]?i[a].p(t,o):(i[a]=ge(e,o),i[a].c(),i[a].m(n,null))}for(;a<i.length;a+=1)i[a].d(1);i.length=r.length}},d:function(e){e&&u(n),l(i,e)}}}function ge(e,t){var n,r,i,s,l,p=U("publish / status / "+t.step);return{c:function(){n=h("li"),r=h("i"),s=d(" "),l=h("noscript"),r.className=i="fa fa-fw "+(t.i<t.progress.length-1?"fa-check":"fa-spinner fa-pulse")+" svelte-1wigpa8",n.className="svelte-1wigpa8",v(n,"done",t.i<t.progress.length-1)},m:function(e,t){o(e,n,t),a(n,r),a(n,s),a(n,l),l.insertAdjacentHTML("afterend",p)},p:function(e,t){e.progress&&i!==(i="fa fa-fw "+(t.i<t.progress.length-1?"fa-check":"fa-spinner fa-pulse")+" svelte-1wigpa8")&&(r.className=i),e.progress&&p!==(p=U("publish / status / "+t.step))&&(c(l),l.insertAdjacentHTML("afterend",p)),e.progress&&v(n,"done",t.i<t.progress.length-1)},d:function(e){e&&u(n)}}}function ve(e,t){var n,r,i,s,l,p=t.tpl.name;function _(){e.set({shareurl_type:r.__value})}return{c:function(){n=h("label"),r=h("input"),s=d(" "),l=h("noscript"),e._bindingGroups[0].push(r),f(r,"change",_),r.__value=i=t.tpl.id,r.value=r.__value,m(r,"type","radio"),r.name="url-type",r.className="svelte-1wigpa8",n.className="radio"},m:function(e,i){o(e,n,i),a(n,r),r.checked=r.__value===t.shareurl_type,a(n,s),a(n,l),l.insertAdjacentHTML("afterend",p)},p:function(e,t){e.shareurl_type&&(r.checked=r.__value===t.shareurl_type),e.plugin_shareurls&&i!==(i=t.tpl.id)&&(r.__value=i),r.value=r.__value,e.plugin_shareurls&&p!==(p=t.tpl.name)&&(c(l),l.insertAdjacentHTML("afterend",p))},d:function(t){t&&u(n),e._bindingGroups[0].splice(e._bindingGroups[0].indexOf(r),1),b(r,"change",_)}}}function we(e,t){var n,r,i,s,l,p=t.tpl.title;function _(){e.set({embed_type:r.__value})}return{c:function(){n=h("label"),r=h("input"),s=d(" "),l=h("noscript"),e._bindingGroups[1].push(r),f(r,"change",_),m(r,"type","radio"),r.__value=i=t.tpl.id,r.value=r.__value,r.className="svelte-1wigpa8",n.className="radio"},m:function(e,i){o(e,n,i),a(n,r),r.checked=r.__value===t.embed_type,a(n,s),a(n,l),l.insertAdjacentHTML("afterend",p)},p:function(e,t){e.embed_type&&(r.checked=r.__value===t.embed_type),e.embed_templates&&i!==(i=t.tpl.id)&&(r.__value=i),r.value=r.__value,e.embed_templates&&p!==(p=t.tpl.title)&&(c(l),l.insertAdjacentHTML("afterend",p))},d:function(t){t&&u(n),e._bindingGroups[1].splice(e._bindingGroups[1].indexOf(r),1),b(r,"change",_)}}}function ye(e,t){var n,r,i,s,l,p,f=t.tpl.title,b=t.tpl.text;return{c:function(){n=h("div"),r=h("b"),i=d(f),s=d(":"),l=d(" "),p=h("noscript")},m:function(e,t){o(e,n,t),a(n,r),a(r,i),a(r,s),a(n,l),a(n,p),p.insertAdjacentHTML("afterend",b)},p:function(e,t){e.embed_templates&&f!==(f=t.tpl.title)&&_(i,f),e.embed_templates&&b!==(b=t.tpl.text)&&(c(p),p.insertAdjacentHTML("afterend",b))},d:function(e){e&&u(n)}}}function Ne(e){var t=this;j(this,e),this.refs={},this._state=i({chart:{id:""},embed_templates:[],plugin_shareurls:[],published:!1,publishing:!1,publishStarted:0,needs_republish:!1,publish_error:!1,auto_publish:!1,progress:[],shareurl_type:"default",embed_type:"responsive",copy_success:!1,statusUrl:!1},e.data),this._recompute({shareurl_type:1,chart:1,plugin_shareurls:1,published:1,embed_type:1,publishStarted:1,now:1},this._state),this._bindingGroups=[[],[]],this._intro=!0,this._handlers.state=[re],re.call(this,{changed:s({},this._state),current:this._state}),this._fragment=function(e,t){var n,r,i,s,c,v,w,y,N,x,O,T,j,k,S,E,C,L,P,H,D,A,G,I,R,q,F,W,$,B,J,V,z,K,Q,X,Y,Z,ee,te,ne,re,oe,_e,ge,Ne,xe,Oe,Te,je,ke,Se,Ee,Ce,Le,Me,Pe,He=U("publish / share-embed"),Ue=U("publish / share-url"),De=U("publish / share-url / fullscreen"),Ae=U("publish / help / share-url"),Ge=U("publish / embed"),Ie=U("publish / copy"),Re=U("publish / copy-success"),qe=U("publish / embed / help");function Fe(e){return e.published?ce:ue}var We=Fe(t),$e=We(e,t);function Be(e){return e.published?pe:le}var Je=Be(t),Ve=Je(e,t);function ze(t){e.publish()}var Ke=!t.published&&he(),Qe=t.needs_republish&&!t.publishing&&de(),Xe=t.published&&!t.needs_republish&&t.progress&&t.progress.includes("done")&&!t.publishing&&fe(),Ye=t.publish_error&&be(e,t),Ze=t.publishing&&me(e,t);function et(){e.set({shareurl_type:A.__value})}for(var tt=t.plugin_shareurls,nt=[],rt=0;rt<tt.length;rt+=1)nt[rt]=ve(e,ae(t,tt,rt));var it=new M({root:e.root,store:e.store,slots:{default:p()}}),st=t.embed_templates,at=[];for(rt=0;rt<st.length;rt+=1)at[rt]=we(e,se(t,st,rt));function ot(n){e.copy(t.embedCode)}var ut=t.embed_templates.slice(2),ct=[];for(rt=0;rt<ut.length;rt+=1)ct[rt]=ye(e,ie(t,ut,rt));var lt=new M({root:e.root,store:e.store,slots:{default:p()}});return{c:function(){$e.c(),n=d("\n\n"),r=h("button"),Ve.c(),s=d("\n\n"),Ke&&Ke.c(),c=d(" "),Qe&&Qe.c(),v=d(" "),Xe&&Xe.c(),w=d(" "),Ye&&Ye.c(),y=d(" "),Ze&&Ze.c(),N=d("\n\n"),x=h("div"),O=h("h2"),T=d("\n    "),j=h("div"),k=h("i"),S=d("\n        "),E=h("div"),C=h("div"),L=h("b"),P=d("\n                "),H=h("div"),D=h("label"),A=h("input"),G=d("\n                        "),I=h("noscript"),R=d("\n                    ");for(var a=0;a<nt.length;a+=1)nt[a].c();q=d("\n            "),F=h("div"),W=h("a"),$=d(t.shareUrl),B=d("\n        "),J=h("div"),it._fragment.c(),V=d("\n\n    "),z=h("div"),K=h("i"),Q=d("\n        "),X=h("div"),Y=h("div"),Z=h("b"),ee=d("\n                "),te=h("div");for(a=0;a<at.length;a+=1)at[a].c();ne=d("\n            "),re=h("div"),oe=h("textarea"),_e=d("\n                "),ge=h("button"),Ne=h("i"),xe=d(" "),Oe=d(Ie),Te=d("\n                "),je=h("div"),ke=d(Re),Ee=d("\n        "),Ce=h("div"),Le=h("noscript"),Me=d(" ");for(a=0;a<ct.length;a+=1)ct[a].c();lt._fragment.c(),f(r,"click",ze),r.disabled=t.publishing,r.className=i="btn-publish btn btn-primary btn-large "+(t.published?"":"btn-first-publish")+" svelte-1wigpa8",k.className="icon fa fa-link fa-fw",e._bindingGroups[0].push(A),f(A,"change",et),A.__value="default",A.value=A.__value,m(A,"type","radio"),A.name="url-type",A.className="svelte-1wigpa8",D.className="radio",H.className="embed-options svelte-1wigpa8",C.className="h",W.target="_blank",W.className="share-url svelte-1wigpa8",W.href=t.shareUrl,F.className="inpt",E.className="ctrls",j.className="block",K.className="icon fa fa-code fa-fw",te.className="embed-options svelte-1wigpa8",Y.className="h",m(oe,"type","text"),oe.className="input embed-code svelte-1wigpa8",oe.readOnly=!0,oe.value=t.embedCode,Ne.className="fa fa-copy",f(ge,"click",ot),ge.className="btn btn-copy",ge.title="copy",je.className=Se="copy-success "+(t.copy_success?"show":"")+" svelte-1wigpa8",re.className="inpt",X.className="ctrls",z.className="block",g(x,"margin-top","20px"),x.className=Pe=t.published?"":"inactive"},m:function(i,u){$e.m(i,u),o(i,n,u),o(i,r,u),Ve.m(r,null),o(i,s,u),Ke&&Ke.m(i,u),o(i,c,u),Qe&&Qe.m(i,u),o(i,v,u),Xe&&Xe.m(i,u),o(i,w,u),Ye&&Ye.m(i,u),o(i,y,u),Ze&&Ze.m(i,u),o(i,N,u),o(i,x,u),a(x,O),O.innerHTML=He,a(x,T),a(x,j),a(j,k),a(j,S),a(j,E),a(E,C),a(C,L),L.innerHTML=Ue,a(C,P),a(C,H),a(H,D),a(D,A),A.checked=A.__value===t.shareurl_type,a(D,G),a(D,I),I.insertAdjacentHTML("afterend",De),a(H,R);for(var l=0;l<nt.length;l+=1)nt[l].m(H,null);a(E,q),a(E,F),a(F,W),a(W,$),a(j,B),a(it._slotted.default,J),J.innerHTML=Ae,it._mount(j,null),a(x,V),a(x,z),a(z,K),a(z,Q),a(z,X),a(X,Y),a(Y,Z),Z.innerHTML=Ge,a(Y,ee),a(Y,te);for(l=0;l<at.length;l+=1)at[l].m(te,null);a(X,ne),a(X,re),a(re,oe),e.refs.embedInput=oe,a(re,_e),a(re,ge),a(ge,Ne),a(ge,xe),a(ge,Oe),a(re,Te),a(re,je),a(je,ke),a(z,Ee),a(lt._slotted.default,Ce),a(Ce,Le),Le.insertAdjacentHTML("beforebegin",qe),a(Ce,Me);for(l=0;l<ct.length;l+=1)ct[l].m(Ce,null);lt._mount(z,null)},p:function(s,a){if(We!==(We=Fe(t=a))&&($e.d(1),($e=We(e,t)).c(),$e.m(n.parentNode,n)),Je===(Je=Be(t))&&Ve?Ve.p(s,t):(Ve.d(1),(Ve=Je(e,t)).c(),Ve.m(r,null)),s.publishing&&(r.disabled=t.publishing),s.published&&i!==(i="btn-publish btn btn-primary btn-large "+(t.published?"":"btn-first-publish")+" svelte-1wigpa8")&&(r.className=i),t.published?Ke&&(Ke.d(1),Ke=null):Ke||((Ke=he()).c(),Ke.m(c.parentNode,c)),t.needs_republish&&!t.publishing?Qe||((Qe=de()).c(),Qe.m(v.parentNode,v)):Qe&&(Qe.d(1),Qe=null),t.published&&!t.needs_republish&&t.progress&&t.progress.includes("done")&&!t.publishing?Xe||((Xe=fe()).c(),Xe.m(w.parentNode,w)):Xe&&(Xe.d(1),Xe=null),t.publish_error?Ye?Ye.p(s,t):((Ye=be(e,t)).c(),Ye.m(y.parentNode,y)):Ye&&(Ye.d(1),Ye=null),t.publishing?Ze?Ze.p(s,t):((Ze=me(e,t)).c(),Ze.m(N.parentNode,N)):Ze&&(Ze.d(1),Ze=null),s.shareurl_type&&(A.checked=A.__value===t.shareurl_type),s.plugin_shareurls||s.shareurl_type){tt=t.plugin_shareurls;for(var o=0;o<tt.length;o+=1){var u=ae(t,tt,o);nt[o]?nt[o].p(s,u):(nt[o]=ve(e,u),nt[o].c(),nt[o].m(H,null))}for(;o<nt.length;o+=1)nt[o].d(1);nt.length=tt.length}if(s.shareUrl&&(_($,t.shareUrl),W.href=t.shareUrl),s.embed_templates||s.embed_type){st=t.embed_templates;for(o=0;o<st.length;o+=1){var l=se(t,st,o);at[o]?at[o].p(s,l):(at[o]=we(e,l),at[o].c(),at[o].m(te,null))}for(;o<at.length;o+=1)at[o].d(1);at.length=st.length}if(s.embedCode&&(oe.value=t.embedCode),s.copy_success&&Se!==(Se="copy-success "+(t.copy_success?"show":"")+" svelte-1wigpa8")&&(je.className=Se),s.embed_templates){ut=t.embed_templates.slice(2);for(o=0;o<ut.length;o+=1){var p=ie(t,ut,o);ct[o]?ct[o].p(s,p):(ct[o]=ye(e,p),ct[o].c(),ct[o].m(Ce,null))}for(;o<ct.length;o+=1)ct[o].d(1);ct.length=ut.length}s.published&&Pe!==(Pe=t.published?"":"inactive")&&(x.className=Pe)},d:function(t){$e.d(t),t&&(u(n),u(r)),Ve.d(),b(r,"click",ze),t&&u(s),Ke&&Ke.d(t),t&&u(c),Qe&&Qe.d(t),t&&u(v),Xe&&Xe.d(t),t&&u(w),Ye&&Ye.d(t),t&&u(y),Ze&&Ze.d(t),t&&(u(N),u(x)),e._bindingGroups[0].splice(e._bindingGroups[0].indexOf(A),1),b(A,"change",et),l(nt,t),it.destroy(),l(at,t),e.refs.embedInput===oe&&(e.refs.embedInput=null),b(ge,"click",ot),l(ct,t),lt.destroy()}}}(this,this._state),this.root._oncreate.push((function(){t.fire("update",{changed:s({},t._state),current:t._state})})),e.target&&(this._fragment.c(),this._mount(e.target,e.anchor),O(this))}function xe(e,t){this._handlers={},this._dependents=[],this._computed=w(),this._sortedComputedProperties=[],this._state=i({},e),this._differs=t&&t.immutable?N:y}i(Ne.prototype,E),i(Ne.prototype,ne),Ne.prototype._recompute=function(e,t){var n,r,i,s,a,o;(e.shareurl_type||e.chart||e.plugin_shareurls||e.published)&&this._differs(t.shareUrl,t.shareUrl=function(e){var t=e.shareurl_type,n=e.chart,r=e.plugin_shareurls;if(!e.published)return"https://www.datawrapper.de/...";if("default"===t)return n.publicUrl;var i="";return r.forEach((function(e){e.id===t&&(i=(i=e.url.replace(/%chart_id%/g,n.id)).replace(/%(.*?)%/g,(function(e,t){return function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(!t)return e;for(var r=t.split("."),i=e,s=0;s<r.length&&null!=i;s++)i=i[r[s]];return null==i?n:i}({id:n.id,metadata:n.metadata},t)})))})),i}(t))&&(e.shareUrl=!0),(e.embed_type||e.chart)&&this._differs(t.embedCode,t.embedCode=(r=(n=t).embed_type,(i=n.chart).metadata?i.metadata.publish&&!i.metadata.publish["embed-codes"]?'<iframe src="'.concat(i.publicUrl,'" width="100%" height="').concat(i.metadata.publish["embed-height"],'" scrolling="no" frameborder="0" allowtransparency="true"></iframe>'):i.metadata.publish["embed-codes"]["embed-method-"+r]?i.metadata.publish["embed-codes"]["embed-method-"+r]:"":""))&&(e.embedCode=!0),(e.publishStarted||e.now)&&this._differs(t.publishWait,t.publishWait=(a=(s=t).publishStarted,o=s.now,a>0?o-a:0))&&(e.publishWait=!0)},i(xe.prototype,{_add:function(e,t){this._dependents.push({component:e,props:t})},_init:function(e){for(var t={},n=0;n<e.length;n+=1){var r=e[n];t["$"+r]=this._state[r]}return t},_remove:function(e){for(var t=this._dependents.length;t--;)if(this._dependents[t].component===e)return void this._dependents.splice(t,1)},_set:function(e,t){var n=this,r=this._state;this._state=i(i({},r),e);for(var s=0;s<this._sortedComputedProperties.length;s+=1)this._sortedComputedProperties[s].update(this._state,t);this.fire("state",{changed:t,previous:r,current:this._state}),this._dependents.filter((function(e){for(var r={},i=!1,s=0;s<e.props.length;s+=1){var a=e.props[s];a in t&&(r["$"+a]=n._state[a],i=!0)}if(i)return e.component._stage(r),!0})).forEach((function(e){e.component.set({})})),this.fire("update",{changed:t,previous:r,current:this._state})},_sortComputedProperties:function(){var e,t=this._computed,n=this._sortedComputedProperties=[],r=w();function i(s){var a=t[s];a&&(a.deps.forEach((function(t){if(t===e)throw new Error("Cyclical dependency detected between ".concat(t," <-> ").concat(s));i(t)})),r[s]||(r[s]=!0,n.push(a)))}for(var s in this._computed)i(e=s)},compute:function(e,t,n){var r,s=this,a={deps:t,update:function(i,a,o){var u=t.map((function(e){return e in a&&(o=!0),i[e]}));if(o){var c=n.apply(null,u);s._differs(c,r)&&(r=c,a[e]=!0,i[e]=r)}}};this._computed[e]=a,this._sortComputedProperties();var o=i({},this._state),u={};a.update(o,u,!0),this._set(o,u)},fire:x,get:T,on:k,set:function(e){var t=this._state,n=this._changed={},r=!1;for(var i in e){if(this._computed[i])throw new Error("'".concat(i,"' is a read-only computed property"));this._differs(e[i],t[i])&&(n[i]=r=!0)}r&&this._set(e,n)}});return{App:Ne,data:{chart:{id:""},embed_templates:[],plugin_shareurls:[],published:!1,publishing:!1,needs_republish:!1,publish_error:!1,auto_publish:!1,progress:[],shareurl_type:"default",embed_type:"responsive",copy_success:!1},store:new xe({})}}));
