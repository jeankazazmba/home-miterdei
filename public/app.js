(() => {
  // Home Miterdei: session experience, independent from a confirmed subscription.
  const welcome=document.getElementById('welcomeOverlay');
  const welcomeForm=document.getElementById('welcomeForm');
  const welcomeFirst=document.getElementById('welcomeFirst');
  const welcomeLast=document.getElementById('welcomeLast');
  const nameError=document.getElementById('welcomeError');
  let profile=null;
  const profileKey='miterdei-profile-v1';
  const profileGet=()=>{try{return localStorage.getItem(profileKey)}catch{return null}};
  const profileSet=value=>{try{localStorage.setItem(profileKey,value)}catch{}};
  const sanitizeName=value=>String(value||'').trim().replace(/\s+/g,' ').slice(0,40).replace(/[<>]/g,'');
  function showWelcome(edit=false){
    document.body.classList.add('profile-locked');
    welcome.classList.remove('is-hidden');
    welcome.removeAttribute('aria-hidden');
    if(edit && profile){welcomeFirst.value=profile.first;welcomeLast.value=profile.last;}
    document.getElementById('welcomeTitle').innerHTML=edit?'Votre Home.<br/><em>Votre nom.</em>':'Tout commence<br/><em>avec vous.</em>';
    welcome.querySelector('.welcome-submit').firstChild.textContent=edit?'Enregistrer mon nom ':'Entrer dans mon Home ';
    requestAnimationFrame(()=>welcomeFirst.focus({preventScroll:true}));
  }
  function applyProfile(info){
    profile=info;
    document.getElementById('greetingName').textContent=', '+info.first;
    document.getElementById('userLabel').textContent=info.first;
    document.getElementById('userAvatar').textContent=info.first.charAt(0).toUpperCase();
    document.getElementById('joinGreeting').textContent=info.first+', votre place est ici.';
    document.getElementById('fullName').value=info.first+' '+info.last;
    welcome.classList.add('is-hidden');
    welcome.setAttribute('aria-hidden','true');
    document.body.classList.remove('profile-locked');
  }
  try{
    const stored=JSON.parse(profileGet()||'null');
    if(stored && sanitizeName(stored.first).length>=2 && sanitizeName(stored.last).length>=2){
      applyProfile({first:sanitizeName(stored.first),last:sanitizeName(stored.last)});
    }else showWelcome();
  }catch{showWelcome()}
  welcomeForm.addEventListener('submit',e=>{
    e.preventDefault();
    const first=sanitizeName(welcomeFirst.value),last=sanitizeName(welcomeLast.value);
    if(first.length<2||last.length<2){nameError.textContent='Indiquez un prénom et un nom valides.';return;}
    nameError.textContent='';
    const next={first,last};profileSet(JSON.stringify(next));applyProfile(next);
  });
  document.getElementById('editProfile').addEventListener('click',()=>showWelcome(true));
  const root=document.documentElement;
  const themeButton=document.getElementById('themeSwitch');
  const savedTheme=localStorage.getItem('miterdei-theme');
  if(savedTheme==='light'||savedTheme==='dark')root.dataset.theme=savedTheme;
  function updateTheme(){themeButton.setAttribute('aria-label',root.dataset.theme==='dark'?'Passer en thème clair':'Passer en thème sombre');document.querySelector('meta[name="theme-color"]').content=root.dataset.theme==='dark'?'#08090b':'#f5f5f5';}
  updateTheme();
  themeButton.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('miterdei-theme',root.dataset.theme);updateTheme();});
  const state={count:0,price:530,ready:false,challenge:null,refreshing:false};
  const money=n=>new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
  const usd=n=>`${money(n)} $`;
  const form=document.getElementById('joinForm'),msg=document.getElementById('formMessage'),submit=document.getElementById('submitBtn');
  const dialog=document.getElementById('verifyDialog'),verifySubmit=document.getElementById('verifySubmit'),otpInput=document.getElementById('otpInput'),verifyError=document.getElementById('verifyError');
  function message(text,error=false){msg.textContent=text;msg.classList.toggle('error',error);msg.classList.toggle('success',!error);}
  function display(){
    document.querySelectorAll('[data-count]').forEach(el=>el.textContent=money(state.count));
    document.querySelectorAll('[data-price]').forEach(el=>el.textContent=state.price>0?usd(state.price):'À définir');
    document.querySelectorAll('[data-share]').forEach(el=>el.textContent=state.price>0&&state.count>0?money(Math.ceil(state.price*100/state.count)/100):'—');
    document.querySelectorAll('[data-projected]').forEach(el=>el.textContent=state.price>0?money(Math.ceil(state.price*100/(state.count+1))/100):'—');
    submit.disabled=!state.ready;
    if(!state.ready && !state.refreshing){message('Notre kit Standard coûte 530 $ US. Les inscriptions seront ouvertes après activation de la vérification e-mail et du stockage sécurisé.');}
    else if(state.ready && !state.challenge && !form.dataset.active){message('Aucun paiement demandé à l’inscription.');}
  }
  async function refresh(){
    if(state.refreshing)return;
    state.refreshing=true;
    try{const res=await fetch('/api/status',{cache:'no-store'});if(!res.ok)throw new Error('Status indisponible');const data=await res.json();state.count=data.count||0;state.price=data.price||530;state.ready=Boolean(data.ready);state.refreshing=false;display();}catch(e){state.refreshing=false;state.ready=false;display();message('Le serveur est momentanément indisponible. Réessayez dans quelques instants.',true);}
  }
  refresh();setInterval(refresh,10000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
  async function api(path,data){const res=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});let body={};try{body=await res.json()}catch{}if(!res.ok)throw new Error(body.error||'Une erreur est survenue.');return body;}
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    if(!document.getElementById('termsCheck').checked||!document.getElementById('commitCheck').checked){message('Veuillez accepter les deux conditions obligatoires.',true);return;}
    if(!state.ready){message('Les souscriptions ne sont pas encore ouvertes.',true);return;}
    submit.disabled=true;submit.firstChild.textContent='Envoi du code… ';form.dataset.active='yes';
    try{
      const email=document.getElementById('email').value.trim();
      const r=await api('/api/start',{name:document.getElementById('fullName').value.trim(),email,terms:true,commitment:true,batteryOptIn:document.getElementById('batteryCheck').checked,website:document.getElementById('website').value});
      state.challenge=r.challenge;document.getElementById('verifyEmail').textContent=email;verifyError.textContent='';otpInput.value='';dialog.showModal();setTimeout(()=>otpInput.focus(),100);message('Un code vient de vous être envoyé par e-mail.');
    }catch(e){message(e.message,true)}finally{submit.firstChild.textContent='Recevoir mon code de vérification ';submit.disabled=!state.ready;}
  });
  verifySubmit.addEventListener('click',async()=>{
    const code=otpInput.value.trim();if(!/^\d{8}$/.test(code)){verifyError.textContent='Saisissez un code de 8 chiffres.';return;}
    verifySubmit.disabled=true;verifySubmit.firstChild.textContent='Vérification… ';
    try{
      const result=await api('/api/confirm',{challenge:state.challenge,code});
      state.challenge=null;dialog.close();form.reset();delete form.dataset.active;
      message(result.receiptSent?'Inscription confirmée ! Un e-mail de bienvenue vous a été envoyé.':'Inscription confirmée ! Le message de bienvenue sera envoyé ultérieurement.');
      await refresh();document.getElementById('rejoindre').scrollIntoView({behavior:'smooth'});
    }catch(e){verifyError.textContent=e.message}finally{verifySubmit.disabled=false;verifySubmit.firstChild.textContent='Confirmer mon inscription ';}
  });
  otpInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();verifySubmit.click();}});
  // Localisation demandée explicitement : aucune coordonnée transmise ni sauvegardée.
  const geoButton=document.getElementById('findLocation'), geoStatus=document.getElementById('geoStatus');
  if(geoButton && geoStatus){
    geoButton.addEventListener('click',()=>{
      if(!navigator.geolocation){geoStatus.textContent='Votre navigateur ne propose pas la géolocalisation.';return;}
      geoButton.disabled=true;geoStatus.textContent='Autorisation de localisation en attente…';
      navigator.geolocation.getCurrentPosition(pos=>{
        const lat=pos.coords.latitude.toFixed(2),lng=pos.coords.longitude.toFixed(2);
        geoStatus.textContent=`Votre position approximative : ${lat}°, ${lng}° · Le modèle 3D reste fictif.`;
        geoButton.disabled=false;
      },err=>{
        geoStatus.textContent=err.code===1?'Accès refusé. Aucune position collectée.':'Position indisponible. Réessayez plus tard.';
        geoButton.disabled=false;
      },{enableHighAccuracy:false,timeout:12000,maximumAge:60000});
    });
  }

})();
