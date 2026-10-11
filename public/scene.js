// Home Miterdei — minimal 3D architectural illustration.
// No real geolocation is collected or inferred.
const container = document.getElementById('sceneWrap');
const canvas = document.getElementById('homeCanvas');
const fallback = document.getElementById('sceneFallback');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (container && canvas) {
  try {
    // Three.js is loaded on demand to keep the initial page fast.
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
    camera.position.set(10, 8.5, 13);
    camera.lookAt(0, 1.05, 0);
    const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    const group = new THREE.Group();
    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 2.0));
    const area = new THREE.DirectionalLight(0xffffff, 3.6);area.position.set(4,11,7);scene.add(area);
    const back = new THREE.DirectionalLight(0xb2bbc9,1.9);back.position.set(-6,5,-8);scene.add(back);
    const material = (color,opts={})=>new THREE.MeshStandardMaterial({color,metalness:.26,roughness:.39,...opts});
    const palette={platform:material(0x31343a,{metalness:.1,roughness:.7}),walls:material(0xeeeeee,{metalness:.15,roughness:.52}),roof:material(0x9b9fa7,{metalness:.45,roughness:.3}),dark:material(0x141518,{metalness:.3}),accent:material(0xffffff,{emissive:0x333333,emissiveIntensity:.4}),glass:material(0x525a66,{metalness:.75,roughness:.09,transparent:true,opacity:.87}),shadow:material(0x191b21)};
    const rounded=(w,h,d,r=0.1)=>{
      const shape = new THREE.Shape(),x=-w/2,y=-h/2;
      shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);
      shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);
      shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
      const geom=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:5});
      geom.translate(0,0,-d/2);return geom;
    };
    const box=(w,h,d,mat,x,y,z)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);group.add(mesh);return mesh;};
    // Raised residential plot and fine elevation lines.
    const base=new THREE.Mesh(rounded(8.7,6.2,.33,.4),palette.platform);
    base.rotation.x=-Math.PI/2;base.position.y=-.22;group.add(base);
    const surface=material(0x53565e,{roughness:.82,metalness:.05});
    const top=box(8.15,.06,5.6,surface,0,-.035,0);
    // Lane and garden paving.
    const drive=box(2.3,.018,2.65,material(0x868890,{roughness:.85}),0,0,1.49);
    for(let i=-3;i<=3;i++){
      const grass=box(.63,.025,.065,palette.roof, -3.2+i*.16,.012,-2.48+i*.22);
      grass.rotation.y=.25;
    }
    // Architectural home: foundations, facade, flat second volume.
    box(4.75,.23,3.65,palette.dark,0,.18,-.38);
    box(4.48,2.65,3.32,palette.walls,0,1.62,-.38);
    box(4.8,.22,3.7,palette.roof,0,3.02,-.38);
    box(2.1,.85,1.8,palette.walls,-.82,3.54,-.48);
    box(2.4,.14,2.1,palette.roof,-.82,4.04,-.48);
    // Main entry and windows on near facade.
    box(1.05,1.85,.075,palette.dark,.17,1.19,1.32);
    box(.13,.13,.085,palette.accent,.55,1.10,1.37);
    for(const x of [-1.48,1.56]){
      box(.92,1.1,.09,palette.dark,x,1.8,1.33);
      box(.76,.92,.12,palette.glass,x,1.8,1.39);
      box(.055,1,.13,palette.walls,x,1.8,1.45);
      box(.91,.045,.14,palette.walls,x,1.8,1.47);
    }
    box(1.25,.44,.09,palette.glass,-.82,3.5,.48);
    for(const x of [-2.15,2.15])for(const z of [-1.8,1.1])box(.1,3.05,.12,palette.roof,x,1.53,z);

    // Vie autour de notre Home : arbres sobres, sentier et éclairage d'entrée.
    const treeTrunk=material(0x62676c,{roughness:.88,metalness:.03});
    const treeLeaf=material(0xaab0b8,{roughness:.85,metalness:.02});
    function addTree(x,z,height=1.25){
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.045,.065,height*.58,9),treeTrunk);
      trunk.position.set(x,height*.30,z);group.add(trunk);
      const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(height*.35,1),treeLeaf);
      crown.position.set(x,height*.75,z);group.add(crown);
    }
    addTree(-3.48,-1.8,1.6);addTree(3.42,-1.85,1.3);addTree(3.46,.92,1.15);
    for(let i=0;i<5;i++)box(.82,.014,.33,palette.roof,.1,.014,2.55-i*.28);
    const porch=new THREE.PointLight(0xffffff,1.25,3.5);porch.position.set(.4,2.23,1.65);group.add(porch);
    const porchLamp=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),palette.accent);
    porchLamp.position.copy(porch.position);group.add(porchLamp);

    // Roof-mounted receiver: mast, dish bowl and concentric network waves.
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(.048,.08,1.05,14),palette.roof);mast.position.set(1.23,3.61,-.98);group.add(mast);
    const dish=new THREE.Mesh(new THREE.SphereGeometry(.69,30,14,0,Math.PI*2,0,Math.PI/3.3),new THREE.MeshStandardMaterial({color:0xf9f9f9,metalness:.4,roughness:.25,side:THREE.DoubleSide}));
    dish.scale.y=.47;dish.rotation.set(.58,0,-.46);dish.position.set(1.4,4.12,-.98);group.add(dish);
    const disk=new THREE.Mesh(new THREE.SphereGeometry(.13,16,8),palette.dark);disk.position.set(1.42,4.3,-.9);group.add(disk);
    const rings=[];
    for(let i=0;i<3;i++){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(1+i*.42,.018,8,100,Math.PI*1.35),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.36-i*.08,depthWrite:false}));
      ring.rotation.set(-.45,0,-.25);ring.position.set(1.3,4.45+i*.32,-1);group.add(ring);rings.push(ring);
    }
    // Discreet local point indicator.
    const pin = new THREE.Mesh(new THREE.ConeGeometry(.16,.36,18),palette.accent);pin.rotation.x=Math.PI;pin.position.set(-3,.8,.2);group.add(pin);
    const pinOrb=new THREE.Mesh(new THREE.SphereGeometry(.21,20,14),palette.accent);pinOrb.position.set(-3,1.09,.2);group.add(pinOrb);
    const pinRing=new THREE.Mesh(new THREE.TorusGeometry(.46,.018,6,60),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.65}));pinRing.rotation.x=-Math.PI/2;pinRing.position.set(-3,.03,.2);group.add(pinRing);
    // White/dark floor grid lines, distinct from a real map.
    const grid=new THREE.GridHelper(19,26,0x717680,0x51545a);
    grid.position.y=-.42;scene.add(grid);
    const root = document.documentElement;
    const applyTheme=()=>{
      const light=root.dataset.theme==='light';
      palette.platform.color.setHex(light?0xb6bbc4:0x30343b);
      surface.color.setHex(light?0xe3e5e9:0x565960);
      palette.dark.color.setHex(light?0x3b3d42:0x141518);
      palette.roof.color.setHex(light?0x7c8188:0x9b9fa7);
      grid.material.opacity=light?.11:.18;grid.material.transparent=true;
    };
    applyTheme();
    // Manipulation interactive : glisser pour faire pivoter, pincer/molette pour zoomer,
    // double-clic ou bouton pour revenir à la vue d'origine. Aucune coordonnée GPS n'est utilisée.
    const cameraTarget=new THREE.Vector3(0,1.25,0);
    const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
    const initial={yaw:Math.atan2(10,13),pitch:0.44,zoom:1};
    let yaw=initial.yaw,pitch=initial.pitch,zoom=initial.zoom;
    let targetYaw=yaw,targetPitch=pitch,targetZoom=zoom;
    let baseRadius=19,frame=0,lastTime=0;
    const pointers=new Map();
    let pinchDistance=0;
    const startMessage=document.getElementById('sceneControlHint');
    const updateHint=message=>{if(startMessage) startMessage.textContent=message;};
    const fit=()=>{
      const rect=container.getBoundingClientRect();
      if(rect.width<2||rect.height<2)return;
      baseRadius=rect.width<500?23:19;
      camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();
      renderer.setSize(rect.width,rect.height,false);
      renderFrame();
    };
    function renderFrame(){
      const r=baseRadius*zoom;
      camera.position.set(cameraTarget.x+r*Math.cos(pitch)*Math.sin(yaw),cameraTarget.y+r*Math.sin(pitch),cameraTarget.z+r*Math.cos(pitch)*Math.cos(yaw));
      camera.lookAt(cameraTarget);
      renderer.render(scene,camera);
    }
    const stepZoom=factor=>{targetZoom=clamp(targetZoom*factor,.53,1.65);if(reduced){zoom=targetZoom;renderFrame();}};
    document.getElementById('rotateHome')?.addEventListener('click',()=>{
      targetYaw+=Math.PI/2;updateHint('Nous explorons une autre façade du Home.');
      if(reduced){yaw=targetYaw;renderFrame();}
    });
    document.getElementById('zoomInHome')?.addEventListener('click',()=>stepZoom(.82));
    document.getElementById('zoomOutHome')?.addEventListener('click',()=>stepZoom(1.22));
    const reset=()=>{
      targetYaw=initial.yaw;targetPitch=initial.pitch;targetZoom=1;
      updateHint('Vue initiale restaurée.');
      if(reduced){yaw=targetYaw;pitch=targetPitch;zoom=targetZoom;renderFrame();}
    };
    document.getElementById('resetHome')?.addEventListener('click',reset);
    const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    canvas.style.touchAction='none';
    canvas.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse' && event.button!==0)return;
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
      canvas.classList.add('is-dragging');
      if(pointers.size===2){const pts=[...pointers.values()];pinchDistance=distance(pts[0],pts[1]);}
      updateHint('Faites pivoter ou pincez pour zoomer.');
    });
    canvas.addEventListener('pointermove',event=>{
      if(!pointers.has(event.pointerId))return;
      const prev=pointers.get(event.pointerId);
      pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
      if(pointers.size===1){
        targetYaw-=(event.clientX-prev.x)*.009;
        targetPitch=clamp(targetPitch+(event.clientY-prev.y)*.006,.14,1.25);
      }else if(pointers.size===2){
        const pts=[...pointers.values()];const next=distance(pts[0],pts[1]);
        if(pinchDistance>0 && next>0)stepZoom(pinchDistance/next);
        pinchDistance=next;
      }
      if(reduced){yaw=targetYaw;pitch=targetPitch;zoom=targetZoom;renderFrame();}
    });
    const endPointer=event=>{
      pointers.delete(event.pointerId);
      if(canvas.hasPointerCapture?.(event.pointerId))canvas.releasePointerCapture(event.pointerId);
      if(pointers.size<2)pinchDistance=0;
      if(!pointers.size)canvas.classList.remove('is-dragging');
    };
    canvas.addEventListener('pointerup',endPointer);
    canvas.addEventListener('pointercancel',endPointer);
    canvas.addEventListener('lostpointercapture',event=>{pointers.delete(event.pointerId);if(!pointers.size)canvas.classList.remove('is-dragging');});
    canvas.addEventListener('wheel',event=>{
      event.preventDefault();
      stepZoom(event.deltaY>0?1.085:.922);
      updateHint('Zoom ajusté.');
    },{passive:false});
    canvas.addEventListener('dblclick',reset);
    canvas.addEventListener('keydown',event=>{
      const steps={ArrowLeft:[-.17,0],ArrowRight:[.17,0],ArrowUp:[0,.11],ArrowDown:[0,-.11]};
      if(steps[event.key]){
        event.preventDefault();const [dyaw,dpitch]=steps[event.key];targetYaw+=dyaw;targetPitch=clamp(targetPitch+dpitch,.14,1.25);
      }else if(event.key==='+'||event.key==='='){event.preventDefault();stepZoom(.85);}
      else if(event.key==='-'){event.preventDefault();stepZoom(1.15);}
      else if(event.key==='0'){event.preventDefault();reset();}
      else return;
      if(reduced){yaw=targetYaw;pitch=targetPitch;zoom=targetZoom;renderFrame();}
    });
    new ResizeObserver(fit).observe(container);fit();
    fallback?.classList.add('is-ready');
    // Inertie douce inspirée des interactions Apple : arrêt automatique hors de l'onglet.
    const tick=time=>{
      const dt=Math.min(3,(time-lastTime||16)/16);lastTime=time;
      const damping=1-Math.pow(.84,dt);
      yaw+=(targetYaw-yaw)*damping;
      pitch+=(targetPitch-pitch)*damping;
      zoom+=(targetZoom-zoom)*damping;
      const t=time*.001;
      pinOrb.position.y=1.09+Math.sin(t*1.5)*.04;
      rings.forEach((r,i)=>{r.material.opacity=.23+.06*Math.sin(t+i);});
      renderFrame();
      frame=requestAnimationFrame(tick);
    };
    const observer=new MutationObserver(()=>{applyTheme();renderFrame();});
    observer.observe(root,{attributes:true,attributeFilter:['data-theme']});
    if(!reduced){
      frame=requestAnimationFrame(tick);
      document.addEventListener('visibilitychange',()=>{
        if(document.hidden){cancelAnimationFrame(frame);}else{lastTime=0;cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);}
      });
    }else renderFrame();

  } catch (err){console.warn('3D unavailable, fallback shown',err);}
}
