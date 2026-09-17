import * as T from '../vendor/three/three.module.js';
import {OrbitControls} from '../vendor/three/OrbitControls.js';
const canvas=document.querySelector('#house'), status=document.querySelector('#status');
try {
const renderer=new T.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
const scene=new T.Scene();scene.background=new T.Color('#cbd4d2');
const camera=new T.PerspectiveCamera(55,1,.08,150);camera.position.set(15,11,18);
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.target.set(0,3,0);controls.maxDistance=36;controls.minDistance=.1;controls.maxPolarAngle=Math.PI*.92;
scene.add(new T.HemisphereLight(0xeaf5ff,0x8c7055,2.7));
const sun=new T.DirectionalLight(0xffeed5,3.5);sun.position.set(8,16,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15});sun.shadow.bias=-.001;scene.add(sun);
const mat=(c,rough=.7)=>new T.MeshStandardMaterial({color:c,roughness:rough});
const plaster=mat('#e6dfcf'),wood=mat('#a8774d'),dark=mat('#333b39'),linen=mat('#ddd4be'),green=mat('#718363'),stone=mat('#bab9ad');
const glass=new T.MeshStandardMaterial({color:'#a9cbd0',transparent:true,opacity:.2,roughness:.15,depthWrite:false});
const shell=new T.Group();scene.add(shell);
function box(w,h,d,x,y,z,m=plaster,parent=scene){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function ball(r,x,y,z,m){const o=new T.Mesh(new T.SphereGeometry(r,16,12),m);o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o;}
box(42,.2,42,0,-.3,0,mat('#81917b'));box(10,.25,12,0,-.08,0,stone);
for(const y of [0,3.2]){
 box(8,.16,10,0,y,0,wood);
 box(.18,3.1,10,-4,y+1.6,0,plaster,shell);box(.18,3.1,10,4,y+1.6,0,plaster,shell);
 box(8,3.1,.18,0,y+1.6,-5,plaster,shell);
 for(const x of [-3.8,0,3.8])box(.2,3.1,.22,x,y+1.6,5,dark,shell);
 box(8,.35,.22,0,y+.25,5,dark,shell);box(8,.35,.22,0,y+3,5,dark,shell);
 box(7.5,2.5,.07,0,y+1.65,5,glass,shell);
}
box(8.5,.25,10.5,0,6.5,0,dark,shell);
// Timber screen on the upper facade.
for(let x=-3.7;x<-1;x+=.2)box(.07,2.6,.16,x,4.85,5.2,wood,shell);
// Ground-floor living room, kitchen and dining area.
box(3,.45,1.15,-1.7,.45,2,linen);box(3,.65,.25,-1.7,.95,1.5,linen);
for(const x of [-3.15,-.25])box(.2,.6,1.15,x,.8,2,linen);
box(3.7,.025,3,-1.5,.1,2.6,mat('#a7a48e'));box(1.5,.12,.75,-1.4,.5,3.25,wood);box(.12,.4,.55,-1.4,.25,3.25,dark);
box(3.5,.9,.75,-1.7,.5,-4.3,wood);box(3.6,.09,.85,-1.7,.98,-4.3,stone);
box(.8,2.5,.85,-3.4,1.3,-3.7,dark);box(2.3,.95,.9,-1.4,.55,-2.3,wood);box(2.5,.09,1.05,-1.4,1.06,-2.3,stone);
box(1.6,.12,1.2,1.9,.9,-1,wood);
for(const x of [1.3,2.5])for(const z of [-1.9,0]){box(.5,.12,.5,x,.5,z,linen);box(.5,.55,.1,x,.8,z+(z<0?-.2:.2),wood);box(.1,.45,.1,x,.25,z,dark);}
// Staircase with treads and a landing.
for(let i=0;i<16;i++)box(1.1,.2,.3,3, .2+i*.2,3.8-i*.3,wood);
// Upstairs bedroom and bathroom.
box(.12,2.8,6,0,4.65,-1.9);box(3.8,2.8,.12,-2,4.65,-1.2);
box(2,.35,2.3,-2,3.5,1.2,wood);box(1.95,.25,2.2,-2,3.8,1.2,linen);box(2.2,1.15,.15,-2,4,0,wood);
for(const x of [-2.5,-1.5])box(.7,.15,.45,x,4,.4,plaster);
box(1.96,.08,1.15,-2,3.98,1.7,green);box(.6,.6,.6,-3.4,3.6,.3,wood);
box(1.6,.55,.8,-2,3.6,-3.5,plaster);box(1.35,.07,.6,-2,3.9,-3.5,stone);box(1.6,.9,.08,-2,4.8,-4.85,glass);
box(1.6,2,.08,-2,4.3,-2.4,glass);
// Terrace and planting.
box(8,.12,3.2,0,0,6.8,wood);
for(const x of [-3.2,3.2]){box(.6,.7,.6,x,.4,7.6,stone);ball(.65,x,1.15,7.6,green);}
for(const x of [-9,9])for(const z of [-6,7]){box(.3,2,.3,x,.8,z,wood);ball(1.5,x,2.6,z,green);}
const views=[
['Снаружи',[15,10,18],[0,3,0],'Вращайте дом пальцем или мышью. Колесо / жест двумя пальцами — масштаб.'],
['Гостиная',[-1.3,1.65,4.3],[-1.4,1.5,0],'Панорамное остекление, зона отдыха и открытая кухня.'],
['Кухня',[1,1.65,-.5],[-1.8,1.3,-3.5],'Кухонный остров и обеденная зона на первом этаже.'],
['Лестница',[1,1.7,4],[3,2.3,0],'Лестница связывает общественную и приватную части дома.'],
['Спальня',[-.6,4.9,3.9],[-2,4.2,.7],'Второй этаж: спальня с тёплыми деревянными поверхностями.'],
['Ванная',[-.8,4.85,-1.7],[-2.4,4.2,-4],'Ванная комната второго этажа.'],
['Терраса',[0,1.7,8],[0,1.5,4],'Открытая терраса перед гостиной.']];
let active=0,cut=false;
function go(i){active=i;const [name,pos,target,copy]=views[i];camera.position.fromArray(pos);controls.target.fromArray(target);controls.enablePan=i===0;controls.minDistance=i===0?9:.1;controls.maxDistance=i===0?36:5;document.querySelector('#room').textContent=name;document.querySelector('#copy').textContent=copy;document.querySelectorAll('[data-view]').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));shell.visible=!cut;controls.update();}
views.forEach((v,i)=>{const b=document.createElement('button');b.textContent=v[0];b.dataset.view=i;b.onclick=()=>go(i);document.querySelector('#rooms').append(b);});
document.querySelector('#cut').onclick=e=>{cut=!cut;shell.visible=!cut;e.currentTarget.setAttribute('aria-pressed',String(cut));};
document.querySelector('#reset').onclick=()=>go(active);
document.querySelector('#enter').onclick=()=>go(1);
document.querySelector('#full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{status.textContent='Полноэкранный режим недоступен в этом браузере.';}};
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();status.textContent='3D-контекст потерян. Обновите страницу.';});
function resize(){renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();go(0);
status.textContent='3D-модель · концепция интерьера';
renderer.setAnimationLoop(()=>{if(document.hidden)return;controls.update();renderer.render(scene,camera);});
}catch(error){console.error(error);status.textContent='3D недоступен. Попробуйте другой браузер или включите аппаратное ускорение.';document.querySelector('#fallback').hidden=false;}
