!function(n,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define("svelte/signin",r):(n=n||self).signin=r()}(this,(function(){"use strict";function n(r){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n})(r)}function r(n,r,t){return r in n?Object.defineProperty(n,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):n[r]=t,n}function t(n,r){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(n);r&&(s=s.filter((function(r){return Object.getOwnPropertyDescriptor(n,r).enumerable}))),t.push.apply(t,s)}return t}function s(n){for(var s=1;s<arguments.length;s++){var e=null!=arguments[s]?arguments[s]:{};s%2?t(Object(e),!0).forEach((function(t){r(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):t(Object(e)).forEach((function(r){Object.defineProperty(n,r,Object.getOwnPropertyDescriptor(e,r))}))}return n}function e(n){return(e=Object.setPrototypeOf?Object.getPrototypeOf:function(n){return n.__proto__||Object.getPrototypeOf(n)})(n)}function o(n,r){return(o=Object.setPrototypeOf||function(n,r){return n.__proto__=r,n})(n,r)}function i(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(n){return!1}}function a(n,r,t){return(a=i()?Reflect.construct:function(n,r,t){var s=[null];s.push.apply(s,r);var e=new(Function.bind.apply(n,s));return t&&o(e,t.prototype),e}).apply(null,arguments)}function c(n){var r="function"==typeof Map?new Map:void 0;return(c=function(n){if(null===n||(t=n,-1===Function.toString.call(t).indexOf("[native code]")))return n;var t;if("function"!=typeof n)throw new TypeError("Super expression must either be null or a function");if(void 0!==r){if(r.has(n))return r.get(n);r.set(n,s)}function s(){return a(n,arguments,e(this).constructor)}return s.prototype=Object.create(n.prototype,{constructor:{value:s,enumerable:!1,writable:!0,configurable:!0}}),o(s,n)})(n)}function u(n,r){if(null==n)return{};var t,s,e=function(n,r){if(null==n)return{};var t,s,e={},o=Object.keys(n);for(s=0;s<o.length;s++)t=o[s],r.indexOf(t)>=0||(e[t]=n[t]);return e}(n,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(n);for(s=0;s<o.length;s++)t=o[s],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(n,t)&&(e[t]=n[t])}return e}function p(n,r){return!r||"object"!=typeof r&&"function"!=typeof r?function(n){if(void 0===n)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return n}(n):r}function d(){}function l(n,r){for(var t in r)n[t]=r[t];return n}function f(n,r){n.appendChild(r)}function g(n,r,t){n.insertBefore(r,t)}function w(n){n.parentNode.removeChild(n)}function m(n){return document.createElement(n)}function v(n){return document.createTextNode(n)}function h(n,r,t,s){n.addEventListener(r,t,s)}function _(n,r,t,s){n.removeEventListener(r,t,s)}function E(n,r,t){null==t?n.removeAttribute(r):n.setAttribute(r,t)}function b(n,r,t){n.style.setProperty(r,t)}function S(n,r,t){n.classList[t?"add":"remove"](r)}function y(){return Object.create(null)}function P(r,t){return r!=r?t==t:r!==t||r&&"object"===n(r)||"function"==typeof r}function k(n,r){return n!=n?r==r:n!==r}function H(n,r){var t=n in this._handlers&&this._handlers[n].slice();if(t)for(var s=0;s<t.length;s+=1){var e=t[s];if(!e.__calling)try{e.__calling=!0,e.call(this,r)}finally{e.__calling=!1}}}function L(n){n._lock=!0,R(n._beforecreate),R(n._oncreate),R(n._aftercreate),n._lock=!1}function O(){return this._state}function N(n,r){n._handlers=y(),n._slots=y(),n._bind=r._bind,n._staged={},n.options=r,n.root=r.root||n,n.store=r.store||n.root.store,r.root||(n._beforecreate=[],n._oncreate=[],n._aftercreate=[])}function T(n,r){var t=this._handlers[n]||(this._handlers[n]=[]);return t.push(r),{cancel:function(){var n=t.indexOf(r);~n&&t.splice(n,1)}}}function R(n){for(;n&&n.length;)n.shift()()}var j={destroy:function(n){this.destroy=d,this.fire("destroy"),this.set=d,this._fragment.d(!1!==n),this._fragment=null,this._state={}},get:O,fire:H,on:T,set:function(n){this._set(l({},n)),this.root._lock||L(this.root)},_recompute:d,_set:function(n){var r=this._state,t={},s=!1;for(var e in n=l(this._staged,n),this._staged={},n)this._differs(n[e],r[e])&&(t[e]=s=!0);s&&(this._state=l(l({},r),n),this._recompute(t,this._state),this._bind&&this._bind(t,this._state),this._fragment&&(this.fire("state",{changed:t,current:this._state,previous:r}),this._fragment.p(t,this._state),this.fire("update",{changed:t,current:this._state,previous:r})))},_stage:function(n){l(this._staged,n)},_mount:function(n,r){this._fragment[this._fragment.i?"i":"m"](n,r||null)},_differs:P},M={};function x(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"core";"chart"===n?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(M[n]=window.__dw.vis.meta.locale||{}):M[n]="core"===n?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[n])}function I(n){var r=arguments,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"core";if(n=n.trim(),M[t]||x(t),!M[t][n])return"MISSING:"+n;var s=M[t][n];return"string"==typeof s&&arguments.length>2&&(s=s.replace(/\$(\d)/g,(function(n,t){return t=2+Number(t),void 0===r[t]?n:r[t]}))),s}function C(n){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=s({payload:null,raw:!1,method:"GET",baseUrl:"//".concat(dw.backend.__api_domain),mode:"cors",credentials:"include"},r,{headers:s({"Content-Type":"application/json"},r.headers)}),e=t.payload,o=t.baseUrl,i=t.raw,a=u(t,["payload","baseUrl","raw"]),c="".concat(o.replace(/\/$/,""),"/").concat(n.replace(/^\//,""));return e&&(a.body=JSON.stringify(e)),window.fetch(c,a).then((function(n){if(i)return n;if(!n.ok)throw new q(n);if(204!==n.status){var r=n.headers.get("content-type").split(";")[0];return"application/json"===r?n.json():"image/png"===r||"application/pdf"===r?n.blob():n.text()}}))}C.get=F("GET"),C.patch=F("PATCH"),C.put=F("PUT"),C.post=F("POST"),C.head=F("HEAD");function F(n){return function(r,t){if(t&&t.method)throw new Error("Setting option.method is not allowed in httpReq.".concat(n.toLowerCase(),"()"));return C(r,s({},t,{method:n}))}}C.delete=F("DELETE");var A,q=function(n){function r(n){var t;return function(n,r){if(!(n instanceof r))throw new TypeError("Cannot call a class as a function")}(this,r),(t=p(this,e(r).call(this))).name="HttpReqError",t.status=n.status,t.statusText=n.statusText,t.message="[".concat(n.status,"] ").concat(n.statusText),t.response=n,t}return function(n,r){if("function"!=typeof r&&null!==r)throw new TypeError("Super expression must either be null or a function");n.prototype=Object.create(r&&r.prototype,{constructor:{value:n,writable:!0,configurable:!0}}),r&&o(n,r)}(r,n),r}(c(Error)),D=!1;function U(n){var r=n.password;return A?A(r):(!D&&r.length>4&&(D=!0,require(["zxcvbn"],(function(n){A=n}))),!1)}function $(n,r){var t,s=r.password.length>=8&&z();return{c:function(){s&&s.c(),t=document.createComment("")},m:function(n,r){s&&s.m(n,r),g(n,t,r)},p:function(n,r){r.password.length>=8?s||((s=z()).c(),s.m(t.parentNode,t)):s&&(s.d(1),s=null)},d:function(n){s&&s.d(n),n&&w(t)}}}function z(n,r){return{c:d,m:d,d:d}}function G(n){N(this,n),this._state=l({password:"",passwordRepeat:""},n.data),this._recompute({password:1,passwordRepeat:1,passwordStrength:1,passwordTooShort:1,passwordHelp:1,passwordMismatch:1},this._state),this._intro=!0,this._fragment=$(0,this._state),n.target&&(this._fragment.c(),this._mount(n.target,n.anchor))}function Z(n,r,t){return t?r?r(n):n:(n&&n.then||(n=Promise.resolve(n)),r?n.then(r):n)}l(G.prototype,j),G.prototype._recompute=function(n,r){var t,s,e;n.password&&this._differs(r.passwordTooShort,r.passwordTooShort=r.password.length<8)&&(n.passwordTooShort=!0),(n.password||n.passwordRepeat)&&this._differs(r.passwordMismatch,r.passwordMismatch=(s=(t=r).password,e=t.passwordRepeat,s&&s!==e))&&(n.passwordMismatch=!0),n.password&&this._differs(r.passwordStrength,r.passwordStrength=U(r))&&(n.passwordStrength=!0),(n.password||n.passwordStrength)&&this._differs(r.passwordHelp,r.passwordHelp=function(n){var r=n.password,t=n.passwordStrength;if(""===r||!t)return I("account / pwd-too-short").replace("%num",8);var s=["bad","weak","ok","good","excellent"][t.score];return I("account / password / ".concat(s))}(r))&&(n.passwordHelp=!0),(n.password||n.passwordTooShort||n.passwordStrength||n.passwordHelp)&&this._differs(r.passwordError,r.passwordError=function(n){var r=n.password,t=n.passwordTooShort,s=n.passwordStrength,e=n.passwordHelp;return!!r&&(t?I("account / pwd-too-short").replace("%num",8):!!(s&&s.score<2)&&e)}(r))&&(n.passwordError=!0),(n.passwordStrength||n.passwordHelp)&&this._differs(r.passwordSuccess,r.passwordSuccess=function(n){var r=n.passwordStrength,t=n.passwordHelp;return!!(r&&r.score>2)&&t}(r))&&(n.passwordSuccess=!0),n.passwordMismatch&&this._differs(r.passwordRepeatError,r.passwordRepeatError=!!r.passwordMismatch&&I("account / password / mismatch"))&&(n.passwordRepeatError=!0),(n.password||n.passwordMismatch||n.passwordTooShort)&&this._differs(r.passwordOk,r.passwordOk=function(n){var r=n.password,t=n.passwordMismatch,s=n.passwordTooShort;return r&&!t&&!s}(r))&&(n.passwordOk=!0)};var B=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;function J(){}function K(n){var r=n();if(r&&r.then)return r.then(J)}function Q(n,r){try{var t=n()}catch(n){return r(n)}return t&&t.then?t.then(void 0,r):t}function V(n,r){return n&&n.then?n.then(r):r(n)}function W(n){return B.test(n)}var X={doLogIn:function(){try{var n=this,r=n.get(),t=r.loginEmail,s=r.loginPassword,e=r.rememberLogin;return n.set({loggingIn:!0,loginError:"",loginSuccess:""}),V(Q((function(){return Z(C.post("/v3/auth/login",{payload:{email:t,password:s,keepSession:e}}),(function(){n.set({loginSuccess:"Login successful, reloading page"}),setTimeout((function(){window.window.location.href="/"}),2e3)}))}),(function(r){return K((function(){if("HttpReqError"===r.name)return Z(r.response.json(),(function(t){n.set({loginError:t?t.message:r.message})}));n.set({loginError:r})}))})),(function(){n.set({loggingIn:!1})}))}catch(n){return Promise.reject(n)}},doSignUp:function(){try{var n=this,r=n.get(),t=r.signupEmail,s=r.signupPassword,e=r.signupPassword2;return s!==e?n.set({signupError:"Passwords must match"}):(n.set({signingUp:!0,signupError:"",signupSuccess:""}),V(Q((function(){return Z(C.post("/v3/auth/signup",{payload:{email:t,password:s}}),(function(){n.set({signupSuccess:"Sign up successful. Redirecting to user dashboard."}),setTimeout((function(){window.location.href="/"}),2e3)}))}),(function(r){return K((function(){if("HttpReqError"===r.name)return Z(r.response.json(),(function(t){n.set({signupError:t?t.message:r.message})}));n.set({signupError:r})}))})),(function(){n.set({signingUp:!1})})))}catch(n){return Promise.reject(n)}},requestNewPassword:function(){try{var n=this,r=n.get().loginEmail;return n.set({requestingPassword:!0,loginError:"",loginSuccess:""}),V(Q((function(){return Z(C.post("/v3/auth/reset-password",{payload:{email:r}}),(function(){n.set({loginSuccess:I("signin / password-reset / success")})}))}),(function(r){return K((function(){if("HttpReqError"===r.name)return Z(r.response.json(),(function(t){n.set({loginError:t.message?I("signin / password-reset / error / ".concat(t.message)):r.message})}));n.set({loginError:r})}))})),(function(){n.set({requestingPassword:!1})}))}catch(n){return Promise.reject(n)}}};function Y(n,r,t){var s=Object.create(n);return s.signin=r[t],s}function nn(n,r){var t;return{c:function(){(t=m("div")).className="alert alert-success"},m:function(n,s){g(n,t,s),t.innerHTML=r.loginSuccess},p:function(n,r){n.loginSuccess&&(t.innerHTML=r.loginSuccess)},d:function(n){n&&w(t)}}}function rn(n,r){var t;return{c:function(){(t=m("div")).className="alert alert-error"},m:function(n,s){g(n,t,s),t.innerHTML=r.loginError},p:function(n,r){n.loginError&&(t.innerHTML=r.loginError)},d:function(n){n&&w(t)}}}function tn(n,r){var t,s,e,o,i,a=I("password"),c=!1;function u(){c=!0,n.set({loginPassword:i.value}),c=!1}return{c:function(){t=m("div"),s=m("label"),e=v(a),o=v("\n                        "),i=m("input"),s.className="svelte-6km566",h(i,"input",u),i.className="login-pwd input-xxlarge span3 svelte-6km566",i.autocomplete="current-password",E(i,"type","password"),t.className="control-group svelte-6km566"},m:function(n,a){g(n,t,a),f(t,s),f(s,e),f(t,o),f(t,i),i.value=r.loginPassword},p:function(n,r){!c&&n.loginPassword&&(i.value=r.loginPassword)},d:function(n){n&&w(t),_(i,"input",u)}}}function sn(n,r){var t,s,e,o,i,a,c,u,p=I("Remember login?");function d(){n.set({rememberLogin:e.checked})}var l=r.loggingIn&&en();function S(r){r.preventDefault(),n.doLogIn()}return{c:function(){t=m("div"),s=m("label"),e=m("input"),o=v(" "),i=m("noscript"),a=v("\n                    "),c=m("button"),l&&l.c(),u=v(" Login"),h(e,"change",d),e.className="keep-login svelte-6km566",E(e,"type","checkbox"),s.className="checkbox svelte-6km566",s.htmlFor="keep-login",b(s,"margin-top","10px"),h(c,"click",S),c.disabled=r.invalidLoginForm,c.className="btn btn-login btn-primary svelte-6km566"},m:function(n,d){g(n,t,d),f(t,s),f(s,e),e.checked=r.rememberLogin,f(s,o),f(s,i),i.insertAdjacentHTML("afterend",p),f(t,a),f(t,c),l&&l.m(c,null),f(c,u)},p:function(n,r){n.rememberLogin&&(e.checked=r.rememberLogin),r.loggingIn?l||((l=en()).c(),l.m(c,u)):l&&(l.d(1),l=null),n.invalidLoginForm&&(c.disabled=r.invalidLoginForm)},d:function(n){n&&w(t),_(e,"change",d),l&&l.d(),_(c,"click",S)}}}function en(n,r){var t;return{c:function(){(t=m("i")).className="fa fa-fw fa-spinner fa-pulse"},m:function(n,r){g(n,t,r)},d:function(n){n&&w(t)}}}function on(n,r){var t,s,e,o,i=I("Send new password"),a=r.requestingPassword&&an();function c(r){r.preventDefault(),n.requestNewPassword()}return{c:function(){t=m("div"),s=m("button"),a&&a.c(),e=v(" "),o=m("noscript"),h(s,"click",c),s.disabled=r.invalidLoginEmail,s.className="btn btn-send-pw btn-primary",b(t,"padding-bottom","10px")},m:function(n,r){g(n,t,r),f(t,s),a&&a.m(s,null),f(s,e),f(s,o),o.insertAdjacentHTML("afterend",i)},p:function(n,r){r.requestingPassword?a||((a=an()).c(),a.m(s,e)):a&&(a.d(1),a=null),n.invalidLoginEmail&&(s.disabled=r.invalidLoginEmail)},d:function(n){n&&w(t),a&&a.d(),_(s,"click",c)}}}function an(n,r){var t;return{c:function(){(t=m("i")).className="fa fa-fw fa-spinner fa-pulse"},m:function(n,r){g(n,t,r)},d:function(n){n&&w(t)}}}function cn(n,r){var t,s=I("Can't recall your password?");function e(r){r.preventDefault(),n.set({forgotPassword:!0})}return{c:function(){h(t=m("a"),"click",e),t.href="#/forgot-password"},m:function(n,r){g(n,t,r),t.innerHTML=s},d:function(n){n&&w(t),_(t,"click",e)}}}function un(n,r){var t,s=I("Return to login...");function e(r){r.preventDefault(),n.set({forgotPassword:!1})}return{c:function(){h(t=m("a"),"click",e),t.href="#/return"},m:function(n,r){g(n,t,r),t.innerHTML=s},d:function(n){n&&w(t),_(t,"click",e)}}}function pn(n,r){var t;return{c:function(){(t=m("style")).textContent="#dwLoginForm {\n                width: 420px;\n                margin-left: -210px;\n                box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);\n                border: 0;\n                position: relative;\n            }"},m:function(n,r){g(n,t,r)},p:d,d:function(n){n&&w(t)}}}function dn(n,r){var t,s,e,o,i,a,c,u,p,d,l,y,P,k,H,L,O,N,T,R,j,M,x,C,F,A,q,D,U,$,z,Z,B,J,K=I("login / signup / headline"),Q=I("login / signup / intro"),V=I("email"),W=!1,X=I("password"),Y=!1,nn={},rn=I("repeat password"),tn=!1,sn=I("Sign Up"),en=r.signupSuccess&&ln(n,r),on=r.signupError&&fn(n,r);function an(){W=!0,n.set({signupEmail:k.value}),W=!1}function cn(){Y=!0,n.set({signupPassword:R.value}),Y=!1}var un={};void 0!==r.signupPassword&&(un.password=r.signupPassword,nn.password=!0),void 0!==r.signupPassword2&&(un.passwordRepeat=r.signupPassword2,nn.passwordRepeat=!0),void 0!==r.passwordHelp&&(un.passwordHelp=r.passwordHelp,nn.passwordHelp=!0),void 0!==r.passwordSuccess&&(un.passwordSuccess=r.passwordSuccess,nn.passwordSuccess=!0),void 0!==r.passwordError&&(un.passwordError=r.passwordError,nn.passwordError=!0),void 0!==r.passwordRepeatError&&(un.passwordRepeatError=r.passwordRepeatError,nn.passwordRepeatError=!0),void 0!==r.signupPasswordOk&&(un.passwordOk=r.signupPasswordOk,nn.passwordOk=!0);var pn=new G({root:n.root,store:n.store,data:un,_bind:function(r,t){var s={};!nn.password&&r.password&&(s.signupPassword=t.password),!nn.passwordRepeat&&r.passwordRepeat&&(s.signupPassword2=t.passwordRepeat),!nn.passwordHelp&&r.passwordHelp&&(s.passwordHelp=t.passwordHelp),!nn.passwordSuccess&&r.passwordSuccess&&(s.passwordSuccess=t.passwordSuccess),!nn.passwordError&&r.passwordError&&(s.passwordError=t.passwordError),!nn.passwordRepeatError&&r.passwordRepeatError&&(s.passwordRepeatError=t.passwordRepeatError),!nn.passwordOk&&r.passwordOk&&(s.signupPasswordOk=t.passwordOk),n._set(s),nn={}}});function dn(n){return n.passwordError?mn:n.passwordSuccess?wn:n.passwordHelp?gn:void 0}n.root._beforecreate.push((function(){pn._bind({password:1,passwordRepeat:1,passwordHelp:1,passwordSuccess:1,passwordError:1,passwordRepeatError:1,passwordOk:1},pn.get())}));var En=dn(r),bn=En&&En(n,r);function Sn(){tn=!0,n.set({signupPassword2:U.value}),tn=!1}var yn=r.passwordRepeatError&&vn(n,r);function Pn(n){return n.signingUp?_n:hn}var kn=Pn(r),Hn=kn(n,r);function Ln(r){r.preventDefault(),n.doSignUp()}return{c:function(){t=m("div"),s=m("h3"),e=v("\n            "),o=m("p"),i=v("\n\n            "),en&&en.c(),a=v(" "),on&&on.c(),c=v("\n\n            "),u=m("div"),p=m("form"),d=m("div"),l=m("label"),y=v(V),P=v("\n                        "),k=m("input"),H=v("\n                    "),L=m("div"),O=m("label"),N=v(X),T=v("\n                        "),R=m("input"),j=v("\n                        "),M=m("div"),pn._fragment.c(),x=v("\n                            "),bn&&bn.c(),C=v("\n                    "),F=m("div"),A=m("label"),q=v(rn),D=v("\n                        "),U=m("input"),$=v("\n                        "),yn&&yn.c(),z=v("\n                    "),Z=m("button"),Hn.c(),B=v("\n                        \n                        "),J=m("noscript"),l.className="svelte-6km566",h(k,"input",an),E(k,"type","email"),k.autocomplete="username",k.className="span3 input-xlarge register-email svelte-6km566",d.className="control-group svelte-6km566",S(d,"error",r.invalidSignupEmail),O.className="svelte-6km566",h(R,"input",cn),R.autocomplete="new-password",E(R,"type","password"),R.className="span3 input-xlarge register-pwd svelte-6km566",b(M,"width","270px"),L.className="control-group svelte-6km566",S(L,"warning",r.passwordError),S(L,"success",r.passwordSuccess),A.className="svelte-6km566",h(U,"input",Sn),U.autocomplete="new-password",E(U,"type","password"),U.className="span3 input-xlarge register-pwd-2 svelte-6km566",F.className="control-group svelte-6km566",S(F,"error",r.passwordRepeatError),h(Z,"click",Ln),Z.disabled=r.invalidSignupForm,Z.className="btn btn-default",u.className="signup-form form-vertcal",t.className="span3 row-signup"},m:function(n,w){g(n,t,w),f(t,s),s.innerHTML=K,f(t,e),f(t,o),o.innerHTML=Q,f(t,i),en&&en.m(t,null),f(t,a),on&&on.m(t,null),f(t,c),f(t,u),f(u,p),f(p,d),f(d,l),f(l,y),f(d,P),f(d,k),k.value=r.signupEmail,f(p,H),f(p,L),f(L,O),f(O,N),f(L,T),f(L,R),R.value=r.signupPassword,f(L,j),f(L,M),pn._mount(M,null),f(M,x),bn&&bn.m(M,null),f(p,C),f(p,F),f(F,A),f(A,q),f(F,D),f(F,U),U.value=r.signupPassword2,f(F,$),yn&&yn.m(F,null),f(p,z),f(p,Z),Hn.m(Z,null),f(Z,B),f(Z,J),J.insertAdjacentHTML("afterend",sn)},p:function(s,e){(r=e).signupSuccess?en?en.p(s,r):((en=ln(n,r)).c(),en.m(t,a)):en&&(en.d(1),en=null),r.signupError?on?on.p(s,r):((on=fn(n,r)).c(),on.m(t,c)):on&&(on.d(1),on=null),!W&&s.signupEmail&&(k.value=r.signupEmail),s.invalidSignupEmail&&S(d,"error",r.invalidSignupEmail),!Y&&s.signupPassword&&(R.value=r.signupPassword);var o={};!nn.password&&s.signupPassword&&(o.password=r.signupPassword,nn.password=void 0!==r.signupPassword),!nn.passwordRepeat&&s.signupPassword2&&(o.passwordRepeat=r.signupPassword2,nn.passwordRepeat=void 0!==r.signupPassword2),!nn.passwordHelp&&s.passwordHelp&&(o.passwordHelp=r.passwordHelp,nn.passwordHelp=void 0!==r.passwordHelp),!nn.passwordSuccess&&s.passwordSuccess&&(o.passwordSuccess=r.passwordSuccess,nn.passwordSuccess=void 0!==r.passwordSuccess),!nn.passwordError&&s.passwordError&&(o.passwordError=r.passwordError,nn.passwordError=void 0!==r.passwordError),!nn.passwordRepeatError&&s.passwordRepeatError&&(o.passwordRepeatError=r.passwordRepeatError,nn.passwordRepeatError=void 0!==r.passwordRepeatError),!nn.passwordOk&&s.signupPasswordOk&&(o.passwordOk=r.signupPasswordOk,nn.passwordOk=void 0!==r.signupPasswordOk),pn._set(o),nn={},En===(En=dn(r))&&bn?bn.p(s,r):(bn&&bn.d(1),(bn=En&&En(n,r))&&bn.c(),bn&&bn.m(M,null)),s.passwordError&&S(L,"warning",r.passwordError),s.passwordSuccess&&S(L,"success",r.passwordSuccess),!tn&&s.signupPassword2&&(U.value=r.signupPassword2),r.passwordRepeatError?yn?yn.p(s,r):((yn=vn(n,r)).c(),yn.m(F,null)):yn&&(yn.d(1),yn=null),s.passwordRepeatError&&S(F,"error",r.passwordRepeatError),kn!==(kn=Pn(r))&&(Hn.d(1),(Hn=kn(n,r)).c(),Hn.m(Z,B)),s.invalidSignupForm&&(Z.disabled=r.invalidSignupForm)},d:function(n){n&&w(t),en&&en.d(),on&&on.d(),_(k,"input",an),_(R,"input",cn),pn.destroy(),bn&&bn.d(),_(U,"input",Sn),yn&&yn.d(),Hn.d(),_(Z,"click",Ln)}}}function ln(n,r){var t;return{c:function(){(t=m("div")).className="alert alert-success"},m:function(n,s){g(n,t,s),t.innerHTML=r.signupSuccess},p:function(n,r){n.signupSuccess&&(t.innerHTML=r.signupSuccess)},d:function(n){n&&w(t)}}}function fn(n,r){var t;return{c:function(){(t=m("div")).className="alert alert-error"},m:function(n,s){g(n,t,s),t.innerHTML=r.signupError},p:function(n,r){n.signupError&&(t.innerHTML=r.signupError)},d:function(n){n&&w(t)}}}function gn(n,r){var t;return{c:function(){(t=m("p")).className="help muted svelte-6km566"},m:function(n,s){g(n,t,s),t.innerHTML=r.passwordHelp},p:function(n,r){n.passwordHelp&&(t.innerHTML=r.passwordHelp)},d:function(n){n&&w(t)}}}function wn(n,r){var t;return{c:function(){(t=m("p")).className="help text-success svelte-6km566"},m:function(n,s){g(n,t,s),t.innerHTML=r.passwordSuccess},p:function(n,r){n.passwordSuccess&&(t.innerHTML=r.passwordSuccess)},d:function(n){n&&w(t)}}}function mn(n,r){var t;return{c:function(){(t=m("p")).className="help text-warning svelte-6km566"},m:function(n,s){g(n,t,s),t.innerHTML=r.passwordError},p:function(n,r){n.passwordError&&(t.innerHTML=r.passwordError)},d:function(n){n&&w(t)}}}function vn(n,r){var t;return{c:function(){(t=m("p")).className="help text-error svelte-6km566"},m:function(n,s){g(n,t,s),t.innerHTML=r.passwordRepeatError},p:function(n,r){n.passwordRepeatError&&(t.innerHTML=r.passwordRepeatError)},d:function(n){n&&w(t)}}}function hn(n,r){var t;return{c:function(){(t=m("i")).className="fa fa-fw fa-pencil"},m:function(n,r){g(n,t,r)},d:function(n){n&&w(t)}}}function _n(n,r){var t;return{c:function(){(t=m("i")).className="fa fa-fw fa-spinner fa-pulse"},m:function(n,r){g(n,t,r)},d:function(n){n&&w(t)}}}function En(n,r){for(var t,s,e,o=I("login / alternative signin"),i=r.alternativeSignIn,a=[],c=0;c<i.length;c+=1)a[c]=Sn(n,Y(r,i,c));return{c:function(){t=m("div"),s=m("noscript"),e=v(" ");for(var n=0;n<a.length;n+=1)a[n].c();t.className="alternative-signin svelte-6km566"},m:function(n,r){g(n,t,r),f(t,s),s.insertAdjacentHTML("beforebegin",o),f(t,e);for(var i=0;i<a.length;i+=1)a[i].m(t,null)},p:function(r,s){if(r.alternativeSignIn){i=s.alternativeSignIn;for(var e=0;e<i.length;e+=1){var o=Y(s,i,e);a[e]?a[e].p(r,o):(a[e]=Sn(n,o),a[e].c(),a[e].m(t,null))}for(;e<a.length;e+=1)a[e].d(1);a.length=i.length}},d:function(n){n&&w(t),function(n,r){for(var t=0;t<n.length;t+=1)n[t]&&n[t].d(r)}(a,n)}}}function bn(n,r){var t,s;return{c:function(){(t=m("i")).className=s=r.signin.icon+" svelte-6km566"},m:function(n,r){g(n,t,r)},p:function(n,r){n.alternativeSignIn&&s!==(s=r.signin.icon+" svelte-6km566")&&(t.className=s)},d:function(n){n&&w(t)}}}function Sn(n,r){var t,s,e,o,i=r.signin.label,a=r.signin.icon&&bn(0,r);return{c:function(){t=m("a"),a&&a.c(),s=v(" "),e=m("noscript"),t.href=o=r.signin.url,t.className="alternative-signin-link svelte-6km566"},m:function(n,r){g(n,t,r),a&&a.m(t,null),f(t,s),f(t,e),e.insertAdjacentHTML("afterend",i)},p:function(n,r){r.signin.icon?a?a.p(n,r):((a=bn(0,r)).c(),a.m(t,s)):a&&(a.d(1),a=null),n.alternativeSignIn&&i!==(i=r.signin.label)&&(!function(n){for(;n.nextSibling;)n.parentNode.removeChild(n.nextSibling)}(e),e.insertAdjacentHTML("afterend",i)),n.alternativeSignIn&&o!==(o=r.signin.url)&&(t.href=o)},d:function(n){n&&w(t),a&&a.d()}}}function yn(n){N(this,n),this._state=l({noSignup:!1,alternativeSignIn:[],forgotPassword:!1,loginEmail:"",loginPassword:"",rememberLogin:!0,loginEmailError:!1,loginError:"",loginSuccess:"",signupEmail:"",signupPassword:"",signupPassword2:"",signupPasswordOk:!1,passwordHelp:!1,passwordSuccess:!1,passwordError:!1,passwordRepeatError:!1,requestingPassword:!1,loggingIn:!1,signingUp:!1},n.data),this._recompute({loginEmail:1,forgotPassword:1,loginPassword:1,signupEmail:1,signupPassword:1,signupPassword2:1},this._state),this._intro=!0,this._fragment=function(n,r){var t,s,e,o,i,a,c,u,p,d,l,b,y,P,k,H,L,O,N,T,R,j,M,x,C,F,A,q,D,U,$,z,G,Z,B,J=I("login / login / headline"),K=I("login / login / intro"),Q=I("email"),V=!1,W=I("login / signup / confirmation-email"),X=I("login / signup / confirmation-email-hint"),Y=I("login / signup / confirm"),en=r.loginSuccess&&nn(n,r),an=r.loginError&&rn(n,r);function ln(){V=!0,n.set({loginEmail:O.value}),V=!1}var fn=!r.forgotPassword&&tn(n,r),gn=!r.forgotPassword&&sn(n,r),wn=r.forgotPassword&&on(n,r);function mn(n){return n.forgotPassword?un:cn}var vn=mn(r),hn=vn(n,r);function _n(n){return n.noSignup?pn:dn}var bn=_n(r),Sn=bn(n,r),yn=r.alternativeSignIn.length&&En(n,r);function Pn(r){r.stopPropagation(),n.fire("keyup",r)}return{c:function(){t=m("div"),(s=m("button")).textContent="×",e=v("\n    "),o=m("div"),i=m("div"),a=m("h3"),c=v("\n\n            "),u=m("p"),p=v("\n\n            "),en&&en.c(),d=v(" "),an&&an.c(),l=v("\n\n            "),b=m("form"),y=m("div"),P=m("div"),k=m("label"),H=v(Q),L=v("\n                        "),O=m("input"),N=v("\n                    "),fn&&fn.c(),T=v("\n                "),gn&&gn.c(),R=v("\n\n            "),j=m("div"),wn&&wn.c(),M=v("\n                "),x=m("div"),hn.c(),F=v("\n        "),Sn.c(),A=v("\n\n    "),yn&&yn.c(),q=v("\n\n    "),D=m("div"),U=m("div"),$=m("noscript"),z=v("\n\n            "),G=m("div"),Z=v("\n\n            "),B=m("button"),s.type="button",s.className="close",s.dataset.dismiss="modal",k.className="svelte-6km566",h(O,"input",ln),O.className="login-email input-xxlarge span3 svelte-6km566",O.autocomplete="username",E(O,"type","email"),P.className="control-group svelte-6km566",S(P,"error",r.invalidLoginEmail),b.className="login-form form-vertical",i.className=C="span"+(r.noSignup?4:3)+" row-login svelte-6km566",o.className="row login-signup",G.className="sub",B.className="button btn btn-got-it",U.className="jumbo-text",D.className="signup-confirm hidden",h(t,"keyup",Pn),t.className="modal-body svelte-6km566",t.dataset.piwikMask=!0},m:function(n,w){g(n,t,w),f(t,s),f(t,e),f(t,o),f(o,i),f(i,a),a.innerHTML=J,f(i,c),f(i,u),u.innerHTML=K,f(i,p),en&&en.m(i,null),f(i,d),an&&an.m(i,null),f(i,l),f(i,b),f(b,y),f(y,P),f(P,k),f(k,H),f(P,L),f(P,O),O.value=r.loginEmail,f(y,N),fn&&fn.m(y,null),f(b,T),gn&&gn.m(b,null),f(i,R),f(i,j),wn&&wn.m(j,null),f(j,M),f(j,x),hn.m(x,null),f(o,F),Sn.m(o,null),f(t,A),yn&&yn.m(t,null),f(t,q),f(t,D),f(D,U),f(U,$),$.insertAdjacentHTML("beforebegin",W),f(U,z),f(U,G),G.innerHTML=X,f(U,Z),f(U,B),B.innerHTML=Y},p:function(r,s){s.loginSuccess?en?en.p(r,s):((en=nn(n,s)).c(),en.m(i,d)):en&&(en.d(1),en=null),s.loginError?an?an.p(r,s):((an=rn(n,s)).c(),an.m(i,l)):an&&(an.d(1),an=null),!V&&r.loginEmail&&(O.value=s.loginEmail),r.invalidLoginEmail&&S(P,"error",s.invalidLoginEmail),s.forgotPassword?fn&&(fn.d(1),fn=null):fn?fn.p(r,s):((fn=tn(n,s)).c(),fn.m(y,null)),s.forgotPassword?gn&&(gn.d(1),gn=null):gn?gn.p(r,s):((gn=sn(n,s)).c(),gn.m(b,null)),s.forgotPassword?wn?wn.p(r,s):((wn=on(n,s)).c(),wn.m(j,M)):wn&&(wn.d(1),wn=null),vn!==(vn=mn(s))&&(hn.d(1),(hn=vn(n,s)).c(),hn.m(x,null)),r.noSignup&&C!==(C="span"+(s.noSignup?4:3)+" row-login svelte-6km566")&&(i.className=C),bn===(bn=_n(s))&&Sn?Sn.p(r,s):(Sn.d(1),(Sn=bn(n,s)).c(),Sn.m(o,null)),s.alternativeSignIn.length?yn?yn.p(r,s):((yn=En(n,s)).c(),yn.m(t,q)):yn&&(yn.d(1),yn=null)},d:function(n){n&&w(t),en&&en.d(),an&&an.d(),_(O,"input",ln),fn&&fn.d(),gn&&gn.d(),wn&&wn.d(),hn.d(),Sn.d(),yn&&yn.d(),_(t,"keyup",Pn)}}}(this,this._state),n.target&&(this._fragment.c(),this._mount(n.target,n.anchor),L(this))}function Pn(n,r){this._handlers={},this._dependents=[],this._computed=y(),this._sortedComputedProperties=[],this._state=l({},n),this._differs=r&&r.immutable?k:P}l(yn.prototype,j),l(yn.prototype,X),yn.prototype._recompute=function(n,r){var t,s,e,o,i,a,c;(n.loginEmail||n.forgotPassword)&&this._differs(r.invalidLoginEmail,r.invalidLoginEmail=(s=(t=r).loginEmail,e=t.forgotPassword,!(W(s)||""===s&&!e)))&&(n.invalidLoginEmail=!0),(n.loginEmail||n.loginPassword)&&this._differs(r.invalidLoginForm,r.invalidLoginForm=function(n){var r=n.loginEmail,t=n.loginPassword;return!W(r)||""===t}(r))&&(n.invalidLoginForm=!0),(n.signupEmail||n.signupPassword||n.signupPassword2)&&this._differs(r.invalidSignupForm,r.invalidSignupForm=(i=(o=r).signupEmail,a=o.signupPassword,c=o.signupPassword2,!W(i)||a!==c||a.length<8||void 0))&&(n.invalidSignupForm=!0),(n.signupEmail||n.forgotPassword)&&this._differs(r.invalidSignupEmail,r.invalidSignupEmail=function(n){var r=n.signupEmail;return n.forgotPassword,!W(r)&&""!==r}(r))&&(n.invalidSignupEmail=!0),(n.signupPassword||n.signupPassword2)&&this._differs(r.invalidSignupPassword,r.invalidSignupPassword=function(n){var r=n.signupPassword,t=n.signupPassword2;return""!==r&&r!==t}(r))&&(n.invalidSignupPassword=!0)},l(Pn.prototype,{_add:function(n,r){this._dependents.push({component:n,props:r})},_init:function(n){for(var r={},t=0;t<n.length;t+=1){var s=n[t];r["$"+s]=this._state[s]}return r},_remove:function(n){for(var r=this._dependents.length;r--;)if(this._dependents[r].component===n)return void this._dependents.splice(r,1)},_set:function(n,r){var t=this,s=this._state;this._state=l(l({},s),n);for(var e=0;e<this._sortedComputedProperties.length;e+=1)this._sortedComputedProperties[e].update(this._state,r);this.fire("state",{changed:r,previous:s,current:this._state}),this._dependents.filter((function(n){for(var s={},e=!1,o=0;o<n.props.length;o+=1){var i=n.props[o];i in r&&(s["$"+i]=t._state[i],e=!0)}if(e)return n.component._stage(s),!0})).forEach((function(n){n.component.set({})})),this.fire("update",{changed:r,previous:s,current:this._state})},_sortComputedProperties:function(){var n,r=this._computed,t=this._sortedComputedProperties=[],s=y();function e(o){var i=r[o];i&&(i.deps.forEach((function(r){if(r===n)throw new Error("Cyclical dependency detected between ".concat(r," <-> ").concat(o));e(r)})),s[o]||(s[o]=!0,t.push(i)))}for(var o in this._computed)e(n=o)},compute:function(n,r,t){var s,e=this,o={deps:r,update:function(o,i,a){var c=r.map((function(n){return n in i&&(a=!0),o[n]}));if(a){var u=t.apply(null,c);e._differs(u,s)&&(s=u,i[n]=!0,o[n]=s)}}};this._computed[n]=o,this._sortComputedProperties();var i=l({},this._state),a={};o.update(i,a,!0),this._set(i,a)},fire:H,get:O,on:T,set:function(n){var r=this._state,t=this._changed={},s=!1;for(var e in n){if(this._computed[e])throw new Error("'".concat(e,"' is a read-only computed property"));this._differs(n[e],r[e])&&(t[e]=s=!0)}s&&this._set(n,t)}});return{App:yn,data:{},store:new Pn({}),init:function(n){}}}));
