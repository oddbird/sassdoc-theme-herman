!function(deparam){if("function"==typeof require&&"object"==typeof exports&&"object"==typeof module){try{var jquery=require("jquery")}catch(e){}module.exports=deparam(jquery)}else if("function"==typeof define&&define.amd)define(["jquery"],function(e){return deparam(e)});else{var global;try{global=eval("this")}catch(e){global=window}global.deparam=deparam(global.jQuery)}}(function(e){var t=function(e,t){var r={},o={true:!0,false:!1,null:null};return e?(e.replace(/\+/g," ").split("&").forEach(function(e){var a,l=e.split("="),n=decodeURIComponent(l[0]),i=r,p=0,c=n.split("]["),u=c.length-1;if(/\[/.test(c[0])&&/\]$/.test(c[u])?(c[u]=c[u].replace(/\]$/,""),u=(c=c.shift().split("[").concat(c)).length-1):u=0,2===l.length)if(a=decodeURIComponent(l[1]),t&&(a=a&&!isNaN(a)&&+a+""===a?+a:"undefined"===a?void 0:void 0!==o[a]?o[a]:a),u)for(;p<=u;p++)i=i[n=""===c[p]?i.length:c[p]]=p<u?i[n]||(c[p+1]&&isNaN(c[p+1])?{}:[]):a;else"[object Array]"===Object.prototype.toString.call(r[n])?r[n].push(a):!{}.hasOwnProperty.call(r,n)?r[n]=a:r[n]=[r[n],a];else n&&(r[n]=t?void 0:"")}),r):r};return e&&(e.prototype.deparam=e.deparam=t),t});