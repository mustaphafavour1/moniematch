(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[302],{9179:function(e,t,r){Promise.resolve().then(r.bind(r,7637))},7637:function(e,t,r){"use strict";r.d(t,{BusinessBottomNav:function(){return m},InvestorBottomNav:function(){return v}});var n=r(7437),a=r(7138),o=r(6463),i=r(8030);/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,i.Z)("Home",[["path",{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"y5dka4"}],["polyline",{points:"9 22 9 12 15 12 15 22",key:"e2us08"}]]);var l=r(5430),u=r(9013),c=r(2022);/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let f=(0,i.Z)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);var h=r(9333);let d=[{href:"/investor",icon:s,label:"Home"},{href:"/investor/matches",icon:l.Z,label:"Matches"},{href:"/investor/portfolio",icon:u.Z,label:"Portfolio"},{href:"/investor/profile",icon:c.Z,label:"Profile"}],y=[{href:"/business",icon:s,label:"Home"},{href:"/business/investors",icon:f,label:"Investors"},{href:"/business/reporting",icon:h.Z,label:"Reports"},{href:"/business/profile",icon:c.Z,label:"Profile"}];function p(e){let{tabs:t}=e,r=(0,o.usePathname)();return(0,n.jsx)("nav",{style:{position:"sticky",bottom:0,left:0,right:0,zIndex:20,background:"rgba(247,241,232,0.95)",backdropFilter:"blur(12px)",borderTop:"1px solid var(--line)",display:"flex",alignItems:"stretch",paddingBottom:"env(safe-area-inset-bottom, 0px)"},children:t.map(e=>{let t=r===e.href||e.href.length>1&&r.startsWith(e.href),o=e.icon;return(0,n.jsxs)(a.default,{href:e.href,style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 0 8px",textDecoration:"none",color:t?"var(--clay)":"var(--ink-3)",transition:"color 200ms"},children:[(0,n.jsx)(o,{size:22,strokeWidth:t?2.2:1.8}),(0,n.jsx)("span",{style:{fontSize:10,fontWeight:t?700:500,fontFamily:"var(--font-body)"},children:e.label})]},e.href)})})}function v(){return(0,n.jsx)(p,{tabs:d})}function m(){return(0,n.jsx)(p,{tabs:y})}},8030:function(e,t,r){"use strict";r.d(t,{Z:function(){return l}});var n=r(2265);/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let a=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),o=function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return t.filter((e,t,r)=>!!e&&r.indexOf(e)===t).join(" ")};/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var i={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let s=(0,n.forwardRef)((e,t)=>{let{color:r="currentColor",size:a=24,strokeWidth:s=2,absoluteStrokeWidth:l,className:u="",children:c,iconNode:f,...h}=e;return(0,n.createElement)("svg",{ref:t,...i,width:a,height:a,stroke:r,strokeWidth:l?24*Number(s)/Number(a):s,className:o("lucide",u),...h},[...f.map(e=>{let[t,r]=e;return(0,n.createElement)(t,r)}),...Array.isArray(c)?c:[c]])}),l=(e,t)=>{let r=(0,n.forwardRef)((r,i)=>{let{className:l,...u}=r;return(0,n.createElement)(s,{ref:i,iconNode:t,className:o("lucide-".concat(a(e)),l),...u})});return r.displayName="".concat(e),r}},9013:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("BarChart2",[["line",{x1:"18",x2:"18",y1:"20",y2:"10",key:"1xfpm4"}],["line",{x1:"12",x2:"12",y1:"20",y2:"4",key:"be30l9"}],["line",{x1:"6",x2:"6",y1:"20",y2:"14",key:"1r4le6"}]])},9333:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Mic",[["path",{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z",key:"131961"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]])},2022:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]])},5430:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */let n=(0,r(8030).Z)("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]])},7138:function(e,t,r){"use strict";r.d(t,{default:function(){return a.a}});var n=r(231),a=r.n(n)},6463:function(e,t,r){"use strict";var n=r(1169);r.o(n,"useParams")&&r.d(t,{useParams:function(){return n.useParams}}),r.o(n,"usePathname")&&r.d(t,{usePathname:function(){return n.usePathname}}),r.o(n,"useRouter")&&r.d(t,{useRouter:function(){return n.useRouter}}),r.o(n,"useSearchParams")&&r.d(t,{useSearchParams:function(){return n.useSearchParams}})}},function(e){e.O(0,[231,971,23,744],function(){return e(e.s=9179)}),_N_E=e.O()}]);