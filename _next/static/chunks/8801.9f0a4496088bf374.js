"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8801],{16:(e,t,i)=>{i.d(t,{f:()=>a});var r=i(56911);class n{constructor(e,t){this.vec3=e,this.id=t}}function a(e,t,i,a){return new n((0,r.fA)(e,t,i),a)}},760:(e,t,i)=>{i.d(t,{R:()=>C,b:()=>x,r:()=>R});var r=i(4538),n=i(80194),a=i(85267),o=i(19889),s=i(2152),l=i(7865),d=i(51103),c=i(88795),p=i(25576),h=i(82784),u=i(43417),f=i(85263),m=i(62809),v=i(90475),g=i(76085),S=i(86416),_=i(86032),T=i(53041),O=i(84458),y=i(70760),E=i(34216),b=i(90564),A=i(92961);let R=1;function x(e){let t=new b.N5,{attributes:i,varyings:x,vertex:C,fragment:D}=t,{applyMarkerOffset:L,draped:I,output:P,capType:N,stippleEnabled:w,falloffEnabled:W,roundJoins:U,wireframe:z,innerColorEnabled:F}=e;t.include(d.p),t.include(o.s,e),t.include(s.q,e),t.include(a.g,e),t.include(c.Z,e);let j=L&&!I;j&&(C.uniforms.add(new g.m("markerScale",e=>e.markerScale)),t.include(l.r,{space:O.lM.World})),(0,h.NB)(C,e),C.uniforms.add(new _.F("inverseProjectionMatrix",e=>e.camera.inverseProjectionMatrix),new u.E("nearFar",e=>e.camera.nearFar),new g.m("miterLimit",e=>"miter"!==e.join?0:e.miterLimit),new f.I("viewport",e=>e.camera.fullViewport)),C.constants.add("LARGE_HALF_FLOAT","float",65500),i.add(T.r.POSITION,"vec3"),i.add(T.r.PREVPOSITION,"vec3"),i.add(T.r.NEXTPOSITION,"vec3"),i.add(T.r.SUBDIVISIONFACTOR,"float"),i.add(T.r.UV0,"vec2"),x.add("vColor","vec4"),x.add("vpos","vec3"),x.add("vLineDistance","float"),x.add("vLineWidth","float"),w&&x.add("vLineSizeInv","float");let H=N===E.x.ROUND,M=w&&H,V=W||M;V&&x.add("vLineDistanceNorm","float"),H&&(x.add("vSegmentSDF","float"),x.add("vReverseSegmentSDF","float")),C.code.add((0,S.H)`vec2 perpendicular(vec2 v) {
return vec2(v.y, -v.x);
}
float interp(float ncp, vec4 a, vec4 b) {
return (-ncp - a.z) / (b.z - a.z);
}
vec2 rotate(vec2 v, float a) {
float s = sin(a);
float c = cos(a);
mat2 m = mat2(c, -s, s, c);
return m * v;
}`),C.code.add((0,S.H)`vec4 projectAndScale(vec4 pos) {
vec4 posNdc = proj * pos;
posNdc.xy *= viewport.zw / posNdc.w;
return posNdc;
}`),C.code.add((0,S.H)`void clipAndTransform(inout vec4 pos, inout vec4 prev, inout vec4 next, in bool isStartVertex) {
float vnp = nearFar[0] * 0.99;
if(pos.z > -nearFar[0]) {
if (!isStartVertex) {
if(prev.z < -nearFar[0]) {
pos = mix(prev, pos, interp(vnp, prev, pos));
next = pos;
} else {
pos = vec4(0.0, 0.0, 0.0, 1.0);
}
} else {
if(next.z < -nearFar[0]) {
pos = mix(pos, next, interp(vnp, pos, next));
prev = pos;
} else {
pos = vec4(0.0, 0.0, 0.0, 1.0);
}
}
} else {
if (prev.z > -nearFar[0]) {
prev = mix(pos, prev, interp(vnp, pos, prev));
}
if (next.z > -nearFar[0]) {
next = mix(next, pos, interp(vnp, next, pos));
}
}
forwardViewPosDepth(pos.xyz);
pos = projectAndScale(pos);
next = projectAndScale(next);
prev = projectAndScale(prev);
}`),(0,h.Nz)(C),C.constants.add("aaWidth","float",+!w).main.add((0,S.H)`
    // unpack values from uv0.y
    bool isStartVertex = abs(abs(uv0.y)-3.0) == 1.0;

    float coverage = 1.0;

    // Check for special value of uv0.y which is used by the Renderer when graphics
    // are removed before the VBO is recompacted. If this is the case, then we just
    // project outside of clip space.
    if (uv0.y == 0.0) {
      // Project out of clip space
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
    }
    else {
      bool isJoin = abs(uv0.y) < 3.0;
      float lineSize = getSize();

      if (lineSize < 1.0) {
        coverage = lineSize; // convert sub-pixel coverage to alpha
        lineSize = 1.0;
      }
      lineSize += aaWidth;

      float lineWidth = lineSize * pixelRatio;
      vLineWidth = lineWidth;
      ${w?(0,S.H)`vLineSizeInv = 1.0 / lineSize;`:""}

      vec4 pos  = view * vec4(position, 1.0);
      vec4 prev = view * vec4(prevPosition, 1.0);
      vec4 next = view * vec4(nextPosition, 1.0);
  `),j&&C.main.add((0,S.H)`vec4 other = isStartVertex ? next : prev;
bool markersHidden = areWorldMarkersHidden(pos, other);
if(!isJoin && !markersHidden) {
pos.xyz += normalize(other.xyz - pos.xyz) * getWorldMarkerSize(pos) * 0.5;
}`),C.main.add((0,S.H)`clipAndTransform(pos, prev, next, isStartVertex);
vec2 left = (pos.xy - prev.xy);
vec2 right = (next.xy - pos.xy);
float leftLen = length(left);
float rightLen = length(right);`),(w||H)&&C.main.add((0,S.H)`
      float isEndVertex = float(!isStartVertex);
      vec2 segmentOrigin = mix(pos.xy, prev.xy, isEndVertex);
      vec2 segment = mix(right, left, isEndVertex);
      ${H?(0,S.H)`vec2 segmentEnd = mix(next.xy, pos.xy, isEndVertex);`:""}
    `),C.main.add((0,S.H)`left = (leftLen > 0.001) ? left/leftLen : vec2(0.0, 0.0);
right = (rightLen > 0.001) ? right/rightLen : vec2(0.0, 0.0);
vec2 capDisplacementDir = vec2(0, 0);
vec2 joinDisplacementDir = vec2(0, 0);
float displacementLen = lineWidth;
if (isJoin) {
bool isOutside = (left.x * right.y - left.y * right.x) * uv0.y > 0.0;
joinDisplacementDir = normalize(left + right);
joinDisplacementDir = perpendicular(joinDisplacementDir);
if (leftLen > 0.001 && rightLen > 0.001) {
float nDotSeg = dot(joinDisplacementDir, left);
displacementLen /= length(nDotSeg * left - joinDisplacementDir);
if (!isOutside) {
displacementLen = min(displacementLen, min(leftLen, rightLen)/abs(nDotSeg));
}
}
if (isOutside && (displacementLen > miterLimit * lineWidth)) {`),U?C.main.add((0,S.H)`
        vec2 startDir = leftLen < 0.001 ? right : left;
        startDir = perpendicular(startDir);

        vec2 endDir = rightLen < 0.001 ? left : right;
        endDir = perpendicular(endDir);

        float factor = ${w?(0,S.H)`min(1.0, subdivisionFactor * ${S.H.float((R+2)/(R+1))})`:(0,S.H)`subdivisionFactor`};

        float rotationAngle = acos(clamp(dot(startDir, endDir), -1.0, 1.0));
        joinDisplacementDir = rotate(startDir, -sign(uv0.y) * factor * rotationAngle);
      `):C.main.add((0,S.H)`if (leftLen < 0.001) {
joinDisplacementDir = right;
}
else if (rightLen < 0.001) {
joinDisplacementDir = left;
}
else {
joinDisplacementDir = (isStartVertex || subdivisionFactor > 0.0) ? right : left;
}
joinDisplacementDir = perpendicular(joinDisplacementDir);`);let B=N!==E.x.BUTT;return C.main.add((0,S.H)`
        displacementLen = lineWidth;
      }
    } else {
      // CAP handling ---------------------------------------------------
      joinDisplacementDir = isStartVertex ? right : left;
      joinDisplacementDir = perpendicular(joinDisplacementDir);

      ${B?(0,S.H)`capDisplacementDir = isStartVertex ? -right : left;`:""}
    }
  `),C.main.add((0,S.H)`
    // Displacement (in pixels) caused by join/or cap
    vec2 dpos = joinDisplacementDir * sign(uv0.y) * displacementLen + capDisplacementDir * displacementLen;
    float lineDistNorm = sign(uv0.y) * pos.w;

    vLineDistance =  lineWidth * lineDistNorm;
    ${V?(0,S.H)`vLineDistanceNorm = lineDistNorm;`:""}

    pos.xy += dpos;
  `),H&&C.main.add((0,S.H)`vec2 segmentDir = normalize(segment);
vSegmentSDF = (isJoin && isStartVertex) ? LARGE_HALF_FLOAT : (dot(pos.xy - segmentOrigin, segmentDir) * pos.w) ;
vReverseSegmentSDF = (isJoin && !isStartVertex) ? LARGE_HALF_FLOAT : (dot(pos.xy - segmentEnd, -segmentDir) * pos.w);`),w&&(I?C.uniforms.add(new v.U("worldToScreenRatio",e=>1/e.screenToPCSRatio)):C.main.add((0,S.H)`vec3 segmentCenter = mix((nextPosition + position) * 0.5, (position + prevPosition) * 0.5, isEndVertex);
float worldToScreenRatio = computeWorldToScreenRatio(segmentCenter);`),C.main.add((0,S.H)`float segmentLengthScreenDouble = length(segment);
float segmentLengthScreen = segmentLengthScreenDouble * 0.5;
float discreteWorldToScreenRatio = discretizeWorldToScreenRatio(worldToScreenRatio);
float segmentLengthRender = length(mix(nextPosition - position, position - prevPosition, isEndVertex));
vStipplePatternStretch = worldToScreenRatio / discreteWorldToScreenRatio;`),I?C.main.add((0,S.H)`float segmentLengthPseudoScreen = segmentLengthScreen / pixelRatio * discreteWorldToScreenRatio / worldToScreenRatio;
float startPseudoScreen = uv0.x * discreteWorldToScreenRatio - mix(0.0, segmentLengthPseudoScreen, isEndVertex);`):C.main.add((0,S.H)`float startPseudoScreen = mix(uv0.x, uv0.x - segmentLengthRender, isEndVertex) * discreteWorldToScreenRatio;
float segmentLengthPseudoScreen = segmentLengthRender * discreteWorldToScreenRatio;`),C.uniforms.add(new g.m("stipplePatternPixelSize",e=>(0,s.h)(e))),C.main.add((0,S.H)`float patternLength = lineSize * stipplePatternPixelSize;
vStippleDistanceLimits = computeStippleDistanceLimits(startPseudoScreen, segmentLengthPseudoScreen, segmentLengthScreen, patternLength);
vStippleDistance = mix(vStippleDistanceLimits.x, vStippleDistanceLimits.y, isEndVertex);
if (segmentLengthScreenDouble >= 0.001) {
vec2 stippleDisplacement = pos.xy - segmentOrigin;
float stippleDisplacementFactor = dot(segment, stippleDisplacement) / (segmentLengthScreenDouble * segmentLengthScreenDouble);
vStippleDistance += (stippleDisplacementFactor - isEndVertex) * (vStippleDistanceLimits.y - vStippleDistanceLimits.x);
}
vStippleDistanceLimits *= pos.w;
vStippleDistance *= pos.w;
vStippleDistanceLimits = isJoin ?
vStippleDistanceLimits :
isStartVertex ?
vec2(-1e34, vStippleDistanceLimits.y) :
vec2(vStippleDistanceLimits.x, 1e34);`)),C.main.add((0,S.H)`
      // Convert back into NDC
      pos.xy = (pos.xy / viewport.zw) * pos.w;

      vColor = getColor();
      vColor.a *= coverage;

      ${z&&!I?"pos.z -= 0.001 * pos.w;":""}

      // transform final position to camera space for slicing
      vpos = (inverseProjectionMatrix * pos).xyz;
      gl_Position = pos;
      forwardObjectAndLayerIdColor();
    }`),t.fragment.include(n.HQ,e),t.include(y.z,e),D.include(p.a),D.main.add((0,S.H)`discardBySlice(vpos);
