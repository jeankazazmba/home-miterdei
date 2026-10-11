import {respond,validateChallenge,hmac,hash,members,saveMember,sendMail,safe,PRICE,publicReady} from './_shared.js';
export default async function handler(req,res){
  if(req.method!=='POST') return respond(res,405,{error:'Méthode non autorisée'});
  if(!publicReady) return respond(res,503,{error:'Les inscriptions ne sont pas disponibles actuellement.'});
  const body=typeof req.body==='object'?req.body:{};
  const payload=validateChallenge(body.challenge);
  if(!payload||!/^\d{8}$/.test(body.code||'')||hmac(`${payload.email}:${payload.time}:${body.code}`)!==payload.digest)return respond(res,400,{error:'Code incorrect ou expiré.'});
  try {
    const before=await members();
    if(before.paths.includes(`members/${hash(payload.email)}.json`))return respond(res,409,{error:'Cette adresse est déjà inscrite.'});
    await saveMember(payload);
    const {count}=await members();
    const share=count>0?Math.ceil(PRICE*100/count)/100:0;
    let receiptSent=true;
    try {await sendMail(payload.email,'Bienvenue • Votre souscription Home Miterdei',`<div style="font:16px Arial,sans-serif;color:#151515;line-height:1.7"><h2>Votre participation est enregistrée.</h2><p>Bonjour ${safe(payload.name)}, votre adresse a été vérifiée et notre souscription au kit Standard est enregistrée.</p><p><strong>${count}</strong> personne(s) inscrite(s) actuellement.</p><p>Quote-part indicative : <strong>${share.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} $ US</strong>.</p><p>Ce montant évolue avec les souscriptions. Le montant définitif, les modalités de paiement et la date d'achat seront annoncés avant toute collecte.</p><p>Aucun paiement n'a été effectué sur ce site.</p><p>— Home Miterdei</p></div>`);}catch(e){receiptSent=false;console.error('receipt',e);}
    return respond(res,200,{success:true,count,share,receiptSent});
  }catch(e){console.error('confirm',e);return respond(res,500,{error:'Impossible de finaliser votre inscription. Réessayez ou contactez l’organisateur.'});}
}
