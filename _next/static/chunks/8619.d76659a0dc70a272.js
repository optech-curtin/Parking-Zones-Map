"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8619],{4093:(e,t,r)=>{r.d(t,{SL:()=>s,wR:()=>n});var i=r(53041),o=r(93446),a=r(99419);let n=[],s=[new a._(i.r.POSITION,3,o.pe.FLOAT,0,12)];new a._(i.r.POSITION,2,o.pe.FLOAT,0,8),new a._(i.r.POSITION,2,o.pe.FLOAT,0,16),new a._(i.r.UV0,2,o.pe.FLOAT,8,16)},6586:(e,t,r)=>{r.d(t,{A:()=>h,C:()=>l});var i=r(70983),o=r(40200),a=r(73982),n=r(74558),s=r(24202);function l(e,t,r,i){let s="polygon"===e.type?a.Wq.CCW_IS_HOLE:a.Wq.NONE,l="polygon"===e.type?e.rings:e.paths,{position:h,outlines:d}=(0,a.oR)(l,!!e.hasZ,s,e.spatialReference),u=(0,o.jh)(h.length),g=(0,n.au)(h,e.spatialReference,0,u,0,h,0,h.length/3,t,r,i),p=null!=g;return{lines:p?c(d,h,u):[],projectionSuccess:p,sampledElevation:g}}function h(e,t){let r="polygon"===e.type?a.Wq.CCW_IS_HOLE:a.Wq.NONE,o="polygon"===e.type?e.rings:e.paths,{position:n,outlines:l}=(0,a.oR)(o,!1,r),h=(0,i.projectBuffer)(n,e.spatialReference,0,n,t,0);for(let e=2;e<n.length;e+=3)n[e]=s.bi;return{lines:h?c(l,n):[],projectionSuccess:h}}function c(e,t,r=null){let i=[];for(let{index:a,count:n}of e){if(n<=1)continue;let e=3*a,s=3*n;i.push({position:(0,o.l5)(t,3*a,3*n),mapPositions:null!=r?(0,o.l5)(r,e,s):void 0})}return i}},10212:(e,t,r)=>{r.d(t,{C:()=>m,b:()=>v});var i=r(80194),o=r(51704),a=r(85267),n=r(76257),s=r(88795),l=r(72936),h=r(25576),c=r(82784),d=r(62809),u=r(86416),g=r(53041),p=r(70760),f=r(90564);function v(e){let t=new f.N5,{vertex:r,fragment:v,attributes:m,varyings:_}=t,{vvColor:y,hasVertexColors:x}=e;return(0,c.NB)(r,e),t.include(o.d,e),t.include(n.c,e),t.include(l.A,e),t.include(a.g,e),v.include(i.HQ,e),t.include(p.z,e),t.include(s.Z,e),m.add(g.r.POSITION,"vec3"),y&&m.add(g.r.COLORFEATUREATTRIBUTE,"float"),x||_.add("vColor","vec4"),_.add("vpos","vec3"),r.uniforms.add(new d.E("uColor",e=>e.color)),r.main.add((0,u.H)`
      vpos = position;
      forwardNormalizedVertexColor();
      forwardObjectAndLayerIdColor();

      ${x?"vColor *= uColor;":y?"vColor = uColor * interpolateVVColor(colorFeatureAttribute);":"vColor = uColor;"}
      forwardViewPosDepth((view * vec4(vpos, 1.0)).xyz);
      gl_Position = transformPosition(proj, view, vpos);`),v.include(h.a),v.main.add((0,u.H)`discardBySlice(vpos);
