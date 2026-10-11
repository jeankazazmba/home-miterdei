import {respond,members,PRICE,CURRENCY,BLOB_READY,MAIL_READY,publicReady} from './_shared.js';
export default async function handler(req,res) {
  if(req.method!=='GET') return respond(res,405,{error:'Méthode non autorisée'});
  try {
    const {count}=await members();
    respond(res,200,{count,price:PRICE,currency:CURRENCY,share:PRICE>0&&count>0?Math.ceil(PRICE*100/count)/100:null,ready:publicReady,storageReady:BLOB_READY,emailReady:MAIL_READY,product:'Starlink Standard',updatedAt:new Date().toISOString()});
  } catch(e){console.error('status',e);respond(res,503,{error:'Statistiques momentanément indisponibles',ready:false});}
}
