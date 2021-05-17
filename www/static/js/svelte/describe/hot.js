!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("Handsontable"),require("dayjs")):"function"==typeof define&&define.amd?define(["Handsontable","dayjs"],e):(t=t||self)["describe/hot"]=e(t.HOT,t.dayjs)}(this,(function(t,e){"use strict";t=t&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t,e=e&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e;var r=function(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n};var n=function(t){if(Array.isArray(t))return r(t)};var o=function(t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t))return Array.from(t)};var a=function(t,e){if(t){if("string"==typeof t)return r(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Object"===n&&t.constructor&&(n=t.constructor.name),"Map"===n||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?r(t,e):void 0}};var i=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")};var u=function(t){return n(t)||o(t)||a(t)||i()};var s=function(t){if(Array.isArray(t))return t};var l=function(t,e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(t)){var r=[],n=!0,o=!1,a=void 0;try{for(var i,u=t[Symbol.iterator]();!(n=(i=u.next()).done)&&(r.push(i.value),!e||r.length!==e);n=!0);}catch(t){o=!0,a=t}finally{try{n||null==u.return||u.return()}finally{if(o)throw a}}return r}};var c=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")};var f=function(t,e){return s(t)||l(t,e)||a(t,e)||c()},h="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function d(t,e,r){return t(r={path:e,exports:{},require:function(t,e){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==e&&r.path)}},r.exports),r.exports}var p=d((function(t){function e(r){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?t.exports=e=function(t){return typeof t}:t.exports=e=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(r)}t.exports=e}));var m=function(t,e,r){return e in t?Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[e]=r,t};function v(){}function g(t,e){for(var r in e)t[r]=e[r];return t}function b(t,e){for(var r in e)t[r]=1;return t}function y(){return Object.create(null)}function _(t){t._lock=!0,w(t._beforecreate),w(t._oncreate),w(t._aftercreate),t._lock=!1}function w(t){for(;t&&t.length;)t.shift()()}var x={destroy:function(t){this.destroy=v,this.fire("destroy"),this.set=v,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:function(){return this._state},fire:function(t,e){var r=t in this._handlers&&this._handlers[t].slice();if(r)for(var n=0;n<r.length;n+=1){var o=r[n];if(!o.__calling)try{o.__calling=!0,o.call(this,e)}finally{o.__calling=!1}}},on:function(t,e){var r=this._handlers[t]||(this._handlers[t]=[]);return r.push(e),{cancel:function(){var t=r.indexOf(e);~t&&r.splice(t,1)}}},set:function(t){this._set(g({},t)),this.root._lock||_(this.root)},_recompute:v,_set:function(t){var e=this._state,r={},n=!1;for(var o in t=g(this._staged,t),this._staged={},t)this._differs(t[o],e[o])&&(r[o]=n=!0);n&&(this._state=g(g({},e),t),this._recompute(r,this._state),this._bind&&this._bind(r,this._state),this._fragment&&(this.fire("state",{changed:r,current:this._state,previous:e}),this._fragment.p(r,this._state),this.fire("update",{changed:r,current:this._state,previous:e})))},_stage:function(t){g(this._staged,t)},_mount:function(t,e){this._fragment[this._fragment.i?"i":"m"](t,e||null)},_differs:function(t,e){return t!=t?e==e:t!==e||t&&"object"===p(t)||"function"==typeof t}},M=/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,S=/<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;function C(t,e){if(null===t)return null;if(void 0!==t){if((t=String(t)).indexOf("<")<0||t.indexOf(">")<0)return t;if(t=function(t,e){e=(((void 0!==e?e||"":"<a><span><b><br><br/><i><strong><sup><sub><strike><u><em><tt>")+"").toLowerCase().match(/<[a-z][a-z0-9]*>/g)||[]).join("");var r=t,n=t;for(;;)if(n=(r=n).replace(S,"").replace(M,(function(t,r){return e.indexOf("<"+r.toLowerCase()+">")>-1?t:""})),r===n)return n}(t,e),"undefined"==typeof document)return t;var r=document.createElement("div");r.innerHTML=t;for(var n=r.querySelectorAll("*"),o=0;o<n.length;o++){"a"===n[o].nodeName.toLowerCase()&&("_self"!==n[o].getAttribute("target")&&n[o].setAttribute("target","_blank"),n[o].setAttribute("rel","nofollow noopener noreferrer"),n[o].getAttribute("href")&&n[o].getAttribute("href").trim().replace(/[^a-zA-Z0-9 -:]/g,"").startsWith("javascript:")&&n[o].setAttribute("href",""));for(var a=[],i=0;i<n[o].attributes.length;i++){var u=n[o].attributes[i];u.specified&&"on"===u.name.substr(0,2)&&a.push(u.name)}a.forEach((function(t){return n[o].removeAttribute(t)}))}return r.innerHTML}}var N="object"==("undefined"==typeof self?"undefined":p(self))&&self.self===self&&self||"object"==("undefined"==typeof global?"undefined":p(global))&&global.global===global&&global||Function("return this")()||{},O=Array.prototype,F=Object.prototype,L=O.slice,R=F.toString,T=F.hasOwnProperty,j="undefined"!=typeof DataView,k=Array.isArray,E=Object.keys,A=Object.create,I=isNaN,B=!{toString:null}.propertyIsEnumerable("toString"),P=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"],D=Math.pow(2,53)-1;function H(t,e){return e=null==e?t.length-1:+e,function(){for(var r=Math.max(arguments.length-e,0),n=Array(r),o=0;o<r;o++)n[o]=arguments[o+e];switch(e){case 0:return t.call(this,n);case 1:return t.call(this,arguments[0],n);case 2:return t.call(this,arguments[0],arguments[1],n)}var a=Array(e+1);for(o=0;o<e;o++)a[o]=arguments[o];return a[e]=n,t.apply(this,a)}}function $(t){var e=p(t);return"function"===e||"object"===e&&!!t}function z(t){var e="[object "+t+"]";return function(t){return R.call(t)===e}}var Y=z("Number"),q=z("Date"),V=z("Function"),G=N.document&&N.document.childNodes;"function"!=typeof/./&&"object"!=("undefined"==typeof Int8Array?"undefined":p(Int8Array))&&"function"!=typeof G&&(V=function(t){return"function"==typeof t||!1});var U=V,Z=z("Object"),J=(j&&Z(new DataView(new ArrayBuffer(8))),"undefined"!=typeof Map&&Z(new Map)),W=k||z("Array");function K(t,e){return null!=t&&T.call(t,e)}var Q=z("Arguments");!function(){Q(arguments)||(Q=function(t){return K(t,"callee")})}();var X=Q;function tt(t){return Y(t)&&I(t)}var et,rt=(et="length",function(t){return null==t?void 0:t[et]});function nt(t,e){e=function(t){for(var e={},r=t.length,n=0;n<r;++n)e[t[n]]=!0;return{contains:function(t){return e[t]},push:function(r){return e[r]=!0,t.push(r)}}}(e);var r=P.length,n=t.constructor,o=U(n)&&n.prototype||F,a="constructor";for(K(t,a)&&!e.contains(a)&&e.push(a);r--;)(a=P[r])in t&&t[a]!==o[a]&&!e.contains(a)&&e.push(a)}function ot(t){if(!$(t))return[];if(E)return E(t);var e=[];for(var r in t)K(t,r)&&e.push(r);return B&&nt(t,e),e}function at(t){return t instanceof at?t:this instanceof at?void(this._wrapped=t):new at(t)}function it(t){if(!$(t))return[];var e=[];for(var r in t)e.push(r);return B&&nt(t,e),e}function ut(t){var e=rt(t);return function(r){if(null==r)return!1;var n=it(r);if(rt(n))return!1;for(var o=0;o<e;o++)if(!U(r[t[o]]))return!1;return t!==ht||!U(r[st])}}at.VERSION="1.13.1",at.prototype.value=function(){return this._wrapped},at.prototype.valueOf=at.prototype.toJSON=at.prototype.value,at.prototype.toString=function(){return String(this._wrapped)};var st="forEach",lt=["clear","delete"],ct=["get","has","set"],ft=lt.concat(st,ct),ht=lt.concat(ct),dt=["add"].concat(lt,st,"has");function pt(t){for(var e=ot(t),r=e.length,n=Array(r),o=0;o<r;o++)n[o]=t[e[o]];return n}J?ut(ft):z("Map"),J?ut(ht):z("WeakMap"),J?ut(dt):z("Set");var mt,vt,gt=(mt=ot,function(t){var e=arguments.length;if(vt&&(t=Object(t)),e<2||null==t)return t;for(var r=1;r<e;r++)for(var n=arguments[r],o=mt(n),a=o.length,i=0;i<a;i++){var u=o[i];vt&&void 0!==t[u]||(t[u]=n[u])}return t});function bt(t){return at.toPath(t)}function yt(t,e){for(var r=e.length,n=0;n<r;n++){if(null==t)return;t=t[e[n]]}return r?t:void 0}function _t(t){return t}function wt(t){return t=gt({},t),function(e){return function(t,e){var r=ot(e),n=r.length;if(null==t)return!n;for(var o=Object(t),a=0;a<n;a++){var i=r[a];if(e[i]!==o[i]||!(i in o))return!1}return!0}(e,t)}}function xt(t){return t=bt(t),function(e){return yt(e,t)}}function Mt(t,e,r){if(void 0===e)return t;switch(null==r?3:r){case 1:return function(r){return t.call(e,r)};case 3:return function(r,n,o){return t.call(e,r,n,o)};case 4:return function(r,n,o,a){return t.call(e,r,n,o,a)}}return function(){return t.apply(e,arguments)}}function St(t,e,r){return null==t?_t:U(t)?Mt(t,e,r):$(t)&&!W(t)?wt(t):xt(t)}function Ct(t,e){return St(t,e,1/0)}function Nt(t,e,r){return at.iteratee!==Ct?at.iteratee(t,e):St(t,e,r)}function Ot(t){var e=function(e){return t[e]},r="(?:"+ot(t).join("|")+")",n=RegExp(r),o=RegExp(r,"g");return function(t){return t=null==t?"":""+t,n.test(t)?t.replace(o,e):t}}at.toPath=function(t){return W(t)?t:[t]},at.iteratee=Ct;var Ft={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"};function Lt(t,e,r,n,o){if(!(n instanceof e))return t.apply(r,o);var a=function(t){if(!$(t))return{};if(A)return A(t);var e=function(){};e.prototype=t;var r=new e;return e.prototype=null,r}(t.prototype),i=t.apply(a,o);return $(i)?i:a}Ot(Ft),Ot(function(t){for(var e={},r=ot(t),n=0,o=r.length;n<o;n++)e[t[r[n]]]=r[n];return e}(Ft)),at.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var Rt=H((function(t,e){var r=Rt.placeholder;return function n(){for(var o=0,a=e.length,i=Array(a),u=0;u<a;u++)i[u]=e[u]===r?arguments[o++]:e[u];for(;o<arguments.length;)i.push(arguments[o++]);return Lt(t,n,this,this,i)}}));Rt.placeholder=at;var Tt,jt=H((function(t,e,r){if(!U(t))throw new TypeError("Bind must be called on a function");var n=H((function(o){return Lt(t,n,e,this,r.concat(o))}));return n})),kt=(Tt=rt,function(t){var e=Tt(t);return"number"==typeof e&&e>=0&&e<=D});function Et(t,e,r,n){if(n=n||[],e||0===e){if(e<=0)return n.concat(t)}else e=1/0;for(var o=n.length,a=0,i=rt(t);a<i;a++){var u=t[a];if(kt(u)&&(W(u)||X(u)))if(e>1)Et(u,e-1,r,n),o=n.length;else for(var s=0,l=u.length;s<l;)n[o++]=u[s++];else r||(n[o++]=u)}return n}H((function(t,e){var r=(e=Et(e,!1,!1)).length;if(r<1)throw new Error("bindAll must be passed function names");for(;r--;){var n=e[r];t[n]=jt(t[n],t)}return t}));var At,It=H((function(t,e,r){return setTimeout((function(){return t.apply(null,r)}),e)}));Rt(It,at,1),Rt((function(t,e){var r;return function(){return--t>0&&(r=e.apply(this,arguments)),t<=1&&(e=null),r}}),2);var Bt=function(t,e,r){return function(n,o,a){var i=0,u=rt(n);if("number"==typeof a)t>0?i=a>=0?a:Math.max(a+u,i):u=a>=0?Math.min(a+1,u):a+u+1;else if(r&&a&&u)return n[a=r(n,o)]===o?a:-1;if(o!=o)return(a=e(L.call(n,i,u),tt))>=0?a+i:-1;for(a=t>0?i:u-1;a>=0&&a<u;a+=t)if(n[a]===o)return a;return-1}}(1,(At=1,function(t,e,r){e=Nt(e,r);for(var n=rt(t),o=At>0?0:n-1;o>=0&&o<n;o+=At)if(e(t[o],o,t))return o;return-1}),(function(t,e,r,n){for(var o=(r=Nt(r,n,1))(e),a=0,i=rt(t);a<i;){var u=Math.floor((a+i)/2);r(t[u])<o?a=u+1:i=u}return a}));function Pt(t,e,r){var n,o;if(e=Mt(e,r),kt(t))for(n=0,o=t.length;n<o;n++)e(t[n],n,t);else{var a=ot(t);for(n=0,o=a.length;n<o;n++)e(t[a[n]],a[n],t)}return t}function Dt(t,e,r){e=Nt(e,r);for(var n=!kt(t)&&ot(t),o=(n||t).length,a=Array(o),i=0;i<o;i++){var u=n?n[i]:i;a[i]=e(t[u],u,t)}return a}function Ht(t,e,r,n){return kt(t)||(t=pt(t)),("number"!=typeof r||n)&&(r=0),Bt(t,e,r)>=0}function $t(t,e){return Dt(t,xt(e))}function zt(t,e,r){return e in r}H((function(t,e,r){var n,o;return U(e)?o=e:(e=bt(e),n=e.slice(0,-1),e=e[e.length-1]),Dt(t,(function(t){var a=o;if(!a){if(n&&n.length&&(t=yt(t,n)),null==t)return;a=t[e]}return null==a?a:a.apply(t,r)}))}));var Yt=H((function(t,e){var r={},n=e[0];if(null==t)return r;U(n)?(e.length>1&&(n=Mt(n,e[1])),e=it(t)):(n=zt,e=Et(e,!1,!1),t=Object(t));for(var o=0,a=e.length;o<a;o++){var i=e[o],u=t[i];n(u,i,t)&&(r[i]=u)}return r}));H((function(t,e){var r,n,o=e[0];return U(o)?(n=o,o=function(){return!n.apply(this,arguments)},e.length>1&&(r=e[1])):(e=Dt(Et(e,!1,!1),String),o=function(t,r){return!Ht(e,r)}),Yt(t,o,r)}));var qt=H((function(t,e){return e=Et(e,!0,!0),r=t,a=[],n=Nt(n=function(t){return!Ht(e,t)},o),Pt(r,(function(t,e,r){n(t,e,r)&&a.push(t)})),a;var r,n,o,a}));function Vt(t,e,r,n){var o;!0!==(o=e)&&!1!==o&&"[object Boolean]"!==R.call(o)&&(n=r,r=e,e=!1),null!=r&&(r=Nt(r,n));for(var a=[],i=[],u=0,s=rt(t);u<s;u++){var l=t[u],c=r?r(l,u,t):l;e&&!r?(u&&i===c||a.push(l),i=c):r?Ht(i,c)||(i.push(c),a.push(l)):Ht(a,l)||a.push(l)}return a}function Gt(t,e){return t._chain?at(e).chain():e}function Ut(t){if(!t.format())return _t;switch(t.precision()){case"year":return function(t){return q(t)?t.getFullYear():t};case"half":return function(t){return q(t)?t.getFullYear()+" H"+(t.getMonth()/6+1):t};case"quarter":return function(t){return q(t)?t.getFullYear()+" Q"+(t.getMonth()/3+1):t};case"month":return function(t){return q(t)?e(t).format("MMM YY"):t};case"week":return function(t){return q(t)?function(t){var e=t.getUTCDay(),r=new Date(t.valueOf());r.setDate(r.getDate()-(e+6)%7+3);var n=r.getUTCFullYear(),o=Math.floor((r.getTime()-new Date(n,0,1,-6))/864e5);return[n,1+Math.floor(o/7),e>0?e:7]}(t).slice(0,2).join(" W"):t};case"day":return function(t,r){return q(t)?e(t).format(r?"dddd, MMMM DD, YYYY":"l"):t};case"day-minutes":return function(t){return q(t)?e(t).format("MMM DD").replace(" ","&nbsp;")+" - "+e(t).format("LT").replace(" ","&nbsp;"):t};case"day-seconds":return function(t){return q(t)?e(t).format("LTS").replace(" ","&nbsp;"):t}}}H((function(t,e){return qt(t,e)})),H((function(t){return Vt(Et(t,!0,!0))})),H((function(t){for(var e=t&&function(t,e,r){var n,o,a=-1/0,i=-1/0;if(null==e||"number"==typeof e&&"object"!=p(t[0])&&null!=t)for(var u=0,s=(t=kt(t)?t:pt(t)).length;u<s;u++)null!=(n=t[u])&&n>a&&(a=n);else e=Nt(e,r),Pt(t,(function(t,r,n){((o=e(t,r,n))>i||o===-1/0&&a===-1/0)&&(a=t,i=o)}));return a}(t,rt).length||0,r=Array(e),n=0;n<e;n++)r[n]=$t(t,n);return r})),Pt(["pop","push","reverse","shift","sort","splice","unshift"],(function(t){var e=O[t];at.prototype[t]=function(){var r=this._wrapped;return null!=r&&(e.apply(r,arguments),"shift"!==t&&"splice"!==t||0!==r.length||delete r[0]),Gt(this,r)}})),Pt(["concat","join","slice"],(function(t){var e=O[t];at.prototype[t]=function(){var t=this._wrapped;return null!=t&&(t=e.apply(t,arguments)),Gt(this,t)}}));var Zt=d((function(t){
/*! @preserve
     * numeral.js
     * version : 2.0.6
     * author : Adam Draper
     * license : MIT
     * http://adamwdraper.github.com/Numeral-js/
     */
!function(e,r){t.exports?t.exports=r():e.numeral=r()}(h,(function(){var t,e,r,n,o,a={},i={},u={currentLocale:"en",zeroFormat:null,nullFormat:null,defaultFormat:"0,0",scalePercentBy100:!0},s={currentLocale:u.currentLocale,zeroFormat:u.zeroFormat,nullFormat:u.nullFormat,defaultFormat:u.defaultFormat,scalePercentBy100:u.scalePercentBy100};function l(t,e){this._input=t,this._value=e}return(t=function(r){var n,o,i,u;if(t.isNumeral(r))n=r.value();else if(0===r||void 0===r)n=0;else if(null===r||e.isNaN(r))n=null;else if("string"==typeof r)if(s.zeroFormat&&r===s.zeroFormat)n=0;else if(s.nullFormat&&r===s.nullFormat||!r.replace(/[^0-9]+/g,"").length)n=null;else{for(o in a)if((u="function"==typeof a[o].regexps.unformat?a[o].regexps.unformat():a[o].regexps.unformat)&&r.match(u)){i=a[o].unformat;break}n=(i=i||t._.stringToNumber)(r)}else n=Number(r)||null;return new l(r,n)}).version="2.0.6",t.isNumeral=function(t){return t instanceof l},t._=e={numberToFormat:function(e,r,n){var o,a,u,s,l,c,f,h,d=i[t.options.currentLocale],p=!1,m=!1,v="",g="",b=!1;if(e=e||0,u=Math.abs(e),t._.includes(r,"(")?(p=!0,r=r.replace(/[\(|\)]/g,"")):(t._.includes(r,"+")||t._.includes(r,"-"))&&(c=t._.includes(r,"+")?r.indexOf("+"):e<0?r.indexOf("-"):-1,r=r.replace(/[\+|\-]/g,"")),t._.includes(r,"a")&&(a=!!(a=r.match(/a(k|m|b|t)?/))&&a[1],t._.includes(r," a")&&(v=" "),r=r.replace(new RegExp(v+"a[kmbt]?"),""),u>=1e12&&!a||"t"===a?(v+=d.abbreviations.trillion,e/=1e12):u<1e12&&u>=1e9&&!a||"b"===a?(v+=d.abbreviations.billion,e/=1e9):u<1e9&&u>=1e6&&!a||"m"===a?(v+=d.abbreviations.million,e/=1e6):(u<1e6&&u>=1e3&&!a||"k"===a)&&(v+=d.abbreviations.thousand,e/=1e3)),t._.includes(r,"[.]")&&(m=!0,r=r.replace("[.]",".")),s=e.toString().split(".")[0],l=r.split(".")[1],f=r.indexOf(","),o=(r.split(".")[0].split(",")[0].match(/0/g)||[]).length,l?(t._.includes(l,"[")?(l=(l=l.replace("]","")).split("["),g=t._.toFixed(e,l[0].length+l[1].length,n,l[1].length)):g=t._.toFixed(e,l.length,n),s=g.split(".")[0],g=t._.includes(g,".")?d.delimiters.decimal+g.split(".")[1]:"",m&&0===Number(g.slice(1))&&(g="")):s=t._.toFixed(e,0,n),v&&!a&&Number(s)>=1e3&&v!==d.abbreviations.trillion)switch(s=String(Number(s)/1e3),v){case d.abbreviations.thousand:v=d.abbreviations.million;break;case d.abbreviations.million:v=d.abbreviations.billion;break;case d.abbreviations.billion:v=d.abbreviations.trillion}if(t._.includes(s,"-")&&(s=s.slice(1),b=!0),s.length<o)for(var y=o-s.length;y>0;y--)s="0"+s;return f>-1&&(s=s.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1"+d.delimiters.thousands)),0===r.indexOf(".")&&(s=""),h=s+g+(v||""),p?h=(p&&b?"(":"")+h+(p&&b?")":""):c>=0?h=0===c?(b?"-":"+")+h:h+(b?"-":"+"):b&&(h="-"+h),h},stringToNumber:function(t){var e,r,n,o=i[s.currentLocale],a=t,u={thousand:3,million:6,billion:9,trillion:12};if(s.zeroFormat&&t===s.zeroFormat)r=0;else if(s.nullFormat&&t===s.nullFormat||!t.replace(/[^0-9]+/g,"").length)r=null;else{for(e in r=1,"."!==o.delimiters.decimal&&(t=t.replace(/\./g,"").replace(o.delimiters.decimal,".")),u)if(n=new RegExp("[^a-zA-Z]"+o.abbreviations[e]+"(?:\\)|(\\"+o.currency.symbol+")?(?:\\))?)?$"),a.match(n)){r*=Math.pow(10,u[e]);break}r*=(t.split("-").length+Math.min(t.split("(").length-1,t.split(")").length-1))%2?1:-1,t=t.replace(/[^0-9\.]+/g,""),r*=Number(t)}return r},isNaN:function(t){function e(e){return t.apply(this,arguments)}return e.toString=function(){return t.toString()},e}((function(t){return"number"==typeof t&&isNaN(t)})),includes:function(t,e){return-1!==t.indexOf(e)},insert:function(t,e,r){return t.slice(0,r)+e+t.slice(r)},reduce:function(t,e){if(null===this)throw new TypeError("Array.prototype.reduce called on null or undefined");if("function"!=typeof e)throw new TypeError(e+" is not a function");var r,n=Object(t),o=n.length>>>0,a=0;if(3===arguments.length)r=arguments[2];else{for(;a<o&&!(a in n);)a++;if(a>=o)throw new TypeError("Reduce of empty array with no initial value");r=n[a++]}for(;a<o;a++)a in n&&(r=e(r,n[a],a,n));return r},multiplier:function(t){var e=t.toString().split(".");return e.length<2?1:Math.pow(10,e[1].length)},correctionFactor:function(){var t=Array.prototype.slice.call(arguments);return t.reduce((function(t,r){var n=e.multiplier(r);return t>n?t:n}),1)},toFixed:function(t,e,r,n){var o,a,i,u,s=t.toString().split("."),l=e-(n||0);return o=2===s.length?Math.min(Math.max(s[1].length,l),e):l,i=Math.pow(10,o),u=(r(t+"e+"+o)/i).toFixed(o),n>e-o&&(a=new RegExp("\\.?0{1,"+(n-(e-o))+"}$"),u=u.replace(a,"")),u}},t.options=s,t.formats=a,t.locales=i,t.locale=function(t){return t&&(s.currentLocale=t.toLowerCase()),s.currentLocale},t.localeData=function(t){if(!t)return i[s.currentLocale];if(t=t.toLowerCase(),!i[t])throw new Error("Unknown locale : "+t);return i[t]},t.reset=function(){for(var t in u)s[t]=u[t]},t.zeroFormat=function(t){s.zeroFormat="string"==typeof t?t:null},t.nullFormat=function(t){s.nullFormat="string"==typeof t?t:null},t.defaultFormat=function(t){s.defaultFormat="string"==typeof t?t:"0.0"},t.register=function(t,e,r){if(e=e.toLowerCase(),this[t+"s"][e])throw new TypeError(e+" "+t+" already registered.");return this[t+"s"][e]=r,r},t.validate=function(e,r){var n,o,a,i,u,s,l,c;if("string"!=typeof e&&(e+="",console.warn&&console.warn("Numeral.js: Value is not string. It has been co-erced to: ",e)),(e=e.trim()).match(/^\d+$/))return!0;if(""===e)return!1;try{l=t.localeData(r)}catch(e){l=t.localeData(t.locale())}return a=l.currency.symbol,u=l.abbreviations,n=l.delimiters.decimal,o="."===l.delimiters.thousands?"\\.":l.delimiters.thousands,(null===(c=e.match(/^[^\d]+/))||(e=e.substr(1),c[0]===a))&&((null===(c=e.match(/[^\d]+$/))||(e=e.slice(0,-1),c[0]===u.thousand||c[0]===u.million||c[0]===u.billion||c[0]===u.trillion))&&(s=new RegExp(o+"{2}"),!e.match(/[^\d.,]/g)&&(!((i=e.split(n)).length>2)&&(i.length<2?!!i[0].match(/^\d+.*\d$/)&&!i[0].match(s):1===i[0].length?!!i[0].match(/^\d+$/)&&!i[0].match(s)&&!!i[1].match(/^\d+$/):!!i[0].match(/^\d+.*\d$/)&&!i[0].match(s)&&!!i[1].match(/^\d+$/)))))},t.fn=l.prototype={clone:function(){return t(this)},format:function(e,r){var n,o,i,u=this._value,l=e||s.defaultFormat;if(r=r||Math.round,0===u&&null!==s.zeroFormat)o=s.zeroFormat;else if(null===u&&null!==s.nullFormat)o=s.nullFormat;else{for(n in a)if(l.match(a[n].regexps.format)){i=a[n].format;break}o=(i=i||t._.numberToFormat)(u,l,r)}return o},value:function(){return this._value},input:function(){return this._input},set:function(t){return this._value=Number(t),this},add:function(t){var r=e.correctionFactor.call(null,this._value,t);return this._value=e.reduce([this._value,t],(function(t,e,n,o){return t+Math.round(r*e)}),0)/r,this},subtract:function(t){var r=e.correctionFactor.call(null,this._value,t);return this._value=e.reduce([t],(function(t,e,n,o){return t-Math.round(r*e)}),Math.round(this._value*r))/r,this},multiply:function(t){return this._value=e.reduce([this._value,t],(function(t,r,n,o){var a=e.correctionFactor(t,r);return Math.round(t*a)*Math.round(r*a)/Math.round(a*a)}),1),this},divide:function(t){return this._value=e.reduce([this._value,t],(function(t,r,n,o){var a=e.correctionFactor(t,r);return Math.round(t*a)/Math.round(r*a)})),this},difference:function(e){return Math.abs(t(this._value).subtract(e).value())}},t.register("locale","en",{delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(t){var e=t%10;return 1==~~(t%100/10)?"th":1===e?"st":2===e?"nd":3===e?"rd":"th"},currency:{symbol:"$"}}),t.register("format","bps",{regexps:{format:/(BPS)/,unformat:/(BPS)/},format:function(e,r,n){var o,a=t._.includes(r," BPS")?" ":"";return e*=1e4,r=r.replace(/\s?BPS/,""),o=t._.numberToFormat(e,r,n),t._.includes(o,")")?((o=o.split("")).splice(-1,0,a+"BPS"),o=o.join("")):o=o+a+"BPS",o},unformat:function(e){return+(1e-4*t._.stringToNumber(e)).toFixed(15)}}),n={base:1024,suffixes:["B","KiB","MiB","GiB","TiB","PiB","EiB","ZiB","YiB"]},o="("+(o=(r={base:1e3,suffixes:["B","KB","MB","GB","TB","PB","EB","ZB","YB"]}).suffixes.concat(n.suffixes.filter((function(t){return r.suffixes.indexOf(t)<0}))).join("|")).replace("B","B(?!PS)")+")",t.register("format","bytes",{regexps:{format:/([0\s]i?b)/,unformat:new RegExp(o)},format:function(e,o,a){var i,u,s,l=t._.includes(o,"ib")?n:r,c=t._.includes(o," b")||t._.includes(o," ib")?" ":"";for(o=o.replace(/\s?i?b/,""),i=0;i<=l.suffixes.length;i++)if(u=Math.pow(l.base,i),s=Math.pow(l.base,i+1),null===e||0===e||e>=u&&e<s){c+=l.suffixes[i],u>0&&(e/=u);break}return t._.numberToFormat(e,o,a)+c},unformat:function(e){var o,a,i=t._.stringToNumber(e);if(i){for(o=r.suffixes.length-1;o>=0;o--){if(t._.includes(e,r.suffixes[o])){a=Math.pow(r.base,o);break}if(t._.includes(e,n.suffixes[o])){a=Math.pow(n.base,o);break}}i*=a||1}return i}}),t.register("format","currency",{regexps:{format:/(\$)/},format:function(e,r,n){var o,a,i=t.locales[t.options.currentLocale],u={before:r.match(/^([\+|\-|\(|\s|\$]*)/)[0],after:r.match(/([\+|\-|\)|\s|\$]*)$/)[0]};for(r=r.replace(/\s?\$\s?/,""),o=t._.numberToFormat(e,r,n),e>=0?(u.before=u.before.replace(/[\-\(]/,""),u.after=u.after.replace(/[\-\)]/,"")):e<0&&!t._.includes(u.before,"-")&&!t._.includes(u.before,"(")&&(u.before="-"+u.before),a=0;a<u.before.length;a++)switch(u.before[a]){case"$":o=t._.insert(o,i.currency.symbol,a);break;case" ":o=t._.insert(o," ",a+i.currency.symbol.length-1)}for(a=u.after.length-1;a>=0;a--)switch(u.after[a]){case"$":o=a===u.after.length-1?o+i.currency.symbol:t._.insert(o,i.currency.symbol,-(u.after.length-(1+a)));break;case" ":o=a===u.after.length-1?o+" ":t._.insert(o," ",-(u.after.length-(1+a)+i.currency.symbol.length-1))}return o}}),t.register("format","exponential",{regexps:{format:/(e\+|e-)/,unformat:/(e\+|e-)/},format:function(e,r,n){var o=("number"!=typeof e||t._.isNaN(e)?"0e+0":e.toExponential()).split("e");return r=r.replace(/e[\+|\-]{1}0/,""),t._.numberToFormat(Number(o[0]),r,n)+"e"+o[1]},unformat:function(e){var r=t._.includes(e,"e+")?e.split("e+"):e.split("e-"),n=Number(r[0]),o=Number(r[1]);return o=t._.includes(e,"e-")?o*=-1:o,t._.reduce([n,Math.pow(10,o)],(function(e,r,n,o){var a=t._.correctionFactor(e,r);return e*a*(r*a)/(a*a)}),1)}}),t.register("format","ordinal",{regexps:{format:/(o)/},format:function(e,r,n){var o=t.locales[t.options.currentLocale],a=t._.includes(r," o")?" ":"";return r=r.replace(/\s?o/,""),a+=o.ordinal(e),t._.numberToFormat(e,r,n)+a}}),t.register("format","percentage",{regexps:{format:/(%)/,unformat:/(%)/},format:function(e,r,n){var o,a=t._.includes(r," %")?" ":"";return t.options.scalePercentBy100&&(e*=100),r=r.replace(/\s?\%/,""),o=t._.numberToFormat(e,r,n),t._.includes(o,")")?((o=o.split("")).splice(-1,0,a+"%"),o=o.join("")):o=o+a+"%",o},unformat:function(e){var r=t._.stringToNumber(e);return t.options.scalePercentBy100?.01*r:r}}),t.register("format","time",{regexps:{format:/(:)/,unformat:/(:)/},format:function(t,e,r){var n=Math.floor(t/60/60),o=Math.floor((t-60*n*60)/60),a=Math.round(t-60*n*60-60*o);return n+":"+(o<10?"0"+o:o)+":"+(a<10?"0"+a:a)},unformat:function(t){var e=t.split(":"),r=0;return 3===e.length?(r+=60*Number(e[0])*60,r+=60*Number(e[1]),r+=Number(e[2])):2===e.length&&(r+=60*Number(e[0]),r+=Number(e[1])),Number(r)}}),t}))}));function Jt(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function Wt(t,e){var r=e=function(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?Jt(Object(r),!0).forEach((function(e){m(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):Jt(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}({format:"0.[00]",prepend:"",append:"",minusChar:"−",multiply:1},e),n=r.format,o=r.append,a=r.prepend,i=r.minusChar,u=r.multiply;n.includes("%")&&Number.isFinite(t)&&(t*=.01),t*=u;var s=n.indexOf("(")>-1,l=Zt(s?t:Math.abs(t)).format(n);return a&&!s&&t<0&&Kt.has(a.trim().toLowerCase())?"".concat(i).concat(a).concat(l.replace("+","")).concat(o):a&&t>=0&&Kt.has(a.trim().toLowerCase())&&n.includes("+")?"".concat(0===t?"±":"+").concat(a).concat(l.replace("+","")).concat(o):0===t&&n.includes("+")?"".concat(a).concat(l.replace("+","±")).concat(o):t<0&&!s?"".concat(a).concat(i).concat(l.replace("+","")).concat(o):"".concat(a).concat(l).concat(o)}var Kt=new Set(["฿","₿","¢","$","€","eur","£","gbp","¥","yen","usd","cad","us$","ca$","can$"]);function Qt(t,e){return Math.abs(t-e)<1e-6}function Xt(t){var e=t["number-format"]||"-",r=Number(t["number-divisor"]||0),n=(t["number-append"]||"").replace(/ /g," "),o=(t["number-prepend"]||"").replace(/ /g," ");return function(t,a,i){if(isNaN(t))return t;var u,s,l=e,c=0;0!==r&&"-"===l&&(c=1),"s"===l.substr(0,1)&&(c=Math.max(0,(u=t,s=+l.substr(1),0===u?0:Math.round(s-Math.ceil(Math.log(Math.abs(u))/Math.LN10))))),i&&(c=0),"-"===l&&(c=Qt(t,Math.round(t))?0:Qt(t,.1*Math.round(10*t))?1:Qt(t,.01*Math.round(100*t))?2:Qt(t,.001*Math.round(1e3*t))?3:Qt(t,1e-4*Math.round(1e4*t))?4:Qt(t,1e-5*Math.round(1e5*t))?5:6),"n"===l[0]&&(c=Number(l.substr(1,l.length)));for(var f="0,0",h=0;h<c;h++)0===h&&(f+="."),f+="0";return Wt(t,{format:f,prepend:a?o:"",append:a?n:"",multiply:Math.pow(10,-1*r)})}}var te=function(t){return t};function ee(t,e,r){return"date"===t.type()?Ut(t.type(!0)):"number"===t.type()?Xt(function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(!e)return t;for(var n=Array.isArray(e)?e:e.split("."),o=t,a=0;a<n.length&&null!=o;a++)o=o[n[a]];return null==o?r:o}(e,"data.column-format.".concat(r),{})):te}function re(t,e,r,n){var o={date:"fa fa-clock-o"};return function(a,i,u,s,l,c,f){if(!(r.numColumns()<=s)&&r.hasColumn(s)){var h=r.column(s),d=t.get(),p=d.searchResults,m=d.currentResult,v=d.activeColumn,g=t.getColumnFormat(h.name());if((u=a.toPhysicalRow(u))>0){var b=ee(h,e.get().metadata,h.name());c=null===h.val(u-1)||""===h.val(u-1)?"–":b(h.val(u-1),!0)}parseInt(c)<0&&i.classList.add("negative"),i.classList.add(h.type()+"Type"),i.dataset.column=s,"text"===h.type()&&c&&c.length>70&&(c=c.substr(0,60)+"…"),0===u?(i.classList.add("firstRow"),o[h.type()]&&(c='<i class="'+o[h.type()]+'"></i> '+c)):i.classList.add(u%2?"oddRow":"evenRow"),g.ignore&&i.classList.add("ignored"),v&&v.name()===h.name()&&i.classList.add("active");var y=n.hooks.run(a,"modifyRow",u);p.forEach((function(t){t.row===y&&t.col===s&&i.classList.add("htSearchResult")})),m&&m.row===y&&m.col===s&&i.classList.add("htCurrentSearchResult"),u>0&&!h.type(!0).isValid(h.val(u-1))&&null!==h.val(u-1)&&""!==h.val(u-1)&&i.classList.add("parsingError"),u>0&&(null===h.val(u-1)||""===h.val(u-1))&&i.classList.add("noData"),h.isComputed&&h.errors.length&&h.errors.find((function(t){return"all"===t.row||t.row===u-1}))&&i.classList.add("parsingError"),f.readOnly&&i.classList.add("readOnly"),e.dataCellChanged(s,u)&&i.classList.add("changed"),function(t,e,r,o,a,i,u){var s=C(n.helper.stringify(i));e.innerHTML=s}(0,i,0,0,0,c)}}}function ne(t){if(!t||"object"!==p(t))return t;try{return JSON.parse(JSON.stringify(t))}catch(e){return t}}var oe=null,ae=null;var ie={render:function(){this.get().hot.render()},doSearch:function(){var t=this,e=this.get(),r=e.hot,n=e.search;clearTimeout(ae),ae=setTimeout((function(){if(r&&n){var e=r.getPlugin("search").query(n);t.set({searchResults:e})}else t.set({searchResults:[]})}),300)},update:function(){var e=this,r=this.get(),n=r.data,o=r.transpose,a=r.firstRowIsHeader,i=r.skipRows,u=r.hot;if(n){var s=this.store.get().dw_chart,l=s.dataset(dw.datasource.delimited({csv:n,transpose:o,firstRowIsHeader:a,skipRows:i}).parse()).dataset();this.set({columnOrder:l.columnOrder()});var c=[[]];l.eachColumn((function(t){return c[0].push(t.title())})),l.eachRow((function(t){var e=[];l.eachColumn((function(r){return e.push(r.raw(t))})),c.push(e)})),u.loadData(c);var f=re(this,s,l,t);u.updateSettings({cells:function(t,r){return{readOnly:e.get().readonly||l.hasColumn(r)&&l.column(r).isComputed&&0===t,renderer:f}},manualColumnMove:[]}),this.set({ds:l}),this.set({has_changes:ne(chart.get("metadata.data.changes",[])).length>0}),t.hooks.once("afterRender",(function(){return e.initCustomEvents()})),t.hooks.once("afterRender",(function(){return e.fire("afterRender")})),u.render()}},dataChanged:function(t){var e=this,r=this.get().hot,n=!1;t.forEach((function(t){var o=f(t,4),a=o[0],i=o[1],u=o[2],s=o[3];if(u!==s){var l=e.store.get().dw_chart,c=e.get().transpose,h=ne(l.get("metadata.data.changes",[]));if(a=r.toPhysicalRow(a),i=l.dataset().columnOrder()[i],c){var d=a;a=i,i=d}h.push({column:i,row:a,value:s,previous:u,time:(new Date).getTime()}),l.set("metadata.data.changes",h),n=!0}})),n&&setTimeout((function(){e.update(),chart.save()}),100)},columnMoved:function(e,r){var n=this,o=this.get().hot;if(e.length){var a=this.get().columnOrder,i=a.slice(0),s=a[r],l=i.splice(e[0],e.length),c=void 0===s?i.length:s?i.indexOf(s):0;i.splice.apply(i,[c,0].concat(u(l))),this.store.get().dw_chart.set("metadata.data.column-order",i.slice(0)),this.set({columnOrder:i}),t.hooks.once("afterRender",(function(){setTimeout((function(){n.fire("resetSort"),o.selectCell(0,c,o.countRows()-1,c+l.length-1)}),10)})),this.update()}},updateHeight:function(){var t=document.querySelector(".ht_master.handsontable .wtHolder .wtHider").getBoundingClientRect().height;this.refs.hot.style.height=Math.min(500,t+10)+"px"},checkRange:function(t,e,r,n){var o=this.get().hot,a=this.get().ds;if(e!==n||0!==t||r!==o.countRows()-1)if(e===n||0!==t||r!==o.countRows()-1)this.set({activeColumn:null,multiSelection:!1});else{for(var i=[],u=Math.min(e,n);u<=Math.max(e,n);u++)i.push(+document.querySelector("#data-preview .htCore tbody tr:first-child td:nth-child(".concat(u+2,")")).dataset.column);this.set({multiSelection:i.map((function(t){return a.column(t)})),activeColumn:null})}},initCustomEvents:function(){var t=this;setTimeout((function(){t.refs.hot.querySelectorAll(".htCore thead th:first-child").forEach((function(t){t.removeEventListener("click",ce),t.addEventListener("click",ce)})),t.refs.hot.querySelectorAll(".htCore thead th+th").forEach((function(t){t.removeEventListener("click",le),t.addEventListener("click",le)}))}),500)},getColumnFormat:function(t){return this.store.get().dw_chart.get("metadata.data.column-format",{})[t]||{type:"auto",ignore:!1}}};function ue(){var e=this;oe=this,t.hooks.once("afterRender",(function(){return e.initCustomEvents()})),window.addEventListener("keyup",(function(t){var r=e.get(),n=r.activeColumn,o=r.ds;if(n&&"input"!==t.target.tagName.toLowerCase()&&"textarea"!==t.target.tagName.toLowerCase()&&("ArrowRight"===t.key||"ArrowLeft"===t.key)){t.preventDefault(),t.stopPropagation();var a=o.indexOf(n.name());"ArrowRight"===t.key?e.set({activeColumn:o.column((a+1)%o.numColumns())}):e.set({activeColumn:o.column((a-1+o.numColumns())%o.numColumns())})}}));var r=this.store.get().dw_chart,n=new t(this.refs.hot,{data:[],rowHeaders:function(e){return t.hooks.run(n,"modifyRow",e)+1},colHeaders:!0,fixedRowsTop:1,fixedColumnsLeft:this.get().fixedColumnsLeft,filters:!0,startRows:13,startCols:8,fillHandle:!1,stretchH:"all",height:500,manualColumnMove:!0,selectionMode:"range",autoColumnSize:{useHeaders:!0,syncLimit:5},sortIndicator:!0,columnSorting:!0,sortFunction:function(t,e){if(e.col>-1){var n=r.dataset().column(e.col),o=n.type();return function(e,r){return 0===e[0]?-1:(e[1]=n.val(e[0]-1),r[1]=n.val(r[0]-1),"number"===o&&(isNaN(e[1])&&(e[1]=t?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY),isNaN(r[1])&&(r[1]=t?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY)),"date"===o&&("string"==typeof e[1]&&(e[1]=new Date(110,0,1)),"string"==typeof r[1]&&(r[1]=new Date(110,0,1))),("desc"===t?-1:1)*(e[1]>r[1]?1:e[1]<r[1]?-1:0))}}return function(t,e){return t[0]-e[0]}},afterGetColHeader:function(t,r){var n=e.get(),o=n.activeColumn,a=n.ds;a&&a.hasColumn(t)&&((0===t||t)&&o&&a.column(t).name()===o.name()&&r.classList.add("selected"),(0===t||t)&&(e.getColumnFormat(a.column(t).name()).ignore?r.classList.add("ignored"):r.classList.remove("ignored")))},search:"search"});window.HT=n,this.set({hot:n}),t.hooks.add("afterSetDataAtCell",(function(t){return e.dataChanged(t)})),t.hooks.add("afterColumnMove",(function(t,r){return e.columnMoved(t,r)})),t.hooks.add("afterRender",(function(){return e.updateHeight()})),t.hooks.add("afterSelection",(function(t,r,n,o){return e.checkRange(t,r,n,o)}))}function se(t){var e=t.changed,r=t.current,n=t.previous,o=r.hot;if(o){if(e.data&&this.update(),e.firstRowIsHeader&&n&&void 0!==n.firstRowIsHeader&&this.update(),e.hot&&this.update(),e.search&&n&&(this.doSearch(),this.set({searchIndex:0})),e.searchResults&&o.render(),e.currentResult&&r.currentResult){o.render();var a=r.currentResult;o.scrollViewportTo(a.row,a.col),setTimeout((function(){o.scrollViewportTo(a.row,a.col)}),100)}e.activeColumn&&setTimeout((function(){return o.render()}),10),e.fixedColumnsLeft&&o.updateSettings({fixedColumnsLeft:r.fixedColumnsLeft}),e.sorting&&o.getPlugin("columnSorting").sort(chart.dataset().indexOf(r.sorting.sortBy),r.sorting.sortDir?"asc":"desc")}}function le(t){for(var e=this.parentNode.children.length,r=-1,n=0;n<e;n++)if(this.parentNode.children.item(n)===this){r=n;break}var o=+oe.refs.hot.querySelector(".htCore tbody tr:first-child td:nth-child(".concat(r+1,")")).dataset.column,a=oe.store.get().dw_chart,i=oe.get(),u=i.activeColumn,s=i.hot;if(a.dataset().hasColumn(o)){var l=a.dataset().column(+o);u&&u.name()===l.name()?(t.target.parentNode.classList.remove("selected"),oe.set({activeColumn:!1}),s.deselectCell()):(t.target.parentNode.classList.add("selected"),oe.set({activeColumn:l}))}}function ce(t){t.preventDefault();var e=oe.get().transpose;oe.set({transpose:!e}),oe.update()}function fe(t,e){var r;return{c:function(){var t;t="div",(r=document.createElement(t)).id="data-preview"},m:function(e,n){!function(t,e,r){t.insertBefore(e,r)}(e,r,n),t.refs.hot=r},p:v,d:function(e){var n;e&&(n=r).parentNode.removeChild(n),t.refs.hot===r&&(t.refs.hot=null)}}}function he(t){var e=this;!function(t,e){t._handlers=y(),t._slots=y(),t._bind=e._bind,t._staged={},t.options=e,t.root=e.root||t,t.store=e.store||t.root.store,e.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}(this,t),this.refs={},this._state=g({hot:null,data:"",readonly:!1,skipRows:0,firstRowIsHeader:!0,fixedColumnsLeft:0,searchIndex:0,sortBy:"-",transpose:!1,activeColumn:null,search:"",searchResults:[]},t.data),this._recompute({searchResults:1,searchIndex:1},this._state),this._intro=!0,this._handlers.state=[se],se.call(this,{changed:b({},this._state),current:this._state}),this._fragment=fe(this,this._state),this.root._oncreate.push((function(){ue.call(e),e.fire("update",{changed:b({},e._state),current:e._state})})),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor),_(this))}return g(he.prototype,x),g(he.prototype,ie),he.prototype._recompute=function(t,e){(t.searchResults||t.searchIndex)&&this._differs(e.currentResult,e.currentResult=function(t){var e=t.searchResults,r=t.searchIndex;if(!e||!e.length)return null;var n=e.length;if(r<0||r>=n){for(;r<0;)r+=n;r>n&&(r%=n)}return e[r]}(e))&&(t.currentResult=!0)},{Handsontable:he}}));