discardByTerrainDepth();`),z?D.main.add((0,S.H)`vec4 finalColor = vec4(1.0, 0.0, 1.0, 1.0);`):(H&&D.main.add((0,S.H)`
        float sdf = min(vSegmentSDF, vReverseSegmentSDF);
        vec2 fragmentPosition = vec2(
          min(sdf, 0.0),
          vLineDistance
        ) * gl_FragCoord.w;

        float fragmentRadius = length(fragmentPosition);
        float fragmentCapSDF = (fragmentRadius - vLineWidth) * 0.5; // Divide by 2 to transform from double pixel scale
        float capCoverage = clamp(0.5 - fragmentCapSDF, 0.0, 1.0);

        if (capCoverage < ${S.H.float(A.Q)}) {
          discard;
        }
      `),M?D.main.add((0,S.H)`
      vec2 stipplePosition = vec2(
        min(getStippleSDF() * 2.0 - 1.0, 0.0),
        vLineDistanceNorm * gl_FragCoord.w
      );
      float stippleRadius = length(stipplePosition * vLineWidth);
      float stippleCapSDF = (stippleRadius - vLineWidth) * 0.5; // Divide by 2 to transform from double pixel scale
      float stippleCoverage = clamp(0.5 - stippleCapSDF, 0.0, 1.0);
      float stippleAlpha = step(${S.H.float(A.Q)}, stippleCoverage);
      `):D.main.add((0,S.H)`float stippleAlpha = getStippleAlpha();`),P!==r.V.ObjectAndLayerIdColor&&D.main.add((0,S.H)`discardByStippleAlpha(stippleAlpha, ${S.H.float(A.Q)});`),D.uniforms.add(new m.E("intrinsicColor",e=>e.color)),D.main.add((0,S.H)`vec4 color = intrinsicColor * vColor;`),F&&(D.uniforms.add(new m.E("innerColor",e=>e.innerColor??e.color),new g.m("innerWidth",(e,t)=>e.innerWidth*t.camera.pixelRatio)),D.main.add((0,S.H)`float distToInner = abs(vLineDistance * gl_FragCoord.w) - innerWidth;