discardByTerrainDepth();
outputColorHighlightOID(vColor, vpos);`),t}let m=Object.freeze(Object.defineProperty({__proto__:null,build:v},Symbol.toStringTag,{value:"Module"}))},18193:(e,t,r)=>{r.d(t,{$:()=>h});var i=r(54635),o=r(40998),a=r(38715),n=r(63599),s=r(7916),l=r(87261);class h{constructor(e,t={}){this.geometry=e,this.screenToWorldRatio=1,this._transformation=(0,a.vt)(),this._shaderTransformation=null,this._boundingSphere=null,this.id=(0,i.c)(),this.layerUid=t.layerUid,this.graphicUid=t.graphicUid,this.castShadow=t.castShadow??!1,t.objectShaderTransformation&&this.objectShaderTransformationChanged(t.objectShaderTransformation)}get transformation(){return this._transformation}set transformation(e){(0,o.C)(this._transformation,e),this._boundingSphere=null}get boundingInfo(){return this.geometry.boundingInfo}objectShaderTransformationChanged(e){null==e?this._shaderTransformation=null:(this._shaderTransformation??=(0,a.vt)(),(0,o.lw)(this._shaderTransformation,e,this.geometry.transformation)),this._boundingSphere=null}get boundingSphere(){return this.boundingInfo?(null==this._boundingSphere&&(this._boundingSphere??=(0,s.c)(),(0,n.t)((0,s.a)(this._boundingSphere),this.boundingInfo.center,this.shaderTransformation),this._boundingSphere[3]=this.boundingInfo.radius*(0,l.hG)(this.shaderTransformation)),this._boundingSphere):s.N}get material(){return this.geometry.material}get type(){return this.geometry.type}get shaderTransformation(){return this._shaderTransformation??this.transformation}get attributes(){return this.geometry.attributes}get highlight(){return this.geometry.highlights}foreachHighlightOptions(e){this.geometry.foreachHighlightOptions(e)}get hasHighlights(){return this.geometry.hasHighlights}get occludees(){return this.geometry.occludees}get visible(){return this.geometry.visible}set visible(e){this.geometry.visible=e}}},21942:(e,t,r)=>{r.d(t,{S:()=>g,b:()=>u});var i=r(89946),o=r(75769),a=r(77414),n=r(76085),s=r(86416),l=r(44761),h=r(5012),c=r(25928),d=r(90564);function u(){let e=new d.N5;e.include(i.Q);let{fragment:t}=e;return t.uniforms.add(new h.N("blurInput",e=>e.singleHighlightBlurTexture),new a.t("blurSize",e=>e.blurSize),new h.N("highlightTexture",e=>e.highlightTexture),new h.N("highlightOptionsTexture",e=>e.highlightOptionsTexture),new l.c("highlightLevel",e=>e.highlightLevel),new n.m("occludedIntensityFactor",e=>e.occludedFactor)),t.constants.add("inner","float",1-(c.o-c.b)/c.o),e.include(o.y),t.main.add((0,s.H)`vec2 highlightTextureSize = vec2(textureSize(highlightTexture,0));
vec2 uv = sUV;
vec2 center = texture(blurInput, uv).rg;
vec2 blurredHighlightValue = (vOutlinePossible == 0.0)
? center
: center * 0.204164
+ texture(blurInput, uv + blurSize * 1.407333).rg * 0.304005
+ texture(blurInput, uv - blurSize * 1.407333).rg * 0.304005
+ texture(blurInput, uv + blurSize * 3.294215).rg * 0.093913
+ texture(blurInput, uv - blurSize * 3.294215).rg * 0.093913;
float highlightIntensity = blurredHighlightValue.r;
float occlusionWeight = blurredHighlightValue.g;
if (highlightIntensity <= 0.01) {
discard;
}
vec4 fillColor    = texelFetch(highlightOptionsTexture, ivec2(highlightLevel, 0), 0);
vec4 outlineColor = texelFetch(highlightOptionsTexture, ivec2(highlightLevel, 1), 0);
vec2 centerTexel = texelFetch(highlightTexture, ivec2(uv * highlightTextureSize), 0).rg;
uint centerBits = readLevelBits(centerTexel, highlightLevel);
bool centerFilled = (centerBits & 1u) == 1u;
bool centerOccluded = (centerBits & 3u) == 3u;
bool occluded = centerOccluded || (0.5 * highlightIntensity < occlusionWeight);
float occlusionFactor = occluded ? occludedIntensityFactor : 1.0;
float outlineFactor = centerFilled ? 1.0 : smoothstep(0.0, inner, highlightIntensity);
float fillFactor = centerFilled ? 1.0 : 0.0;
vec4 baseColor = mix(outlineColor, fillColor, fillFactor);
float intensity = baseColor.a * occlusionFactor * outlineFactor;
fragColor = vec4(baseColor.rgb, intensity);`),e}let g=Object.freeze(Object.defineProperty({__proto__:null,build:u},Symbol.toStringTag,{value:"Module"}))},22094:(e,t,r)=>{var i,o;function a(e){return null!=e&&!e.running}r.d(t,{c:()=>o,pi:()=>a,tf:()=>i}),function(e){e[e.Idle=0]="Idle",e[e.Rendering=1]="Rendering",e[e.Ready=2]="Ready",e[e.Fading=3]="Fading"}(i||(i={})),function(e){e[e.RG=0]="RG",e[e.BA=1]="BA",e[e.COUNT=2]="COUNT"}(o||(o={}))},24202:(e,t,r)=>{r.d(t,{bi:()=>tv});var i,o,a,n,s,l=r(81856),h=r(74652),c=r(57845),d=r(90304),u=r(40941),g=r(87196),p=r(45257),f=r(82558),v=r(91838),m=r(61939);r(33638);var _=r(12709),y=r(40998),x=r(63599),w=r(56911),C=r(59641),b=r(34124),T=r(85084),S=r(84766),O=r(16);class R{constructor(){this._extent=(0,S.vt)(),this.resolution=0,this.renderLocalOrigin=(0,O.f)(0,0,0,"O"),this.pixelRatio=1,this.mapUnitsPerPixel=1,this.canvasGeometries=new D}get extent(){return this._extent}setupGeometryViewsCyclical(e){this.setupGeometryView();let t=.001*e.range;if(this._extent[0]-t<=e.min){let t=this.canvasGeometries.extents[this.canvasGeometries.numViews++];(0,S.cY)(this._extent,e.range,0,t)}if(this._extent[2]+t>=e.max){let t=this.canvasGeometries.extents[this.canvasGeometries.numViews++];(0,S.cY)(this._extent,-e.range,0,t)}}setupGeometryView(){this.canvasGeometries.numViews=1,(0,S.C)(this.canvasGeometries.extents[0],this._extent)}hasSomeSizedView(){for(let e=0;e<this.canvasGeometries.numViews;e++){let t=this.canvasGeometries.extents[e];if(t[0]!==t[2]&&t[1]!==t[3])return!0}return!1}}class D{constructor(){this.extents=[(0,S.vt)(),(0,S.vt)(),(0,S.vt)()],this.numViews=0}}!function(e){e[e.Color=0]="Color",e[e.ColorNoRasterImage=1]="ColorNoRasterImage",e[e.Highlight=2]="Highlight",e[e.WaterNormal=3]="WaterNormal",e[e.Occluded=4]="Occluded",e[e.ObjectAndLayerIdColor=5]="ObjectAndLayerIdColor"}(i||(i={}));class P{constructor(e,t,r){this._fbos=e,this._format=t,this._name=r}get valid(){return null!=this._handle?.getTexture()}dispose(){this._handle=(0,u.Gz)(this._handle)}get texture(){return this._handle?.getTexture()}bind(e,t,r){this._handle&&this._handle.fbo?.width===t&&this._handle.fbo?.height===r||(this._handle?.release(),this._handle=this._fbos.acquire(t,r,this._name,this._format)),e.bindFramebuffer(this._handle?.fbo)}generateMipMap(){this._handle?.getTexture()?.descriptor?.hasMipmap&&this._handle?.getTexture()?.generateMipmap()}}var I=r(7320),A=r(4538),M=r(95554);class E{constructor(e,t,r,i,o=I.N.RGBA_MIPMAP){this.output=r,this.content=i,this.fbo=new P(e,o,t)}get valid(){return this.fbo.valid}}class F{constructor(e){this.targets=[new E(e,"overlay color",A.V.Color,i.Color),new E(e,"overlay IM color",A.V.Color,i.ColorNoRasterImage),new E(e,"overlay highlight",A.V.Highlight,i.Highlight,I.N.RG),new E(e,"overlay water",A.V.Normal,i.WaterNormal),new E(e,"overlay occluded",A.V.Color,i.Occluded)],(0,M.E)()&&this.targets.push(new E(e,"overlay olid",A.V.ObjectAndLayerIdColor,i.ObjectAndLayerIdColor,I.N.RGBA))}getTexture(e){return this.targets[e]?.fbo.texture}dispose(){for(let e of this.targets)e.fbo.dispose()}computeValidity(){return this.targets.reduce((e,t,r)=>t.valid?e|=1<<r:e,0)}}var N=r(29262),L=r(44120);!function(e){e[e.Material=0]="Material",e[e.ShadowMap=1]="ShadowMap",e[e.Highlight=2]="Highlight",e[e.ViewshedShadowMap=3]="ViewshedShadowMap"}(o||(o={})),r(4318),r(61456),r(82956),r(61004),r(76085),r(86416),r(5012);var H=r(73024);!function(e){e[e.Disabled=0]="Disabled",e[e.Enabled=1]="Enabled",e[e.EnabledWithWater=2]="EnabledWithWater",e[e.COUNT=3]="COUNT"}(a||(a={})),(0,L.vt)(),H.n;var z=r(50841),W=r(15529),V=r(54036),j=r(54971),U=r(69804),k=r(60649),G=r(96741),q=r(72030),B=r(84153);class Z extends G.w{constructor(e,t){super(e,t,new k.$(q.H,()=>r.e(3844).then(r.bind(r,43844))))}initializePipeline(){return(0,B.Ey)({blending:B.Ky,colorWrite:B.kn})}}var $=r(25928);class Q extends G.w{constructor(e,t){super(e,t,new k.$($.a,()=>r.e(1490).then(r.bind(r,1490))))}initializePipeline(){return(0,B.Ey)({colorWrite:B.kn})}}var Y=r(28544),X=r(73375);class K extends X.Y{constructor(){super(...arguments),this.occludedFactor=Y.cD,this.verticalCellCount=0,this.horizontalCellCount=0,this.highlightLevel=0,this.pixelRatio=1}}var J=r(40957);class ee extends G.w{constructor(e,t){super(e,t,new k.$(J.H,()=>r.e(9591).then(r.bind(r,89591))))}initializePipeline(){return(0,B.Ey)({colorWrite:B.kn})}}var et=r(21942);class er extends G.w{constructor(e,t){super(e,t,new k.$(et.S,()=>r.e(7528).then(r.bind(r,67528))))}initializePipeline(){return(0,B.Ey)({blending:B.Ky,colorWrite:B.kn})}}var ei=r(88409);class eo extends G.w{constructor(e,t){super(e,t,new k.$(ei.a,()=>r.e(9687).then(r.bind(r,69687))))}initializePipeline(){return(0,B.Ey)({colorWrite:B.kn})}}var ea=r(18189),en=r(47120),es=r(4093),el=r(25627),eh=r(62233),ec=r(93446),ed=r(87155),eu=r(15494);let eg=class extends U.A{constructor(){super(...arguments),this.produces=j.OG.HIGHLIGHTS,this.consumes={required:[j.OG.HIGHLIGHTS,"highlights"]},this._useMultipleHighlights=!1,this._downsampleDrawParameters=new $.H,this._passParameters=new K,this._singleHighlightBlurDrawParameters=new ei.S,this._grid=new ep}initialize(){this.addHandles([(0,p.wB)(()=>this._updateOptionsTexture(),()=>{},p.Vh)])}destroy(){this._grid.coverage=(0,u.Gz)(this._grid.coverage),this._grid.vao=(0,u.WD)(this._grid.vao),this._passParameters.highlightOptionsTexture=(0,u.Gz)(this._passParameters.highlightOptionsTexture)}_updateOptionsTexture(){if(null==this._passParameters.highlightOptionsTexture){let e=new eu.R(16,2);e.internalFormat=ec.Ab.RGBA,e.samplingMode=ec.Cj.NEAREST,this._passParameters.highlightOptionsTexture=new ed.g(this.renderingContext,e,null)}this._passParameters.highlightOptionsTexture.setData(function(e){let t=new Uint8Array(128),r=0;for(let i of e){let e=4*r,o=4*r+64;++r;let{color:a}=i,n=i.haloColor??a;t[e+0]=a.r,t[e+1]=a.g,t[e+2]=a.b,t[e+3]=i.fillOpacity*a.a*255,t[o+0]=n.r,t[o+1]=n.g,t[o+2]=n.b,t[o+3]=i.haloOpacity*n.a*255}return t}(this.view.state.highlights)),this.requestRender(ea.C7.UPDATE)}precompile(){this.techniques.precompile(Q),this._useMultipleHighlights?this.techniques.precompile(Z):(this.techniques.precompile(ee),this.techniques.precompile(eo),this.techniques.precompile(er))}render(e){let t=e.find(({name:e})=>e===j.OG.HIGHLIGHTS),{techniques:r,bindParameters:i,_passParameters:o,renderingContext:a}=this;if(!i.decorations)return t;let n=r.get(Q);if(!n.compiled)return this.requestRender(ea.C7.UPDATE),t;let s=e.find(({name:e})=>"highlights"===e).getTexture(),l=()=>{this._gridUpdateResources(s);let e=this._gridComputeCoverage(n,s,i),{horizontalCellCount:t,verticalCellCount:r}=e;return o.horizontalCellCount=t,o.verticalCellCount=r,o.coverageTexture=e.coverage?.getTexture(),e},h=e=>{let t=e.verticalCellCount*e.horizontalCellCount;a.bindVAO(e.vao),a.drawElementsInstanced(ec.WR.TRIANGLES,6,ec.pe.UNSIGNED_BYTE,0,t)},{camera:c}=i,d=()=>{a.bindFramebuffer(t.fbo),a.setViewport4fv(c.fullViewport)};return this._useMultipleHighlights?this._renderMultiple(s,l,h,d):this._renderSingle(s,l,h,d),o.highlightTexture=null,o.coverageTexture=null,t}_renderMultiple(e,t,r,i){let{techniques:o,bindParameters:a,_passParameters:n,renderingContext:s}=this,l=o.get(Z);if(!l.compiled)return void this.requestRender(ea.C7.UPDATE);let h=t();n.highlightTexture=e,n.pixelRatio=a.camera.pixelRatio,s.bindTechnique(l,a,n),i(),r(h)}_renderSingle(e,t,r,i){let{fboCache:o,techniques:a,bindParameters:n,_passParameters:s,renderingContext:l}=this,h=a.get(ee),c=a.get(eo),d=a.get(er);if(!d.compiled||!c.compiled||!h.compiled)return void this.requestRender(ea.C7.UPDATE);let u=t(),{width:g,height:p}=e.descriptor;s.highlightTexture=e;let{camera:f}=n,{fullWidth:v,fullHeight:m,pixelRatio:_}=f,y=Math.ceil(v/_),x=Math.ceil(m/_),{_singleHighlightBlurDrawParameters:w}=this,C=this.view._stage.renderView.renderer,{highlights:b}=n;for(let e=0;e<b.length;++e){let{name:t}=b[e];if(!C.hasHighlightOptions(t))continue;s.highlightLevel=e,l.setClearColor(0,0,0,0);let a=o.acquire(g,p,"single highlight",I.N.RG);l.bindFramebuffer(a.fbo),l.setViewport(0,0,g,p),l.clear(ec.NV.COLOR),l.bindTechnique(h,n,s),r(u),w.blurInput=a.getTexture(),(0,V.hZ)(w.blurSize,1/y,0);let f=o.acquire(y,x,"single highlight blur h",I.N.RG);l.unbindTexture(f.fbo?.colorTexture),l.bindFramebuffer(f.fbo),l.setViewport(0,0,y,x),l.clear(ec.NV.COLOR),l.bindTechnique(c,n,s,w),r(u),a.release(),(0,V.hZ)(w.blurSize,0,1/x),s.singleHighlightBlurTexture=f.getTexture(),i(),l.bindTechnique(d,n,s,w),r(u),f.release()}}_gridUpdateResources(e){let t=this._grid,{width:r,height:i}=e.descriptor;if(t.horizontalCellCount=Math.ceil(r/$.g),t.verticalCellCount=Math.ceil(i/$.g),t.vao)return;let o=this.renderingContext,a=eh.g.createIndex(o,ec._U.STATIC_DRAW,ev);t.vao=new el.Z(o,en.D,new Map([["geometry",es.wR]]),new Map([["geometry",eh.g.createVertex(o,ec._U.STATIC_DRAW)]]),a)}_gridComputeCoverage(e,t,r){let i=this.renderingContext,o=this._grid,a=t.descriptor,n=Math.ceil(a.width/$.g),s=Math.ceil(a.height/$.g);this._downsampleDrawParameters.input=t,o.coverage?.release();let l=this.fboCache.acquire(n,s,"highlight coverage",I.N.RG);return o.coverage=l,i.bindFramebuffer(l.fbo),i.bindTechnique(e,r,this._passParameters,this._downsampleDrawParameters),i.setViewport(0,0,n,s),i.screen.draw(),o}get test(){}};(0,l._)([(0,v.MZ)()],eg.prototype,"produces",void 0),(0,l._)([(0,v.MZ)()],eg.prototype,"consumes",void 0),eg=(0,l._)([(0,_.$)("esri.views.3d.webgl-engine.effects.highlight.Highlight")],eg);class ep{constructor(){this.coverage=null,this.vao=null,this.verticalCellCount=0,this.horizontalCellCount=0,this.viewportWidth=0,this.viewportHeight=0}}let ef=0,ev=new Uint8Array([0,1,2,2,1,3]);var em=r(61910),e_=r(97681);class ey{constructor(e,t,r,i){this._textures=e,this._techniques=t,this.materialChanged=r,this.requestRender=i,this._id2glMaterialRef=new em.O}dispose(){this._textures.destroy()}acquire(e,t,r){this._ownMaterial(e);let i=e.produces.get(t);if(!i?.(r))return null;let o=this._id2glMaterialRef.get(r,e.id);return null==o&&(o=new ex(e.createGLMaterial({material:e,techniques:this._techniques,textures:this._textures,output:r})),this._id2glMaterialRef.set(r,e.id,o)),o.ref(),o.glMaterial}release(e,t){let r=this._id2glMaterialRef.get(t,e.id);null!=r&&(r.unref(),r.referenced||((0,u.WD)(r.glMaterial),this._id2glMaterialRef.delete(t,e.id)))}_ownMaterial(e){e.repository&&e.repository!==this&&m.A.getLogger("esri.views.3d.webgl-engine.lib.GLMaterialRepository").error("Material is already owned by a different material repository"),e.repository=this}}class ex{constructor(e){this.glMaterial=e,this._refCnt=0}ref(){++this._refCnt}unref(){--this._refCnt,(0,e_.vA)(this._refCnt>=0)}get referenced(){return this._refCnt>0}}var ew=r(49892),eC=r(60048),eb=r(69214);r(63430);var eT=r(38715),eS=r(35430),eO=r(87466),eR=r(74806),eD=r(22045);!function(e){e[e.Immediate=0]="Immediate",e[e.FadeWithWeather=1]="FadeWithWeather"}(n||(n={}));var eP=r(75648);class eI{constructor(e){this.shadowMap=e,this.slot=eD.N.OPAQUE_MATERIAL,this.slicePlane=null,this.hasOccludees=!1,this.enableFillLights=!0,this.oitPass=eb.Y.NONE,this.alignPixelEnabled=!1,this.decorations=!0,this.overlayStretch=1,this.viewshedEnabled=!1,this._camera=new N.A,this._inverseViewport=(0,eS.vt)(),this._oldLighting=new eP.TA,this._newLighting=new eP.TA,this._fadedLighting=new eP.TA,this._lighting=this._newLighting,this.ssr=new eA,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.highlights=[],this.highlightOrderMap=new Map,this.highlightMixOrigin=(0,eS.vt)(),this.highlightMixTexture=null,this.hudRenderStyle=eR.D.Occluded,this.hudOccludedFragmentOpacity=1,this.clouds=new eO.n,this.shadowHighlightsVisible=!1}get camera(){return this._camera}set camera(e){this._camera=e,this._inverseViewport[0]=1/e.fullViewport[2],this._inverseViewport[1]=1/e.fullViewport[3]}get inverseViewport(){return this._inverseViewport}get lighting(){return this._lighting}fadeLighting(){switch(this.clouds.fadeFactor){case 0:this._lighting=this._oldLighting;break;default:this._fadedLighting.lerpLighting(this._oldLighting,this._newLighting,this.clouds.fadeFactor),this._lighting=this._fadedLighting;break;case 1:this._lighting=this._newLighting,this._oldLighting.copyFrom(this._newLighting)}}updateLighting(e,t,r,i){this._oldLighting.copyFrom(this.lighting),this._newLighting.noonFactor=t,this._newLighting.globalFactor=r,this._newLighting.set(e),i===n.FadeWithWeather&&this.clouds.requestFade(),this.fadeLighting()}get highlight(){return null==this.highlightLevel?null:this.highlights[this.highlightLevel]}}class eA{constructor(){this.fadeFactor=1,this.reprojectionMatrix=(0,eT.vt)()}}class eM{constructor(e,t){this.rctx=e,this.lastFrameCamera=new N.A,this.output=A.V.Color,this.renderOccludedMask=eE,this.bind=new eI(t),this.bind.alignPixelEnabled=!0}}let eE=eC.m$.Occlude|eC.m$.OccludeAndTransparent|eC.m$.OccludeAndTransparentStencil;var eF=r(20538),eN=r(3391),eL=r(13784),eH=r(10954);let ez=class extends N.A{constructor(){super(...arguments),this._projectionMatrix=(0,eT.vt)()}get projectionMatrix(){return this._projectionMatrix}};(0,l._)([(0,v.MZ)()],ez.prototype,"_projectionMatrix",void 0),(0,l._)([(0,v.MZ)({readOnly:!0})],ez.prototype,"projectionMatrix",null),ez=(0,l._)([(0,_.$)("esri.views.3d.webgl-engine.lib.CascadeCamera")],ez);var eW=r(817);!function(e){e[e.Highlight=0]="Highlight",e[e.ExcludeHighlight=1]="ExcludeHighlight"}(s||(s={}));class eV{constructor(){this.camera=new ez,this.lightMat=(0,eT.vt)()}}class ej{constructor(){this.maxNumCascadesHighQuality=4,this.maxNumCascadesLowQuality=4,this.textureSizeModHighQuality=1.3,this.textureSizeModLowQuality=.9,this.splitSchemeLambda=0}}class eU{constructor(e,t){this._fbos=e,this._viewingMode=t,this._enabled=!1,this._snapshots=[],this._textureHeight=0,this._numCascades=1,this.settings=new ej,this._projectionView=(0,eT.vt)(),this._projectionViewInverse=(0,eT.vt)(),this._modelViewLight=(0,eT.vt)(),this._cascadeDistances=[0,0,0,0,0],this._usedCascadeDistances=(0,L.vt)(),this._cascades=[new eV,new eV,new eV,new eV],this._lastOrigin=null,this._maxTextureWidth=Math.min((0,c.A)("esri-mobile")?4096:16384,e.rctx.parameters.maxTextureSize)}dispose(){this.enabled=!1,this.disposeOffscreenBuffers()}get depthTexture(){return this._handle?.getTexture()}get _textureWidth(){return this._textureHeight*this._numCascades}get numCascades(){return this._numCascades}get cascadeDistances(){return(0,eL.s)(this._usedCascadeDistances,this._cascadeDistances[0],this._numCascades>1?this._cascadeDistances[1]:1/0,this._numCascades>2?this._cascadeDistances[2]:1/0,this._numCascades>3?this._cascadeDistances[3]:1/0)}disposeOffscreenBuffers(){this._handle=(0,u.Gz)(this._handle),this._discardSnapshots()}set maxCascades(e){this.settings.maxNumCascadesHighQuality=(0,eF.qE)(Math.floor(e),1,4)}get maxCascades(){return this.settings.maxNumCascadesHighQuality}set enabled(e){this._enabled=e,e||this.disposeOffscreenBuffers()}get enabled(){return this._enabled}get ready(){return this._enabled&&null!=this.depthTexture}get cascades(){for(let e=0;e<this._numCascades;++e)eK[e]=this._cascades[e];return eK.length=this._numCascades,eK}start(e,t,r,i,o){(0,e_.vA)(this.enabled);let{near:a,far:n}=function(e){let{near:t,far:r}=e;return t<2&&(t=2),r<2&&(r=2),t>=r&&(t=2,r=4),{near:t,far:r}}(r);this._computeCascadeDistances(a,n,i),this._textureHeight=this._computeTextureHeight(e,o,i),this._setupMatrices(e,t);let{viewMatrix:s,projectionMatrix:l}=e;for(let e=0;e<this._numCascades;++e)this._constructCascade(e,l,s,t);this._lastOrigin=null,this.clear()}finish(){(0,e_.vA)(this.enabled),this._handle?.detachDepth()}getShadowMapMatrices(e){if(!this._lastOrigin||!(0,x.p)(e,this._lastOrigin)){this._lastOrigin=this._lastOrigin||(0,w.vt)(),(0,x.c)(this._lastOrigin,e);for(let t=0;t<this._numCascades;++t){(0,y.Tl)(eJ,this._cascades[t].lightMat,e);for(let e=0;e<16;++e)e0[16*t+e]=eJ[e]}}return e0}moveSnapshot(e){(0,e_.vA)(this.enabled),this._handle?.detachDepth(),this._snapshots[e]?.release(),this._snapshots[e]=this._handle,this._handle=null,this.clear()}copySnapshot(e){let t=this._handle?.getTexture()?.descriptor;if(!this.enabled||!t)return;this._snapshots[e]?.release();let{width:r,height:i}=t,o=e===s.Highlight?"shadow highlight snapshot":"shadow no highlight snapshot";this._snapshots[e]=this._fbos.acquire(r,i,o,I.N.RGBA4);let a=this._fbos.rctx;this._bindFbo();let n=a.bindTexture(this._snapshots[e]?.getTexture(),ed.g.TEXTURE_UNIT_FOR_UPDATES);a.gl.copyTexSubImage2D(ec.Ap.TEXTURE_2D,0,0,0,0,0,r,i),a.bindTexture(n,ed.g.TEXTURE_UNIT_FOR_UPDATES)}getSnapshot(e){return this.enabled?this._snapshots[e]?.getTexture():null}clear(){let e=this._fbos.rctx;this._ensureFbo(),this._bindFbo(),e.setClearColor(1,1,1,1),e.clear(ec.NV.COLOR|ec.NV.DEPTH)}_computeTextureHeight(e,t,r){let i=Math.min(window.devicePixelRatio,t)/e.pixelRatio,o=r?this.settings.textureSizeModHighQuality:this.settings.textureSizeModLowQuality,a=(0,eW.Mv)(Math.floor(Math.max(e.fullWidth,e.fullHeight)*i*o)),n=Math.min(this._maxTextureWidth,this._numCascades*a);return(0,eW.uT)(n/this._numCascades)}_ensureFbo(){this._handle?.fbo?.width===this._textureWidth&&this._handle?.fbo.height===this._textureHeight||(this._handle?.release(),this._handle=this._fbos.acquire(this._textureWidth,this._textureHeight,"shadow map",I.N.RGBA4)),this._handle?.acquireDepth(I.z.DEPTH16_BUFFER)}_discardSnapshot(e){this._snapshots[e]=(0,u.Gz)(this._snapshots[e])}_discardSnapshots(){for(let e=0;e<this._snapshots.length;++e)this._discardSnapshot(e);this._snapshots.length=0}_bindFbo(){this._fbos.rctx.bindFramebuffer(this._handle?.fbo)}_constructCascade(e,t,r,i){let o=this._cascades[e],a=-this._cascadeDistances[e],n=-this._cascadeDistances[e+1],s=(t[10]*a+t[14])/Math.abs(t[11]*a+t[15]),l=(t[10]*n+t[14])/Math.abs(t[11]*n+t[15]);(0,e_.vA)(s<l);for(let e=0;e<8;++e){(0,eL.s)(eG,e%4==0||e%4==3?-1:1,e%4==0||e%4==1?-1:1,e<4?s:l,1);let t=eq[e];(0,eL.t)(t,eG,this._projectionViewInverse),t[0]/=t[3],t[1]/=t[3],t[2]/=t[3]}(0,x.v)(eX,eq[0]),o.camera.viewMatrix=(0,y.Tl)(ek,this._modelViewLight,eX);for(let e=0;e<8;++e)(0,x.t)(eq[e],eq[e],o.camera.viewMatrix);let h=eq[0][2],c=eq[0][2];for(let e=1;e<8;++e)h=Math.min(h,eq[e][2]),c=Math.max(c,eq[e][2]);h-=200,c+=200,o.camera.near=-c,o.camera.far=-h,function(e,t,r,i,o){var a;let n,s,l,h,c=1/eq[0][3],d=1/eq[4][3];(0,e_.vA)(c<d);let u=c+Math.sqrt(c*d),g=Math.sin((0,eF.XM)(e[2]*t[0]+e[6]*t[1]+e[10]*t[2]));(function(e,t,r,i,o,a,n,s){let l,h;(0,V.hZ)(e1,0,0);for(let t=0;t<4;++t)(0,V.WQ)(e1,e1,e[t]);(0,V.hs)(e1,e1,.25),(0,V.hZ)(e2,0,0);for(let t=4;t<8;++t)(0,V.WQ)(e2,e2,e[t]);(0,V.hs)(e2,e2,.25),(0,V.Cc)(e3[0],e[4],e[5],.5),(0,V.Cc)(e3[1],e[5],e[6],.5),(0,V.Cc)(e3[2],e[6],e[7],.5),(0,V.Cc)(e3[3],e[7],e[4],.5);let c=0,d=(0,V.hG)(e3[0],e1);for(let e=1;e<4;++e){let t=(0,V.hG)(e3[e],e1);t<d&&(d=t,c=e)}(0,V.Re)(e4,e3[c],e[c+4]);let u=e4[0];e4[0]=-e4[1],e4[1]=u,(0,V.Re)(e5,e2,e1),0>(0,V.Om)(e5,e4)&&(0,V.ze)(e4,e4),(0,V.Cc)(e4,e4,e5,r),(0,V.S8)(e4,e4),l=h=(0,V.Om)((0,V.Re)(e9,e[0],e1),e4);for(let t=1;t<8;++t){let r=(0,V.Om)((0,V.Re)(e9,e[t],e1),e4);r<l?l=r:r>h&&(h=r)}(0,V.C)(i,e1),(0,V.hs)(e9,e4,l-t),(0,V.WQ)(i,i,e9);let g=-1,p=1,f=0,v=0;for(let t=0;t<8;++t){(0,V.Re)(e8,e[t],i),(0,V.S8)(e8,e8);let r=e4[0]*e8[1]-e4[1]*e8[0];r>0?r>g&&(g=r,f=t):r<p&&(p=r,v=t)}(0,e_.MX)(g>0,"leftArea"),(0,e_.MX)(p<0,"rightArea"),(0,V.hs)(e6,e4,l),(0,V.WQ)(e6,e6,e1),(0,V.hs)(e7,e4,h),(0,V.WQ)(e7,e7,e1),te[0]=-e4[1],te[1]=e4[0];let m=(0,e_.L)(i,e[v],e7,(0,V.WQ)(e9,e7,te),1,o),_=(0,e_.L)(i,e[f],e7,e9,1,a),y=(0,e_.L)(i,e[f],e6,(0,V.WQ)(e9,e6,te),1,n),x=(0,e_.L)(i,e[v],e6,e9,1,s);(0,e_.MX)(m,"rayRay"),(0,e_.MX)(_,"rayRay"),(0,e_.MX)(y,"rayRay"),(0,e_.MX)(x,"rayRay")})(eq,u/=g,g,eB,eZ,e$,eQ,eY),a=o.projectionMatrix,(0,V.Re)(ti,eQ,eY),(0,V.hs)(ti,ti,.5),to[0]=ti[0],to[1]=ti[1],to[2]=0,to[3]=ti[1],to[4]=-ti[0],to[5]=0,to[6]=ti[0]*ti[0]+ti[1]*ti[1],to[7]=ti[0]*ti[1]-ti[1]*ti[0],to[8]=1,to[6]=-(0,V.Om)(tr(to,0),eB),to[7]=-(0,V.Om)(tr(to,1),eB),n=(0,V.Om)(tr(to,0),eQ)+to[6],s=(0,V.Om)(tr(to,1),eQ)+to[7],n=-(n+(l=(0,V.Om)(tr(to,0),eY)+to[6]))/(s+((0,V.Om)(tr(to,1),eY)+to[7])),to[0]+=to[1]*n,to[3]+=to[4]*n,to[6]+=to[7]*n,n=1/((0,V.Om)(tr(to,0),eQ)+to[6]),s=1/((0,V.Om)(tr(to,1),eQ)+to[7]),to[0]*=n,to[3]*=n,to[6]*=n,to[1]*=s,to[4]*=s,to[7]*=s,to[2]=to[1],to[5]=to[4],to[8]=to[7],to[7]+=1,n=(0,V.Om)(tr(to,1),eZ)+to[7],s=(0,V.Om)(tr(to,2),eZ)+to[8],n=-.5*(n/s+(l=(0,V.Om)(tr(to,1),eQ)+to[7])/((0,V.Om)(tr(to,2),eQ)+to[8])),to[1]+=to[2]*n,to[4]+=to[5]*n,to[7]+=to[8]*n,n=(0,V.Om)(tr(to,1),eZ)+to[7],l=-(s=(0,V.Om)(tr(to,2),eZ)+to[8])/n,to[1]*=l,to[4]*=l,to[7]*=l,a[0]=to[0],a[1]=to[1],a[2]=0,a[3]=to[2],a[4]=to[3],a[5]=to[4],a[6]=0,a[7]=to[5],a[8]=0,a[9]=0,a[10]=1,a[11]=0,a[12]=to[6],a[13]=to[7],a[14]=0,a[15]=to[8],o.projectionMatrix[10]=2/(r-i),o.projectionMatrix[14]=-(r+i)/(r-i)}(r,i,h,c,o.camera),(0,y.lw)(o.lightMat,o.camera.projectionMatrix,o.camera.viewMatrix);let d=this._textureHeight;o.camera.viewport=[e*d,0,d,d]}_setupMatrices(e,t){(0,y.lw)(this._projectionView,e.projectionMatrix,e.viewMatrix),(0,y.B8)(this._projectionViewInverse,this._projectionView);let r=this._viewingMode===eH.RT.Global?e.eye:(0,x.i)(eX,0,0,1);(0,y.t5)(this._modelViewLight,[0,0,0],[-t[0],-t[1],-t[2]],r)}_computeCascadeDistances(e,t,r){let i=r?this.settings.maxNumCascadesHighQuality:this.settings.maxNumCascadesLowQuality;this._numCascades=Math.min(1+Math.floor((0,e_.kL)(t/e,4)),i);let o=(t-e)/this._numCascades,a=(t/e)**(1/this._numCascades),n=e,s=e;for(let e=0;e<this._numCascades+1;++e)this._cascadeDistances[e]=(0,eF.Cc)(n,s,this.settings.splitSchemeLambda),n*=a,s+=o}get test(){}}let ek=(0,eT.vt)(),eG=(0,L.vt)(),eq=[];for(let e=0;e<8;++e)eq.push((0,L.vt)());let eB=(0,eS.vt)(),eZ=(0,eS.vt)(),e$=(0,eS.vt)(),eQ=(0,eS.vt)(),eY=(0,eS.vt)(),eX=(0,w.vt)(),eK=[],eJ=(0,eT.vt)(),e0=eT.zK.concat(eT.zK,eT.zK,eT.zK,eT.zK),e1=(0,eS.vt)(),e2=(0,eS.vt)(),e3=[(0,eS.vt)(),(0,eS.vt)(),(0,eS.vt)(),(0,eS.vt)()],e4=(0,eS.vt)(),e5=(0,eS.vt)(),e9=(0,eS.vt)(),e8=(0,eS.vt)(),e6=(0,eS.vt)(),e7=(0,eS.vt)(),te=(0,eS.vt)(),tt=(0,eS.vt)();function tr(e,t){return(0,V.hZ)(tt,e[t],e[t+3]),tt}let ti=(0,eS.vt)(),to=(0,eN.vt)();class ta extends G.w{constructor(e,t){super(e,t,new k.$(z.a,()=>r.e(3362).then(r.bind(r,93362))))}initializePipeline(e){return e.hasAlpha?(0,B.Ey)({blending:B.Ky,colorWrite:B.kn}):(0,B.Ey)({colorWrite:B.kn})}}var tn=r(95421);class ts extends tn.K{constructor(){super(...arguments),this.hasAlpha=!1}}(0,l._)([(0,tn.W)()],ts.prototype,"hasAlpha",void 0);var tl=r(58462),th=r(38220),tc=r(52922);class td extends G.w{constructor(e,t){super(e,t,new k.$(tc.a,()=>r.e(2452).then(r.bind(r,82452))))}}var tu=r(25451);let tg=class extends W.RW{constructor(e){super(e),this._overlays=null,this._renderTargets=null,this._overlayParameters=new tc.O,this.hasHighlights=!1,this._hasWater=!1,this._renderers=new Map,this._sortedDrapeSourceRenderersDirty=!1,this._sortedRenderers=new g.A,this._passParameters=new z.T,this._materials=null,this._screenToWorldRatio=1,this._localOriginFactory=null,this.unloadedMemory=0,this.ignoresMemoryFactor=!1,this._camera=new N.A,this.events=new h.A,this.longitudeCyclical=null,this.produces=new Map([[eD.N.DRAPED_MATERIAL,e=>e!==A.V.Highlight||this.hasHighlights],[eD.N.DRAPED_WATER,()=>this._hasWater]]),this._hasTargetWithoutRasterImage=!1,this._hasDrapedFeatureSource=!1,this._hasDrapedRasterSource=!1}initialize(){let e=this._view,t=e._stage,r=t.renderer.fboCache,{waterTextures:i,textures:o}=t.renderView;this._renderContext=new eM(this._rctx,new eU(r,e.state.viewingMode)),this.addHandles([(0,p.wB)(()=>i.updating,()=>this.events.emit("content-changed"),p.pc),(0,p.wB)(()=>this.spatialReference,e=>this._localOriginFactory=new ew.g(e),p.pc),(0,p.on)(()=>e.allLayerViews,"after-changes",()=>this._sortedDrapeSourceRenderersDirty=!0),(0,p.wB)(()=>(function(e){let t=0;for(let r of e){let{name:e}=r;t+=e.length;let{color:i,fillOpacity:o,haloColor:a,haloOpacity:n}=r;t+=i.r+i.g+i.b+i.a+o,t+=a?a.r+a.g+a.b+a.a+n:0}let r=e.at(0);if(r){let{shadowOpacity:e,shadowDifference:i,shadowColor:o}=r;t+=e+i+o.r+o.g+o.b+o.a}return ef+++(t>=0?0:1)})(e.state.highlights),()=>this._sortedDrapeSourceRenderersDirty=!0,p.Vh),(0,p.wB)(()=>e.state.highlights,t=>{this._bindParameters.highlights=t,this._bindParameters.highlightOrderMap=e.state.highlightOrderMap,this._updateHighlights()},p.Vh),e.resourceController.scheduler.registerTask(tu.W6.STAGE,this)]),this._materials=new ey(o,this._techniques,()=>{this.notifyChange("rendersOccludedDraped"),this.events.emit("content-changed"),this.notifyChange("updating"),this.notifyChange("isEmpty")},()=>this.events.emit("content-changed"));let{_bindParameters:a,_camera:s}=this;s.near=1,s.far=1e4,s.relativeElevation=null,a.slot=eD.N.DRAPED_MATERIAL,a.mainDepth=null,a.camera=s,a.oitPass=eb.Y.NONE,a.updateLighting([new th.$p((0,w.S)())],0,0,n.Immediate)}destroy(){this._renderers.forEach(e=>e.destroy()),this._renderers.clear(),this._passParameters.texture=(0,u.WD)(this._passParameters.texture),this.disposeOverlays()}get _bindParameters(){return this._renderContext.bind}get _rctx(){return this._stage.renderView.renderingContext}get _view(){return this.parent.view}get _stage(){return this.parent.view._stage}get spatialReference(){return this.parent.spatialReference}get _techniques(){return this._stage.renderView.techniques}get rctx(){return this._rctx}get materials(){return this._materials}get screenToWorldRatio(){return this._screenToWorldRatio}get localOriginFactory(){return this._localOriginFactory}get pluginContext(){return this._pluginContext}initializeRenderContext(e){this._pluginContext=e,this._techniques.precompile(td)}uninitializeRenderContext(){}acquireTechniques(){return[]}render(){}get updating(){return this._sortedDrapeSourceRenderersDirty||(0,d.Bs)(this._renderers,e=>e.updating)}get hasOverlays(){return null!=this._overlays&&null!=this._renderTargets}getMaterialRenderer(e){for(let t of this._renderers.values()){let r=t.getMaterialRenderer(e);if(r)return r}return null}get layers(){return this._sortedDrapeSourceRenderersDirty&&this._updateSortedDrapeSourceRenderers(),this._sortedRenderers.map(e=>e.drapeSource.layer).filter(e=>!!e)}_updateHighlights(){let e=this._view.state;this._renderers.forEach(t=>t.updateHighlights(e.highlightOrderMap))}createDrapeSourceRenderer(e,t,r){let i=this._renderers.get(e);null!=i&&i.destroy();let o=new t({...r,rendererContext:this,drapeSource:e});return this._renderers.set(e,o),this._sortedDrapeSourceRenderersDirty=!0,"fullOpacity"in e&&this.addHandles((0,p.wB)(()=>e.fullOpacity,()=>this.events.emit("content-changed")),e),o}removeDrapeSourceRenderer(e){if(null==e)return;let t=this._renderers.get(e);null!=t&&(this._sortedDrapeSourceRenderersDirty=!0,this._renderers.delete(e),this.removeHandles(e),t.destroy())}computeValidity(){return this._renderTargets?.computeValidity()??0}releaseRenderTargets(){this._renderTargets?.dispose()}get overlays(){return this._overlays??[]}ensureDrapeTargets(e){this._hasTargetWithoutRasterImage=!!this._overlays&&(0,f.bw)(e,e=>e.drapeTargetType===C.sv.WithoutRasterImage)}ensureDrapeSources(e){this._overlays?(this._hasDrapedFeatureSource=(0,f.bw)(e,e=>e.drapeSourceType===C.Om.Features),this._hasDrapedRasterSource=(0,f.bw)(e,e=>e.drapeSourceType===C.Om.RasterImage)):this._hasDrapedFeatureSource=this._hasDrapedRasterSource=!1}get _needsColorWithoutRasterImage(){return this._hasDrapedRasterSource&&this._hasDrapedFeatureSource&&this._hasTargetWithoutRasterImage}ensureOverlays(e,t,r=this._bindParameters.overlayStretch){null==this._overlays&&(this._renderTargets=new F(this._stage.renderer.fboCache),this._overlays=[new R,new R]),this.ensureDrapeTargets(e),this.ensureDrapeSources(t),this._bindParameters.overlayStretch=r}disposeOverlays(){this._overlays=null,this._renderTargets=(0,u.WD)(this._renderTargets),this.events.emit("textures-disposed")}getTexture(e){if(null!=e)return e===i.ColorNoRasterImage&&!this._needsColorWithoutRasterImage&&this._hasDrapedFeatureSource?this._renderTargets?.getTexture(i.Color):this._renderTargets?.getTexture(e)}get running(){return this.updating}runTask(e){this._processDrapeSources(e,()=>!0)}_processDrapeSources(e,t){let r=!1;for(let[i,o]of this._renderers){if(e.done)break;(i.destroyed||t(i))&&o.commitChanges(this._view.state.highlightOrderMap)&&(r=!0,e.madeProgress())}this._sortedDrapeSourceRenderersDirty&&(this._sortedDrapeSourceRenderersDirty=!1,r=!0,this._updateSortedDrapeSourceRenderers()),r&&(null!=this._overlays&&0===this._renderers.size&&this.disposeOverlays(),this.notifyChange("updating"),this.notifyChange("isEmpty"),this.events.emit("content-changed"),this.hasHighlights=(0,d.Bs)(this._renderers,e=>e.hasHighlights),this.notifyChange("rendersOccludedDraped"))}hasHighlightOptions(e){return(0,d.Bs)(this._renderers,t=>t.hasHighlightOptions(e))}processSyncDrapeSources(){this._processDrapeSources(tu.Bb,e=>e.updatePolicy===tl.q.SYNC)}get isEmpty(){return!b.b.OVERLAY_DRAW_DEBUG_TEXTURE&&!(0,d.Bs)(this._renderers,e=>!e.isEmpty)}get hasWater(){let e=(0,d.Bs)(this._renderers,e=>e.hasWater);return e!==this._hasWater&&(this._hasWater=e,this.events.emit("has-water")),this._hasWater}get rendersOccludedDraped(){let e=this._renderContext.renderOccludedMask;this._renderContext.renderOccludedMask=tm,++this._techniques.precompiling;let t=this._sortedRenderers.some(({renderer:e})=>e.precompile(this._renderContext));return--this._techniques.precompiling,this._renderContext.renderOccludedMask=e,t}renders(e){if(b.b.OVERLAY_DRAW_DEBUG_TEXTURE&&e!==i.Occluded&&e!==i.Highlight)return!0;++this._techniques.precompiling;let t=this._sortedRenderers.some(({renderer:e})=>e.precompile(this._renderContext));return--this._techniques.precompiling,t}get mode(){return this.isEmpty?a.Disabled:this.hasWater&&this.renders(i.WaterNormal)?a.EnabledWithWater:this._renderTargets?.getTexture(i.Color)?a.Enabled:a.Disabled}updateAnimation(e){let t=!1;return this._renderers.forEach(r=>t=r.updateAnimation(e)||t),t&&this.parent.requestRender(ea.C7.BACKGROUND),t}updateDrapeSourceOrder(){this._sortedDrapeSourceRenderersDirty=!0}precompileShaders(e){if(this._renderTargets){for(let t of(this._bindParameters.alignPixelEnabled=e.alignPixelEnabled,++this._techniques.precompiling,this._renderTargets.targets)){if(t.content===i.ColorNoRasterImage&&!this._needsColorWithoutRasterImage)continue;let e=t.output;this._renderContext.output=e,this._bindParameters.slot=e===A.V.Normal?eD.N.DRAPED_WATER:eD.N.DRAPED_MATERIAL,t.content===i.Occluded&&(this._renderContext.renderOccludedMask=tm),this._sortedRenderers.forAll(({drapeSource:e,renderer:r})=>{t.content===i.ColorNoRasterImage&&e.drapeSourceType===C.Om.RasterImage||r.precompile(this._renderContext)}),this._renderContext.renderOccludedMask=eE}--this._techniques.precompiling}}drawOverlays(e){if(this._overlays&&this._renderTargets){for(let e of this._overlays)this.longitudeCyclical?e.setupGeometryViewsCyclical(this.longitudeCyclical):e.setupGeometryView();for(let t of(this._bindParameters.alignPixelEnabled=e.alignPixelEnabled,this._renderTargets.targets)){if(t.content===i.ColorNoRasterImage&&!this._needsColorWithoutRasterImage)continue;let e=this._drawTarget(T.vr.INNER,t),r=this._drawTarget(T.vr.OUTER,t);(e||r)&&t.fbo.generateMipMap()}}}_drawTarget(e,t){let r=this._overlays[e],o=r.canvasGeometries;if(0===o.numViews)return!1;let a=this._view.state.contentPixelRatio;this._screenToWorldRatio=a*r.mapUnitsPerPixel/this._bindParameters.overlayStretch;let n=t.output;if(this.isEmpty||n===A.V.Normal&&!this.hasWater||!r.hasSomeSizedView())return!1;let{_rctx:s,_camera:l,_renderContext:h,_bindParameters:c}=this;if(l.pixelRatio=r.pixelRatio*a,h.output=n,c.screenToWorldRatio=this._screenToWorldRatio,c.screenToPCSRatio=this._screenToWorldRatio*this.parent.worldToPCSRatio,c.slot=n===A.V.Normal?eD.N.DRAPED_WATER:eD.N.DRAPED_MATERIAL,t.content===i.Occluded&&(h.renderOccludedMask=tm),!this.renders(t.content))return h.renderOccludedMask=eE,!1;let{resolution:d}=r,u=e===T.vr.INNER?0:d;if(s.setViewport(u,0,d,d),this._bindTargetFBO(t),e===T.vr.INNER&&(s.setClearColor(0,0,0,0),s.clear(ec.NV.COLOR)),b.b.OVERLAY_DRAW_DEBUG_TEXTURE&&t.content!==i.Occluded&&t.content!==i.Highlight){this._techniques.precompile(ta,t_);let t=this._techniques.get(ta,t_);for(let i=0;i<o.numViews;i++)this._setViewParameters(o.extents[i],r),this._ensureDebugPatternResources(r.resolution,tf[e]),s.bindTechnique(t,c,this._passParameters),s.screen.draw()}if(t.output===A.V.Highlight){let{fboCache:r}=this._stage.renderer,i=this._resolution;this._bindTargetFBO(t),function(e,t,r,i,o,a=0){let n=i.highlights,s=n.length>1?t.acquire(r.width,r.height,"highlight mix",I.N.RG):null;if(s){let t=e.getBoundFramebufferObject();e.bindFramebuffer(s.fbo),e.clearFramebuffer(L.uY),e.bindFramebuffer(t)}let l=s?.getTexture();i.highlightMixTexture=l,(0,V.hZ)(i.highlightMixOrigin,a,0),n.forEach((t,n)=>{n>0&&(e.bindTexture(l,ed.g.TEXTURE_UNIT_FOR_UPDATES),e.gl.copyTexSubImage2D(ec.Ap.TEXTURE_2D,0,0,0,a,0,r.width,r.height),e.bindTexture(null,ed.g.TEXTURE_UNIT_FOR_UPDATES)),e.clear(ec.NV.DEPTH),i.highlightLevel=n,o()}),i.highlightLevel=null,i.highlightMixTexture=null,s?.release()}(s,r,{width:i,height:i},c,()=>this._renderAllGeometry(e,t),u)}else this._renderAllGeometry(e,t);return s.bindFramebuffer(null),h.renderOccludedMask=eE,!0}_renderAllGeometry(e,t){let r=this._overlays[e],o=r.canvasGeometries;this._sortedRenderers.forAll(({drapeSource:a,renderer:n})=>{if(t.content===i.ColorNoRasterImage&&a.drapeSourceType===C.Om.RasterImage)return;let{fullOpacity:s}=a,l=null!=s&&s<1&&t.output===A.V.Color&&this._bindTemporaryFBO();for(let e=0;e<o.numViews;e++)this._setViewParameters(o.extents[e],r),n.render(this._renderContext);if(l){this._bindTargetFBO(t),this._overlayParameters.texture=l.getTexture(),this._overlayParameters.opacity=s,this._overlayParameters.overlayIndex=e;let r=this._techniques.get(td);this._rctx.bindTechnique(r,this._bindParameters,this._overlayParameters),this._rctx.screen.draw(),l.release()}})}_bindTargetFBO(e){let t=this._resolution;e.fbo.bind(this._rctx,2*t,t)}_bindTemporaryFBO(){let e=this._resolution,t=this._stage.renderer.fboCache,r=t.acquire(2*e,e,"overlay tmp");return t.rctx.bindFramebuffer(r.fbo),t.rctx.clear(ec.NV.COLOR),r}get _resolution(){return this._overlays?.[T.vr.INNER].resolution??0}notifyContentChanged(){this.events.emit("content-changed")}intersect(e,t,r,i){this._sortedDrapeSourceRenderersDirty&&this._updateSortedDrapeSourceRenderers();let o=0;for(let{renderer:a}of this._sortedRenderers)o=a.intersect?.(e,t,r,i,o)??o}_updateSortedDrapeSourceRenderers(){if(this._sortedRenderers.clear(),0===this._renderers.size)return;let e=this._view.map.allLayers,t=e.length;this._renderers.forEach((r,i)=>{let o=e.indexOf(i.layer),a=o>=0,n=i.renderGroup??(a?C.O7.MapLayer:C.O7.ViewLayer);this._sortedRenderers.push(new tp(i,r,t*n+(a?o:0)))}),this._sortedRenderers.sort((e,t)=>e.index-t.index)}_setViewParameters(e,t){let r=this._camera;r.viewport=[0,0,t.resolution,t.resolution],(0,y.v3)(r.projectionMatrix,0,e[2]-e[0],0,e[3]-e[1],r.near,r.far),(0,y.kN)(r.viewMatrix,[-e[0],-e[1],0])}_ensureDebugPatternResources(e,t){if((0,x.i)(this._passParameters.color,t[0],t[1],t[2]),this._passParameters.texture)return;let r=new Uint8Array(e*e*4),i=0;for(let t=0;t<e;t++)for(let o=0;o<e;o++){let a=Math.floor(o/10),n=Math.floor(t/10);a<2||n<2||10*a>e-20||10*n>e-20?(r[i++]=255,r[i++]=255,r[i++]=255,r[i++]=255):(r[i++]=255,r[i++]=255,r[i++]=255,r[i++]=1&a&&1&n?1&o^1&t?0:255:1&a^1&n?0:128)}let o=new eu.R(e);o.samplingMode=ec.Cj.NEAREST,this._passParameters.texture=new ed.g(this._rctx,o,r)}get test(){}};(0,l._)([(0,v.MZ)()],tg.prototype,"hasHighlights",void 0),(0,l._)([(0,v.MZ)()],tg.prototype,"_sortedDrapeSourceRenderersDirty",void 0),(0,l._)([(0,v.MZ)({constructOnly:!0})],tg.prototype,"parent",void 0),(0,l._)([(0,v.MZ)({readOnly:!0})],tg.prototype,"_techniques",null),(0,l._)([(0,v.MZ)({type:Boolean,readOnly:!0})],tg.prototype,"updating",null),(0,l._)([(0,v.MZ)()],tg.prototype,"isEmpty",null),(0,l._)([(0,v.MZ)({readOnly:!0})],tg.prototype,"rendersOccludedDraped",null),tg=(0,l._)([(0,_.$)("esri.views.3d.terrain.OverlayRenderer")],tg);class tp{constructor(e,t,r){this.drapeSource=e,this.renderer=t,this.index=r}}let tf=[[1,.5,.5],[.5,.5,1]],tv=-2,tm=eC.m$.OccludeAndTransparent,t_=new ts;t_.hasAlpha=!0},24491:(e,t,r)=>{r.d(t,{W:()=>a});var i=r(60048),o=r(19039);class a extends i.im{intersect(e,t,r,i,a,n){return(0,o.Uy)(e,r,i,a,void 0,n)}}},25302:(e,t,r)=>{r.d(t,{v:()=>A});var i=r(44120),o=r(83094),a=r(4538),n=r(95554),s=r(18189),l=r(93895),h=r(97305),c=r(22045),d=r(53041),u=r(82454),g=r(24491),p=r(68191),f=r(60649),v=r(96741),m=r(69214),_=r(67880),y=r(10212),x=r(93446),w=r(84153);p.S;class C extends v.w{constructor(e,t){super(e,t,new f.$(y.C,()=>r.e(4218).then(r.bind(r,44218))))}_createPipeline(e,t){let{oitPass:r,output:i,transparent:o,cullFace:n,draped:s,hasOccludees:l,polygonOffset:c,enableOffset:d}=e,u=r===m.Y.NONE,g=r===m.Y.FrontFace;return(0,w.Ey)({blending:(0,a.RN)(i)&&o?(0,h.Yf)(r):null,culling:(0,w.Xt)(n),depthTest:s?null:{func:(0,h.K_)(r)},depthWrite:(0,h.z5)(e),drawBuffers:i===a.V.Depth?{buffers:[x.Hr.NONE]}:(0,h.m6)(r,i),colorWrite:w.kn,stencilWrite:l?_.v0:null,stencilTest:l?t?_.a9:_.qh:null,polygonOffset:u||g?c?b:null:(0,h.aB)(d)})}initializePipeline(e){return this._occludeePipelineState=this._createPipeline(e,!0),this._createPipeline(e,!1)}getPipeline(e){return e?this._occludeePipelineState:super.getPipeline()}}let b={factor:1,units:1};var T=r(81856),S=r(26847),O=r(30066),R=r(95421),D=r(4111);class P extends D.E{constructor(){super(...arguments),this.cullFace=s.s2.None,this.hasVertexColors=!1,this.transparent=!1,this.discardInvisibleFragments=!1,this.polygonOffset=!1,this.enableOffset=!0,this.writeDepth=!0,this.hasOccludees=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.objectAndLayerIdColorInstanced=!1,this.vvColor=!1,this.draped=!1,this.textureCoordinateType=S.I.None,this.emissionSource=O.ZX.None,this.occlusionPass=!1,this.hasVvInstancing=!0,this.vvSize=!1,this.vvOpacity=!1}}(0,T._)([(0,R.W)({count:s.s2.COUNT})],P.prototype,"cullFace",void 0),(0,T._)([(0,R.W)()],P.prototype,"hasVertexColors",void 0),(0,T._)([(0,R.W)()],P.prototype,"transparent",void 0),(0,T._)([(0,R.W)()],P.prototype,"discardInvisibleFragments",void 0),(0,T._)([(0,R.W)()],P.prototype,"polygonOffset",void 0),(0,T._)([(0,R.W)()],P.prototype,"enableOffset",void 0),(0,T._)([(0,R.W)()],P.prototype,"writeDepth",void 0),(0,T._)([(0,R.W)()],P.prototype,"hasOccludees",void 0),(0,T._)([(0,R.W)()],P.prototype,"terrainDepthTest",void 0),(0,T._)([(0,R.W)()],P.prototype,"cullAboveTerrain",void 0),(0,T._)([(0,R.W)()],P.prototype,"objectAndLayerIdColorInstanced",void 0),(0,T._)([(0,R.W)()],P.prototype,"vvColor",void 0),(0,T._)([(0,R.W)()],P.prototype,"draped",void 0);var I=r(92961);class A extends g.W{constructor(e){super(e,E),this._configuration=new P,this.supportsEdges=!0,this.produces=new Map([[c.N.OPAQUE_MATERIAL,e=>this._isOpaqueMaterialPass(e)],[c.N.OPAQUE_MATERIAL_WITHOUT_NORMALS,e=>this._isOpaqueNoSSAODepthPass(e)],[c.N.TRANSPARENT_MATERIAL,e=>(0,a.QG)(e)&&this._transparent&&this.parameters.writeDepth],[c.N.TRANSPARENT_MATERIAL_WITHOUT_NORMALS,e=>(0,a.eh)(e)&&this._transparent&&this.parameters.writeDepth],[c.N.TRANSPARENT_MATERIAL_WITHOUT_DEPTH,e=>(0,a.QG)(e)&&this._transparent&&!this.parameters.writeDepth],[c.N.DRAPED_MATERIAL,e=>(0,a.i3)(e)]])}getConfiguration(e,t){return this._configuration.output=e,this._configuration.cullFace=this.parameters.cullFace,this._configuration.hasVertexColors=this.parameters.hasVertexColors&&!this.parameters.vvColor,this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.transparent=this._transparent,this._configuration.discardInvisibleFragments=this._transparent&&!this._isOpaquePass(e)&&this.parameters.discardInvisibleFragments,this._configuration.polygonOffset=this.parameters.polygonOffset,this._configuration.writeDepth=this.parameters.writeDepth,this._configuration.hasOccludees=t.hasOccludees,this._configuration.oitPass=t.oitPass,this._configuration.enableOffset=t.camera.relativeElevation<h.xt,this._configuration.terrainDepthTest=t.terrainDepthTest&&(0,a.RN)(e),this._configuration.cullAboveTerrain=t.cullAboveTerrain,this._configuration.vvColor=!!this.parameters.vvColor,this._configuration.draped=this.parameters.draped,this._configuration}get visible(){return this.parameters.color[3]>=I.Q}get _transparent(){return this.parameters.color[3]<1||this.parameters.forceTransparentMode}_isOpaquePass(e){return this._isOpaqueMaterialPass(e)||this._isOpaqueNoSSAODepthPass(e)}_isOpaqueMaterialPass(e){return e===a.V.Highlight||(0,a.QG)(e)&&!this._transparent}_isOpaqueNoSSAODepthPass(e){return(0,a.eh)(e)&&this.parameters.writeDepth&&!this._transparent}createGLMaterial(e){return new M(e)}createBufferWriter(){let e=(0,o.BP)().vec3f(d.r.POSITION);return(0,n.E)()&&e.vec4u8(d.r.OBJECTANDLAYERIDCOLOR),this.parameters.vvColor?e.f32(d.r.COLORFEATUREATTRIBUTE):e.vec4u8(d.r.COLOR),new u.Z(e)}}class M extends l.A{beginSlot(e){return this.getTechnique(C,e)}}class E extends p.S{constructor(){super(...arguments),this.color=i.uY,this.forceTransparentMode=!1,this.writeDepth=!0,this.hasVertexColors=!1,this.polygonOffset=!1,this.hasSlicePlane=!1,this.cullFace=s.s2.None,this.draped=!1,this.discardInvisibleFragments=!1}}},25878:(e,t,r)=>{r.d(t,{v:()=>a,z:()=>o});var i=r(86416);function o(e){e.fragment.code.add((0,i.H)`float normals2FoamIntensity(vec3 n, float waveStrength){
float normalizationFactor =  max(0.015, waveStrength);
return max((n.x + n.y)*0.3303545/normalizationFactor + 0.3303545, 0.0);
}`)}function a(e){e.fragment.code.add((0,i.H)`vec3 foamIntensity2FoamColor(float foamIntensityExternal, float foamPixelIntensity, vec3 skyZenitColor, float dayMod){
return foamIntensityExternal * (0.075 * skyZenitColor * pow(foamPixelIntensity, 4.) +  50.* pow(foamPixelIntensity, 23.0)) * dayMod;
}`)}},25928:(e,t,r)=>{r.d(t,{H:()=>l,a:()=>g,b:()=>u,c:()=>h,g:()=>c,o:()=>d});var i=r(91845),o=r(86416),a=r(717),n=r(73375),s=r(90564);class l extends n.Y{}function h(){let e=new s.N5,{outputs:t,fragment:r}=e;return e.include(i.c),r.uniforms.add(new a.o("textureInput",e=>e.input)),r.constants.add("outlineWidth","int",Math.ceil(d)),r.constants.add("cellSize","int",c),t.add("fragGrid","vec2"),r.main.add((0,o.H)`ivec2 inputTextureSize = textureSize(textureInput, 0);
ivec2 cellBottomLeftCornerInput = ivec2(floor(gl_FragCoord.xy) * vec2(cellSize));
ivec2 coordMid =  cellBottomLeftCornerInput + ivec2(cellSize >> 1);
uvec2 centreTexel = uvec2( texelFetch(textureInput, coordMid, 0).rg * 255.0) & uvec2(0x55u);
float marginSquare = float(outlineWidth*outlineWidth);
uvec2 outputValue = centreTexel & uvec2(0x55u);
for(int y = -outlineWidth; y <= cellSize + outlineWidth; y+=2) {
int dy = y < 0 ? -y : y > cellSize ? y-cellSize : 0;
int xMargin = dy > 0 ? int(ceil(sqrt(marginSquare - float(dy*dy)))) : outlineWidth;
for(int x = -xMargin; x <= cellSize + xMargin; x+=2) {
ivec2 coord = cellBottomLeftCornerInput + ivec2(x, y);
uvec2[4] texels = uvec2[4] (
uvec2(texelFetch(textureInput,coord+ivec2(0,0),0).rg * 255.0) & uvec2(0x55u),
uvec2(texelFetch(textureInput,coord+ivec2(1,0),0).rg * 255.0) & uvec2(0x55u),
uvec2(texelFetch(textureInput,coord+ivec2(0,1),0).rg * 255.0) & uvec2(0x55u),
uvec2(texelFetch(textureInput,coord+ivec2(1,1),0).rg * 255.0) & uvec2(0x55u)
);
if (texels[0] == texels[1] && texels[1] == texels[2] && texels[2] == texels[3] && texels[3] ==  centreTexel) {
continue;
}
for (int i=0; i<4; ++i){
outputValue |= ((texels[i] ^ centreTexel) << 1);
outputValue |= texels[i];
}
}
}
fragGrid = vec2(outputValue) / 255.0;`),e}let c=32,d=9,u=.4,g=Object.freeze(Object.defineProperty({__proto__:null,HighlightDownsampleDrawParameters:l,blurSize:.4,build:h,gridCellPixelSize:32,outlineSize:9},Symbol.toStringTag,{value:"Module"}))},32620:(e,t,r)=>{r.d(t,{t:()=>v,z:()=>y});var i=r(54036),o=r(35430),a=r(44120),n=r(69752),s=r(9245),l=r(40200),h=r(75169),c=r(95775),d=r(10954),u=r(4023),g=r(74405),p=r(63497),f=r(53041);function v(e,t,r=null){var o,y,x,w,C,b,T,S,O,R,D,P,I,A,M;let E=[],F=t.mapPositions;!function(e,t){let{attributeData:{position:r},removeDuplicateStartEnd:i}=e,o=function(e){let t=e.length;return e[0]===e[t-3]&&e[1]===e[t-2]&&e[2]===e[t-1]}(r)&&i,a=r.length/3-!!o,n=Array(2*(a-1)),s=o?r.slice(0,-3):r,l=0;for(let e=0;e<a-1;e++)n[l++]=e,n[l++]=e+1;t.push([f.r.POSITION,new u.n(s,n,3,o)])}(t,E);let N=E[0][1].data,L=E[0][1].indices.length,H=(0,c.EH)(L);return function(e,t,r){if(null!=e.attributeData.colorFeature)return;let i=e.attributeData.color;t.push([f.r.COLOR,new u.n(i??a.Un,r,4)])}(t,E,H),o=t,y=E,x=H,null==o.attributeData.sizeFeature&&y.push([f.r.SIZE,new u.n([o.attributeData.size??1],x,1,!0)]),w=t,C=E,b=H,w.attributeData.normal&&C.push([f.r.NORMAL,new u.n(w.attributeData.normal,b,3)]),T=t,S=E,O=H,null!=T.attributeData.colorFeature&&S.push([f.r.COLORFEATUREATTRIBUTE,new u.n([T.attributeData.colorFeature],O,1,!0)]),R=t,D=E,P=H,null!=R.attributeData.sizeFeature&&D.push([f.r.SIZEFEATUREATTRIBUTE,new u.n([R.attributeData.sizeFeature],P,1,!0)]),I=t,A=E,M=H,null!=I.attributeData.opacityFeature&&A.push([f.r.OPACITYFEATUREATTRIBUTE,new u.n([I.attributeData.opacityFeature],M,1,!0)]),function(e,t,r){if(null==e.overlayInfo||e.overlayInfo.renderCoordsHelper.viewingMode!==d.RT.Global||!e.overlayInfo.spatialReference.isGeographic)return;let o=(0,l.jh)(r.length),a=(0,n.tO)(e.overlayInfo.spatialReference);for(let e=0;e<o.length;e+=3)(0,s.RC)(r,e,o,e,a);let c=r.length/3,g=(0,h.oe)(c+1),p=m,v=_,y=0,x=0;(0,i.hZ)(p,o[x++],o[x++]),x++,g[0]=0;for(let e=1;e<c+1;++e)e===c&&(x=0),(0,i.hZ)(v,o[x++],o[x++]),x++,y+=(0,i.xg)(p,v),g[e]=y,[p,v]=[v,p];t.push([f.r.DISTANCETOSTART,new u.n(g,t[0][1].indices,1,!0)])}(t,E,N),new p.V(e,E,F,g.X.Line,r)}let m=(0,o.vt)(),_=(0,o.vt)();function y(e,t){if(null==e||0===e.length)return[];let r=[];return e.forEach(e=>{let i=e.length,o=(0,l.jh)(3*i);e.forEach((e,t)=>{o[3*t]=e[0],o[3*t+1]=e[1],o[3*t+2]=e[2]}),r.push({attributeData:{position:o,normal:t},removeDuplicateStartEnd:!1})}),r}},34561:(e,t,r)=>{r.d(t,{k9:()=>y,zF:()=>_});var i,o,a,n,s,l=r(81856),h=r(92713),c=r(91838);r(57845),r(61939),r(33638);var d=r(33498),u=r(12709);let g=i=class extends h.A{constructor(e){super(e),this.type="cloudy",this.cloudCover=.5}clone(){return new i({cloudCover:this.cloudCover})}};(0,l._)([(0,d.e)({cloudy:"cloudy"}),(0,c.MZ)({json:{write:{isRequired:!0}}})],g.prototype,"type",void 0),(0,l._)([(0,c.MZ)({type:Number,nonNullable:!0,range:{min:0,max:1},json:{write:!0}})],g.prototype,"cloudCover",void 0),g=i=(0,l._)([(0,u.$)("esri.views.3d.environment.CloudyWeather")],g);let p=o=class extends h.A{constructor(e){super(e),this.type="foggy",this.fogStrength=.5}clone(){return new o({fogStrength:this.fogStrength})}};(0,l._)([(0,d.e)({foggy:"foggy"}),(0,c.MZ)({json:{write:{isRequired:!0}}})],p.prototype,"type",void 0),(0,l._)([(0,c.MZ)({type:Number,nonNullable:!0,range:{min:0,max:1},json:{write:!0}})],p.prototype,"fogStrength",void 0),p=o=(0,l._)([(0,u.$)("esri.views.3d.environment.FoggyWeather")],p);let f=a=class extends h.A{constructor(e){super(e),this.type="rainy",this.cloudCover=.5,this.precipitation=.5}clone(){return new a({cloudCover:this.cloudCover,precipitation:this.precipitation})}};(0,l._)([(0,d.e)({rainy:"rainy"}),(0,c.MZ)({json:{write:{isRequired:!0}}})],f.prototype,"type",void 0),(0,l._)([(0,c.MZ)({type:Number,nonNullable:!0,range:{min:0,max:1},json:{write:!0}})],f.prototype,"cloudCover",void 0),(0,l._)([(0,c.MZ)({type:Number,nonNullable:!0,range:{min:0,max:1},json:{write:!0}})],f.prototype,"precipitation",void 0),f=a=(0,l._)([(0,u.$)("esri.views.3d.environment.RainyWeather")],f);let v=n=class extends h.A{constructor(e){super(e),this.type="snowy",this.cloudCover=.5,this.precipitation=.5,this.snowCover="disabled"}clone(){return new n({cloudCover:this.cloudCover,precipitation:this.precipitation,snowCover:this.snowCover})}};(0,l._)([(0,d.e)({snowy:"snowy"}),(0,c.MZ)({json:{write:{isRequired:!0}}})],v.prototype,"type",void 0),(0,l._)([(0,c.MZ)({type:Number,nonNullable:!0,range:{min:0,max:1},json:{write:!0}})],v.prototype,"cloudCover",void 0),(0,l._)([(0,c.MZ)({type:Number,nonNullable:!0,range:{min:0,max:1},json:{write:!0}})],v.prototype,"precipitation",void 0),(0,l._)([(0,c.MZ)({type:["enabled","disabled"],nonNullable:!0,json:{write:!0}})],v.prototype,"snowCover",void 0),v=n=(0,l._)([(0,u.$)("esri.views.3d.environment.SnowyWeather")],v);let m=s=class extends h.A{constructor(e){super(e),this.type="sunny",this.cloudCover=.5}clone(){return new s({cloudCover:this.cloudCover})}};(0,l._)([(0,d.e)({sunny:"sunny"}),(0,c.MZ)({json:{write:{isRequired:!0}}})],m.prototype,"type",void 0),(0,l._)([(0,c.MZ)({type:Number,nonNullable:!0,range:{min:0,max:1},json:{write:!0}})],m.prototype,"cloudCover",void 0),m=s=(0,l._)([(0,u.$)("esri.views.3d.environment.SunnyWeather")],m);let _=1e4,y=1e5},34635:(e,t,r)=>{r.d(t,{$4:()=>function e(t){if(!t)return null;let r=null;switch(t.type){case c:case h:case d:r=e(t.outline);break;case"simple-line":{let e=(0,s.Lz)(t.width);null!=t.style&&"none"!==t.style&&0!==e&&((r={color:t.color,style:m(t.style),width:e,cap:t.cap,join:"miter"===t.join?(0,s.Lz)(t.miterLimit):t.join}).dashArray=v(r).join(",")||"none");break}default:r=null}return r},O0:()=>v,O1:()=>m,Sw:()=>_,eH:()=>p,rc:()=>f});var i=r(81048),o=r(70152),a=r(39166),n=r(16082),s=r(55048),l=r(20131);let h="picture-fill",c="simple-fill",d="simple-marker",u=new Map([["dash",[4,3]],["dashdot",[4,3,1,3]],["dot",[1,3]],["longdash",[8,3]],["longdashdot",[8,3,1,3]],["longdashdotdot",[8,3,1,3,1,3]],["shortdash",[4,1]],["shortdashdot",[4,1,1,1]],["shortdashdotdot",[4,1,1,1,1,1]],["shortdot",[1,1]],["solid",[]]]),g=new n.q(1e3);function p(e){let t=e.style,r=null;if(e)switch(e.type){case d:"cross"!==t&&"x"!==t&&(r=e.color);break;case c:t&&"solid"!==t?"none"!==t&&(r={type:"pattern",x:0,y:0,src:(0,i.s)(`esri/symbols/patterns/${t}.png`),width:5,height:5}):r=e.color;break;case h:r={type:"pattern",src:e.url,width:(0,s.Lz)(e.width)*e.xscale,height:(0,s.Lz)(e.height)*e.yscale,x:(0,s.Lz)(e.xoffset),y:(0,s.Lz)(e.yoffset)};break;case"text":r=e.color;break;case"cim":r=(0,l.Nk)(e)}return r}function f(e,t){let r=e+"-"+t;return void 0!==g.get(r)?Promise.resolve(g.get(r)):(0,a.A)(e,{responseType:"image"}).then(e=>{let i=e.data,o=i.naturalWidth,a=i.naturalHeight,n=document.createElement("canvas");n.width=o,n.height=a;let s=n.getContext("2d");s.fillStyle=t,s.fillRect(0,0,o,a),s.globalCompositeOperation="destination-in",s.drawImage(i,0,0);let l=n.toDataURL();return g.put(r,l),l})}function v(e){if(!e?.style)return[];let{dashArray:t,style:r,width:i}=e;if("string"==typeof t&&"none"!==t)return t.split(",").map(e=>Number(e));let o=i??0,a=u.has(r)?u.get(r).map(e=>e*o):[];if("butt"!==e.cap)for(let[e,t]of a.entries())a[e]=e%2==1?t+o:Math.max(t-o,1);return a}let m=(()=>{let e={};return t=>{if(e[t])return e[t];let r=t.replaceAll("-","");return e[t]=r,r}})(),_=new o.A([128,128,128])},40957:(e,t,r)=>{r.d(t,{H:()=>c,b:()=>h});var i=r(89946),o=r(75769),a=r(86416),n=r(44761),s=r(5012),l=r(90564);function h(){let e=new l.N5;e.include(i.Q),e.include(o.y);let{fragment:t}=e;return e.outputs.add("fragSingleHighlight","vec2",0),t.uniforms.add(new s.N("highlightTexture",e=>e.highlightTexture),new n.c("highlightLevel",e=>e.highlightLevel)),t.main.add((0,a.H)`ivec2 iuv = ivec2(gl_FragCoord.xy);
vec2 inputTexel = texelFetch(highlightTexture, iuv, 0).rg;
uint bits = readLevelBits(inputTexel, highlightLevel);
bool hasHighlight = (bits & 1u) == 1u;
bool hasOccluded  = (bits & 2u) == 2u;
fragSingleHighlight = vec2(hasHighlight ? 1.0 : 0.0, hasOccluded ? 1.0 : 0.0);`),e}let c=Object.freeze(Object.defineProperty({__proto__:null,build:h},Symbol.toStringTag,{value:"Module"}))},50841:(e,t,r)=>{r.d(t,{T:()=>c,a:()=>u,b:()=>d});var i=r(56911),o=r(91845),a=r(70058),n=r(86416),s=r(5012),l=r(73375),h=r(90564);class c extends l.Y{constructor(){super(...arguments),this.color=(0,i.fA)(1,1,1)}}function d(){let e=new h.N5;return e.include(o.c),e.fragment.uniforms.add(new s.N("tex",e=>e.texture),new a.t("uColor",e=>e.color)),e.fragment.main.add((0,n.H)`vec4 texColor = texture(tex, uv);
fragColor = texColor * vec4(uColor, 1.0);`),e}let u=Object.freeze(Object.defineProperty({__proto__:null,TextureOnlyPassParameters:c,build:d},Symbol.toStringTag,{value:"Module"}))},52922:(e,t,r)=>{r.d(t,{O:()=>d,a:()=>g,b:()=>u});var i=r(85084),o=r(91845),a=r(76085),n=r(86416),s=r(44761),l=r(5012),h=r(73375),c=r(90564);class d extends h.Y{constructor(){super(...arguments),this.overlayIndex=i.vr.INNER,this.opacity=1}}function u(){let e=new c.N5;return e.include(o.c),e.fragment.uniforms.add(new l.N("tex",e=>e.texture)),e.fragment.uniforms.add(new s.c("overlayIdx",e=>e.overlayIndex)),e.fragment.uniforms.add(new a.m("opacity",e=>e.opacity)),e.fragment.main.add((0,n.H)`vec2 overlayUV = overlayIdx == 0 ? vec2(uv.x * 0.5, uv.y) : vec2(uv.x * 0.5 + 0.5, uv.y);
fragColor = texture(tex, overlayUV) * opacity;`),e}let g=Object.freeze(Object.defineProperty({__proto__:null,OverlayCompositingPassParameters:d,build:u},Symbol.toStringTag,{value:"Module"}))},57663:(e,t,r)=>{var i,o;r.d(t,{k:()=>o,q:()=>i}),function(e){e[e.ADD=0]="ADD",e[e.UPDATE=1]="UPDATE",e[e.REMOVE=2]="REMOVE"}(i||(i={})),function(e){e[e.NONE=0]="NONE",e[e.VISIBILITY=1]="VISIBILITY",e[e.GEOMETRY=2]="GEOMETRY",e[e.TRANSFORMATION=4]="TRANSFORMATION",e[e.HIGHLIGHT=8]="HIGHLIGHT",e[e.OCCLUDEE=16]="OCCLUDEE"}(o||(o={}))},61910:(e,t,r)=>{r.d(t,{O:()=>i});class i{constructor(){this._outer=new Map}clear(){this._outer.clear()}get empty(){return 0===this._outer.size}get(e,t){return this._outer.get(e)?.get(t)}getInner(e){return this._outer.get(e)}set(e,t,r){let i=this._outer.get(e);i?i.set(t,r):this._outer.set(e,new Map([[t,r]]))}delete(e,t){let r=this._outer.get(e);r&&(r.delete(t),0===r.size&&this._outer.delete(e))}forEach(e){this._outer.forEach((t,r)=>e(t,r))}forAll(e){for(let t of this._outer.values())for(let r of t.values())e(r)}}},72030:(e,t,r)=>{r.d(t,{H:()=>d,b:()=>c});var i=r(89946),o=r(75769),a=r(76085),n=r(86416),s=r(25743),l=r(5012),h=r(90564);function c(){let e=new h.N5;e.include(i.Q);let{fragment:t}=e;return t.uniforms.add(new l.N("highlightTexture",e=>e.highlightTexture),new l.N("highlightOptionsTexture",e=>e.highlightOptionsTexture),new a.m("pixelRatio",e=>e.pixelRatio),new a.m("occludedIntensityFactor",e=>e.occludedFactor),new s.W("maxHighlightLevel",e=>e.highlights.length-1)),t.constants.add("pixelSampleScale","float",1),e.include(o.y),t.code.add((0,n.H)`const float pascal17[9] = float[9](12870.0, 11440.0, 8008.0, 4368.0, 1820.0, 560.0, 120.0, 16.0, 1.0);
const float denom17 =  65536.0;
float colorWeight[16] = float[16](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
float colorOcclusion[16] = float[16](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
float weights[16] = float[16](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
void applyTexel(vec2 texel, float weight) {
if (texel != vec2(0.0)){
int maxChannel = (maxHighlightLevel >> 2) & 1;
for (int channelIndex = 0; channelIndex <= maxChannel; ++channelIndex){
uint channel = readChannel(texel, channelIndex << 2);
int firstIndex = channelIndex << 2;
int maxIndex  = min(firstIndex + 3, maxHighlightLevel);
for (int highlightIndex = firstIndex; highlightIndex <= maxIndex; ++highlightIndex ) {
uint v = readChannelBits(channel, highlightIndex);
if ((v & 1u) == 1u){
colorWeight[highlightIndex] += weight;
if ((v & 2u) == 2u){
colorOcclusion[highlightIndex] += weight;
}
}
}
}
}
}
vec2 readTexel(ivec2 iuv, int du, int dv) {
return texelFetch(highlightTexture, iuv + ivec2(du, dv), 0).rg;
}
void readAndApplyTexel(ivec2 iuv, int du, int dv, float weight) {
vec2 texel = readTexel(iuv, du, dv);
applyTexel(texel, weight);
}
void readAndApply2TexelsU(ivec2 iuv, int du, int dv, float weight) {
readAndApplyTexel(iuv, -du, dv, weight);
readAndApplyTexel(iuv, +du, dv, weight);
}
float getWeight(int pixelDistance) {
float scaledDistance = float(pixelDistance) * pixelSampleScale / pixelRatio;
float d0f = floor(scaledDistance);
int d0 = int(d0f);
if (d0 >= 8){
return 0.0;
}
float w0 = pascal17[d0];
float w1 = pascal17[d0+1];
float f =  scaledDistance - d0f;
return mix(w0, w1, f);
}`),t.main.add((0,n.H)`vec2 highlightTextureSize = vec2(textureSize(highlightTexture,0));
ivec2 iuv = ivec2(sUV * highlightTextureSize);
vec2 centerTexel = texelFetch(highlightTexture, iuv, 0).rg;
bool outlinePossible = false;
if (vOutlinePossible > 0.0){
for (int highlightLevel=0; highlightLevel<= maxHighlightLevel; ++highlightLevel) {
if ((readLevelBits(centerTexel,highlightLevel) & 1u) == 0u) {
outlinePossible = true;
break;
}
}
}
if (outlinePossible) {
int maxPixelDistance = clamp(int(8.0 * pixelRatio / pixelSampleScale), 2, 16);
float weightSum = 0.0;
for(int y = 0; y <= maxPixelDistance; ++y) {
float w = getWeight(y);
weights[y] = w;
weightSum += w * (y == 0 ? 1.0 : 2.0);
}
for(int y = 0; y <= maxPixelDistance; ++y) {
weights[y] = weights[y] / weightSum;
}
float weight0 = weights[0];
applyTexel(centerTexel, weight0 * weight0);
for(int y = 0; y <= maxPixelDistance; y += 1) {
float yFactor = weights[y];
if (y != 0) {
float xFactor = weight0;
float weight = xFactor * yFactor;
if (weight > 0.0) {
readAndApplyTexel(iuv, 0, +y, weight);
readAndApplyTexel(iuv, 0, -y, weight);
}
}
for(int x = 1; x <= maxPixelDistance; x += 1) {
float xFactor = weights[x];
float weight = xFactor * yFactor;
if (weight > 0.0) {
readAndApply2TexelsU(iuv, x, +y, weight);
if (y != 0){
readAndApply2TexelsU(iuv, x, -y, weight);
}
}
}
}
} else {
applyTexel(centerTexel, 1.0);
}
int frontColorIndex = 999;
int maxColorIndex = 0;
for (int i = 0; i <= maxHighlightLevel; ++i) {
if (colorWeight[i] > 0.0){
frontColorIndex = min(frontColorIndex, i);
maxColorIndex = max(maxColorIndex, i);
}
}
if (frontColorIndex == 999){
fragColor = vec4(0.0);
return;
}
vec4 accumulatedColor = vec4(0.0);
for (int curColorIndex = frontColorIndex; curColorIndex <= maxColorIndex; ++curColorIndex) {
float curColorWeight = colorWeight[curColorIndex];
if (curColorWeight <= 0.01){
continue;
}
uint vc = readLevelBits(centerTexel, curColorIndex);
bool centerFilled = (vc & 1u) == 1u;
bool centerOccluded = (vc & 3u) == 3u;
float curColorOcclusion = colorOcclusion[curColorIndex];
bool occluded = centerFilled ? centerOccluded : curColorOcclusion > 0.5 * curColorWeight;
int colorChannel = centerFilled ? 0 : 1;
vec4 colorBase = texelFetch(highlightOptionsTexture, ivec2(curColorIndex, colorChannel), 0);
float occlusionFactor = occluded ? occludedIntensityFactor : 1.0;
float outlineFactor = centerFilled ? 1.0 : smoothstep(0.0, 0.03, curColorWeight);
float intensity = colorBase.a * occlusionFactor * outlineFactor;
vec3 currentColor = colorBase.rgb;
float a0 = accumulatedColor.a;
float a1 = intensity;
float alpha = clamp(a0 + a1 - a0 * a1, 0.0, 1.0);
if (alpha > 0.001){
vec3 blendedColor = ((1.0 - a1) * a0 * accumulatedColor.rgb + a1 * currentColor) / alpha;
accumulatedColor = vec4(blendedColor, alpha);
}
}
fragColor = accumulatedColor;`),e}let d=Object.freeze(Object.defineProperty({__proto__:null,build:c},Symbol.toStringTag,{value:"Module"}))},73481:(e,t,r)=>{r.d(t,{S:()=>l});var i=r(20538),o=r(8922),a=r(63599),n=r(97067),s=r(72500);function l(e,t,r){let l=!function(e,t,r,i){let n=Array.isArray(t[0])?(e,r)=>t[e][r]:(e,r)=>t[3*e+r],l=i?(0,o.GA)(i)/(0,o.G9)(i):1;return(0,s.lU)(e,(e,t)=>(0,a.i)(e,n(t,0)*l,n(t,1)*l,n(t,2)),r)}(h,e,t,r)?[0,0,1]:(0,s.Qj)(h);return Math.abs(l[2])>Math.cos((0,i.kU)(80))?n._.Z:Math.abs(l[1])>Math.abs(l[0])?n._.Y:n._.X}let h=(0,s.vt)()},73982:(e,t,r)=>{r.d(t,{Wq:()=>i,lO:()=>d,oR:()=>u});var i,o=r(23352),a=r(97067),n=r(60470),s=r(40200),l=r(95775),h=r(73481),c=r(91819);function d(e){let t=u(e.rings,e.hasZ,i.CCW_IS_HOLE,e.spatialReference),r=[],a=0,n=0;for(let e of t.polygons){let i=e.count,h=e.index,c=(0,s.l5)(t.position,3*h,3*i),d=e.holeIndices.map(e=>e-h),u=(0,l.Dg)((0,o.e)(c,d,3));r.push({position:c,faces:u}),a+=c.length,n+=u.length}let h=function(e,t,r){if(1===e.length)return e[0];let i=(0,s.jh)(t),o=Array(r),a=0,n=0,h=0;for(let t of e){for(let e=0;e<t.position.length;e++)i[a++]=t.position[e];for(let e of t.faces)o[n++]=e+h;h=a/3}return{position:i,faces:(0,l.Dg)(o)}}(r,a,n),d=Array.isArray(h.position)?(0,c.b)(h.position,3,{originalIndices:h.faces}):(0,c.b)(h.position.buffer,6,{originalIndices:h.faces});return h.position=(0,s.xm)(new Float64Array(d.buffer)),h.faces=d.indices,h}function u(e,t,r,o){let l=e.length,c=Array(l),d=Array(l),u=Array(l),p=0;for(let t=0;t<l;++t)p+=e[t].length;let f=0,v=0,m=0,_=(0,s.jh)(3*p),y=0;for(let s=l-1;s>=0;s--){let p=e[s],x=r===i.CCW_IS_HOLE&&function(e,t,r){if(!t)return!(0,n.$3)(e);let i=e.length-1;switch((0,h.S)(e,i,r)){case a._.X:return!(0,n.$3)(e,a._.Y,a._.Z);case a._.Y:return!(0,n.$3)(e,a._.X,a._.Z);case a._.Z:return!(0,n.$3)(e,a._.X,a._.Y)}}(p,t,o);if(x&&1!==l)c[f++]=p;else{let e=p.length;for(let t=0;t<f;++t)e+=c[t].length;let r={index:y,pathLengths:Array(f+1),count:e,holeIndices:Array(f)};r.pathLengths[0]=p.length,p.length>0&&(u[m++]={index:y,count:p.length}),y=x?g(p,p.length-1,-1,_,y,p.length,t):g(p,0,1,_,y,p.length,t);for(let e=0;e<f;++e){let i=c[e];r.holeIndices[e]=y,r.pathLengths[e+1]=i.length,i.length>0&&(u[m++]={index:y,count:i.length}),y=g(i,0,1,_,y,i.length,t)}f=0,r.count>0&&(d[v++]=r)}}for(let e=0;e<f;++e){let r=c[e];r.length>0&&(u[m++]={index:y,count:r.length}),y=g(r,0,1,_,y,r.length,t)}return d.length=v,u.length=m,{position:_,polygons:d,outlines:u}}function g(e,t,r,i,o,a,n){o*=3;for(let s=0;s<a;++s){let a=e[t];i[o++]=a[0],i[o++]=a[1],i[o++]=n&&a[2]?a[2]:0,t+=r}return o/3}!function(e){e[e.NONE=0]="NONE",e[e.CCW_IS_HOLE=1]="CCW_IS_HOLE"}(i||(i={}))},82956:(e,t,r)=>{r.d(t,{E:()=>P});var i=r(25878),o=r(50737),a=r(86416);function n(e){e.fragment.code.add((0,a.H)`
    const float GAMMA = ${a.H.float(o.Tf)};
    const float INV_GAMMA = ${a.H.float(1/o.Tf)};

    vec4 delinearizeGamma(vec4 color) {
      return vec4(pow(color.rgb, vec3(INV_GAMMA)), color.a);
    }

    vec3 linearizeGamma(vec3 color) {
      return pow(color, vec3(GAMMA));
    }
  `)}var s=r(60136),l=r(51338),h=r(18977),c=r(43417),d=r(90475),u=r(86032),g=r(70762);function p(e,t){if(!t.screenSpaceReflections)return;let r=e.fragment;r.include(h.E),r.uniforms.add(new c.E("nearFar",e=>e.camera.nearFar),new g.x("depthMap",e=>e.depth?.attachment),new u.F("proj",e=>e.camera.projectionMatrix),new d.U("invResolutionHeight",e=>1/e.camera.height),new u.F("reprojectionMatrix",e=>e.ssr.reprojectionMatrix)).code.add((0,a.H)`
  vec2 reprojectionCoordinate(vec3 projectionCoordinate)
  {
    vec4 zw = proj * vec4(0.0, 0.0, -projectionCoordinate.z, 1.0);
    vec4 reprojectedCoord = reprojectionMatrix * vec4(zw.w * (projectionCoordinate.xy * 2.0 - 1.0), zw.z, zw.w);
    reprojectedCoord.xy /= reprojectedCoord.w;
    return reprojectedCoord.xy * 0.5 + 0.5;
  }

  const int maxSteps = ${t.highStepCount?"150":"75"};

  vec4 applyProjectionMat(mat4 projectionMat, vec3 x)
  {
    vec4 projectedCoord =  projectionMat * vec4(x, 1.0);
    projectedCoord.xy /= projectedCoord.w;
    projectedCoord.xy = projectedCoord.xy*0.5 + 0.5;
    return projectedCoord;
  }

  vec3 screenSpaceIntersection(vec3 dir, vec3 startPosition, vec3 viewDir, vec3 normal)
  {
    vec3 viewPos = startPosition;
    vec3 viewPosEnd = startPosition;

    // Project the start position to the screen
    vec4 projectedCoordStart = applyProjectionMat(proj, viewPos);
    vec3  Q0 = viewPos / projectedCoordStart.w; // homogeneous camera space
    float k0 = 1.0/ projectedCoordStart.w;

    // advance the position in the direction of the reflection
    viewPos += dir;

    vec4 projectedCoordVanishingPoint = applyProjectionMat(proj, dir);

    // Project the advanced position to the screen
    vec4 projectedCoordEnd = applyProjectionMat(proj, viewPos);
    vec3  Q1 = viewPos / projectedCoordEnd.w; // homogeneous camera space
    float k1 = 1.0/ projectedCoordEnd.w;

    // calculate the reflection direction in the screen space
    vec2 projectedCoordDir = (projectedCoordEnd.xy - projectedCoordStart.xy);
    vec2 projectedCoordDistVanishingPoint = (projectedCoordVanishingPoint.xy - projectedCoordStart.xy);

    float yMod = min(abs(projectedCoordDistVanishingPoint.y), 1.0);

    float projectedCoordDirLength = length(projectedCoordDir);
    float maxSt = float(maxSteps);

    // normalize the projection direction depending on maximum steps
    // this determines how blocky the reflection looks
    vec2 dP = yMod * (projectedCoordDir)/(maxSt * projectedCoordDirLength);

    // Normalize the homogeneous camera space coordinates
    vec3  dQ = yMod * (Q1 - Q0)/(maxSt * projectedCoordDirLength);
    float dk = yMod * (k1 - k0)/(maxSt * projectedCoordDirLength);

    // initialize the variables for ray marching
    vec2 P = projectedCoordStart.xy;
    vec3 Q = Q0;
    float k = k0;
    float rayStartZ = -startPosition.z; // estimated ray start depth value
    float rayEndZ = -startPosition.z;   // estimated ray end depth value
    float prevEstimateZ = -startPosition.z;
    float rayDiffZ = 0.0;
    float dDepth;
    float depth;
    float rayDiffZOld = 0.0;

    // early outs
    if (dot(normal, dir) < 0.0 || dot(-viewDir, normal) < 0.0)
      return vec3(P, 0.0);
    float dDepthBefore = 0.0;

    for(int i = 0; i < maxSteps-1; i++)
    {
      depth = -linearDepthFromTexture(depthMap, P); // get linear depth from the depth buffer

      // estimate depth of the marching ray
      rayStartZ = prevEstimateZ;
      dDepth = -rayStartZ - depth;
      rayEndZ = (dQ.z * 0.5 + Q.z)/ ((dk * 0.5 + k));
      rayDiffZ = rayEndZ- rayStartZ;
      prevEstimateZ = rayEndZ;

      if(-rayEndZ > nearFar[1] || -rayEndZ < nearFar[0] || P.y < 0.0  || P.y > 1.0 )
      {
        return vec3(P, 0.);
      }

      // If we detect a hit - return the intersection point, two conditions:
      //  - dDepth > 0.0 - sampled point depth is in front of estimated depth
      //  - if difference between dDepth and rayDiffZOld is not too large
      //  - if difference between dDepth and 0.025/abs(k) is not too large
      //  - if the sampled depth is not behind far plane or in front of near plane

      if((dDepth) < 0.025/abs(k) + abs(rayDiffZ) && dDepth > 0.0 && depth > nearFar[0] && depth < nearFar[1] && abs(P.y - projectedCoordStart.y) > invResolutionHeight)
      {
        float weight = dDepth / (dDepth - dDepthBefore);
        vec2 Pf = mix(P - dP, P, 1.0 - weight);
        if (abs(Pf.y - projectedCoordStart.y) > invResolutionHeight) {
          return vec3(Pf, depth);
        }
        else {
          return vec3(P, depth);
        }
      }

      // continue with ray marching
      P = clamp(P + dP, vec2(0.0), vec2(0.999));
      Q.z += dQ.z;
      k += dk;
      rayDiffZOld = rayDiffZ;
      dDepthBefore = dDepth;
    }
    return vec3(P, 0.0);
  }
  `)}var f=r(56911),v=r(54015),m=r(22094),_=r(87466),y=r(34561),x=r(4318),w=r(93205),C=r(20456),b=r(2907),T=r(73024);class S extends T.n{constructor(e,t){super(e,"samplerCube",b.c.Bind,(r,i)=>r.bindTexture(e,t(i)))}}function O(e){let t=e.fragment;t.constants.add("radiusCloudsSquared","float",R).code.add((0,a.H)`vec3 intersectWithCloudLayer(vec3 dir, vec3 cameraPosition, vec3 spherePos) {
float B = 2.0 * dot(cameraPosition, dir);
float C = dot(cameraPosition, cameraPosition) - radiusCloudsSquared;
float det = B * B - 4.0 * C;
float pointIntDist = max(0.0, 0.5 *(-B + sqrt(det)));
return (cameraPosition + dir * pointIntDist) - spherePos;
}`),t.uniforms.add(new d.U("radiusCurvatureCorrection",({clouds:e})=>e.parallax.radiusCurvatureCorrection)).code.add((0,a.H)`vec3 correctForPlanetCurvature(vec3 dir) {
dir.z = dir.z * (1.0 - radiusCurvatureCorrection) + radiusCurvatureCorrection;
return dir;
}`),t.code.add((0,a.H)`vec3 rotateDirectionToAnchorPoint(mat4 rotMat, vec3 inVec) {
return (rotMat * vec4(inVec, 0.0)).xyz;
}`),(0,x.Gc)(t),(0,x.O4)(t);let r=(0,f.fA)(.28,.175,.035);t.constants.add("RIM_COLOR","vec3",r),t.code.add((0,a.H)`
    vec3 calculateCloudColor(vec3 cameraPosition, vec3 worldSpaceRay, vec4 clouds) {
      float upDotLight = dot(cameraPosition, mainLightDirection);
      float dirDotLight = max(dot(worldSpaceRay, mainLightDirection), 0.0);
      float sunsetTransition = clamp(pow(max(upDotLight, 0.0), ${a.H.float(.3)}), 0.0, 1.0);

      // Base color of the clouds that depends on lighting of the sun and sky
      vec3 ambientLight = calculateAmbientIrradiance(cameraPosition,  0.0);
      vec3 combinedLight = clamp((mainLightIntensity + ambientLight )/PI, vec3(0.0), vec3(1.0));
      vec3 baseCloudColor = pow(combinedLight * pow(clouds.xyz, vec3(GAMMA)), vec3(INV_GAMMA));

      // Rim light around the edge of the clouds simulating scattering of the direct lun light
      float scatteringMod = max(clouds.a < 0.5 ? clouds.a / 0.5 : - clouds.a / 0.5 + 2.0, 0.0);
      float rimLightIntensity = 0.5 + 0.5 * pow(max(upDotLight, 0.0), 0.35);
      vec3 directSunScattering = RIM_COLOR * rimLightIntensity * (pow(dirDotLight, ${a.H.float(140)})) * scatteringMod;

      // Brighten the clouds around the sun at the sunsets
      float additionalLight = ${a.H.float(.2)} * pow(dirDotLight, ${a.H.float(10)}) * (1. - pow(sunsetTransition, ${a.H.float(.3)})) ;

      return vec3(baseCloudColor * (1.0 + additionalLight) + directSunScattering);
    }
  `),t.uniforms.add(new w.o("readChannelsRG",e=>e.clouds.readChannels===m.c.RG),new S("cubeMap",e=>e.clouds.data?.cubeMap?.colorTexture??null)).code.add((0,a.H)`vec4 sampleCloud(vec3 rayDir, bool readOtherChannel) {
vec4 s = texture(cubeMap, rayDir);
bool readRG = readChannelsRG ^^ readOtherChannel;
s = readRG ? vec4(vec3(s.r), s.g) : vec4(vec3(s.b), s.a);
return length(s) == 0.0 ? vec4(s.rgb, 1.0) : s;
}`),t.uniforms.add(new C.d("anchorPoint",e=>e.clouds.parallax.anchorPoint),new C.d("anchorPointNew",e=>e.clouds.parallaxNew.anchorPoint),new u.F("rotationClouds",e=>e.clouds.parallax.transform),new u.F("rotationCloudsNew",e=>e.clouds.parallaxNew.transform),new d.U("cloudsOpacity",e=>e.clouds.opacity),new d.U("fadeFactor",e=>e.clouds.fadeFactor),new w.o("crossFade",e=>e.clouds.fadeState===_.c.CROSS_FADE)).code.add((0,a.H)`vec4 renderClouds(vec3 worldRay, vec3 cameraPosition) {
vec3 intersectionPoint = intersectWithCloudLayer(worldRay, cameraPosition, anchorPoint);
vec3 worldRayRotated = rotateDirectionToAnchorPoint(rotationClouds, normalize(intersectionPoint));
vec3 worldRayRotatedCorrected = correctForPlanetCurvature(worldRayRotated);
vec4 cloudData = sampleCloud(worldRayRotatedCorrected, crossFade);
vec3 cameraPositionN = normalize(cameraPosition);
vec4 cloudColor = vec4(calculateCloudColor(cameraPositionN, worldRay, cloudData), cloudData.a);
if(crossFade) {
intersectionPoint = intersectWithCloudLayer(worldRay, cameraPosition, anchorPointNew);
worldRayRotated = rotateDirectionToAnchorPoint(rotationCloudsNew, normalize(intersectionPoint));
worldRayRotatedCorrected = correctForPlanetCurvature(worldRayRotated);
cloudData = sampleCloud(worldRayRotatedCorrected, false);
vec4 cloudColorNew = vec4(calculateCloudColor(cameraPositionN, worldRay, cloudData), cloudData.a);
cloudColor = mix(cloudColor, cloudColorNew, fadeFactor);
}
float totalTransmittance = length(cloudColor.rgb) == 0.0 ?
1.0 :
clamp(cloudColor.a * cloudsOpacity + (1.0 - cloudsOpacity), 0.0 , 1.0);
return vec4(cloudColor.rgb, totalTransmittance);
}`)}let R=(v.$O.radius+y.k9)**2;function D(e){e.code.add((0,a.H)`vec3 tonemapACES(vec3 x) {
return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}`)}function P(e,t){e.include(s.f,t),e.include(n),e.include(i.v),t.cloudReflections&&e.include(O),e.include(p,t);let r=e.fragment;r.include(D),r.constants.add("fresnelSky","vec3",[.02,1,15]),r.constants.add("fresnelMaterial","vec2",[.02,.1]),r.constants.add("roughness","float",.015),r.constants.add("foamIntensityExternal","float",1.7),r.constants.add("ssrIntensity","float",.65),r.constants.add("ssrHeightFadeStart","float",l.O),r.constants.add("ssrHeightFadeEnd","float",l.b),r.constants.add("waterDiffusion","float",.92),r.constants.add("waterSeaColorMod","float",.8),r.constants.add("correctionViewingPowerFactor","float",.4),r.constants.add("skyZenitColor","vec3",[.52,.68,.9]),r.constants.add("skyColor","vec3",[.67,.79,.9]),r.constants.add("cloudFresnelModifier","vec2",[1.2,.01]),r.code.add((0,a.H)`PBRShadingWater shadingInfo;
vec3 getSkyGradientColor(in float cosTheta, in vec3 horizon, in vec3 zenit) {
float exponent = pow((1.0 - cosTheta), fresnelSky[2]);
return mix(zenit, horizon, exponent);
}`),r.uniforms.add(new d.U("lightingSpecularStrength",e=>e.lighting.mainLight.specularStrength),new d.U("lightingEnvironmentStrength",e=>e.lighting.mainLight.environmentStrength)),r.code.add((0,a.H)`vec3 getSeaColor(in vec3 n, in vec3 v, in vec3 l, vec3 color, in vec3 lightIntensity, in vec3 localUp, in float shadow, float foamIntensity, vec3 viewPosition, vec3 position) {
float reflectionHit = 0.0;
float reflectionHitDiffused = 0.0;
vec3 seaWaterColor = linearizeGamma(color);
vec3 h = normalize(l + v);
shadingInfo.NdotV = clamp(dot(n, v), 0.001, 1.0);
shadingInfo.VdotN = clamp(dot(v, n), 0.001, 1.0);
shadingInfo.NdotH = clamp(dot(n, h), 0.0, 1.0);
shadingInfo.VdotH = clamp(dot(v, h), 0.0, 1.0);
shadingInfo.LdotH = clamp(dot(l, h), 0.0, 1.0);
float upDotV = max(dot(localUp,v), 0.0);
vec3 skyHorizon = linearizeGamma(skyColor);
vec3 skyZenit = linearizeGamma(skyZenitColor);
vec3 skyColor = getSkyGradientColor(upDotV, skyHorizon, skyZenit );
float upDotL = max(dot(localUp,l),0.0);
float daytimeMod = 0.1 + upDotL * 0.9;
skyColor *= daytimeMod;
float shadowModifier = clamp(shadow, 0.8, 1.0);
vec3 fresnelModifier = fresnelReflection(shadingInfo.VdotN, vec3(fresnelSky[0]), fresnelSky[1]);
vec3 reflSky = lightingEnvironmentStrength * fresnelModifier * skyColor * shadowModifier;
vec3 reflSea = seaWaterColor * mix(skyColor, upDotL * lightIntensity * LIGHT_NORMALIZATION, 2.0 / 3.0) * shadowModifier;
vec3 specular = vec3(0.0);
if(upDotV > 0.0 && upDotL > 0.0) {
vec3 specularSun = brdfSpecularWater(shadingInfo, roughness, vec3(fresnelMaterial[0]), fresnelMaterial[1]);
vec3 incidentLight = lightIntensity * LIGHT_NORMALIZATION * shadow;
float NdotL = clamp(dot(n, l), 0.0, 1.0);
specular = lightingSpecularStrength * NdotL * incidentLight * specularSun;
}
vec3 foam = vec3(0.0);
if(upDotV > 0.0) {
foam = foamIntensity2FoamColor(foamIntensityExternal, foamIntensity, skyZenitColor, daytimeMod);
}
float correctionViewingFactor = pow(max(dot(v, localUp), 0.0), correctionViewingPowerFactor);
vec3 normalCorrectedClouds = mix(localUp, n, correctionViewingFactor);
vec3 reflectedWorld = normalize(reflect(-v, normalCorrectedClouds));`),t.cloudReflections&&r.uniforms.add(new d.U("cloudsOpacity",e=>e.clouds.opacity)).code.add((0,a.H)`vec4 cloudsColor = renderClouds(reflectedWorld, position);
cloudsColor.a = 1.0 - cloudsColor.a;
cloudsColor = pow(cloudsColor, vec4(GAMMA));
cloudsColor *= clamp(fresnelModifier.y * cloudFresnelModifier[0] - cloudFresnelModifier[1], 0.0, 1.0) * cloudsOpacity;`),t.screenSpaceReflections?r.uniforms.add(new u.F("view",e=>e.camera.viewMatrix),new g.x("lastFrameColorTexture",e=>e.ssr.lastFrameColor?.getTexture()),new d.U("fadeFactorSSR",e=>e.ssr.fadeFactor)).code.add((0,a.H)`vec3 viewDir = normalize(viewPosition);
vec4 viewNormalVectorCoordinate = view * vec4(n, 0.0);
vec3 viewNormal = normalize(viewNormalVectorCoordinate.xyz);
vec4 viewUp = view * vec4(localUp, 0.0);
vec3 viewNormalCorrectedSSR = mix(viewUp.xyz, viewNormal, correctionViewingFactor);
vec3 reflected = normalize(reflect(viewDir, viewNormalCorrectedSSR));
vec3 hitCoordinate = screenSpaceIntersection(reflected, viewPosition, viewDir, viewUp.xyz);
vec3 reflectedColor = vec3(0.0);
if (hitCoordinate.z > 0.0)
{
vec2 reprojectedCoordinate = reprojectionCoordinate(hitCoordinate);
vec2 dCoords = smoothstep(0.3, 0.6, abs(vec2(0.5, 0.5) - hitCoordinate.xy));
float heightMod = smoothstep(ssrHeightFadeEnd, ssrHeightFadeStart, -viewPosition.z);
reflectionHit = clamp(1.0 - (1.3 * dCoords.y), 0.0, 1.0) * heightMod * fadeFactorSSR;
reflectionHitDiffused = waterDiffusion * reflectionHit;
reflectedColor = linearizeGamma(texture(lastFrameColorTexture, reprojectedCoordinate).xyz) *
reflectionHitDiffused * fresnelModifier.y * ssrIntensity;
}
float seaColorMod =  mix(waterSeaColorMod, waterSeaColorMod * 0.5, reflectionHitDiffused);
vec3 waterRenderedColor = tonemapACES((1.0 - reflectionHitDiffused) * reflSky + reflectedColor +
reflSea * seaColorMod + specular + foam);`):r.code.add((0,a.H)`vec3 waterRenderedColor = tonemapACES(reflSky + reflSea * waterSeaColorMod + specular + foam);`),t.cloudReflections?t.screenSpaceReflections?r.code.add((0,a.H)`return waterRenderedColor * (1.0 - (1.0 - reflectionHit) * cloudsColor.a) + (1.0 - reflectionHit) * cloudsColor.xyz;
}`):r.code.add((0,a.H)`return waterRenderedColor * (1.0 - cloudsColor.a) + cloudsColor.xyz;
}`):r.code.add((0,a.H)`return waterRenderedColor;
}`)}},83122:(e,t,r)=>{r.d(t,{Xq:()=>n,wk:()=>a});let i={dash:[4,3],dot:[1,3],"long-dash":[8,3],"short-dash":[4,1],"short-dot":[1,1]},o={dash:i.dash,"dash-dot":[...i.dash,...i.dot],dot:i.dot,"long-dash":i["long-dash"],"long-dash-dot":[...i["long-dash"],...i.dot],"long-dash-dot-dot":[...i["long-dash"],...i.dot,...i.dot],none:null,"short-dash":i["short-dash"],"short-dash-dot":[...i["short-dash"],...i["short-dot"]],"short-dash-dot-dot":[...i["short-dash"],...i["short-dot"],...i["short-dot"]],"short-dot":i["short-dot"],solid:null};function a(e){return{pattern:[e,e],pixelRatio:2}}function n(e){var t,r;return"style"===e?.type&&null!=(t=e.style)?null==(r=o[t])?r:{pattern:r.slice(),pixelRatio:8}:null}},83830:(e,t,r)=>{r.d(t,{Ci:()=>a,Dq:()=>l,dB:()=>s,zK:()=>n});var i=r(83094),o=r(53041);let a=(0,i.BP)().vec3f(o.r.POSITION),n=(0,i.BP)().vec3f(o.r.POSITION).vec2f(o.r.UV0),s=(0,i.BP)().vec3f(o.r.POSITION).vec4u8(o.r.COLOR),l=(0,i.BP)().vec3f(o.r.POSITION).vec2f(o.r.UV0).vec4u8(o.r.OBJECTANDLAYERIDCOLOR)},85084:(e,t,r)=>{var i,o,a;r.d(t,{vr:()=>i}),function(e){e[e.INNER=0]="INNER",e[e.OUTER=1]="OUTER"}(i||(i={})),function(e){e[e.REGULAR=0]="REGULAR",e[e.HAS_NORTH_POLE=1]="HAS_NORTH_POLE",e[e.HAS_SOUTH_POLE=2]="HAS_SOUTH_POLE",e[e.HAS_BOTH_POLES=3]="HAS_BOTH_POLES"}(o||(o={})),function(e){e[e.FADING=0]="FADING",e[e.IMMEDIATE=1]="IMMEDIATE",e[e.UNFADED=2]="UNFADED"}(a||(a={}))},87466:(e,t,r)=>{r.d(t,{c:()=>i,n:()=>f});var i,o=r(28255),a=r(20538),n=r(22303),s=r(40998),l=r(38715),h=r(63599),c=r(56911),d=r(519),u=r(54015),g=r(22094),p=r(34561);class f{constructor(){this.startTime=0,this._data=(0,n.v)(null),this._readChannels=g.c.RG,this.parallax=new v,this.parallaxNew=new v,this._anchorPoint=(0,c.vt)(),this._fadeState=(0,n.v)(i.HIDE),this._fadeFactor=(0,n.v)(1)}get data(){return this._data.value}set data(e){this._data.value=e}get readChannels(){return this._readChannels}get fadeState(){return this._fadeState.value}get fadeFactor(){return this._fadeFactor.value}get opacity(){switch(this.fadeState){case i.HIDE:return 0;case i.FADE_OUT:return 1-this.fadeFactor;case i.FADE_IN:return this.fadeFactor;case i.SHOW:case i.CROSS_FADE:return 1}}fade(e,t,r){this.isFading&&this.fadeFactor<1&&(this._fadeFactor.value=r?(0,a.qE)((t-this.startTime)/(x*r),0,1):1,1===this.fadeFactor&&this._endFade()),this._evaluateState(e,t),this._updateParallax(e)}_evaluateState(e,t){let r=e.relativeElevation,o=this._updateAnchorPoint(e);(r>1.7*p.zF||r<-1e4||o>C)&&this.opacity>0?this._startFade(i.HIDE,t):this.isFading||(r>p.zF||r<-.35*p.zF||o>w*C?this.opacity>0&&this._startFade(i.FADE_OUT,t):(0,g.pi)(this.data)&&(0===this.opacity?this._startFade(i.FADE_IN,t):this.data.state===g.tf.Ready&&(this.fadeState===i.SHOW?this._startFade(i.CROSS_FADE,t):this._startFade(i.SHOW,t))))}_updateParallax(e){let t=(0,h.k)(e.eye);this.parallax.radiusCurvatureCorrection=.84*Math.sqrt(Math.max(t-u.$O.radius*u.$O.radius,0))/Math.sqrt(t),(0,d.Cr)(m,this.parallax.anchorPoint,_),(0,s.e$)(this.parallax.transform,l.zK,_[3],(0,d.yo)(_)),(0,d.Cr)(m,this.parallaxNew.anchorPoint,_),(0,s.e$)(this.parallaxNew.transform,l.zK,_[3],(0,d.yo)(_))}_updateAnchorPoint(e){return(0,h.n)(this._anchorPoint,e.eye),(0,h.h)(this._anchorPoint,this._anchorPoint,u.$O.radius),this.fadeState===i.HIDE&&this.data?.state===g.tf.Ready?((0,h.c)(this.parallax.anchorPoint,this._anchorPoint),0):(0,h.l)((0,h.d)(y,this.parallax.anchorPoint,this._anchorPoint))}requestFade(){this._fadeFactor.value=0}_startFade(e,t){switch(this._fadeState.value=e,this.startTime=t,e){case i.CROSS_FADE:this.requestFade(),this._switchReadChannels(),(0,h.c)(this.parallaxNew.anchorPoint,this._anchorPoint);break;case i.FADE_IN:this.requestFade(),this._switchReadChannels(),(0,h.c)(this.parallax.anchorPoint,this._anchorPoint),(0,h.c)(this.parallaxNew.anchorPoint,this._anchorPoint);break;case i.FADE_OUT:this.requestFade();break;case i.SHOW:this._switchReadChannels(),(0,h.c)(this.parallax.anchorPoint,this._anchorPoint),(0,h.c)(this.parallaxNew.anchorPoint,this._anchorPoint),this._endFade();break;case i.HIDE:this._endFade()}}_endFade(){switch(this._fadeFactor.value=1,this.data&&this.data.state!==g.tf.Ready&&(this.data.state=g.tf.Idle),this.fadeState){case i.CROSS_FADE:(0,h.c)(this.parallax.anchorPoint,this.parallaxNew.anchorPoint),this._fadeState.value=i.SHOW;break;case i.FADE_IN:this._fadeState.value=i.SHOW;break;case i.FADE_OUT:this._fadeState.value=i.HIDE;break;case i.SHOW:case i.HIDE:break;default:(0,o.Xb)(this.fadeState)}}_switchReadChannels(){this.data?.state===g.tf.Ready&&(this._readChannels=1-this._readChannels,this.data.state=g.tf.Fading)}get isFading(){return this.fadeState===i.FADE_OUT||this.fadeState===i.FADE_IN||this.fadeState===i.CROSS_FADE}}!function(e){e[e.HIDE=0]="HIDE",e[e.FADE_IN=1]="FADE_IN",e[e.SHOW=2]="SHOW",e[e.CROSS_FADE=3]="CROSS_FADE",e[e.FADE_OUT=4]="FADE_OUT"}(i||(i={}));class v{constructor(){this.anchorPoint=(0,c.vt)(),this.radiusCurvatureCorrection=0,this.transform=(0,l.vt)()}}let m=(0,c.fA)(0,0,1),_=(0,d.vt)(),y=(0,c.vt)(),x=1.25,w=.5,C=2e5},88409:(e,t,r)=>{r.d(t,{S:()=>c,a:()=>u,b:()=>d});var i=r(35430),o=r(89946),a=r(77414),n=r(86416),s=r(717),l=r(73375),h=r(90564);class c extends l.Y{constructor(){super(...arguments),this.blurSize=(0,i.vt)()}}function d(){let e=new h.N5;return e.include(o.Q),e.outputs.add("fragSingleHighlight","vec2",0),e.fragment.uniforms.add(new a.t("blurSize",e=>e.blurSize),new s.o("blurInput",e=>e.blurInput)).main.add((0,n.H)`vec2 highlightTextureSize = vec2(textureSize(blurInput,0));
vec2 center = texture(blurInput, sUV).rg;
if (vOutlinePossible == 0.0) {
fragSingleHighlight = center;
} else {
vec2 sum = center * 0.204164;
sum += texture(blurInput, sUV + blurSize * 1.407333).rg * 0.304005;
sum += texture(blurInput, sUV - blurSize * 1.407333).rg * 0.304005;
sum += texture(blurInput, sUV + blurSize * 3.294215).rg * 0.093913;
sum += texture(blurInput, sUV - blurSize * 3.294215).rg * 0.093913;
fragSingleHighlight = sum;
}`),e}let u=Object.freeze(Object.defineProperty({__proto__:null,SingleHighlightBlurDrawParameters:c,build:d},Symbol.toStringTag,{value:"Module"}))},89700:(e,t,r)=>{r.d(t,{$d:()=>p,GG:()=>R,N7:()=>f,Sx:()=>v,UQ:()=>O,di:()=>D,dt:()=>_,f3:()=>P,k_:()=>g});var i=r(70152),o=r(83610);r(57845);var a=r(55048),n=r(56911),s=r(27318),l=r(20131),h=r(34635),c=r(93165),d=r(76558);let u=new i.A("white");function g(e){if(!e)return 0;if((0,d.wk)(e)){let t=function(e){let t=e.symbolLayers?.at(-1);if(t&&"outline"in t)return t?.outline?.size}(e);return null!=t?t:0}return(0,a.PN)((0,h.$4)(e)?.width)}function p(e){if(null==e||!("symbolLayers"in e)||null==e.symbolLayers)return!1;switch(e.type){case"point-3d":return e.symbolLayers.some(e=>"object"===e.type);case"line-3d":return e.symbolLayers.some(e=>"path"===e.type);case"polygon-3d":return e.symbolLayers.some(e=>"object"===e.type||"extrude"===e.type);default:return!1}}function f(e){return e.resource?.href??""}function v(e,t){if(!e)return null;let r=null;return(0,d.wk)(e)?r=function(e){let t=e.symbolLayers;if(!t)return null;let r=null;return t.forEach(e=>{"object"===e.type&&e.resource?.href||(r="water"===e.type?e.color:e.material?e.material.color:null)}),r?new i.A(r):null}(e):(0,d.$y)(e)&&(r="cim"===e.type?(0,l.Nk)(e):e.color?new i.A(e.color):null),r?m(r,t):null}function m(e,t){if(null==t||null==e)return e;let r=e.toRgba();return r[3]=r[3]*t,new i.A(r)}function _(e,t,r){var o;e&&(t||null!=r)&&(t&&(t=new i.A(t)),(0,d.wk)(e)?function(e,t,r){let i=e.symbolLayers;if(!i)return;let o=e=>m(t=t??e??(null!=r?u:null),r);i.forEach(e=>{if("object"!==e.type||!e.resource?.href||t)if("water"===e.type)e.color=o(e.color);else{let t=o(null!=e.material?e.material.color:null);null==e.material?e.material=new c.N({color:t}):e.material.color=t,null!=r&&"outline"in e&&null!=e.outline?.color&&(e.outline.color=m(e.outline.color,r))}})}(e,t,r):(0,d.$y)(e)&&((o=(o=t)??e.color)&&(e.color=m(o,r)),null!=r&&"outline"in e&&e.outline?.color&&(e.outline.color=m(e.outline.color,r))))}async function y(e,t){let r=e.symbolLayers;r&&await (0,o.jJ)(r,async e=>x(e,t))}async function x(e,t){switch(e.type){case"extrude":var r;e.size="number"==typeof(r=t)[2]?r[2]:0;break;case"icon":case"line":case"text":var i=e,o=t;let a=w(o);null!=a&&(i.size=a);break;case"path":var s=e,l=t;let h=b(l,n.Un,[s.width,void 0,s.height]);s.width=S(l[0],s.width,1,h),s.height=S(l[2],s.height,1,h);break;case"object":await C(e,t)}}function w(e){for(let t of e)if("number"==typeof t)return t;return null}async function C(e,t){let{resourceSize:r,symbolSize:i}=await T(e),o=b(t,r,i);e.width=S(t[0],i[0],r[0],o),e.depth=S(t[1],i[1],r[1],o),e.height=S(t[2],i[2],r[2],o)}function b(e,t,r){for(let i=0;i<3;i++){let o=e[i];switch(o){case"symbol-value":{let e=r[i];return null!=e?e/t[i]:1}case"proportional":break;default:if(o&&t[i])return o/t[i]}}return 1}async function T(e){let{computeObjectLayerResourceSize:t}=await r.e(7713).then(r.bind(r,37713)),i=await t(e,10),{width:o,height:a,depth:n}=e,s=[o,n,a],l=1;for(let e=0;e<3;e++){let t=s[e];if(null!=t){l=t/i[e];break}}for(let e=0;e<3;e++)null==s[e]&&(s[e]=i[e]*l);return{resourceSize:i,symbolSize:s}}function S(e,t,r,i){switch(e){case"proportional":return r*i;case"symbol-value":return null!=t?t:r;default:return e}}async function O(e,t){if(e&&t)return(0,d.wk)(e)?y(e,t):void((0,d.$y)(e)&&function(e,t){let r=w(t);if(null!=r)switch(e.type){case"simple-marker":e.size=r;break;case"picture-marker":{let t=e.width/e.height;t>1?(e.width=r,e.height=r*t):(e.width=r*t,e.height=r);break}case"simple-line":e.width=r;break;case"text":e.font.size=r}}(e,t))}function R(e,t,r){if(e&&null!=t)if((0,d.wk)(e)){let i=e.symbolLayers;i&&i.forEach(e=>{if("object"===e.type)switch(r){case"tilt":e.tilt=(e.tilt??0)+t;break;case"roll":e.roll=(e.roll??0)+t;break;default:e.heading=(e.heading??0)+t}"icon"===e.type&&(e.angle+=t)})}else(0,d.$y)(e)&&("simple-marker"!==e.type&&"picture-marker"!==e.type&&"text"!==e.type||(e.angle+=t))}function D(e){if(!e)return null;let t=e.effects.filter(e=>"bloom"!==e.type).map(e=>e.toJSON());return(0,s.zu)(t)}function P(e){return null!=e&&"polygon-3d"===e.type&&e.symbolLayers.some(e=>"extrude"===e.type)}},89946:(e,t,r)=>{r.d(t,{Q:()=>u});var i=r(54036),o=r(35430),a=r(86416),n=r(2907),s=r(73024);class l extends s.n{constructor(e,t){super(e,"ivec2",n.c.Pass,(r,i,o)=>r.setUniform2iv(e,t(i,o)))}}var h=r(44761),c=r(5012),d=r(25928);function u(e){let{vertex:t}=e;t.uniforms.add(new c.N("coverageTexture",e=>e.coverageTexture),new l("highlightRenderCellCount",e=>(0,i.hZ)(g,e.horizontalCellCount,e.verticalCellCount)),new l("highlightTextureResolution",({highlightTexture:e})=>(0,i.hZ)(g,e.descriptor.width,e.descriptor.height)),new h.c("highlightLevel",e=>e.highlightLevel)).constants.add("cellSize","int",d.g),e.varyings.add("sUV","vec2"),e.varyings.add("vOutlinePossible","float"),t.code.add((0,a.H)`const ivec2 cellVertices[4] = ivec2[4](ivec2(0,0), ivec2(1,0), ivec2(0,1), ivec2(1,1));`).main.add((0,a.H)`int cellIndex = gl_InstanceID;
int cellX = cellIndex % highlightRenderCellCount[0];
int cellY = (cellIndex - cellX) / highlightRenderCellCount[0];
ivec2 cellPos = ivec2(cellX, cellY);
uvec2 covTexel = uvec2(texelFetch(coverageTexture, cellPos, 0).rg * 255.0);
int channelIndex = (highlightLevel >> 2) & 3;
uint channelValue = covTexel[channelIndex];
int highlightIndex = (highlightLevel & 3) << 1;
bool covered = ((channelValue >> highlightIndex) & 1u) == 1u;
if (!covered) {
gl_Position = vec4(0.0);
return;
}
vOutlinePossible = (((channelValue >> highlightIndex) & 2u) == 2u) ? 1.0 : 0.0;
ivec2 iPosInCell = cellVertices[gl_VertexID];
vec2 sPos = vec2(cellPos * cellSize + iPosInCell * (cellSize));
vec2 vPos = sPos / vec2(highlightTextureResolution);
sUV = vPos;
gl_Position = vec4(2.0 * vPos - vec2(1.0), 0.0, 1.0);`)}let g=(0,o.vt)()},91819:(e,t,r)=>{r.d(t,{b:()=>a});var i=r(20538),o=r(95775);function a(e,t,r){let a=Array.isArray(e),s=a?e.length/t:e.byteLength/(4*t),l=a?e:new Uint32Array(e,0,s*t),h=r?.minReduction??0,c=r?.originalIndices||null,d=c?c.length:0,u=r?.componentOffsets||null,g=0;if(u)for(let e=0;e<u.length-1;e++){let t=u[e+1]-u[e];t>g&&(g=t)}else g=s;let p=Math.floor(1.1*g)+1;(null==n||n.length<2*p)&&(n=new Uint32Array((0,i.cU)(2*p)));for(let e=0;e<2*p;e++)n[e]=0;let f=0,v=!!u&&!!c,m=v?d:s,_=(0,o.my)(s),y=new Uint32Array(d),x=0!==h?Math.ceil(15.366399999999999/(h*h)*h*(1-h)):m,w=1,C=u?u[1]:m;for(let e=0;e<m;e++){if(e===x){let t=1-f/e;if(t+1.96*Math.sqrt(t*(1-t)/e)<h)return null;x*=2}if(e===C){for(let e=0;e<2*p;e++)n[e]=0;if(c)for(let e=u[w-1];e<u[w];e++)y[e]=_[c[e]];C=u[++w]}let r=v?c[e]:e,i=r*t,o=function(e,t,r){let i=0;for(let o=0;o<r;o++)i=(i=e[t+o]+i|0)+(i<<11)+(i>>>2)|0;return i>>>0}(l,i,t),a=o%p,s=f;for(;0!==n[2*a+1];){if(n[2*a]===o){let e=n[2*a+1]-1;if(function(e,t,r,i){for(let o=0;o<i;o++)if(e[t+o]!==e[r+o])return!1;return!0}(l,i,e*t,t)){s=_[e];break}}++a>=p&&(a-=p)}s===f&&(n[2*a]=o,n[2*a+1]=r+1,f++),_[r]=s}if(0!==h&&1-f/s<h)return null;if(v){for(let e=u[w-1];e<y.length;e++)y[e]=_[c[e]];_=(0,o.Dg)(y)}let b=a?Array(f):new Uint32Array(f*t);f=0;for(let e=0;e<m;e++)_[e]===f&&(function(e,t,r,i,o){for(let a=0;a<o;a++)r[i+a]=e[t+a]}(l,(v?c[e]:e)*t,b,f*t,t),f++);if(c&&!v){let e=new Uint32Array(d);for(let t=0;t<e.length;t++)e[t]=_[c[t]];_=(0,o.Dg)(e)}return{buffer:Array.isArray(b)?b:b.buffer,indices:_,uniqueCount:f}}let n=null},97253:(e,t,r)=>{var i;r.d(t,{$:()=>i}),function(e){e[e.EnableFastUpdates=0]="EnableFastUpdates",e[e.DisableFastUpdates=1]="DisableFastUpdates",e[e.UpdateFastLocalOrigin=2]="UpdateFastLocalOrigin"}(i||(i={}))}}]);