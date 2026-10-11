import { createHash, createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { list, put } from '@vercel/blob';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const BLOB_READY = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
export const MAIL_READY = Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
export const PRICE = Math.max(0, Number(process.env.KIT_PRICE_USD || 530));
export const CURRENCY = 'USD';
export const SECRET = process.env.SIGNUP_SECRET || '';
export const CONTACT_EMAIL = process.env.ADMIN_CONTACT_EMAIL || 'bagumakazamba@gmail.com';
export const publicReady = BLOB_READY && MAIL_READY && PRICE > 0 && SECRET.length >= 32;

export const hash = value => createHash('sha256').update(value).digest('hex');
export const hmac = value => createHmac('sha256', SECRET).update(value).digest('hex');
export const cleanEmail = value => typeof value === 'string' && value.length < 255 && EMAIL.test(value.trim()) ? value.trim().toLowerCase() : null;
export const cleanName = value => typeof value === 'string' && value.trim().length >= 2 && value.trim().length <= 80 && !/[<>\r\n]/.test(value) ? value.trim().replace(/\s+/g,' ') : null;
export function respond(res, status, body) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.status(status).json(body);
}
export function readBody(req) {
  if (typeof req.body === 'object' && req.body !== null) return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}
export function challengeFor(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${data}.${hmac(data)}`;
}
export function validateChallenge(challenge) {
  if (typeof challenge !== 'string' || challenge.length > 1800) return null;
  const [data, signature, extra] = challenge.split('.');
  if (extra || !data || !signature || signature.length !== 64) return null;
  const actual = Buffer.from(hmac(data),'hex');
  const claimed = Buffer.from(signature,'hex');
  if (claimed.length !== actual.length || !timingSafeEqual(actual, claimed)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data,'base64url').toString('utf-8'));
    if (!Number.isFinite(payload.time) || Date.now() - payload.time > 10*60*1000 || Date.now() < payload.time || !payload.email) return null;
    return payload;
  } catch { return null; }
}
export async function members() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return { count: 0, paths: [] };
  let cursor; let count = 0; let pages = 0; const paths=[];
  do {
    const result = await list({prefix:'members/',limit:1000,cursor,token});
    for (const blob of result.blobs) { count++; paths.push(blob.pathname); }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor && ++pages < 30);
  return { count, paths };
}
export async function saveMember({email,name,batteryOptIn}) {
  const id = hash(email);
  const path = `members/${id}.json`;
  const content = JSON.stringify({id,name,email,batteryOptIn,acceptedAt:new Date().toISOString(),termsVersion:'2026-10-11',amountPolicy:'variable-until-closure',currency:CURRENCY});
  await put(path,content,{access:'private',token:process.env.BLOB_READ_WRITE_TOKEN,addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
}
export async function sendMail(to,subject,html) {
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.MAIL_FROM,reply_to:CONTACT_EMAIL,to:[to],subject,html})});
  if(!response.ok) throw new Error(`Email delivery failed (${response.status})`);
  return response.json();
}
export function safe(str) {return String(str).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function otp() {return String(randomInt(0,100000000)).padStart(8,'0');}