float innerAA = clamp(0.5 - distToInner, 0.0, 1.0);
float innerAlpha = innerColor.a + color.a * (1.0 - innerColor.a);
color = mix(color, vec4(innerColor.rgb, innerAlpha), innerAA);`)),D.main.add((0,S.H)`vec4 finalColor = blendStipple(color, stippleAlpha);`),W&&(D.uniforms.add(new g.m("falloff",e=>e.falloff)),D.main.add((0,S.H)`finalColor.a *= pow(max(0.0, 1.0 - abs(vLineDistanceNorm * gl_FragCoord.w)), falloff);`)),w||D.main.add((0,S.H)`float featherStartDistance = max(vLineWidth - 2.0, 0.0);
float value = abs(vLineDistance) * gl_FragCoord.w;
float feather = (value - featherStartDistance) / (vLineWidth - featherStartDistance);
finalColor.a *= 1.0 - clamp(feather, 0.0, 1.0);`)),D.main.add((0,S.H)`outputColorHighlightOID(finalColor, vpos);`),t}let C=Object.freeze(Object.defineProperty({__proto__:null,build:x,ribbonlineNumRoundJoinSubdivisions:1},Symbol.toStringTag,{value:"Module"}))},2152:(e,t,i)=>{i.d(t,{q:()=>f,h:()=>m});var r=i(58710),n=i(82784),a=i(62809),o=i(90475),s=i(76085),l=i(86416),d=i(5012);function c(e){return e.pattern.map(t=>Math.round(t*e.pixelRatio))}i(62377),i(93446),i(87155),i(15494);var p=i(13784),h=i(44120);let u=(0,h.vt)();function f(e,t){if(!t.stippleEnabled)return void e.fragment.code.add((0,l.H)`float getStippleAlpha() { return 1.0; }
void discardByStippleAlpha(float stippleAlpha, float threshold) {}
vec4 blendStipple(vec4 color, float stippleAlpha) { return color; }`);let i=!(t.draped&&t.stipplePreferContinuous),{vertex:f,fragment:g}=e;g.include(r.W),t.draped||((0,n.yu)(f,t),f.uniforms.add(new o.U("worldToScreenPerDistanceRatio",({camera:e})=>1/e.perScreenPixelRatio)).code.add((0,l.H)`float computeWorldToScreenRatio(vec3 segmentCenter) {
float segmentDistanceToCamera = length(segmentCenter - cameraPosition);
return worldToScreenPerDistanceRatio / segmentDistanceToCamera;
}`)),e.varyings.add("vStippleDistance","float"),e.varyings.add("vStippleDistanceLimits","vec2"),e.varyings.add("vStipplePatternStretch","float"),f.code.add((0,l.H)`
    float discretizeWorldToScreenRatio(float worldToScreenRatio) {
      float step = ${l.H.float(v)};

      float discreteWorldToScreenRatio = log(worldToScreenRatio);
      discreteWorldToScreenRatio = ceil(discreteWorldToScreenRatio / step) * step;
      discreteWorldToScreenRatio = exp(discreteWorldToScreenRatio);
      return discreteWorldToScreenRatio;
    }
  `),f.code.add((0,l.H)`vec2 computeStippleDistanceLimits(float startPseudoScreen, float segmentLengthPseudoScreen, float segmentLengthScreen, float patternLength) {`),f.code.add((0,l.H)`
    if (segmentLengthPseudoScreen >= ${i?"patternLength":"1e4"}) {
  `),(0,n.Nz)(f),f.code.add((0,l.H)`float repetitions = segmentLengthScreen / (patternLength * pixelRatio);
float flooredRepetitions = max(1.0, floor(repetitions + 0.5));
float segmentLengthScreenRounded = flooredRepetitions * patternLength;
float stretch = repetitions / flooredRepetitions;
vStipplePatternStretch = max(0.75, stretch);
return vec2(0.0, segmentLengthScreenRounded);
}
return vec2(startPseudoScreen, startPseudoScreen + segmentLengthPseudoScreen);
}`),g.uniforms.add(new d.N("stipplePatternTexture",e=>e.stippleTexture),new s.m("stipplePatternSDFNormalizer",e=>{var t;return(t=e.stipplePattern)?(Math.floor(.5*(c(t).reduce((e,t)=>Math.max(e,t))-1))+.5)/t.pixelRatio:1}),new s.m("stipplePatternPixelSizeInv",e=>1/m(e))),t.stippleOffColorEnabled&&g.uniforms.add(new a.E("stippleOffColor",e=>{var t;return null==(t=e.stippleOffColor)?h.uY:4===t.length?t:(0,p.s)(u,t[0],t[1],t[2],1)})),g.code.add((0,l.H)`float getStippleSDF(out bool isClamped) {
float stippleDistanceClamped = clamp(vStippleDistance, vStippleDistanceLimits.x, vStippleDistanceLimits.y);
vec2 aaCorrectedLimits = vStippleDistanceLimits + vec2(1.0, -1.0) / gl_FragCoord.w;
isClamped = vStippleDistance < aaCorrectedLimits.x || vStippleDistance > aaCorrectedLimits.y;
float u = stippleDistanceClamped * gl_FragCoord.w * stipplePatternPixelSizeInv * vLineSizeInv;
u = fract(u);
float encodedSDF = rgbaTofloat(texture(stipplePatternTexture, vec2(u, 0.5)));
float sdf = (encodedSDF * 2.0 - 1.0) * stipplePatternSDFNormalizer;
return (sdf - 0.5) * vStipplePatternStretch + 0.5;
}
float getStippleSDF() {
bool ignored;
return getStippleSDF(ignored);
}
float getStippleAlpha() {
bool isClamped;
float stippleSDF = getStippleSDF(isClamped);
float antiAliasedResult = clamp(stippleSDF * vLineWidth + 0.5, 0.0, 1.0);
return isClamped ? floor(antiAliasedResult + 0.5) : antiAliasedResult;
}`),g.code.add((0,l.H)`
    void discardByStippleAlpha(float stippleAlpha, float threshold) {
     ${(0,l.If)(!t.stippleOffColorEnabled,"if (stippleAlpha < threshold) { discard; }")}
    }

    vec4 blendStipple(vec4 color, float stippleAlpha) {
      return ${t.stippleOffColorEnabled?"mix(color, stippleOffColor, stippleAlpha)":"vec4(color.rgb, color.a * stippleAlpha)"};
    }
  `)}function m(e){var t;let i=e.stipplePattern;return i?(null==(t=e.stipplePattern)?1:Math.floor(c(t).reduce((e,t)=>e+t)))/i.pixelRatio:1}let v=.4},7865:(e,t,i)=>{i.d(t,{r:()=>l});var r=i(78060),n=i(82784),a=i(90475),o=i(86416),s=i(84458);function l(e,t){let i=e.vertex;(0,n.Nz)(i),null==i.uniforms.get("markerScale")&&i.constants.add("markerScale","float",1),i.constants.add("markerSizePerLineWidth","float",r.PV).code.add((0,o.H)`float getLineWidth() {
return max(getSize(), 1.0) * pixelRatio;
}
float getScreenMarkerSize() {
return markerSizePerLineWidth * markerScale * getLineWidth();
}`),t.space===s.lM.World&&(i.constants.add("maxSegmentLengthFraction","float",.45),i.uniforms.add(new a.U("perRenderPixelRatio",e=>e.camera.perRenderPixelRatio)),i.code.add((0,o.H)`bool areWorldMarkersHidden(vec4 pos, vec4 other) {
vec3 midPoint = mix(pos.xyz, other.xyz, 0.5);
float distanceToCamera = length(midPoint);
float screenToWorldRatio = perRenderPixelRatio * distanceToCamera * 0.5;
float worldMarkerSize = getScreenMarkerSize() * screenToWorldRatio;
float segmentLen = length(pos.xyz - other.xyz);
return worldMarkerSize > maxSegmentLengthFraction * segmentLen;
}
float getWorldMarkerSize(vec4 pos) {
float distanceToCamera = length(pos.xyz);
float screenToWorldRatio = perRenderPixelRatio * distanceToCamera * 0.5;
return getScreenMarkerSize() * screenToWorldRatio;
}`))}},10638:(e,t,i)=>{i.d(t,{x:()=>h});var r=i(74652),n=i(55434),a=i(40941),o=i(87196),s=i(19069),l=i(74405);let d=["layerObjectAdded","layerObjectRemoved","layerObjectsAdded","layerObjectsRemoved","transformationChanged","shaderTransformationChanged","visibilityChanged","occlusionChanged","highlightChanged","geometryAdded","geometryRemoved","attributesChanged"];var c=i(73275),p=i(58462);class h extends s.J{constructor(e,t,i=""){for(let a of(super(),this.stage=e,this.apiLayerUid=i,this.type=l.X.Layer,this.events=new r.A,this.visible=!0,this.sliceable=!1,this._objectsAdded=new o.A,this._handles=new n.A,this._objects=new o.A,this._pickable=!0,this.visible=t?.visible??!0,this._pickable=t?.pickable??!0,this.updatePolicy=t?.updatePolicy??p.q.ASYNC,this._disableOctree=t?.disableOctree??!1,e.add(this),d))this._handles.add(this.events.on(a,t=>e.handleEvent(a,t)))}destroy(){this._handles.size&&(this._handles.destroy(),this.stage.remove(this),this.invalidateSpatialQueryAccelerator())}get objects(){return this._objects}set pickable(e){this._pickable=e}get pickable(){return this._pickable&&this.visible}add(e){this._objects.push(e),e.parentLayer=this,this.events.emit("layerObjectAdded",{layer:this,object:e}),null!=this._octree&&this._objectsAdded.push(e)}remove(e){this._objects.removeUnordered(e)&&(e.parentLayer=null,this.events.emit("layerObjectRemoved",{layer:this,object:e}),null!=this._octree&&(this._objectsAdded.removeUnordered(e)||this._octree.remove([e])))}addMany(e){for(let t of(this._objects.pushArray(e),e))t.parentLayer=this;this.events.emit("layerObjectsAdded",{layer:this,objects:e}),null!=this._octree&&this._objectsAdded.pushArray(e)}removeMany(e){let t=[];if(this._objects.removeUnorderedMany(e,e.length,t),0!==t.length){for(let e of t)e.parentLayer=null;if(this.events.emit("layerObjectsRemoved",{layer:this,objects:t}),null!=this._octree){for(let e=0;e<t.length;)this._objectsAdded.removeUnordered(t[e])?(t[e]=t[t.length-1],t.length-=1):++e;this._octree.remove(t)}}}sync(){this.updatePolicy!==p.q.SYNC&&this.stage.syncLayer(this.id)}notifyObjectBBChanged(e,t){null==this._octree||this._objectsAdded.includes(e)||this._octree.update(e,t)}getSpatialQueryAccelerator(){return null==this._octree&&this._objects.length>50&&!this._disableOctree?(this._octree=new c.A(e=>e.boundingVolumeWorldSpace.bounds),this._octree.add(this._objects.data,this._objects.length)):null!=this._octree&&this._objectsAdded.length>0&&(this._octree.add(this._objectsAdded.data,this._objectsAdded.length),this._objectsAdded.clear()),this._octree}invalidateSpatialQueryAccelerator(){this._octree=(0,a.pR)(this._octree),this._objectsAdded.clear()}}},19889:(e,t,i)=>{i.d(t,{s:()=>d});var r=i(72936),n=i(70058),a=i(76085),o=i(59722),s=i(86416),l=i(53041);function d(e,t){let i=e.vertex;i.uniforms.add(new a.m("intrinsicWidth",e=>e.width)),t.vvSize?(e.attributes.add(l.r.SIZEFEATUREATTRIBUTE,"float"),i.uniforms.add(new n.t("vvSizeMinSize",e=>e.vvSize.minSize),new n.t("vvSizeMaxSize",e=>e.vvSize.maxSize),new n.t("vvSizeOffset",e=>e.vvSize.offset),new n.t("vvSizeFactor",e=>e.vvSize.factor)),i.code.add((0,s.H)`float getSize() {
return intrinsicWidth * clamp(vvSizeOffset + sizeFeatureAttribute * vvSizeFactor, vvSizeMinSize, vvSizeMaxSize).x;
}`)):(e.attributes.add(l.r.SIZE,"float"),i.code.add((0,s.H)`float getSize(){
return intrinsicWidth * size;
}`)),t.vvOpacity?(e.attributes.add(l.r.OPACITYFEATUREATTRIBUTE,"float"),i.constants.add("vvOpacityNumber","int",8),i.uniforms.add(new o.x("vvOpacityValues",e=>e.vvOpacity.values,8),new o.x("vvOpacityOpacities",e=>e.vvOpacity.opacityValues,8)),i.code.add((0,s.H)`float interpolateOpacity( float value ){
if (value <= vvOpacityValues[0]) {
return vvOpacityOpacities[0];
}
for (int i = 1; i < vvOpacityNumber; ++i) {
if (vvOpacityValues[i] >= value) {
float f = (value - vvOpacityValues[i-1]) / (vvOpacityValues[i] - vvOpacityValues[i-1]);
return mix(vvOpacityOpacities[i-1], vvOpacityOpacities[i], f);
}
}
return vvOpacityOpacities[vvOpacityNumber - 1];
}
vec4 applyOpacity( vec4 color ){
return vec4(color.xyz, interpolateOpacity(opacityFeatureAttribute));
}`)):i.code.add((0,s.H)`vec4 applyOpacity( vec4 color ){
return color;
}`),t.vvColor?(e.include(r.A,t),e.attributes.add(l.r.COLORFEATUREATTRIBUTE,"float"),i.code.add((0,s.H)`vec4 getColor(){
return applyOpacity(interpolateVVColor(colorFeatureAttribute));
}`)):(e.attributes.add(l.r.COLOR,"vec4"),i.code.add((0,s.H)`vec4 getColor(){
return applyOpacity(color);
}`))}},34216:(e,t,i)=>{i.d(t,{Q:()=>d,x:()=>r});var r,n=i(81856),a=i(26847),o=i(30066),s=i(95421),l=i(4111);!function(e){e[e.BUTT=0]="BUTT",e[e.SQUARE=1]="SQUARE",e[e.ROUND=2]="ROUND",e[e.COUNT=3]="COUNT"}(r||(r={}));class d extends l.E{constructor(){super(...arguments),this.capType=r.BUTT,this.hasPolygonOffset=!1,this.writeDepth=!1,this.draped=!1,this.stippleEnabled=!1,this.stippleOffColorEnabled=!1,this.stipplePreferContinuous=!0,this.roundJoins=!1,this.applyMarkerOffset=!1,this.vvSize=!1,this.vvColor=!1,this.vvOpacity=!1,this.falloffEnabled=!1,this.innerColorEnabled=!1,this.hasOccludees=!1,this.occluder=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.wireframe=!1,this.discardInvisibleFragments=!1,this.objectAndLayerIdColorInstanced=!1,this.textureCoordinateType=a.I.None,this.emissionSource=o.ZX.None,this.occlusionPass=!1,this.hasVvInstancing=!0,this.hasSliceTranslatedView=!0}}(0,n._)([(0,s.W)({count:r.COUNT})],d.prototype,"capType",void 0),(0,n._)([(0,s.W)()],d.prototype,"hasPolygonOffset",void 0),(0,n._)([(0,s.W)()],d.prototype,"writeDepth",void 0),(0,n._)([(0,s.W)()],d.prototype,"draped",void 0),(0,n._)([(0,s.W)()],d.prototype,"stippleEnabled",void 0),(0,n._)([(0,s.W)()],d.prototype,"stippleOffColorEnabled",void 0),(0,n._)([(0,s.W)()],d.prototype,"stipplePreferContinuous",void 0),(0,n._)([(0,s.W)()],d.prototype,"roundJoins",void 0),(0,n._)([(0,s.W)()],d.prototype,"applyMarkerOffset",void 0),(0,n._)([(0,s.W)()],d.prototype,"vvSize",void 0),(0,n._)([(0,s.W)()],d.prototype,"vvColor",void 0),(0,n._)([(0,s.W)()],d.prototype,"vvOpacity",void 0),(0,n._)([(0,s.W)()],d.prototype,"falloffEnabled",void 0),(0,n._)([(0,s.W)()],d.prototype,"innerColorEnabled",void 0),(0,n._)([(0,s.W)()],d.prototype,"hasOccludees",void 0),(0,n._)([(0,s.W)()],d.prototype,"occluder",void 0),(0,n._)([(0,s.W)()],d.prototype,"terrainDepthTest",void 0),(0,n._)([(0,s.W)()],d.prototype,"cullAboveTerrain",void 0),(0,n._)([(0,s.W)()],d.prototype,"wireframe",void 0),(0,n._)([(0,s.W)()],d.prototype,"discardInvisibleFragments",void 0),(0,n._)([(0,s.W)()],d.prototype,"objectAndLayerIdColorInstanced",void 0)},49228:(e,t,i)=>{i.d(t,{F:()=>a});var r=i(23106),n=i(89060);class a{constructor(){this._meterUnitOffset=0,this._renderUnitOffset=0,this._unit="meters",this._metersPerElevationInfoUnit=1,this._featureExpressionInfoContext=null,this.centerPointInElevationSR=null,this.mode=null}get featureExpressionInfoContext(){return this._featureExpressionInfoContext}get meterUnitOffset(){return this._meterUnitOffset}get unit(){return this._unit}set unit(e){this._unit=e,this._metersPerElevationInfoUnit=(0,r.Ao)(e)}get requiresSampledElevationInfo(){return"absolute-height"!==this.mode}reset(){this.mode=null,this._meterUnitOffset=0,this._renderUnitOffset=0,this._featureExpressionInfoContext=null,this.unit="meters"}set offsetMeters(e){this._meterUnitOffset=e,this._renderUnitOffset=0}set offsetElevationInfoUnits(e){this._meterUnitOffset=e*this._metersPerElevationInfoUnit,this._renderUnitOffset=0}addOffsetRenderUnits(e){this._renderUnitOffset+=e}geometryZWithOffset(e,t){let i=this.calculateOffsetRenderUnits(t);return null!=this.featureExpressionInfoContext?i:e+i}calculateOffsetRenderUnits(e){let t=this._meterUnitOffset,i=this.featureExpressionInfoContext;return null!=i&&(t+=(0,n.g7)(i)*this._metersPerElevationInfoUnit),t/e.unitInMeters+this._renderUnitOffset}setFromElevationInfo(e){this.mode=e.mode,this.unit=(0,r.Tg)(e.unit)?e.unit:"meters",this.offsetElevationInfoUnits=e.offset??0}updateFeatureExpressionInfoContext(e,t,i){if(null==e)return void(this._featureExpressionInfoContext=null);let r=e?.arcade;r&&null!=t&&null!=i?(this._featureExpressionInfoContext=(0,n.o8)(e),(0,n.gf)(this._featureExpressionInfoContext,(0,n.VG)(r.modules,t,i))):this._featureExpressionInfoContext=e}static fromElevationInfo(e){let t=new a;return null!=e&&t.setFromElevationInfo(e),t}}},49892:(e,t,i)=>{i.d(t,{g:()=>g}),i(57845);var r=i(54635),n=i(63599),a=i(56911),o=i(44120),s=i(70983),l=i(4023),d=i(74405),c=i(63497),p=i(16),h=i(66673),u=i(87914),f=i(53041),m=i(10638),v=i(74154);class g{constructor(e){this._originSR=e,this._rootOriginId="root/"+(0,r.c)(),this._origins=new Map,this._objects=new Map,this._gridSize=5e5}getOrigin(e){let t=this._origins.get(this._rootOriginId);if(null==t){let t=u.Q.rootOrigin;if(null!=t)return this._origins.set(this._rootOriginId,(0,p.f)(t[0],t[1],t[2],this._rootOriginId)),this.getOrigin(e);let i=(0,p.f)(e[0]+Math.random()-.5,e[1]+Math.random()-.5,e[2]+Math.random()-.5,this._rootOriginId);return this._origins.set(this._rootOriginId,i),i}let i=this._gridSize,r=Math.round(e[0]/i),a=Math.round(e[1]/i),o=Math.round(e[2]/i),s=`${r}/${a}/${o}`,l=this._origins.get(s),d=.5*i;if((0,n.d)(S,e,t.vec3),S[0]=Math.abs(S[0]),S[1]=Math.abs(S[1]),S[2]=Math.abs(S[2]),S[0]<d&&S[1]<d&&S[2]<d){if(l){let t=Math.max(...S);if((0,n.d)(S,e,l.vec3),S[0]=Math.abs(S[0]),S[1]=Math.abs(S[1]),S[2]=Math.abs(S[2]),Math.max(...S)<t)return l}return t}return l||(l=(0,p.f)(r*i,a*i,o*i,s),this._origins.set(s,l)),l}_drawOriginBox(e,t=(0,o.fA)(1,1,0,1)){let i=window.view,r=i._stage,n=t.toString();if(!this._objects.has(n)){this._material=new v.W({width:2,color:t}),r.add(this._material);let e=new m.x(r,{pickable:!1}),i=new h.B({castShadow:!1});r.add(i),e.add(i),this._objects.set(n,i)}let a=this._objects.get(n),p=[0,1,5,4,0,2,1,7,6,2,0,1,3,7,5,4,6,2,0],u=p.length,g=Array(3*u),S=[],_=.5*this._gridSize;for(let t=0;t<u;t++)g[3*t]=e[0]+(1&p[t]?_:-_),g[3*t+1]=e[1]+(2&p[t]?_:-_),g[3*t+2]=e[2]+(4&p[t]?_:-_),t>0&&S.push(t-1,t);(0,s.projectBuffer)(g,this._originSR,0,g,i.renderSpatialReference,0,u);let T=new c.V(this._material,[[f.r.POSITION,new l.n(g,S,3,!0)]],null,d.X.Line);r.add(T),a.addGeometry(T)}get test(){}}let S=(0,a.vt)()},58462:(e,t,i)=>{var r;i.d(t,{q:()=>r}),function(e){e[e.ASYNC=0]="ASYNC",e[e.SYNC=1]="SYNC"}(r||(r={}))},59641:(e,t,i)=>{var r,n,a;i.d(t,{O7:()=>n,Om:()=>r,sv:()=>a}),function(e){e[e.RasterImage=0]="RasterImage",e[e.Features=1]="Features"}(r||(r={})),function(e){e[e.MapLayer=0]="MapLayer",e[e.ViewLayer=1]="ViewLayer",e[e.Outline=2]="Outline",e[e.SnappingHint=3]="SnappingHint"}(n||(n={})),function(e){e[e.WithRasterImage=0]="WithRasterImage",e[e.WithoutRasterImage=1]="WithoutRasterImage"}(a||(a={}))},66673:(e,t,i)=>{i.d(t,{B:()=>g}),i(57845);var r,n=i(40998),a=i(38715),o=i(63599),s=i(56911),l=i(7916),d=i(87261),c=i(18189),p=i(19069),h=i(74405),u=i(57323),f=i(97681),m=i(53041),v=i(85640);class g extends p.J{get geometries(){return this._geometries}get transformation(){return this._transformation??a.zK}set transformation(e){this._transformation=(0,n.C)(this._transformation??(0,a.vt)(),e),this._invalidateBoundingVolume(),this._emit("transformationChanged",this)}get shaderTransformation(){return this._shaderTransformation}set shaderTransformation(e){this._shaderTransformation=e?(0,n.C)(this._shaderTransformation??(0,a.vt)(),e):null,this._invalidateBoundingVolume(),this._emit("shaderTransformationChanged",this)}get effectiveTransformation(){return this.shaderTransformation??this.transformation}constructor(e={}){super(),this.type=h.X.Object,this._shaderTransformation=null,this._parentLayer=null,this._visible=!0,this.castShadow=e.castShadow??!0,this.usesVerticalDistanceToGround=e.usesVerticalDistanceToGround??!1,this.graphicUid=e.graphicUid,this.layerUid=e.layerUid,e.isElevationSource&&(this.lastValidElevationBB=new S),this._geometries=e.geometries?Array.from(e.geometries):[]}dispose(){this._geometries.length=0}get parentLayer(){return this._parentLayer}set parentLayer(e){(0,f.vA)(null==this._parentLayer||null==e,"Object3D can only be added to a single Layer"),this._parentLayer=e}addGeometry(e){e.visible=this._visible,this._geometries.push(e),this._emit("geometryAdded",{object:this,geometry:e}),this._invalidateBoundingVolume()}removeGeometry(e){let t=this._geometries.splice(e,1)[0];t&&(this._emit("geometryRemoved",{object:this,geometry:t}),this._invalidateBoundingVolume())}removeAllGeometries(){for(;this._geometries.length>0;)this.removeGeometry(0)}geometryVertexAttributeUpdated(e,t,i=!1){this._emit("attributesChanged",{object:this,geometry:e,attribute:t,sync:i}),(0,m.b)(t)&&this._invalidateBoundingVolume()}get visible(){return this._visible}set visible(e){if(this._visible!==e){for(let t of(this._visible=e,this._geometries))t.visible=this._visible;this._emit("visibilityChanged",this)}}maskOccludee(){let e=new u.p;for(let t of this._geometries)t.occludees=(0,v.Ci)(t.occludees,e);return this._emit("occlusionChanged",this),e}removeOcclude(e){for(let t of this._geometries)t.occludees=(0,v.PC)(t.occludees,e);this._emit("occlusionChanged",this)}highlight(e){let t=new u.h(e);for(let e of this._geometries)e.addHighlight(t);return this._emit("highlightChanged",this),t}removeHighlight(e){for(let t of this._geometries)t.removeHighlight(e);this._emit("highlightChanged",this)}removeStateID(e){e.channel===c.Mg.Highlight?this.removeHighlight(e):this.removeOcclude(e)}getCombinedStaticTransformation(e,t){return(0,n.lw)(t,this.transformation,e.transformation)}getCombinedShaderTransformation(e,t=(0,a.vt)()){return(0,n.lw)(t,this.effectiveTransformation,e.transformation)}get boundingVolumeWorldSpace(){return this._bvWorldSpace||(this._bvWorldSpace=this._bvWorldSpace||new _,this._validateBoundingVolume(this._bvWorldSpace,r.WorldSpace)),this._bvWorldSpace}get boundingVolumeObjectSpace(){return this._bvObjectSpace||(this._bvObjectSpace=this._bvObjectSpace||new _,this._validateBoundingVolume(this._bvObjectSpace,r.ObjectSpace)),this._bvObjectSpace}_validateBoundingVolume(e,t){let i=t===r.ObjectSpace;for(let t of this._geometries){let r=t.boundingInfo;r&&function(e,t,i){let r=e.bbMin,a=e.bbMax;if((0,n.tZ)(i)){let e=(0,o.i)(T,i[12],i[13],i[14]);(0,o.g)(O,r,e),(0,o.g)(y,a,e);for(let e=0;e<3;++e)t.min[e]=Math.min(t.min[e],O[e]),t.max[e]=Math.max(t.max[e],y[e])}else if((0,o.t)(O,r,i),(0,o.p)(r,a))for(let e=0;e<3;++e)t.min[e]=Math.min(t.min[e],O[e]),t.max[e]=Math.max(t.max[e],O[e]);else{(0,o.t)(y,a,i);for(let e=0;e<3;++e)t.min[e]=Math.min(t.min[e],O[e],y[e]),t.max[e]=Math.max(t.max[e],O[e],y[e]);for(let e=0;e<3;++e){(0,o.c)(O,r),(0,o.c)(y,a),O[e]=a[e],y[e]=r[e],(0,o.t)(O,O,i),(0,o.t)(y,y,i);for(let e=0;e<3;++e)t.min[e]=Math.min(t.min[e],O[e],y[e]),t.max[e]=Math.max(t.max[e],O[e],y[e])}}}(r,e,i?t.transformation:this.getCombinedShaderTransformation(t))}for(let t of((0,o.m)((0,l.a)(e.bounds),e.min,e.max,.5),this._geometries)){let r=t.boundingInfo;if(null==r)continue;let n=i?t.transformation:this.getCombinedShaderTransformation(t),a=(0,d.hG)(n);(0,o.t)(E,r.center,n);let s=(0,o.j)(E,(0,l.a)(e.bounds)),c=r.radius*a;e.bounds[3]=Math.max(e.bounds[3],s+c)}}_invalidateBoundingVolume(){let e=this._bvWorldSpace?.bounds;this._bvObjectSpace=this._bvWorldSpace=void 0,this._parentLayer&&e&&this._parentLayer.notifyObjectBBChanged(this,e)}_emit(e,t){this._parentLayer&&this._parentLayer.events.emit(e,t)}get test(){}}class S{constructor(){this.min=(0,s.fA)(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE),this.max=(0,s.fA)(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE)}isEmpty(){return this.max[0]<this.min[0]&&this.max[1]<this.min[1]&&this.max[2]<this.min[2]}}class _ extends S{constructor(){super(...arguments),this.bounds=(0,l.c)()}}let T=(0,s.vt)(),O=(0,s.vt)(),y=(0,s.vt)(),E=(0,s.vt)();!function(e){e[e.WorldSpace=0]="WorldSpace",e[e.ObjectSpace=1]="ObjectSpace"}(r||(r={}))},74154:(e,t,i)=>{i.d(t,{W:()=>z});var r,n=i(61939),a=i(20538),o=i(55048),s=i(54036),l=i(63599),d=i(56911),c=i(44120),p=i(5408),h=i(18945),u=i(72500),f=i(83094),m=i(4538),v=i(95554),g=i(93895),S=i(60048),_=i(22045),T=i(97681),O=i(53041),y=i(68191),E=i(84458),b=i(760);i(57845);var A=i(60649),R=i(96741),x=i(69214),C=i(97305),D=i(67880),L=i(93446),I=i(84153);class P extends R.w{constructor(e,t){super(e,t,new A.$(b.R,()=>i.e(5902).then(i.bind(i,55902))),w),this.primitiveType=t.wireframe?L.WR.LINES:L.WR.TRIANGLE_STRIP}_makePipelineState(e,t){let{oitPass:i,output:r,hasOccludees:n,hasPolygonOffset:a}=e,o=i===x.Y.NONE,s=i===x.Y.FrontFace;return(0,I.Ey)({blending:(0,m.RN)(r)?(0,C.Yf)(i):null,depthTest:{func:(0,C.K_)(i)},depthWrite:(0,C.z5)(e),drawBuffers:r===m.V.Depth?{buffers:[L.Hr.NONE]}:(0,C.m6)(i,r),colorWrite:I.kn,stencilWrite:n?D.v0:null,stencilTest:n?t?D.a9:D.qh:null,polygonOffset:o||s?a?N:null:C.SE})}initializePipeline(e){if(e.occluder){let t=e.hasPolygonOffset?N:null;this._occluderPipelineTransparent=(0,I.Ey)({blending:I.Ky,polygonOffset:t,depthTest:D.sf,depthWrite:null,colorWrite:I.kn,stencilWrite:null,stencilTest:D.mK,drawBuffers:e.output===m.V.Depth?{buffers:[L.Hr.NONE]}:null}),this._occluderPipelineOpaque=(0,I.Ey)({blending:I.Ky,polygonOffset:t,depthTest:D.sf,depthWrite:null,colorWrite:I.kn,stencilWrite:D.r8,stencilTest:D.I$,drawBuffers:e.output===m.V.Depth?{buffers:[L.Hr.NONE]}:null}),this._occluderPipelineMaskWrite=(0,I.Ey)({blending:null,polygonOffset:t,depthTest:D.m,depthWrite:null,colorWrite:null,stencilWrite:D.v0,stencilTest:D.a9,drawBuffers:e.output===m.V.Depth?{buffers:[L.Hr.NONE]}:null})}return this._occludeePipeline=this._makePipelineState(e,!0),this._makePipelineState(e,!1)}getPipeline(e,t){if(e)return this._occludeePipeline;switch(t){case _.N.TRANSPARENT_OCCLUDER_MATERIAL:return this._occluderPipelineTransparent??super.getPipeline();case _.N.OCCLUDER_MATERIAL:return this._occluderPipelineOpaque??super.getPipeline();default:return this._occluderPipelineMaskWrite??super.getPipeline()}}}let N={factor:0,units:-4},w=new Map([[O.r.POSITION,0],[O.r.PREVPOSITION,1],[O.r.NEXTPOSITION,2],[O.r.SUBDIVISIONFACTOR,3],[O.r.UV0,4],[O.r.COLOR,5],[O.r.COLORFEATUREATTRIBUTE,5],[O.r.SIZE,6],[O.r.SIZEFEATUREATTRIBUTE,6],[O.r.OPACITYFEATUREATTRIBUTE,7],[O.r.OBJECTANDLAYERIDCOLOR,8]]);var W=i(34216),U=i(92961);!function(e){e[e.LEFT_JOIN_START=-2]="LEFT_JOIN_START",e[e.LEFT_JOIN_END=-1]="LEFT_JOIN_END",e[e.LEFT_CAP_START=-4]="LEFT_CAP_START",e[e.LEFT_CAP_END=-5]="LEFT_CAP_END",e[e.RIGHT_JOIN_START=2]="RIGHT_JOIN_START",e[e.RIGHT_JOIN_END=1]="RIGHT_JOIN_END",e[e.RIGHT_CAP_START=4]="RIGHT_CAP_START",e[e.RIGHT_CAP_END=5]="RIGHT_CAP_END"}(r||(r={}));class z extends S.im{constructor(e){super(e,j),this._configuration=new W.Q,this.vertexAttributeLocations=w,this.produces=new Map([[_.N.OPAQUE_MATERIAL,e=>(0,m.CL)(e)||(0,m.RN)(e)&&this.parameters.renderOccluded===S.m$.OccludeAndTransparentStencil],[_.N.OPAQUE_MATERIAL_WITHOUT_NORMALS,e=>(0,m.eh)(e)],[_.N.OCCLUDER_MATERIAL,e=>(0,m.T2)(e)&&this.parameters.renderOccluded===S.m$.OccludeAndTransparentStencil],[_.N.TRANSPARENT_OCCLUDER_MATERIAL,e=>(0,m.T2)(e)&&this.parameters.renderOccluded===S.m$.OccludeAndTransparentStencil],[_.N.TRANSPARENT_MATERIAL,e=>(0,m.RN)(e)&&this.parameters.writeDepth&&this.parameters.renderOccluded!==S.m$.OccludeAndTransparentStencil],[_.N.TRANSPARENT_MATERIAL_WITHOUT_DEPTH,e=>(0,m.RN)(e)&&!this.parameters.writeDepth&&this.parameters.renderOccluded!==S.m$.OccludeAndTransparentStencil],[_.N.DRAPED_MATERIAL,e=>(0,m.i3)(e)]])}getConfiguration(e,t){var i;this._configuration.output=e,this._configuration.oitPass=t.oitPass,this._configuration.draped=t.slot===_.N.DRAPED_MATERIAL;let r=null!=this.parameters.stipplePattern&&e!==m.V.Highlight;return this._configuration.stippleEnabled=r,this._configuration.stippleOffColorEnabled=r&&null!=this.parameters.stippleOffColor,this._configuration.stipplePreferContinuous=r&&this.parameters.stipplePreferContinuous,this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.roundJoins="round"===this.parameters.join,this._configuration.capType=this.parameters.cap,this._configuration.applyMarkerOffset=null!=this.parameters.markerParameters&&(i=this.parameters.markerParameters).anchor===E.kJ.Tip&&i.hideOnShortSegments&&"begin-end"===i.placement&&i.worldSpace,this._configuration.hasPolygonOffset=this.parameters.hasPolygonOffset,this._configuration.writeDepth=this.parameters.writeDepth,this._configuration.vvSize=!!this.parameters.vvSize,this._configuration.vvColor=!!this.parameters.vvColor,this._configuration.vvOpacity=!!this.parameters.vvOpacity,this._configuration.innerColorEnabled=this.parameters.innerWidth>0&&null!=this.parameters.innerColor,this._configuration.falloffEnabled=this.parameters.falloff>0,this._configuration.hasOccludees=t.hasOccludees,this._configuration.occluder=this.parameters.renderOccluded===S.m$.OccludeAndTransparentStencil,this._configuration.terrainDepthTest=t.terrainDepthTest&&(0,m.RN)(e),this._configuration.cullAboveTerrain=t.cullAboveTerrain,this._configuration.wireframe=this.parameters.wireframe,this._configuration}get visible(){return this.parameters.color[3]>=U.Q||null!=this.parameters.stipplePattern&&(this.parameters.stippleOffColor?.[3]??0)>U.Q}intersectDraped({attributes:e,screenToWorldRatio:t},i,r,n,o,s){if(!r.options.selectionMode)return;let l=e.get(O.r.SIZE),d=this.parameters.width;if(this.parameters.vvSize){let t=e.get(O.r.SIZEFEATUREATTRIBUTE).data[0];d*=(0,a.qE)(this.parameters.vvSize.offset[0]+t*this.parameters.vvSize.factor[0],this.parameters.vvSize.minSize[0],this.parameters.vvSize.maxSize[0])}else l&&(d*=l.data[0]);let c=n[0],p=n[1],h=(d/2+4)*t,u=Number.MAX_VALUE,f=0,m=e.get(O.r.POSITION).data,v=V(this.parameters,e)?m.length-2:m.length-5;for(let e=0;e<v;e+=3){let t=m[e],i=m[e+1],r=(e+3)%m.length,n=c-t,o=p-i,s=m[r]-t,l=m[r+1]-i,d=(0,a.qE)((s*n+l*o)/(s*s+l*l),0,1),h=s*d-n,v=l*d-o,g=h*h+v*v;g<u&&(u=g,f=e/3)}u<h*h&&o(s.dist,s.normal,f,!1)}intersect(e,t,i,r,o,d){if(!i.options.selectionMode||!e.visible)return;if(!(0,T.zH)(t))return void n.A.getLogger("esri.views.3d.webgl-engine.materials.RibbonLineMaterial").error("intersection assumes a translation-only matrix");let c=e.attributes,f=c.get(O.r.POSITION).data,m=this.parameters.width;if(this.parameters.vvSize){let e=c.get(O.r.SIZEFEATUREATTRIBUTE).data[0];m*=(0,a.qE)(this.parameters.vvSize.offset[0]+e*this.parameters.vvSize.factor[0],this.parameters.vvSize.minSize[0],this.parameters.vvSize.maxSize[0])}else c.has(O.r.SIZE)&&(m*=c.get(O.r.SIZE).data[0]);let v=i.camera;(0,s.C)($,i.point);let g=m*v.pixelRatio/2+4*v.pixelRatio;(0,l.i)(er[0],$[0]-g,$[1]+g,0),(0,l.i)(er[1],$[0]+g,$[1]+g,0),(0,l.i)(er[2],$[0]+g,$[1]-g,0),(0,l.i)(er[3],$[0]-g,$[1]-g,0);for(let e=0;e<4;e++)if(!v.unprojectFromRenderScreen(er[e],en[e]))return;(0,u.Cr)(v.eye,en[0],en[1],ea),(0,u.Cr)(v.eye,en[1],en[2],eo),(0,u.Cr)(v.eye,en[2],en[3],es),(0,u.Cr)(v.eye,en[3],en[0],el);let S=Number.MAX_VALUE,_=0,y=V(this.parameters,c)?f.length-2:f.length-5;for(let e=0;e<y;e+=3){B[0]=f[e]+t[12],B[1]=f[e+1]+t[13],B[2]=f[e+2]+t[14];let i=(e+3)%f.length;if(k[0]=f[i]+t[12],k[1]=f[i+1]+t[13],k[2]=f[i+2]+t[14],0>(0,u.mN)(ea,B)&&0>(0,u.mN)(ea,k)||0>(0,u.mN)(eo,B)&&0>(0,u.mN)(eo,k)||0>(0,u.mN)(es,B)&&0>(0,u.mN)(es,k)||0>(0,u.mN)(el,B)&&0>(0,u.mN)(el,k))continue;if(v.projectToRenderScreen(B,Z),v.projectToRenderScreen(k,q),Z[2]<0&&q[2]>0){(0,l.d)(G,B,k);let e=v.frustum,t=-(0,u.mN)(e[p.FB.NEAR],B)/(0,l.f)(G,(0,u.Qj)(e[p.FB.NEAR]));(0,l.h)(G,G,t),(0,l.g)(B,B,G),v.projectToRenderScreen(B,Z)}else if(Z[2]>0&&q[2]<0){(0,l.d)(G,k,B);let e=v.frustum,t=-(0,u.mN)(e[p.FB.NEAR],k)/(0,l.f)(G,(0,u.Qj)(e[p.FB.NEAR]));(0,l.h)(G,G,t),(0,l.g)(k,k,G),v.projectToRenderScreen(k,q)}else if(Z[2]<0&&q[2]<0)continue;Z[2]=0,q[2]=0;let r=(0,h.kb)((0,h.Cr)(Z,q,X),$);r<S&&(S=r,(0,l.c)(Y,B),(0,l.c)(Q,k),_=e/3)}let E=i.rayBegin,b=i.rayEnd;if(S<g*g){let e=Number.MAX_VALUE;if((0,h.ld)((0,h.Cr)(Y,Q,X),(0,h.Cr)(E,b,K),J)){(0,l.d)(J,J,E);let t=(0,l.l)(J);(0,l.h)(J,J,1/t),e=t/(0,l.j)(E,b)}d(e,J,_,!1)}}get _layout(){let e=(0,f.BP)().vec3f(O.r.POSITION).vec3f(O.r.PREVPOSITION).vec3f(O.r.NEXTPOSITION).f32(O.r.SUBDIVISIONFACTOR).vec2f(O.r.UV0);return this.parameters.vvSize?e.f32(O.r.SIZEFEATUREATTRIBUTE):e.f32(O.r.SIZE),this.parameters.vvColor?e.f32(O.r.COLORFEATUREATTRIBUTE):e.vec4f(O.r.COLOR),this.parameters.vvOpacity&&e.f32(O.r.OPACITYFEATUREATTRIBUTE),(0,v.E)()&&e.vec4u8(O.r.OBJECTANDLAYERIDCOLOR),e}createBufferWriter(){return new H(this._layout,this.parameters)}createGLMaterial(e){return new F(e)}validateParameters(e){"miter"!==e.join&&(e.miterLimit=0),null!=e.markerParameters&&(e.markerScale=e.markerParameters.width/e.width)}}class F extends g.A{constructor(){super(...arguments),this._stipplePattern=null}dispose(){super.dispose(),this._stippleTextures.release(this._stipplePattern),this._stipplePattern=null}beginSlot(e){let t=this._material.parameters.stipplePattern;return this._stipplePattern!==t&&(this._material.setParameters({stippleTexture:this._stippleTextures.swap(t,this._stipplePattern)}),this._stipplePattern=t),this.getTechnique(P,e)}}class j extends y.S{constructor(){super(...arguments),this.width=0,this.color=c.Un,this.join="miter",this.cap=W.x.BUTT,this.miterLimit=5,this.writeDepth=!0,this.hasPolygonOffset=!1,this.stippleTexture=null,this.stipplePreferContinuous=!0,this.markerParameters=null,this.markerScale=1,this.hasSlicePlane=!1,this.vvFastUpdate=!1,this.isClosed=!1,this.falloff=0,this.innerWidth=0,this.wireframe=!1}get transparent(){return this.color[3]<1||null!=this.stipplePattern&&(this.stippleOffColor?.[3]??0)<1}}class H{constructor(e,t){this.vertexBufferLayout=e,this._parameters=t,this.numJoinSubdivisions=0;let i=+!!t.stipplePattern;switch(this._parameters.join){case"miter":case"bevel":this.numJoinSubdivisions=i;break;case"round":this.numJoinSubdivisions=b.r+i}}_isClosed(e){return V(this._parameters,e)}allocate(e){return this.vertexBufferLayout.createBuffer(e)}elementCount(e){let t=e.get(O.r.POSITION).indices.length/2+1,i=this._isClosed(e),r=i?2:4;return r+=((i?t:t-1)-!i)*(2*this.numJoinSubdivisions+4)+2,this._parameters.wireframe&&(r=2+4*(r-2)),r}write(e,t,i,n,a,o){let s=i.get(O.r.POSITION),d=s.indices,c=s.data.length/3,p=i.get(O.r.DISTANCETOSTART)?.data;d&&d.length!==2*(c-1)&&console.warn("RibbonLineMaterial does not support indices");let h=i.get(O.r.SIZEFEATUREATTRIBUTE)?.data[0]??i.get(O.r.SIZE)?.data[0]??1,u=[1,1,1,1],f=0,m=this.vertexBufferLayout.fields.has(O.r.COLORFEATUREATTRIBUTE);m?f=i.get(O.r.COLORFEATUREATTRIBUTE).data[0]:i.has(O.r.COLOR)&&(u=i.get(O.r.COLOR).data);let g=this.vertexBufferLayout.fields.has(O.r.OPACITYFEATUREATTRIBUTE),S=g?i.get(O.r.OPACITYFEATUREATTRIBUTE).data[0]:0,_=new Float32Array(a.buffer),T=(0,v.E)()?new Uint8Array(a.buffer):null,y=this.vertexBufferLayout.stride/4,E=o*y,b=E,A=0,R=p?(e,t,i)=>A=p[i]:(e,t,i)=>A+=(0,l.j)(e,t),x=(e,t,i,r,a,o,s)=>{if(_[E++]=t[0],_[E++]=t[1],_[E++]=t[2],_[E++]=e[0],_[E++]=e[1],_[E++]=e[2],_[E++]=i[0],_[E++]=i[1],_[E++]=i[2],_[E++]=r,_[E++]=s,_[E++]=a,_[E++]=h,m)_[E++]=f;else{let e=Math.min(4*o,u.length-4);_[E++]=u[e],_[E++]=u[e+1],_[E++]=u[e+2],_[E++]=u[e+3]}g&&(_[E++]=S),(0,v.E)()&&(n&&(T[4*E]=n[0],T[4*E+1]=n[1],T[4*E+2]=n[2],T[4*E+3]=n[3]),E++)};E+=y,(0,l.i)(et,s.data[0],s.data[1],s.data[2]),e&&(0,l.t)(et,et,e);let C=this._isClosed(i);if(C){let t=s.data.length-3;(0,l.i)(ee,s.data[t],s.data[t+1],s.data[t+2]),e&&(0,l.t)(ee,ee,e)}else(0,l.i)(ei,s.data[3],s.data[4],s.data[5]),e&&(0,l.t)(ei,ei,e),x(et,et,ei,1,r.LEFT_CAP_START,0,0),x(et,et,ei,1,r.RIGHT_CAP_START,0,0),(0,l.c)(ee,et),(0,l.c)(et,ei);let D=+!C,L=C?c:c-1;for(let t=D;t<L;t++){let i=(t+1)%c*3;(0,l.i)(ei,s.data[i],s.data[i+1],s.data[i+2]),e&&(0,l.t)(ei,ei,e),R(ee,et,t),x(ee,et,ei,0,r.LEFT_JOIN_END,t,A),x(ee,et,ei,0,r.RIGHT_JOIN_END,t,A);let n=this.numJoinSubdivisions;for(let e=0;e<n;++e){let i=(e+1)/(n+1);x(ee,et,ei,i,r.LEFT_JOIN_END,t,A),x(ee,et,ei,i,r.RIGHT_JOIN_END,t,A)}x(ee,et,ei,1,r.LEFT_JOIN_START,t,A),x(ee,et,ei,1,r.RIGHT_JOIN_START,t,A),(0,l.c)(ee,et),(0,l.c)(et,ei)}C?((0,l.i)(ei,s.data[3],s.data[4],s.data[5]),e&&(0,l.t)(ei,ei,e),A=R(ee,et,L),x(ee,et,ei,0,r.LEFT_JOIN_END,D,A),x(ee,et,ei,0,r.RIGHT_JOIN_END,D,A)):(A=R(ee,et,L),x(ee,et,et,0,r.LEFT_CAP_END,L,A),x(ee,et,et,0,r.RIGHT_CAP_END,L,A)),M(_,b+y,_,b,y),E=M(_,E-y,_,E,y),this._parameters.wireframe&&this._addWireframeVertices(a,b,E,y)}_addWireframeVertices(e,t,i,r){let n=new Float32Array(e.buffer,i*Float32Array.BYTES_PER_ELEMENT),a=new Float32Array(e.buffer,t*Float32Array.BYTES_PER_ELEMENT,i-t),o=0,s=e=>o=M(a,e,n,o,r);for(let e=0;e<a.length-1;e+=2*r)s(e),s(e+2*r),s(e+ +r),s(e+2*r),s(e+ +r),s(e+3*r)}}function M(e,t,i,r,n){for(let a=0;a<n;a++)i[r++]=e[t++];return r}function V(e,t){return!!e.isClosed&&t.get(O.r.POSITION).indices.length>2}let B=(0,d.vt)(),k=(0,d.vt)(),G=(0,d.vt)(),J=(0,d.vt)(),$=(0,d.vt)(),Z=(0,o.r_)(),q=(0,o.r_)(),Y=(0,d.vt)(),Q=(0,d.vt)(),X=(0,h.vt)(),K=(0,h.vt)(),ee=(0,d.vt)(),et=(0,d.vt)(),ei=(0,d.vt)(),er=[(0,o.r_)(),(0,o.r_)(),(0,o.r_)(),(0,o.r_)()],en=[(0,d.vt)(),(0,d.vt)(),(0,d.vt)(),(0,d.vt)()],ea=(0,u.vt)(),eo=(0,u.vt)(),es=(0,u.vt)(),el=(0,u.vt)()},74558:(e,t,i)=>{i.d(t,{I2:()=>m,Kf:()=>g,Uk:()=>T,ai:()=>_,au:()=>h,fe:()=>S,nG:()=>f,nu:()=>v,sE:()=>u,uw:()=>r});var r,n=i(40998),a=i(38715),o=i(56911),s=i(26270),l=i(70983),d=i(54919),c=i(98524),p=i(53041);function h(e,t,i,r,n,a,o,s,d,c,p){let h=O[p.mode],u,f,m=0;if((0,l.projectBuffer)(e,t,i,r,d.spatialReference,n,s))return h?.requiresAlignment(p)?(m=h.applyElevationAlignmentBuffer(r,n,a,o,s,d,c,p),u=a,f=o):(u=r,f=n),(0,l.projectBuffer)(u,d.spatialReference,f,a,c.spatialReference,o,s)?m:void 0}function u(e,t,i,r,n){let a=((0,d.v)(e)?e.z:(0,c.cN)(e)?e.array[e.offset+2]:e[2])||0;switch(i.mode){case"on-the-ground":{let i=(0,c.R1)(t,e,"ground")??0;return n.verticalDistanceToGround=0,n.sampledElevation=i,void(n.z=i)}case"relative-to-ground":{let o=(0,c.R1)(t,e,"ground")??0,s=i.geometryZWithOffset(a,r);return n.verticalDistanceToGround=s,n.sampledElevation=o,void(n.z=s+o)}case"relative-to-scene":{let o=(0,c.R1)(t,e,"scene")??0,s=i.geometryZWithOffset(a,r);return n.verticalDistanceToGround=s,n.sampledElevation=o,void(n.z=s+o)}case"absolute-height":{let o=i.geometryZWithOffset(a,r),s=(0,c.R1)(t,e,"ground")??0;return n.verticalDistanceToGround=o-s,n.sampledElevation=s,void(n.z=o)}default:return void(n.z=0)}}function f(e,t,i,r){return u(e,t,i,r,E),E.z}function m(e,t,i){return"on-the-ground"===t&&"on-the-ground"===i?e.staysOnTheGround:t===i||"on-the-ground"!==t&&"on-the-ground"!==i?null==t||null==i?e.definedChanged:r.UPDATE:e.onTheGroundChanged}function v(e){return"relative-to-ground"===e||"relative-to-scene"===e}function g(e){return"absolute-height"!==e}function S(e,t,i,r,a){u(t,i,a,r,E),_(e,E.verticalDistanceToGround);let o=E.sampledElevation,l=(0,n.C)(y,e.transformation);return b[0]=t.x,b[1]=t.y,b[2]=E.z,(0,s.l)(t.spatialReference,b,l,r.spatialReference)?e.transformation=l:console.warn("Could not locate symbol object properly, it might be misplaced"),o}function _(e,t){for(let i=0;i<e.geometries.length;++i){let r=e.geometries[i].getMutableAttribute(p.r.CENTEROFFSETANDDISTANCE);r&&r.data[3]!==t&&(r.data[3]=t,e.geometryVertexAttributeUpdated(e.geometries[i],p.r.CENTEROFFSETANDDISTANCE))}}class T{constructor(){this.verticalDistanceToGround=0,this.sampledElevation=0,this.z=0}}!function(e){e[e.NONE=0]="NONE",e[e.UPDATE=1]="UPDATE",e[e.RECREATE=2]="RECREATE"}(r||(r={}));let O={"absolute-height":{applyElevationAlignmentBuffer:function(e,t,i,r,n,a,o,s){let l=s.calculateOffsetRenderUnits(o),d=s.featureExpressionInfoContext;t*=3,r*=3;for(let a=0;a<n;++a){let n=e[t],a=e[t+1],o=e[t+2];i[r]=n,i[r+1]=a,i[r+2]=null==d?o+l:l,t+=3,r+=3}return 0},requiresAlignment:function(e){let t=e.meterUnitOffset,i=e.featureExpressionInfoContext;return 0!==t||null!=i}},"on-the-ground":{applyElevationAlignmentBuffer:function(e,t,i,r,n,a){let o=0,s=a.spatialReference;t*=3,r*=3;for(let l=0;l<n;++l){let n=e[t],l=e[t+1],d=e[t+2],c=a.getElevation(n,l,d,s,"ground")??0;o+=c,i[r]=n,i[r+1]=l,i[r+2]=c,t+=3,r+=3}return o/n},requiresAlignment:()=>!0},"relative-to-ground":{applyElevationAlignmentBuffer:function(e,t,i,r,n,a,o,s){let l=0,d=s.calculateOffsetRenderUnits(o),c=s.featureExpressionInfoContext,p=a.spatialReference;t*=3,r*=3;for(let o=0;o<n;++o){let n=e[t],o=e[t+1],s=e[t+2],h=a.getElevation(n,o,s,p,"ground")??0;l+=h,i[r]=n,i[r+1]=o,i[r+2]=null==c?s+h+d:h+d,t+=3,r+=3}return l/n},requiresAlignment:()=>!0},"relative-to-scene":{applyElevationAlignmentBuffer:function(e,t,i,r,n,a,o,s){let l=0,d=s.calculateOffsetRenderUnits(o),c=s.featureExpressionInfoContext,p=a.spatialReference;t*=3,r*=3;for(let o=0;o<n;++o){let n=e[t],o=e[t+1],s=e[t+2],h=a.getElevation(n,o,s,p,"scene")??0;l+=h,i[r]=n,i[r+1]=o,i[r+2]=null==c?s+h+d:h+d,t+=3,r+=3}return l/n},requiresAlignment:()=>!0}},y=(0,a.vt)(),E=new T,b=(0,o.vt)()},78060:(e,t,i)=>{i.d(t,{Cz:()=>n,DZ:()=>o,PV:()=>a,vO:()=>r}),i(26928),i(93446),i(87155),i(15494);let r=64,n=32,a=10,o=.25},84458:(e,t,i)=>{i.d(t,{Dt:()=>c,kJ:()=>n,lM:()=>r});var r,n,a=i(81856),o=i(26847),s=i(30066),l=i(95421),d=i(4111);!function(e){e[e.Draped=0]="Draped",e[e.Screen=1]="Screen",e[e.World=2]="World",e[e.COUNT=3]="COUNT"}(r||(r={})),function(e){e[e.Center=0]="Center",e[e.Tip=1]="Tip",e[e.COUNT=2]="COUNT"}(n||(n={}));class c extends d.E{constructor(){super(...arguments),this.space=r.Screen,this.anchor=n.Center,this.occluder=!1,this.writeDepth=!1,this.hideOnShortSegments=!1,this.hasCap=!1,this.hasTip=!1,this.vvSize=!1,this.vvColor=!1,this.vvOpacity=!1,this.hasOccludees=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.textureCoordinateType=o.I.None,this.emissionSource=s.ZX.None,this.discardInvisibleFragments=!0,this.occlusionPass=!1,this.hasVvInstancing=!0,this.hasSliceTranslatedView=!0,this.objectAndLayerIdColorInstanced=!1}get draped(){return this.space===r.Draped}}(0,a._)([(0,l.W)({count:r.COUNT})],c.prototype,"space",void 0),(0,a._)([(0,l.W)({count:n.COUNT})],c.prototype,"anchor",void 0),(0,a._)([(0,l.W)()],c.prototype,"occluder",void 0),(0,a._)([(0,l.W)()],c.prototype,"writeDepth",void 0),(0,a._)([(0,l.W)()],c.prototype,"hideOnShortSegments",void 0),(0,a._)([(0,l.W)()],c.prototype,"hasCap",void 0),(0,a._)([(0,l.W)()],c.prototype,"hasTip",void 0),(0,a._)([(0,l.W)()],c.prototype,"vvSize",void 0),(0,a._)([(0,l.W)()],c.prototype,"vvColor",void 0),(0,a._)([(0,l.W)()],c.prototype,"vvOpacity",void 0),(0,a._)([(0,l.W)()],c.prototype,"hasOccludees",void 0),(0,a._)([(0,l.W)()],c.prototype,"terrainDepthTest",void 0),(0,a._)([(0,l.W)()],c.prototype,"cullAboveTerrain",void 0)},87914:(e,t,i)=>{i.d(t,{G:()=>r,Q:()=>n});let r={stableRendering:!1},n={rootOrigin:null}},89060:(e,t,i)=>{i.d(t,{KF:()=>f,MF:()=>u,VG:()=>c,g7:()=>h,gf:()=>p,o8:()=>l,q6:()=>d});var r=i(61939),n=i(92753),a=i(83048),o=i(20703);let s=()=>r.A.getLogger("esri.views.3d.layers.graphics.featureExpressionInfoUtils");function l(e){return{cachedResult:e.cachedResult,arcade:e.arcade?{func:e.arcade.func,context:e.arcade.modules.arcadeUtils.createExecContext(null,{sr:e.arcade.context.spatialReference}),modules:e.arcade.modules}:null}}async function d(e,t,i,r){let a=e?.expression;if("string"!=typeof a)return null;let s=function(e){return"0"===e?0:null}(a);if(null!=s)return{cachedResult:s};let l=await (0,o.lw)();(0,n.Te)(i);let d=l.arcadeUtils,c=d.createSyntaxTree(a);return d.dependsOnView(c)?(null!=r&&r.error("Expressions containing '$view' are not supported on ElevationInfo"),{cachedResult:0}):{arcade:{func:d.createFunction(c),context:d.createExecContext(null,{sr:t}),modules:l}}}function c(e,t,i){return e.arcadeUtils.createFeature(t.attributes,t.geometry,i)}function p(e,t){if(null!=e&&!m(e)){if(!t||!e.arcade)return void s().errorOncePerTick("Arcade support required but not provided");t._geometry&&(t._geometry=(0,a.wZ)(t._geometry)),e.arcade.modules.arcadeUtils.updateExecContext(e.arcade.context,t)}}function h(e){if(null!=e){if(m(e))return e.cachedResult;let t=e.arcade,i=t?.modules.arcadeUtils.executeFunction(t.func,t.context);return"number"!=typeof i&&(e.cachedResult=0,i=0),i}return 0}function u(e,t=!1){let i=e?.featureExpressionInfo,r=i?.expression;return t||"0"===r||(i=null),i??null}let f={cachedResult:0};function m(e){return null!=e.cachedResult}},98524:(e,t,i)=>{i.d(t,{R1:()=>o,aY:()=>n,cN:()=>a});var r=i(54919);class n{constructor(e,t=null,i=0){this.array=e,this.spatialReference=t,this.offset=i}}function a(e){return"array"in e}function o(e,t,i="ground"){if((0,r.v)(t))return e.getElevation(t.x,t.y,t.z||0,t.spatialReference,i);if(a(t)){let r=t.offset;return e.getElevation(t.array[r++],t.array[r++],t.array[r]||0,t.spatialReference??e.spatialReference,i)}return e.getElevation(t[0],t[1],t[2]||0,e.spatialReference,i)}}}]);