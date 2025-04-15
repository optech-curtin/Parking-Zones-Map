"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1793],{1793:(e,i,a)=>{a.r(i),a.d(i,{default:()=>l});var s=a(81856),t=a(57845),d=a(45257);a(61939),a(33638),a(32391);var r=a(12709),n=a(57628);let u=class extends n.default{initialize(){this.addHandles([(0,d.wB)(()=>this.view.scale,()=>this._update(),d.Vh)],"constructor")}isUpdating(){let e=this.layer.sublayers.some(e=>null!=e.renderer),i=this._commandsQueue.updateTracking.updating,a=null!=this._updatingRequiredPromise,s=!this._workerProxy,d=this.dataUpdating,r=e&&(i||a||s||d);return(0,t.A)("esri-2d-log-updating")&&console.log(`Updating FLV2D: ${r}
  -> hasRenderer ${e}
  -> hasPendingCommand ${i}
  -> updatingRequiredFields ${a}
  -> updatingProxy ${s}
  -> updatingPipeline ${d}
`),r}},l=u=(0,s._)([(0,r.$)("esri.views.2d.layers.SubtypeGroupLayerView2D")],u)}}]);