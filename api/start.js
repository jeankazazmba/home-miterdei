import {respond,members,cleanEmail,cleanName,publicReady,hash,hmac,otp,challengeFor,sendMail,safe} from './_shared.js';
export default async function handler(req,res) {
  if(req.method!=='POST') return respond(res,405,{error:'Méthode non autorisée'});
  if(!publicReady) return respond(res,503,{error:'Les inscriptions ne sont pas encore ouvertes. Le prix et le service de confirmation doivent être configurés.'});
  if(Number(req.headers['content-length']||0)>4096) return respond(res,413,{error:'Requête trop volumineuse'});
  const body=typeof req.body==='object'?req.body:{};
  const email=cleanEmail(body.email),name=cleanName(body.name);
  if(body.website) return respond(res,400,{error:'Requête refusée'});
  if(!email || !name || body.terms!==true || body.commitment!==true) return respond(res,400,{error:'Nom, adresse e-mail et consentements requis.'});
  try {
    const current=await members();
    if(current.paths.includes(`members/${hash(email)}.json`))return respond(res,409,{error:'Cette adresse e-mail est déjà inscrite.'});
    const code=otp();
    const now=Date.now();
    const payload={email,name,batteryOptIn:body.batteryOptIn===true,time:now,digest:hmac(`${email}:${now}:${code}`)};
    const challenge=challengeFor(payload);
    await sendMail(email,'Votre code de vérification • Home Miterdei',`<div style="font:16px Arial,sans-serif;color:#151515;line-height:1.7"><p>Bonjour ${safe(name)},</p><h2>Confirmez votre adresse e-mail</h2><p>Votre code de vérification :</p><p style="font-size:35px;letter-spacing:8px;font-weight:800">${code}</p><p>Ce code expire dans 10 minutes. Si vous n'avez pas demandé cette inscription, ignorez ce message.</p><p>— Home Miterdei</p></div>`);
    return respond(res,200,{challenge,expiresIn:600});
  } catch(e){console.error('start',e);return respond(res,502,{error:'Impossible d’envoyer le code de vérification actuellement.'});}
}
