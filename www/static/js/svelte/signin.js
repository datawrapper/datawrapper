!function(n,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define("svelte/signin",t):(n=n||self).signin=t()}(this,(function(){"use strict";function n(){}function t(n,t){for(var i in t)n[i]=t[i];return n}function i(n,t){n.appendChild(t)}function e(n,t,i){n.insertBefore(t,i)}function s(n){n.parentNode.removeChild(n)}function r(n){return document.createElement(n)}function o(n){return document.createTextNode(n)}function a(n,t,i,e){n.addEventListener(t,i,e)}function u(n,t,i,e){n.removeEventListener(t,i,e)}function l(n,t,i){null==i?n.removeAttribute(t):n.setAttribute(t,i)}function c(n,t,i){n.style.setProperty(t,i)}function d(n,t,i){n.classList[i?"add":"remove"](t)}function p(){return Object.create(null)}function g(n,t){return n!=n?t==t:n!==t||n&&"object"==typeof n||"function"==typeof n}function f(n,t){return n!=n?t==t:n!==t}function m(n,t){var i=n in this._handlers&&this._handlers[n].slice();if(i)for(var e=0;e<i.length;e+=1){var s=i[e];if(!s.__calling)try{s.__calling=!0,s.call(this,t)}finally{s.__calling=!1}}}function v(){return this._state}function h(n,t){var i=this._handlers[n]||(this._handlers[n]=[]);return i.push(t),{cancel:function(){var n=i.indexOf(t);~n&&i.splice(n,1)}}}function w(n){for(;n&&n.length;)n.shift()()}var _={destroy:function(t){this.destroy=n,this.fire("destroy"),this.set=n,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:v,fire:m,on:h,set:function(n){var i;this._set(t({},n)),this.root._lock||((i=this.root)._lock=!0,w(i._beforecreate),w(i._oncreate),w(i._aftercreate),i._lock=!1)},_recompute:n,_set:function(n){var i=this._state,e={},s=!1;for(var r in n=t(this._staged,n),this._staged={},n)this._differs(n[r],i[r])&&(e[r]=s=!0);s&&(this._state=t(t({},i),n),this._recompute(e,this._state),this._bind&&this._bind(e,this._state),this._fragment&&(this.fire("state",{changed:e,current:this._state,previous:i}),this._fragment.p(e,this._state),this.fire("update",{changed:e,current:this._state,previous:i})))},_stage:function(n){t(this._staged,n)},_mount:function(n,t){this._fragment[this._fragment.i?"i":"m"](n,t||null)},_differs:g},b={};function E(n){void 0===n&&(n="core"),"chart"===n?window.__dw&&window.__dw.vis&&window.__dw.vis.meta&&(b[n]=window.__dw.vis.meta.locale||{}):b[n]="core"===n?dw.backend.__messages.core:Object.assign({},dw.backend.__messages.core,dw.backend.__messages[n])}function P(n,t){var i=arguments;if(void 0===t&&(t="core"),n=n.trim(),b[t]||E(t),!b[t][n])return"MISSING:"+n;var e=b[t][n];return"string"==typeof e&&arguments.length>2&&(e=e.replace(/\$(\d)/g,(function(n,t){return t=2+Number(t),void 0===i[t]?n:i[t]}))),e}function S(n,t){void 0===t&&(t={});var i=Object.assign({},{payload:null,raw:!1,method:"GET",baseUrl:"//"+dw.backend.__api_domain,mode:"cors",credentials:"include"},t,{headers:Object.assign({},{"Content-Type":"application/json"},t.headers)}),e=i.payload,s=i.baseUrl,r=i.raw,o=function(n,t){var i={};for(var e in n)Object.prototype.hasOwnProperty.call(n,e)&&-1===t.indexOf(e)&&(i[e]=n[e]);return i}(i,["payload","baseUrl","raw"]),a=s.replace(/\/$/,"")+"/"+n.replace(/^\//,"");return e&&(o.body=JSON.stringify(e)),window.fetch(a,o).then((function(n){if(r)return n;if(!n.ok)throw new L(n);if(204!==n.status){var t=n.headers.get("content-type").split(";")[0];return"application/json"===t?n.json():"image/png"===t||"application/pdf"===t?n.blob():n.text()}}))}S.get=y("GET"),S.patch=y("PATCH"),S.put=y("PUT"),S.post=y("POST"),S.head=y("HEAD");function y(n){return function(t,i){if(i&&i.method)throw new Error("Setting option.method is not allowed in httpReq."+n.toLowerCase()+"()");return S(t,Object.assign({},i,{method:n}))}}S.delete=y("DELETE");var L=function(n){function t(t){n.call(this),this.name="HttpReqError",this.status=t.status,this.statusText=t.statusText,this.message="["+t.status+"] "+t.statusText,this.response=t}return n&&(t.__proto__=n),t.prototype=Object.create(n&&n.prototype),t.prototype.constructor=t,t}(Error),N=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;function j(n){return N.test(n)}var T={doLogIn:async function(){var n=this.get(),t=n.loginEmail,i=n.loginPassword,e=n.rememberLogin;this.set({loggingIn:!0,loginError:"",loginSuccess:""});try{await S.post("/v3/auth/login",{payload:{email:t,password:i,keepSession:e}}),this.set({loginSuccess:"Login successful, reloading page"}),setTimeout((function(){window.window.location.href="/"}),2e3)}catch(n){if("HttpReqError"===n.name){var s=await n.response.json();this.set({loginError:s?s.message:n.message})}else this.set({loginError:n})}this.set({loggingIn:!1})},doSignUp:async function(){var n=this.get(),t=n.signupEmail,i=n.signupPassword;if(i!==n.signupPassword2)return this.set({signupError:"Passwords must match"});this.set({signingUp:!0,signupError:"",signupSuccess:""});try{await S.post("/v3/auth/signup",{payload:{email:t,password:i}}),this.set({signupSuccess:"Sign up successful. Redirecting to user dashboard."}),setTimeout((function(){window.location.href="/"}),2e3)}catch(n){if("HttpReqError"===n.name){var e=await n.response.json();this.set({signupError:e?e.message:n.message})}else this.set({signupError:n})}this.set({signingUp:!1})},requestNewPassword:async function(){var n=this.get().loginEmail;this.set({requestingPassword:!0,loginError:"",loginSuccess:""});try{await S.post("/v3/auth/reset-password",{payload:{email:n}}),this.set({loginSuccess:P("signin / password-reset / success")})}catch(n){if("HttpReqError"===n.name){var t=await n.response.json();this.set({loginError:t.message?P("signin / password-reset / error / "+t.message):n.message})}else this.set({loginError:n})}this.set({requestingPassword:!1})}};function k(n,t,i){var e=Object.create(n);return e.signin=t[i],e}function x(n,t){var i;return{c:function(){(i=r("div")).className="alert alert-success"},m:function(n,s){e(n,i,s),i.innerHTML=t.loginSuccess},p:function(n,t){n.loginSuccess&&(i.innerHTML=t.loginSuccess)},d:function(n){n&&s(i)}}}function H(n,t){var i;return{c:function(){(i=r("div")).className="alert alert-error"},m:function(n,s){e(n,i,s),i.innerHTML=t.loginError},p:function(n,t){n.loginError&&(i.innerHTML=t.loginError)},d:function(n){n&&s(i)}}}function M(n,t){var c,d,p,g,f,m=P("password"),v=!1;function h(){v=!0,n.set({loginPassword:f.value}),v=!1}return{c:function(){c=r("div"),d=r("label"),p=o(m),g=o("\n                        "),f=r("input"),d.className="svelte-ultjro",a(f,"input",h),f.className="login-pwd input-xxlarge span3 svelte-ultjro",f.autocomplete="current-password",l(f,"type","password"),c.className="control-group svelte-ultjro"},m:function(n,s){e(n,c,s),i(c,d),i(d,p),i(c,g),i(c,f),f.value=t.loginPassword},p:function(n,t){!v&&n.loginPassword&&(f.value=t.loginPassword)},d:function(n){n&&s(c),u(f,"input",h)}}}function I(n,t){var d,p,g,f,m,v,h,w,_=P("Remember login?");function b(){n.set({rememberLogin:g.checked})}var E=t.loggingIn&&C();function S(t){t.preventDefault(),n.doLogIn()}return{c:function(){d=r("div"),p=r("label"),g=r("input"),f=o(" "),m=r("noscript"),v=o("\n                    "),h=r("button"),E&&E.c(),w=o(" Login"),a(g,"change",b),g.className="keep-login svelte-ultjro",l(g,"type","checkbox"),p.className="checkbox svelte-ultjro",p.htmlFor="keep-login",c(p,"margin-top","10px"),a(h,"click",S),h.disabled=t.invalidLoginForm,h.className="btn btn-login btn-primary svelte-ultjro"},m:function(n,s){e(n,d,s),i(d,p),i(p,g),g.checked=t.rememberLogin,i(p,f),i(p,m),m.insertAdjacentHTML("afterend",_),i(d,v),i(d,h),E&&E.m(h,null),i(h,w)},p:function(n,t){n.rememberLogin&&(g.checked=t.rememberLogin),t.loggingIn?E||((E=C()).c(),E.m(h,w)):E&&(E.d(1),E=null),n.invalidLoginForm&&(h.disabled=t.invalidLoginForm)},d:function(n){n&&s(d),u(g,"change",b),E&&E.d(),u(h,"click",S)}}}function C(n,t){var i;return{c:function(){(i=r("i")).className="fa fa-fw fa-spinner fa-pulse"},m:function(n,t){e(n,i,t)},d:function(n){n&&s(i)}}}function A(n,t){var l,d,p,g,f=P("Send new password"),m=t.requestingPassword&&F();function v(t){t.preventDefault(),n.requestNewPassword()}return{c:function(){l=r("div"),d=r("button"),m&&m.c(),p=o(" "),g=r("noscript"),a(d,"click",v),d.disabled=t.invalidLoginEmail,d.className="btn btn-send-pw btn-primary",c(l,"padding-bottom","10px")},m:function(n,t){e(n,l,t),i(l,d),m&&m.m(d,null),i(d,p),i(d,g),g.insertAdjacentHTML("afterend",f)},p:function(n,t){t.requestingPassword?m||((m=F()).c(),m.m(d,p)):m&&(m.d(1),m=null),n.invalidLoginEmail&&(d.disabled=t.invalidLoginEmail)},d:function(n){n&&s(l),m&&m.d(),u(d,"click",v)}}}function F(n,t){var i;return{c:function(){(i=r("i")).className="fa fa-fw fa-spinner fa-pulse"},m:function(n,t){e(n,i,t)},d:function(n){n&&s(i)}}}function O(n,t){var i,o=P("Can't recall your password?");function l(t){t.preventDefault(),n.set({forgotPassword:!0})}return{c:function(){a(i=r("a"),"click",l),i.href="#/forgot-password"},m:function(n,t){e(n,i,t),i.innerHTML=o},d:function(n){n&&s(i),u(i,"click",l)}}}function q(n,t){var i,o=P("Return to login...");function l(t){t.preventDefault(),n.set({forgotPassword:!1})}return{c:function(){a(i=r("a"),"click",l),i.href="#/return"},m:function(n,t){e(n,i,t),i.innerHTML=o},d:function(n){n&&s(i),u(i,"click",l)}}}function U(t,i){var o;return{c:function(){(o=r("style")).textContent="#dwLoginForm {\n                width: 420px;\n                margin-left: -210px;\n                box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);\n                border: 0;\n                position: relative;\n            }"},m:function(n,t){e(n,o,t)},p:n,d:function(n){n&&s(o)}}}function R(n,t){var c,p,g,f,m,v,h,w,_,b,E,S,y,L,N,j,T,k,x,H,M,I,C,A,F,O,q,U,R,Z,B=P("login / signup / headline"),J=P("login / signup / intro"),K=P("email"),Q=!1,V=P("password"),W=!1,X=P("repeat password"),Y=!1,nn=P("Sign Up"),tn=t.signupSuccess&&D(n,t),en=t.signupError&&$(n,t);function sn(){Q=!0,n.set({signupEmail:L.value}),Q=!1}function rn(){W=!0,n.set({signupPassword:H.value}),W=!1}function on(){Y=!0,n.set({signupPassword2:O.value}),Y=!1}function an(n){return n.signingUp?z:G}var un=an(t),ln=un(n,t);function cn(t){t.preventDefault(),n.doSignUp()}return{c:function(){c=r("div"),p=r("h3"),g=o("\n            "),f=r("p"),m=o("\n\n            "),tn&&tn.c(),v=o(" "),en&&en.c(),h=o("\n\n            "),w=r("div"),_=r("form"),b=r("div"),E=r("label"),S=o(K),y=o("\n                        "),L=r("input"),N=o("\n                    "),j=r("div"),T=r("label"),k=o(V),x=o("\n                        "),H=r("input"),M=o("\n                    "),I=r("div"),C=r("label"),A=o(X),F=o("\n                        "),O=r("input"),q=o("\n                    "),U=r("button"),ln.c(),R=o("\n                        \n                        "),Z=r("noscript"),E.className="svelte-ultjro",a(L,"input",sn),l(L,"type","email"),L.autocomplete="username",L.className="span3 input-xlarge register-email svelte-ultjro",b.className="control-group svelte-ultjro",d(b,"error",t.invalidSignupEmail),T.className="svelte-ultjro",a(H,"input",rn),H.autocomplete="new-password",l(H,"type","password"),H.className="span3 input-xlarge register-pwd svelte-ultjro",j.className="control-group svelte-ultjro",C.className="svelte-ultjro",a(O,"input",on),O.autocomplete="new-password",l(O,"type","password"),O.className="span3 input-xlarge register-pwd-2 svelte-ultjro",I.className="control-group svelte-ultjro",d(I,"error",t.invalidSignupPassword),a(U,"click",cn),U.disabled=t.invalidSignupForm,U.className="btn btn-default",w.className="signup-form form-vertcal",c.className="span3 row-signup"},m:function(n,s){e(n,c,s),i(c,p),p.innerHTML=B,i(c,g),i(c,f),f.innerHTML=J,i(c,m),tn&&tn.m(c,null),i(c,v),en&&en.m(c,null),i(c,h),i(c,w),i(w,_),i(_,b),i(b,E),i(E,S),i(b,y),i(b,L),L.value=t.signupEmail,i(_,N),i(_,j),i(j,T),i(T,k),i(j,x),i(j,H),H.value=t.signupPassword,i(_,M),i(_,I),i(I,C),i(C,A),i(I,F),i(I,O),O.value=t.signupPassword2,i(_,q),i(_,U),ln.m(U,null),i(U,R),i(U,Z),Z.insertAdjacentHTML("afterend",nn)},p:function(t,i){i.signupSuccess?tn?tn.p(t,i):((tn=D(n,i)).c(),tn.m(c,v)):tn&&(tn.d(1),tn=null),i.signupError?en?en.p(t,i):((en=$(n,i)).c(),en.m(c,h)):en&&(en.d(1),en=null),!Q&&t.signupEmail&&(L.value=i.signupEmail),t.invalidSignupEmail&&d(b,"error",i.invalidSignupEmail),!W&&t.signupPassword&&(H.value=i.signupPassword),!Y&&t.signupPassword2&&(O.value=i.signupPassword2),t.invalidSignupPassword&&d(I,"error",i.invalidSignupPassword),un!==(un=an(i))&&(ln.d(1),(ln=un(n,i)).c(),ln.m(U,R)),t.invalidSignupForm&&(U.disabled=i.invalidSignupForm)},d:function(n){n&&s(c),tn&&tn.d(),en&&en.d(),u(L,"input",sn),u(H,"input",rn),u(O,"input",on),ln.d(),u(U,"click",cn)}}}function D(n,t){var i;return{c:function(){(i=r("div")).className="alert alert-success"},m:function(n,s){e(n,i,s),i.innerHTML=t.signupSuccess},p:function(n,t){n.signupSuccess&&(i.innerHTML=t.signupSuccess)},d:function(n){n&&s(i)}}}function $(n,t){var i;return{c:function(){(i=r("div")).className="alert alert-error"},m:function(n,s){e(n,i,s),i.innerHTML=t.signupError},p:function(n,t){n.signupError&&(i.innerHTML=t.signupError)},d:function(n){n&&s(i)}}}function G(n,t){var i;return{c:function(){(i=r("i")).className="fa fa-fw fa-pencil"},m:function(n,t){e(n,i,t)},d:function(n){n&&s(i)}}}function z(n,t){var i;return{c:function(){(i=r("i")).className="fa fa-fw fa-spinner fa-pulse"},m:function(n,t){e(n,i,t)},d:function(n){n&&s(i)}}}function Z(n,t){for(var a,u,l,c=P("login / alternative signin"),d=t.alternativeSignIn,p=[],g=0;g<d.length;g+=1)p[g]=J(n,k(t,d,g));return{c:function(){a=r("div"),u=r("noscript"),l=o(" ");for(var n=0;n<p.length;n+=1)p[n].c();a.className="alternative-signin svelte-ultjro"},m:function(n,t){e(n,a,t),i(a,u),u.insertAdjacentHTML("beforebegin",c),i(a,l);for(var s=0;s<p.length;s+=1)p[s].m(a,null)},p:function(t,i){if(t.alternativeSignIn){d=i.alternativeSignIn;for(var e=0;e<d.length;e+=1){var s=k(i,d,e);p[e]?p[e].p(t,s):(p[e]=J(n,s),p[e].c(),p[e].m(a,null))}for(;e<p.length;e+=1)p[e].d(1);p.length=d.length}},d:function(n){n&&s(a),function(n,t){for(var i=0;i<n.length;i+=1)n[i]&&n[i].d(t)}(p,n)}}}function B(n,t){var i,o;return{c:function(){(i=r("i")).className=o=t.signin.icon+" svelte-ultjro"},m:function(n,t){e(n,i,t)},p:function(n,t){n.alternativeSignIn&&o!==(o=t.signin.icon+" svelte-ultjro")&&(i.className=o)},d:function(n){n&&s(i)}}}function J(n,t){var a,u,l,c,d=t.signin.label,p=t.signin.icon&&B(0,t);return{c:function(){a=r("a"),p&&p.c(),u=o(" "),l=r("noscript"),a.href=c=t.signin.url,a.className="alternative-signin-link svelte-ultjro"},m:function(n,t){e(n,a,t),p&&p.m(a,null),i(a,u),i(a,l),l.insertAdjacentHTML("afterend",d)},p:function(n,t){t.signin.icon?p?p.p(n,t):((p=B(0,t)).c(),p.m(a,u)):p&&(p.d(1),p=null),n.alternativeSignIn&&d!==(d=t.signin.label)&&(!function(n){for(;n.nextSibling;)n.parentNode.removeChild(n.nextSibling)}(l),l.insertAdjacentHTML("afterend",d)),n.alternativeSignIn&&c!==(c=t.signin.url)&&(a.href=c)},d:function(n){n&&s(a),p&&p.d()}}}function K(n){!function(n,t){n._handlers=p(),n._slots=p(),n._bind=t._bind,n._staged={},n.options=t,n.root=t.root||n,n.store=t.store||n.root.store,t.root||(n._beforecreate=[],n._oncreate=[],n._aftercreate=[])}(this,n),this._state=t({noSignup:!1,alternativeSignIn:[],forgotPassword:!1,loginEmail:"",loginPassword:"",rememberLogin:!0,loginEmailError:!1,loginError:"",loginSuccess:"",signupEmail:"",signupPassword:"",signupPassword2:"",requestingPassword:!1,loggingIn:!1,signingUp:!1},n.data),this._recompute({loginEmail:1,forgotPassword:1,loginPassword:1,signupEmail:1,signupPassword:1,signupPassword2:1},this._state),this._intro=!0,this._fragment=function(n,t){var c,p,g,f,m,v,h,w,_,b,E,S,y,L,N,j,T,k,C,F,D,$,G,z,B,J,K,Q,V,W,X,Y,nn,tn,en,sn=P("login / login / headline"),rn=P("login / login / intro"),on=P("email"),an=!1,un=P("login / signup / confirmation-email"),ln=P("login / signup / confirmation-email-hint"),cn=P("login / signup / confirm"),dn=t.loginSuccess&&x(n,t),pn=t.loginError&&H(n,t);function gn(){an=!0,n.set({loginEmail:k.value}),an=!1}var fn=!t.forgotPassword&&M(n,t),mn=!t.forgotPassword&&I(n,t),vn=t.forgotPassword&&A(n,t);function hn(n){return n.forgotPassword?q:O}var wn=hn(t),_n=wn(n,t);function bn(n){return n.noSignup?U:R}var En=bn(t),Pn=En(n,t),Sn=t.alternativeSignIn.length&&Z(n,t);function yn(t){t.stopPropagation(),n.fire("keyup",t)}return{c:function(){c=r("div"),(p=r("button")).textContent="×",g=o("\n    "),f=r("div"),m=r("div"),v=r("h3"),h=o("\n\n            "),w=r("p"),_=o("\n\n            "),dn&&dn.c(),b=o(" "),pn&&pn.c(),E=o("\n\n            "),S=r("form"),y=r("div"),L=r("div"),N=r("label"),j=o(on),T=o("\n                        "),k=r("input"),C=o("\n                    "),fn&&fn.c(),F=o("\n                "),mn&&mn.c(),D=o("\n\n            "),$=r("div"),vn&&vn.c(),G=o("\n                "),z=r("div"),_n.c(),J=o("\n        "),Pn.c(),K=o("\n\n    "),Sn&&Sn.c(),Q=o("\n\n    "),V=r("div"),W=r("div"),X=r("noscript"),Y=o("\n\n            "),nn=r("div"),tn=o("\n\n            "),en=r("button"),p.type="button",p.className="close",p.dataset.dismiss="modal",N.className="svelte-ultjro",a(k,"input",gn),k.className="login-email input-xxlarge span3 svelte-ultjro",k.autocomplete="username",l(k,"type","email"),L.className="control-group svelte-ultjro",d(L,"error",t.invalidLoginEmail),S.className="login-form form-vertical",m.className=B="span"+(t.noSignup?4:3)+" row-login svelte-ultjro",f.className="row login-signup",nn.className="sub",en.className="button btn btn-got-it",W.className="jumbo-text",V.className="signup-confirm hidden",a(c,"keyup",yn),c.className="modal-body svelte-ultjro",c.dataset.piwikMask=!0},m:function(n,s){e(n,c,s),i(c,p),i(c,g),i(c,f),i(f,m),i(m,v),v.innerHTML=sn,i(m,h),i(m,w),w.innerHTML=rn,i(m,_),dn&&dn.m(m,null),i(m,b),pn&&pn.m(m,null),i(m,E),i(m,S),i(S,y),i(y,L),i(L,N),i(N,j),i(L,T),i(L,k),k.value=t.loginEmail,i(y,C),fn&&fn.m(y,null),i(S,F),mn&&mn.m(S,null),i(m,D),i(m,$),vn&&vn.m($,null),i($,G),i($,z),_n.m(z,null),i(f,J),Pn.m(f,null),i(c,K),Sn&&Sn.m(c,null),i(c,Q),i(c,V),i(V,W),i(W,X),X.insertAdjacentHTML("beforebegin",un),i(W,Y),i(W,nn),nn.innerHTML=ln,i(W,tn),i(W,en),en.innerHTML=cn},p:function(t,i){i.loginSuccess?dn?dn.p(t,i):((dn=x(n,i)).c(),dn.m(m,b)):dn&&(dn.d(1),dn=null),i.loginError?pn?pn.p(t,i):((pn=H(n,i)).c(),pn.m(m,E)):pn&&(pn.d(1),pn=null),!an&&t.loginEmail&&(k.value=i.loginEmail),t.invalidLoginEmail&&d(L,"error",i.invalidLoginEmail),i.forgotPassword?fn&&(fn.d(1),fn=null):fn?fn.p(t,i):((fn=M(n,i)).c(),fn.m(y,null)),i.forgotPassword?mn&&(mn.d(1),mn=null):mn?mn.p(t,i):((mn=I(n,i)).c(),mn.m(S,null)),i.forgotPassword?vn?vn.p(t,i):((vn=A(n,i)).c(),vn.m($,G)):vn&&(vn.d(1),vn=null),wn!==(wn=hn(i))&&(_n.d(1),(_n=wn(n,i)).c(),_n.m(z,null)),t.noSignup&&B!==(B="span"+(i.noSignup?4:3)+" row-login svelte-ultjro")&&(m.className=B),En===(En=bn(i))&&Pn?Pn.p(t,i):(Pn.d(1),(Pn=En(n,i)).c(),Pn.m(f,null)),i.alternativeSignIn.length?Sn?Sn.p(t,i):((Sn=Z(n,i)).c(),Sn.m(c,Q)):Sn&&(Sn.d(1),Sn=null)},d:function(n){n&&s(c),dn&&dn.d(),pn&&pn.d(),u(k,"input",gn),fn&&fn.d(),mn&&mn.d(),vn&&vn.d(),_n.d(),Pn.d(),Sn&&Sn.d(),u(c,"keyup",yn)}}}(this,this._state),n.target&&(this._fragment.c(),this._mount(n.target,n.anchor))}function Q(n,i){this._handlers={},this._dependents=[],this._computed=p(),this._sortedComputedProperties=[],this._state=t({},n),this._differs=i&&i.immutable?f:g}t(K.prototype,_),t(K.prototype,T),K.prototype._recompute=function(n,t){var i,e,s;(n.loginEmail||n.forgotPassword)&&this._differs(t.invalidLoginEmail,t.invalidLoginEmail=(e=(i=t).loginEmail,s=i.forgotPassword,!(j(e)||""===e&&!s)))&&(n.invalidLoginEmail=!0),(n.loginEmail||n.loginPassword)&&this._differs(t.invalidLoginForm,t.invalidLoginForm=function(n){var t=n.loginEmail,i=n.loginPassword;return!j(t)||""===i}(t))&&(n.invalidLoginForm=!0),(n.signupEmail||n.signupPassword||n.signupPassword2)&&this._differs(t.invalidSignupForm,t.invalidSignupForm=function(n){var t=n.signupEmail,i=n.signupPassword,e=n.signupPassword2;return!j(t)||(i!==e||(i.length<8||void 0))}(t))&&(n.invalidSignupForm=!0),(n.signupEmail||n.forgotPassword)&&this._differs(t.invalidSignupEmail,t.invalidSignupEmail=function(n){var t=n.signupEmail;return n.forgotPassword,!j(t)&&""!==t}(t))&&(n.invalidSignupEmail=!0),(n.signupPassword||n.signupPassword2)&&this._differs(t.invalidSignupPassword,t.invalidSignupPassword=function(n){var t=n.signupPassword,i=n.signupPassword2;return""!==t&&t!==i}(t))&&(n.invalidSignupPassword=!0)},t(Q.prototype,{_add:function(n,t){this._dependents.push({component:n,props:t})},_init:function(n){for(var t={},i=0;i<n.length;i+=1){var e=n[i];t["$"+e]=this._state[e]}return t},_remove:function(n){for(var t=this._dependents.length;t--;)if(this._dependents[t].component===n)return void this._dependents.splice(t,1)},_set:function(n,i){var e=this,s=this._state;this._state=t(t({},s),n);for(var r=0;r<this._sortedComputedProperties.length;r+=1)this._sortedComputedProperties[r].update(this._state,i);this.fire("state",{changed:i,previous:s,current:this._state}),this._dependents.filter((function(n){for(var t={},s=!1,r=0;r<n.props.length;r+=1){var o=n.props[r];o in i&&(t["$"+o]=e._state[o],s=!0)}if(s)return n.component._stage(t),!0})).forEach((function(n){n.component.set({})})),this.fire("update",{changed:i,previous:s,current:this._state})},_sortComputedProperties:function(){var n,t=this._computed,i=this._sortedComputedProperties=[],e=p();function s(r){var o=t[r];o&&(o.deps.forEach((function(t){if(t===n)throw new Error("Cyclical dependency detected between "+t+" <-> "+r);s(t)})),e[r]||(e[r]=!0,i.push(o)))}for(var r in this._computed)s(n=r)},compute:function(n,i,e){var s,r=this,o={deps:i,update:function(t,o,a){var u=i.map((function(n){return n in o&&(a=!0),t[n]}));if(a){var l=e.apply(null,u);r._differs(l,s)&&(s=l,o[n]=!0,t[n]=s)}}};this._computed[n]=o,this._sortComputedProperties();var a=t({},this._state),u={};o.update(a,u,!0),this._set(a,u)},fire:m,get:v,on:h,set:function(n){var t=this._state,i=this._changed={},e=!1;for(var s in n){if(this._computed[s])throw new Error("'"+s+"' is a read-only computed property");this._differs(n[s],t[s])&&(i[s]=e=!0)}e&&this._set(n,i)}});return{App:K,data:{},store:new Q({}),init:function(n){}}}));
