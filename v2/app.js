'use strict';
/* ================= Constants ================= */
const TYPES=['Expense','Refund','Income','Reimbursement','Transfer to Reserve','Withdraw from Reserve','Account Transfer'];
const METHODS=['Bank','Tiqmo','Credit','Cash'];
const KINDS=['Fixed','Installment','Variable','Exceptional','Income','Reimbursement','Work'];
const NATURAL=['Fixed','Installment','Variable'];
const BUDGETED=['Fixed','Installment','Variable','Exceptional'];
const GROUPS=['Essentials','Family','Car','Home','Personal','Other','Income','Work'];
const PAL=['#FF8A3D','#F25F8B','#2FB574','#3D8BFF','#8E6CF0','#14B8C4','#F5B82E','#FF6B6B','#E0569B','#7A8CA3','#22A06B','#5B7CFA','#C27A2C'];
const PERSON_COL={Family:'#7A8CA3',Yousef:'#3D8BFF',Yasma:'#F25F8B',Roula:'#8E6CF0',Khalid:'#2FB574'};
const LOGO='<svg viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10.5 20.5 5.5a1.6 1.6 0 0 1 2.1 1.1l1 3.9"/><rect x="4.5" y="10.5" width="23" height="16" rx="3.5"/><path d="M27.5 15.5h-5a3 3 0 0 0 0 6h5"/><circle cx="22.6" cy="18.5" r="1.1" fill="#fff" stroke="none"/></svg>';
/* Shorthand keywords per sub-category id (Arabic + English), for the quick-add box */
const KW={housekeeper:['عامله','خادمه','housekeeper','maid'],electricity:['كهرباء','كهربا','electricity','sec'],internet:['انترنت','نت','فايبر','internet','wifi'],
 mobiles:['جوال','stc','موبايلي','زين','mobile','phone bill'],home:['منظفات','منزل','بيت','مناديل','cleaning'],nursery:['حضانه','nursery'],
 kids:['العاب','لعبه','ترفيه','ملاهي','toys','toy'],birthday:['عيد ميلاد','birthday','حفله'],
 groceries:['بقاله','سوبرماركت','تموينات','خضار','لحم','دجاج','خبز','حليب','دانوب','بنده','كارفور','لولو','تميمي','عثيم','نستو','grocery','groceries','supermarket'],
 restaurants:['مطعم','كافيه','قهوه','كوفي','ايس كريم','عشاء','غداء','فطور','برجر','بيتزا','شاورما','هنقرستيشن','جاهز','كيتا','توصيل','restaurant','cafe','coffee','dinner','lunch','breakfast'],
 fuel:['بنزين','وقود','محطه','fuel','petrol','gas'],car:['غسيل','مغسله','مواقف','باركنج','صيانه','زيت','car wash','parking','service'],carins:['تامين','insurance'],
 tabby:['تابي','tabby'],tamara:['تمارا','tamara'],neo:['نيو','neo'],gym:['جيم','نادي','gym'],youtube:['يوتيوب','youtube'],amazon:['امازون','amazon prime'],subs:['اشتراك','subscription','claude'],
 clothing:['ملابس','لبس','حذاء','جزمه','بنطال','قميص','ثوب','شي ان','clothes','shoes','shein'],personal:['صالون','حلاق','حلاقه','شامبو','صبغه','salon','haircut','barber'],
 pharmacy:['صيدليه','دواء','نهدي','pharmacy','medicine'],gifts:['هديه','هدايا','زياره','ورد','شوكولاته','كوكيز','gift','flowers'],wifegift:['هديه الزوجه'],
 furniture:['اثاث','كنب','سرير','طاوله','كرسي','furniture','sofa','bed','table','chair'],appliances:['جهاز','غساله','ثلاجه','تلفزيون','مكيف','appliance','tv','fridge'],
 decor:['ديكور','ستاره','ستائر','سجاد','decor','curtain','rug'],carpentry:['نجار','نجاره','carpenter','carpentry'],house_services:['تركيب','سباك','كهربائي','installation','plumber'],
 misc:['متفرقات','misc'],extra:['استثنائي'],
 salary:['راتب','salary'],leave:['بدل','leave allowance'],sale:['بيع','بعت','sold','sale'],school_reimb:['والدي','الوالد','ابوي'],work_reimb:['تعويض','reimbursement'],work:['شغل','عمل','work']};
const PERSON_KW={Yousef:['يوسف','yousef','yousuf'],Yasma:['ياسما','yasma'],Roula:['رولا','roula'],Khalid:['خالد','khalid']};

/* ================= State ================= */
const D={Transactions:[],Categories:[],Sub_Categories:[],Accounts:[],Budgets:[],Reserves_Goals:[],Recurring:[],Settings:[],Lists:[]};
const S={tab:'home',ym:null,ymAuto:true,cat:null,q:'',ftag:null,fperson:null,modal:null,loaded:false,lastSync:0,pending:0,undo:null,more:'main'};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>{const n=parseFloat(String(v??'').replace(/,/g,''));return isFinite(n)?n:0};
const r2=n=>Math.round(n*100)/100;
const fmt=n=>{n=r2(n);return n.toLocaleString('en-US',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2})};
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
function today(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`}
const curYm=()=>today().slice(0,7);
S.ym=curYm();
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const ymLabel=ym=>{const[y,m]=ym.split('-');return MONTHS[+m-1]+' '+y};
const shortMonth=ym=>MONTHS[+ym.split('-')[1]-1].slice(0,3);
function addYm(ym,d){let[y,m]=ym.split('-').map(Number);m+=d;while(m>12){m-=12;y++}while(m<1){m+=12;y--}return y+'-'+String(m).padStart(2,'0')}
const dayLabel=d=>{if(!d)return'';const t=new Date(d+'T12:00:00');return t.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})};
const uid=p=>p+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const norm=s=>String(s||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[ًٌٍَُِّْـ]/g,'').replace(/\s+/g,' ').trim();
const toLatin=s=>String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/٫/g,'.').replace(/(\d)[,،](?=\d{3}\b)/g,'$1');
function hashColor(s){let h=0;for(const ch of norm(s))h=(h*31+ch.charCodeAt(0))>>>0;return PAL[h%PAL.length]}

/* ================= Lookups ================= */
const catById=id=>D.Categories.find(c=>c.Category_ID===id);
const subById=id=>D.Sub_Categories.find(s=>s.Sub_ID===id);
function catColor(id,i){const c=catById(id);if(c&&c.Color)return c.Color;const idx=D.Categories.findIndex(x=>x.Category_ID===id);return PAL[(idx<0?(i||0):idx)%PAL.length]}
const isActive=x=>String(x.Active??'Yes').toLowerCase()!=='no'&&x.Active!==false;
const setting=k=>{const r=D.Settings.find(s=>s.Key===k);return r?r.Value:''};
const people=()=>{const l=D.Lists.map(r=>r.For).filter(Boolean);return l.length?l:['Family','Yousef','Yasma','Roula','Khalid']};
const tagsOf=t=>String(t.Tags||'').split(',').map(x=>x.trim()).filter(Boolean);
function allTags(){const m={};for(const t of D.Transactions)for(const g of tagsOf(t)){const k=norm(g);const e=m[k]||(m[k]={name:g,n:0,names:{}});e.n++;e.names[g]=(e.names[g]||0)+1}
 return Object.entries(m).map(([k,e])=>({k,name:Object.entries(e.names).sort((a,b)=>b[1]-a[1])[0][0],n:e.n})).sort((a,b)=>b.n-a.n)}
const tagHtml=g=>`<span class="tag" style="--c:${hashColor(g)}">#${esc(g)}</span>`;
function subIcon(t){const s=subById(t.Sub_Category);if(s&&s.Icon)return s.Icon;const c=catById(t.Category);if(c&&c.Icon)return c.Icon;return{Income:'💰',Reimbursement:'↩️','Transfer to Reserve':'🏦','Withdraw from Reserve':'🏦','Account Transfer':'🔁'}[t.Type]||'•'}
function txTitle(t){const s=subById(t.Sub_Category);if(s)return s.Name;if(t.Type==='Transfer to Reserve'||t.Type==='Withdraw from Reserve'){const g=D.Reserves_Goals.find(g=>g.Goal_ID===t.Goal);return(t.Type==='Transfer to Reserve'?'To ':'From ')+(g?g.Goal_Name:'reserve')}
 if(t.Type==='Account Transfer')return`${t.Payment_Method} → ${t.To_Account}`;const c=catById(t.Category);return c?c.Name:t.Type}

/* ================= Calculations ================= */
const inMonth=(t,ym)=>String(t.Date||'').slice(0,7)===ym;
const signed=t=>t.Type==='Expense'?num(t.Amount):t.Type==='Refund'?-num(t.Amount):0;
function spentBySub(ym){const m={};for(const t of D.Transactions)if(inMonth(t,ym)&&(t.Type==='Expense'||t.Type==='Refund')){const k=t.Sub_Category||('cat:'+t.Category);m[k]=(m[k]||0)+signed(t)}return m}
function budgetBySub(ym){const m={};for(const b of D.Budgets)if(String(b.Month)===ym)m[b.Sub_Category]=(m[b.Sub_Category]||0)+num(b.Budget_Amount);return m}
function catTotals(ym){const sp=spentBySub(ym),bu=budgetBySub(ym),out={};
 for(const c of D.Categories)out[c.Category_ID]={spent:0,budget:0};
 for(const s of D.Sub_Categories){const o=out[s.Category]||(out[s.Category]={spent:0,budget:0});o.spent+=sp[s.Sub_ID]||0;o.budget+=bu[s.Sub_ID]||0}
 for(const k in sp)if(k.startsWith('cat:')){const id=k.slice(4);(out[id]||(out[id]={spent:0,budget:0})).spent+=sp[k]}
 return out}
function kindTotals(ym){const sp=spentBySub(ym),bu=budgetBySub(ym),o={};for(const s of D.Sub_Categories){const k=s.Kind||'Variable';o[k]=o[k]||{spent:0,budget:0};o[k].spent+=sp[s.Sub_ID]||0;o[k].budget+=bu[s.Sub_ID]||0}return o}
function goalSaved(g){let v=num(g.Opening_Saved);for(const t of D.Transactions)if(t.Goal===g.Goal_ID){if(t.Type==='Transfer to Reserve')v+=num(t.Amount);else if(t.Type==='Withdraw from Reserve')v-=num(t.Amount)}return v}
function balances(){const start=String(setting('Start_Date')||'0000-00-00');const op=n=>{const a=D.Accounts.find(a=>a.Name===n);return a?num(a.Opening_Balance):0};
 const b={Bank:op('Bank'),Tiqmo:op('Tiqmo'),Cash:op('Cash'),Credit:0};
 for(const t of D.Transactions){if(String(t.Date||'')<start)continue;const a=num(t.Amount);let m=t.Payment_Method||'Bank';if(m==='Credit')m='Bank';
  if(t.Type==='Expense')b[m]-=a;else if(['Income','Refund','Reimbursement'].includes(t.Type))b[m]+=a;
  else if(t.Type==='Account Transfer'){b[m]-=a;let to=t.To_Account||'Bank';if(to==='Credit')to='Bank';b[to]+=a}}
 const reserved=D.Reserves_Goals.reduce((s,g)=>s+goalSaved(g),0);
 return{...b,reserved,available:b.Bank-reserved}}
function monthIn(ym,type){return D.Transactions.filter(t=>inMonth(t,ym)&&t.Type===type).reduce((s,t)=>s+num(t.Amount),0)}
function personSpent(ym){const o={};for(const p of people())o[p]=0;for(const t of D.Transactions)if(inMonth(t,ym)&&(t.Type==='Expense'||t.Type==='Refund')){const p=t.For||'Family';o[p]=(o[p]||0)+signed(t)}return o}
function houseTotals(){let all=0;for(const t of D.Transactions)if(t.Category==='C-HOUSE')all+=signed(t);return{spent:all,budget:num(setting('New_House_Budget'))}}

/* ================= API ================= */
const api={
 url(){return(window.APP_CONFIG&&APP_CONFIG.api)||ls.get('hb-api')||''},
 key(){return ls.get('hb-key')||''},
 async all(){const r=await fetch(this.url()+'?action=all&key='+encodeURIComponent(this.key()),{cache:'no-store'});const j=await r.json();if(!j.ok)throw j;return j.data},
 async post(body){body.key=this.key();const r=await fetch(this.url(),{method:'POST',body:JSON.stringify(body)});const j=await r.json();if(!j.ok)throw j;return j}
};
let chain=Promise.resolve();
function send(body){S.pending++;syncBadge();chain=chain.then(()=>api.post(body)).then(()=>{S.pending--;syncBadge();saveCache()}).catch(e=>{S.pending--;syncBadge();toast('Could not save. Check your connection — reloading data.');load(true)});return chain}
function syncBadge(){const el=$('#sync');el.hidden=S.pending<=0;el.textContent='Saving…'}
function saveCache(){ls.set('hb-cache',JSON.stringify(D))}
function applyData(d){for(const k in D)D[k]=(d&&d[k])||[];
 for(const t of D.Transactions){t.Amount=num(t.Amount);t.Date=String(t.Date||'').slice(0,10)}
 S.loaded=true}
async function load(silent){if(!api.url()||!api.key()){renderLogin();return}
 try{const d=await api.all();applyData(d);saveCache();S.lastSync=Date.now();render()}
 catch(e){if(e&&e.error==='bad_key'){ls.del('hb-key');renderLogin('That key is not correct.');return}
  if(!silent)toast('Offline — showing saved data.');if(!S.loaded){renderLogin('Could not reach your Google Sheet. Check the link and try again.')}}}

/* table helpers: local change + send */
const KEY={Transactions:'ID',Categories:'Category_ID',Sub_Categories:'Sub_ID',Accounts:'Account_ID',Budgets:'Budget_ID',Reserves_Goals:'Goal_ID',Recurring:'Item',Settings:'Key'};
function upsertLocal(table,row){const k=KEY[table];const i=D[table].findIndex(r=>String(r[k])===String(row[k]));if(i>=0)D[table][i]={...D[table][i],...row};else D[table].push(row)}
function upsert(table,row){upsertLocal(table,row);render();return send({action:'upsert',table,row})}
function remove(table,id){const k=KEY[table];D[table]=D[table].filter(r=>String(r[k])!==String(id));render();return send({action:'delete',table,id})}
function batch(ops){for(const o of ops){if(o.action==='delete'){const k=KEY[o.table];D[o.table]=D[o.table].filter(r=>String(r[k])!==String(o.id))}else upsertLocal(o.table,o.row)}render();return send({action:'batch',ops})}

/* ================= Quick add parser ================= */
function hasWord(text,w){w=norm(w);if(w.includes(' '))return(' '+text+' ').includes(' '+w+' ')||(' '+text+' ').includes(' ال'+w+' ');
 return text.split(' ').some(t=>t===w||t==='ال'+w||t==='بال'+w||t==='و'+w||t==='وال'+w||t==='لل'+w||t==='ب'+w)}
function parseQuick(raw){const lat=toLatin(raw);const m=lat.match(/\d+(?:\.\d+)?/);const a=m?parseFloat(m[0]):0;
 const tags=[];(lat.match(/#[^\s#]+/g)||[]).forEach(h=>tags.push(h.slice(1).replace(/_/g,' ')));
 let rest=lat.replace(/#[^\s#]+/g,' ').replace(/\d+(?:\.\d+)?/,' ');
 const text=norm(rest);
 for(const tg of allTags())if((' '+text+' ').includes(' '+tg.k+' ')&&!tags.some(x=>norm(x)===tg.k))tags.push(tg.name);
 const r={Amount:a,Type:'Expense',Payment_Method:'Bank',For:'Family',Tags:tags,Sub_Category:'',Category:'',Description:''};
 const has=w=>hasWord(text,w);
 if(['تيقمو','tiqmo','تقمو'].some(has))r.Payment_Method='Tiqmo';
 if(['كريدت','بطاقه','ائتمان','credit','visa'].some(has))r.Payment_Method='Credit';
 if(['كاش','نقد','نقدا','cash'].some(has))r.Payment_Method='Cash';
 if(['استرداد','ريفند','refund','مرتجع','ارجاع'].some(has))r.Type='Refund';
 for(const[p,ks]of Object.entries(PERSON_KW))if(ks.some(has))r.For=p;
 let best=null,len=0;
 const tagWords=tags.map(norm).join(' ');
 for(const s of D.Sub_Categories){if(!isActive(s))continue;const words=[...(KW[s.Sub_ID]||[]),s.Name];
  for(const w of words){const nw=norm(w);if(!nw||tagWords.includes(nw))continue;if(nw.length>len&&has(w)){best=s;len=nw.length}}}
 if(best){r.Sub_Category=best.Sub_ID;r.Category=best.Category;
  if(best.Kind==='Income')r.Type='Income';else if(best.Kind==='Reimbursement')r.Type='Reimbursement'}
 // leftover words become the description
 const drop=new Set(['tiqmo','تيقمو','كريدت','credit','كاش','cash','استرداد','refund',...Object.values(PERSON_KW).flat()].map(norm));
 const kw=best?new Set([...(KW[best.Sub_ID]||[]),best.Name].map(norm)):new Set();
 const tagset=new Set(tags.map(norm).join(' ').split(' '));
 r.Description=rest.split(/\s+/).filter(w=>{const n=norm(w);return n&&!drop.has(n)&&!kw.has(n)&&!kw.has(n.replace(/^ال/,''))&&!tagset.has(n)}).join(' ').trim();
 return r}

/* ================= Rendering ================= */
const ICON={
 home:'<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
 list:'<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
 plus:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14"/></svg>',
 budget:'<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 goal:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
 gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
 search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'};

function ring(p,color,size){const r=40,c=2*Math.PI*r,v=Math.max(0,Math.min(1,p));
 return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--sunk)" stroke-width="11"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${c*v} ${c}"/></svg>`}
function bar(spent,budget,color){const p=budget>0?spent/budget:(spent>0?1:0);return `<div class="bar ${budget>0&&spent>budget?'over':''}" style="--c:${color}"><i style="width:${Math.min(100,p*100)}%"></i></div>`}

function header(){return `<header class="top"><div class="logo" aria-hidden="true">${LOGO}</div><h1>Budget</h1>
 <div class="month"><button class="icbtn" data-act="mon" data-v="-1" aria-label="Previous month">‹</button><span>${shortMonth(S.ym)} ${S.ym.slice(0,4)}</span><button class="icbtn" data-act="mon" data-v="1" aria-label="Next month">›</button></div>
 <button class="gear" data-act="tab" data-v="more" aria-label="Settings">${ICON.gear}</button></header>`}

function txRow(t,showDate){const c=catColor(t.Category);const out=t.Type==='Expense';const neutral=['Transfer to Reserve','Withdraw from Reserve','Account Transfer'].includes(t.Type);
 const sign=neutral?'':out?'−':'+';const cls=neutral?'':out?'':'pos';
 const meta=[showDate?`<span>${dayLabel(t.Date)}</span>`:'',t.Type!=='Expense'?`<span>${esc(t.Type)}</span>`:'',`<span>${esc(t.Payment_Method||'')}</span>`,
  t.For&&t.For!=='Family'?`<span class="tag" style="--c:${PERSON_COL[t.For]||hashColor(t.For)}">${esc(t.For)}</span>`:'',...tagsOf(t).map(tagHtml)].filter(Boolean).join('');
 return `<button class="tx" data-act="edit" data-v="${esc(t.ID)}"><div class="ic" style="--c:${c}">${esc(subIcon(t))}</div>
  <div class="mid"><div class="t1">${esc(t.Description||txTitle(t))}</div><div class="t2">${t.Description?`<span>${esc(txTitle(t))}</span>`:''}${meta}</div></div>
  <div class="amt num ${cls}">${sign}${fmt(t.Amount)}</div></button>`}

function groupedList(list,byMonth){if(!list.length)return'';const g={};const key=t=>byMonth?String(t.Date).slice(0,7):t.Date;list.forEach(t=>(g[key(t)]=g[key(t)]||[]).push(t));
 return Object.keys(g).sort().reverse().map(k=>{const tot=g[k].reduce((s,t)=>s+signed(t),0);
  return `<div class="day"><span>${byMonth?ymLabel(k):dayLabel(k)}</span><span class="num">${tot?fmt(tot):''}</span></div><div class="list">${g[k].map(t=>txRow(t,byMonth)).join('')}</div>`}).join('')}
const sortTx=l=>l.slice().sort((a,b)=>String(b.Date).localeCompare(String(a.Date))||String(b.ID).localeCompare(String(a.ID)));

function viewHome(){const b=balances(),kt=kindTotals(S.ym),ct=catTotals(S.ym);
 const natural=NATURAL.reduce((s,k)=>s+((kt[k]||{}).spent||0),0),target=num(setting('Monthly_Target'))||12000,p=natural/target;
 const exc=(kt.Exceptional||{}).spent||0,income=monthIn(S.ym,'Income');
 const cats=D.Categories.filter(c=>isActive(c)&&!['Income','Work'].includes(c.Group)&&c.Category_ID!=='C-HOUSE').map((c,i)=>({c,...ct[c.Category_ID]})).filter(x=>x.budget>0||x.spent!==0);
 const ps=personSpent(S.ym),h=houseTotals();
 return `${header()}
 <section class="hero"><div class="lb">Available to spend</div><div class="big num ${b.available<0?'negw':''}">${fmt(b.available)} <small style="font-size:15px;font-weight:500">SAR</small></div>
  <div class="row"><div><small>Bank</small><b class="num">${fmt(b.Bank)}</b></div><div><small>Tiqmo</small><b class="num">${fmt(b.Tiqmo)}</b></div><div><small>Reserved</small><b class="num">${fmt(b.reserved)}</b></div></div></section>
 <section class="card"><div class="quick"><input id="q" placeholder="Quick add: groceries 120" autocomplete="off" enterkeyhint="done" aria-label="Quick add"><button class="btn pri" data-act="quick">Add</button></div><div class="pv" id="pv">Type what and how much. Add tiqmo, credit or cash, a name like yasma, or #tag.</div></section>
 <section class="card"><div class="ringrow"><div class="ring">${ring(p,p>1?'var(--bad)':p>.85?'var(--warn)':'var(--good)')}<div class="c"><div><b class="num">${Math.round(p*100)}%</b><small>of target</small></div></div></div>
  <div class="kvs"><div class="kv"><span>Spent (${shortMonth(S.ym)})</span><b class="num">${fmt(natural)}</b></div><div class="kv"><span>Target</span><span class="num">${fmt(target)}</span></div>
  <div class="kv"><span>${target-natural>=0?'Left':'Over'}</span><b class="num ${target-natural<0?'neg':''}">${fmt(Math.abs(target-natural))}</b></div>
  <div class="kv"><span>Exceptional</span><span class="num">${fmt(exc)}</span></div><div class="kv"><span>Income</span><span class="num pos">${fmt(income)}</span></div></div></div></section>
 <div class="h2"><h2>Categories</h2><button class="link" data-act="tab" data-v="budgets">Budgets</button></div>
 ${cats.length?`<div class="grid">${cats.map(x=>{const col=catColor(x.c.Category_ID);return `<button class="tile" style="--c:${col}" data-act="cat" data-v="${esc(x.c.Category_ID)}"><div class="ic">${esc(x.c.Icon||'•')}</div><div class="nm">${esc(x.c.Name)}</div><div class="am"><b class="num">${fmt(x.spent)}</b> / <span class="num">${fmt(x.budget)}</span></div>${bar(x.spent,x.budget,col)}</button>`}).join('')}</div>`
  :`<div class="card empty"><b>No budgets for ${ymLabel(S.ym)}</b>Set them in Budgets, or copy last month's.</div>`}
 <div class="h2"><h2>Who it was for</h2><small>${shortMonth(S.ym)}</small></div>
 <div class="people">${Object.entries(ps).map(([n,v])=>`<button class="person" style="--c:${PERSON_COL[n]||hashColor(n)};border:0;text-align:left" data-act="person" data-v="${esc(n)}"><div class="av">${esc(n[0])}</div><small class="muted">${esc(n)}</small><b class="num">${fmt(v)}</b></button>`).join('')}</div>
 ${h.budget>0||h.spent>0?`<div class="h2"><h2>New house setup</h2><small>all months</small></div><section class="card" style="margin-top:0"><div class="kv"><span>Spent so far</span><b class="num">${fmt(h.spent)}</b></div><div class="kv"><span>Budget</span><span class="num">${fmt(h.budget)}</span></div>${bar(h.spent,h.budget,catColor('C-HOUSE'))}<div class="kv"><span>${h.budget-h.spent>=0?'Remaining':'Over budget'}</span><b class="num ${h.budget-h.spent<0?'neg':''}">${fmt(Math.abs(h.budget-h.spent))}</b></div></section>`:''}
 <div class="h2"><h2>Latest</h2><button class="link" data-act="tab" data-v="activity">See all</button></div>
 ${(()=>{const l=sortTx(D.Transactions.filter(t=>inMonth(t,S.ym))).slice(0,6);return l.length?`<div class="list">${l.map(t=>txRow(t,true)).join('')}</div>`:`<div class="card empty"><b>Nothing logged in ${ymLabel(S.ym)} yet</b>Tap + or use quick add.</div>`})()}`}

function matchQuery(t,q){const ql=toLatin(q).trim();if(!ql)return true;const n=ql.replace(/[,\s،]/g,'');
 if(/^\d+(\.\d+)?$/.test(n)){const v=parseFloat(n),a=Math.abs(num(t.Amount));return n.includes('.')?r2(a)===r2(v):Math.floor(a+1e-9)===v}
 const s=subById(t.Sub_Category),c=catById(t.Category);
 return norm([t.Description,t.Notes,t.Tags,t.For,t.Type,t.Payment_Method,s&&s.Name,c&&c.Name].join(' ')).includes(norm(ql))}
function viewActivity(){const active=S.q.trim()||S.ftag||S.fperson;
 let l=D.Transactions.filter(t=>(active?true:inMonth(t,S.ym))&&(!S.ftag||tagsOf(t).some(g=>norm(g)===S.ftag))&&(!S.fperson||(t.For||'Family')===S.fperson)&&matchQuery(t,S.q));
 l=sortTx(l);const tot=l.reduce((s,t)=>s+signed(t),0);const tags=allTags();
 return `${header()}
 <div class="search">${ICON.search}<input id="sq" type="search" value="${esc(S.q)}" placeholder="Search amount (1,350) or name (amazon now)" autocomplete="off" aria-label="Search"></div>
 <div class="fl">People</div><div class="chips scroll">${people().map(p=>`<button class="chip" data-act="fperson" data-v="${esc(p)}" aria-pressed="${S.fperson===p}">${esc(p)}</button>`).join('')}</div>
 ${tags.length?`<div class="fl">Tags</div><div class="chips scroll">${tags.map(g=>`<button class="chip" data-act="ftag" data-v="${esc(g.k)}" aria-pressed="${S.ftag===g.k}" style="--c:${hashColor(g.name)}"><span class="tag" style="--c:${hashColor(g.name)}">#${esc(g.name)}</span><span class="muted num">${g.n}</span></button>`).join('')}</div>`:''}
 ${active?`<section class="card"><div class="kv"><span>${l.length} transactions · all months</span><b class="num">${fmt(tot)}</b></div><button class="link" data-act="clearf">Clear filters</button></section>`:''}
 ${l.length?groupedList(l,!!active):`<div class="card empty"><b>${active?'No matches':'Nothing logged in '+ymLabel(S.ym)}</b>${active?'Try another amount or name.':'Tap + to add your first one.'}</div>`}`}

function viewCat(){const c=catById(S.cat);if(!c){S.cat=null;return viewHome()}const col=catColor(c.Category_ID);const sp=spentBySub(S.ym),bu=budgetBySub(S.ym);
 const subs=D.Sub_Categories.filter(s=>s.Category===c.Category_ID);const t=catTotals(S.ym)[c.Category_ID]||{spent:0,budget:0};
 const tx=sortTx(D.Transactions.filter(x=>inMonth(x,S.ym)&&x.Category===c.Category_ID));
 return `${header()}<div class="h2" style="margin-top:8px"><div class="chead" style="--c:${col}"><button class="icbtn" data-act="back" aria-label="Back">‹</button><div class="dot">${esc(c.Icon||'•')}</div><h2>${esc(c.Name)}</h2></div></div>
 <section class="card" style="--c:${col}"><div class="kv"><span>Spent</span><b class="num">${fmt(t.spent)}</b></div><div class="kv"><span>Budget</span><span class="num">${fmt(t.budget)}</span></div>${bar(t.spent,t.budget,col)}
 ${subs.map(s=>{const a=sp[s.Sub_ID]||0,b=bu[s.Sub_ID]||0;return a||b?`<div class="brow ${isActive(s)?'':'off'}"><div class="n">${esc(s.Icon||'')} ${esc(s.Name)}</div><div class="num">${fmt(a)} <span class="muted">/ ${fmt(b)}</span></div>${bar(a,b,col)}</div>`:''}).join('')}</section>
 <div class="h2"><h2>Transactions</h2><small>${ymLabel(S.ym)}</small></div>${tx.length?groupedList(tx):`<div class="card empty">No transactions this month.</div>`}`}

function viewBudgets(){const bu=budgetBySub(S.ym),sp=spentBySub(S.ym);const hasAny=D.Budgets.some(b=>String(b.Month)===S.ym);
 const kt=kindTotals(S.ym);const nb=NATURAL.reduce((s,k)=>s+((kt[k]||{}).budget||0),0),target=num(setting('Monthly_Target'))||12000;
 const cats=D.Categories.filter(c=>!['Income','Work'].includes(c.Group)&&c.Category_ID!=='C-HOUSE');
 return `${header()}<div class="h2" style="margin-top:6px"><h2>Budgets · ${ymLabel(S.ym)}</h2></div>
 <section class="card"><div class="kv"><span>Monthly budgets (fixed + instalments + variable)</span><b class="num">${fmt(nb)}</b></div><div class="kv"><span>Target</span><span class="num">${fmt(target)}</span></div>
 ${nb>target?`<div class="kv"><span style="color:var(--warn)">Budgets are above target by</span><b class="num" style="color:var(--warn)">${fmt(nb-target)}</b></div>`:''}
 ${!hasAny?`<div class="actions"><button class="btn pri" data-act="copybud">Copy ${shortMonth(addYm(S.ym,-1))} budgets</button></div>`:''}</section>
 ${cats.map(c=>{const col=catColor(c.Category_ID);const subs=D.Sub_Categories.filter(s=>s.Category===c.Category_ID&&BUDGETED.includes(s.Kind)&&(isActive(s)||bu[s.Sub_ID]||sp[s.Sub_ID]));if(!subs.length)return'';
  return `<section class="card" style="--c:${col}"><div class="chead"><div class="dot">${esc(c.Icon||'•')}</div><b>${esc(c.Name)}</b><span class="num muted">${fmt(subs.reduce((s,x)=>s+(sp[x.Sub_ID]||0),0))} / ${fmt(subs.reduce((s,x)=>s+(bu[x.Sub_ID]||0),0))}</span></div>
  ${subs.map(s=>{const a=sp[s.Sub_ID]||0,b=bu[s.Sub_ID]||0;return `<div class="brow"><div class="n">${esc(s.Name)} <small class="muted">${esc(s.Kind)}</small></div><input class="amtin num" inputmode="decimal" data-bud="${esc(s.Sub_ID)}" value="${b?r2(b):''}" placeholder="0" aria-label="Budget for ${esc(s.Name)}">${bar(a,b,col)}<div class="sub"><span>Spent ${fmt(a)}</span><span class="${b-a<0?'neg':''}">${b-a>=0?'Left '+fmt(b-a):'Over '+fmt(a-b)}</span></div></div>`}).join('')}</section>`}).join('')}`}

function viewGoals(){const gs=D.Reserves_Goals;
 return `${header()}<div class="h2" style="margin-top:6px"><h2>Goals & reserves</h2><button class="link" data-act="goalnew">+ New goal</button></div>
 ${gs.length?gs.map((g,i)=>{const s=goalSaved(g),t=num(g.Target_Amount),p=t?s/t:0,col=PAL[(i*3+3)%PAL.length];let need='';
  if(g.Target_Date){const[y,m]=String(g.Target_Date).split('-').map(Number);const[cy,cm]=curYm().split('-').map(Number);const months=Math.max(1,(y-cy)*12+m-cm);need=`<div class="kv"><span>Needed per month</span><b class="num">${fmt(Math.max(0,t-s)/months)}</b></div><div class="kv"><span>By</span><span>${dayLabel(g.Target_Date)} ${String(g.Target_Date).slice(0,4)}</span></div>`}
  return `<section class="card"><div class="goal"><div class="ring">${ring(p,col)}<div class="c"><b class="num" style="font-size:16px">${Math.round(p*100)}%</b></div></div><div class="info"><h3>${esc(g.Goal_Name)}</h3><div class="kv"><span>Saved</span><b class="num">${fmt(s)}</b></div><div class="kv"><span>Target</span><span class="num">${fmt(t)}</span></div></div></div>${need}
  <div class="actions"><button class="btn pri" data-act="goalmove" data-v="${esc(g.Goal_ID)}" data-t="in">Add money</button><button class="btn" data-act="goalmove" data-v="${esc(g.Goal_ID)}" data-t="out">Withdraw</button><button class="btn" data-act="goaledit" data-v="${esc(g.Goal_ID)}">Edit</button></div></section>`}).join('')
 :`<div class="card empty"><b>No goals yet</b>Add your emergency fund or school fees.</div>`}
 <p class="muted" style="margin:14px 4px">New house setup has one total budget (Settings), not monthly budgets. Reserved money stays in your bank account but is taken out of “Available to spend”.</p>`}

function viewMore(){const acc=D.Accounts;
 return `${header()}<div class="h2" style="margin-top:6px"><h2>Categories</h2><span><button class="link" data-act="catnew">+ Category</button> &nbsp; <button class="link" data-act="subnew">+ Sub-category</button></span></div>
 <section class="card">${D.Categories.map(c=>{const col=catColor(c.Category_ID);const subs=D.Sub_Categories.filter(s=>s.Category===c.Category_ID);
  return `<button class="srow ${isActive(c)?'':'off'}" data-act="catedit" data-v="${esc(c.Category_ID)}"><div class="dot" style="--c:${col}">${esc(c.Icon||'•')}</div><div class="grow"><b>${esc(c.Name)}</b><small>${esc(c.Group||'')} · ${subs.length} sub-categories${isActive(c)?'':' · hidden'}</small></div><span class="muted">›</span></button>
  ${subs.map(s=>`<button class="srow subrow ${isActive(s)?'':'off'}" data-act="subedit" data-v="${esc(s.Sub_ID)}"><span>${esc(s.Icon||'•')}</span><div class="grow">${esc(s.Name)}<small>${esc(s.Kind||'')}${isActive(s)?'':' · hidden'}</small></div><span class="muted">›</span></button>`).join('')}`}).join('')}</section>
 <div class="h2"><h2>Opening balances</h2><small>on ${esc(setting('Start_Date')||'start date')}</small></div>
 <section class="card">${acc.filter(a=>a.Name!=='Credit').map(a=>`<div class="kv" style="align-items:center"><span>${esc(a.Name)}</span><input class="amtin num" inputmode="decimal" data-acc="${esc(a.Account_ID)}" value="${num(a.Opening_Balance)||''}" placeholder="0"></div>`).join('')}
 <p class="muted" style="margin:8px 0 0">Credit card spending is taken from the Bank balance.</p></section>
 <div class="h2"><h2>Settings</h2></div>
 <section class="card"><div class="kv" style="align-items:center"><span>Monthly target</span><input class="amtin num" inputmode="decimal" data-set="Monthly_Target" value="${num(setting('Monthly_Target'))||''}"></div>
 <div class="kv" style="align-items:center"><span>New house budget</span><input class="amtin num" inputmode="decimal" data-set="New_House_Budget" value="${num(setting('New_House_Budget'))||''}" placeholder="0"></div>
 <div class="kv" style="align-items:center"><span>Start date</span><input class="inp" style="width:150px;height:36px" type="date" data-set="Start_Date" value="${esc(setting('Start_Date'))}"></div></section>
 ${D.Recurring.length?`<div class="h2"><h2>Recurring bills</h2><small>tap Log when paid</small></div><section class="card">${D.Recurring.map(r=>{const s=subById(r.Sub_Category);const paid=D.Transactions.some(t=>inMonth(t,S.ym)&&t.Sub_Category===r.Sub_Category&&t.Type==='Expense');
  return `<div class="srow" style="cursor:default"><span>${esc(s&&s.Icon||'•')}</span><div class="grow">${esc(r.Item)}<small>${fmt(num(r.Amount))} · ${esc(r.Payment_Method||'Bank')}${r.Day_of_Month?' · day '+esc(r.Day_of_Month):''}</small></div>${paid?'<span class="tag" style="--c:var(--good)">Logged</span>':`<button class="chip" data-act="logrec" data-v="${esc(r.Item)}">Log</button>`}</div>`}).join('')}</section>`:''}
 <div class="h2"><h2>Connection</h2></div><section class="card"><div class="kv"><span>Last synced</span><span>${S.lastSync?new Date(S.lastSync).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'—'}</span></div>
 <div class="actions"><button class="btn" data-act="reload">Sync now</button><button class="btn danger" data-act="signout">Sign out</button></div></section>`}

function render(){if(!S.loaded&&!api.key())return renderLogin();
 const views={home:viewHome,activity:viewActivity,budgets:viewBudgets,goals:viewGoals,more:viewMore};
 const v=S.cat&&S.tab==='home'?viewCat:views[S.tab]||viewHome;
 const ae=document.activeElement;const keep=ae&&ae.id&&['q','sq'].includes(ae.id)?{id:ae.id,v:ae.value,s:ae.selectionStart}:null;
 const keepBud=ae&&ae.dataset&&(ae.dataset.bud||ae.dataset.acc||ae.dataset.set);if(keepBud)return; // don't rebuild while typing in a field
 $('#app').innerHTML=`<div class="wrap">${v()}</div>${nav()}`;
 if(keep){const el=document.getElementById(keep.id);if(el){el.value=keep.v;el.focus();try{el.setSelectionRange(keep.s,keep.s)}catch(e){}}}
 renderModal()}
function nav(){const b=(id,label,ic)=>`<button data-act="tab" data-v="${id}" aria-current="${S.tab===id?'page':'false'}">${ic}${label}</button>`;
 return `<nav class="tabs"><div class="in">${b('home','Home',ICON.home)}${b('activity','Activity',ICON.list)}<button class="add" data-act="add" aria-label="Add transaction">${ICON.plus}</button>${b('budgets','Budgets',ICON.budget)}${b('goals','Goals',ICON.goal)}</div></nav>`}

function renderLogin(msg){$('#app').innerHTML=`<div class="login"><form class="box" id="login"><div class="logo">${LOGO}</div><h1>Home Budget</h1><p>Connect to your Google Sheet.</p>
 ${(window.APP_CONFIG&&APP_CONFIG.api)?'':`<input class="inp" id="lg-url" placeholder="Web app link (https://script.google.com/…)" value="${esc(ls.get('hb-api')||'')}" autocomplete="off">`}
 <input class="inp" id="lg-key" type="password" placeholder="App key" autocomplete="current-password" required><button class="btn pri" type="submit">Connect</button><div class="err">${esc(msg||'')}</div></form></div>`}

/* ================= Modals ================= */
function openTx(t){const base=t?{...t,Tags:tagsOf(t)}:{ID:'',Type:'Expense',Amount:'',Date:today(),Category:'',Sub_Category:'',Payment_Method:'Bank',For:'Family',Tags:[],Description:'',Notes:'',Goal:'',To_Account:''};
 S.modal={kind:'tx',d:base,confirmDel:false,need:false};renderModal()}
function kindForType(type){return type==='Income'?['Income']:type==='Reimbursement'?['Reimbursement']:[...BUDGETED,'Work']}
function txModal(m){const d=m.d;const kinds=kindForType(d.Type);const needsCat=['Expense','Refund','Income','Reimbursement'].includes(d.Type);
 const cats=D.Categories.filter(c=>(isActive(c)||c.Category_ID===d.Category)&&D.Sub_Categories.some(s=>s.Category===c.Category_ID&&kinds.includes(s.Kind)));
 const subs=D.Sub_Categories.filter(s=>s.Category===d.Category&&kinds.includes(s.Kind)&&(isActive(s)||s.Sub_ID===d.Sub_Category));
 const tagSugg=allTags().filter(g=>!d.Tags.some(x=>norm(x)===g.k)).slice(0,10);
 return `<div class="hd"><h2>${d.ID?'Edit':'New'} transaction</h2><button class="icbtn" data-act="close" aria-label="Close">✕</button></div>
 <div class="chips scroll">${TYPES.map(t=>`<button class="chip" data-act="ftype" data-v="${t}" aria-pressed="${d.Type===t}">${t}</button>`).join('')}</div>
 <div class="amountbox" style="margin-top:12px"><input id="m-amt" class="num" inputmode="decimal" placeholder="0" value="${esc(d.Amount)}" aria-label="Amount"><span>SAR</span></div>
 ${needsCat?`<div class="fl">Category</div><div class="catgrid ${m.need&&!d.Sub_Category?'need':''}">${cats.map(c=>`<button class="catbtn" style="--c:${catColor(c.Category_ID)}" data-act="fcat" data-v="${esc(c.Category_ID)}" aria-pressed="${d.Category===c.Category_ID}"><span class="e">${esc(c.Icon||'•')}</span><span>${esc(c.Name)}</span></button>`).join('')}</div>
  ${d.Category?`<div class="fl">Sub-category</div><div class="chips">${subs.map(s=>`<button class="chip" data-act="fsub" data-v="${esc(s.Sub_ID)}" aria-pressed="${d.Sub_Category===s.Sub_ID}">${esc(s.Icon||'')} ${esc(s.Name)}</button>`).join('')||'<span class="muted">No sub-categories yet. Add one in Settings.</span>'}</div>`:''}`:''}
 ${d.Type==='Transfer to Reserve'||d.Type==='Withdraw from Reserve'?`<div class="fl">Goal</div><div class="chips">${D.Reserves_Goals.map(g=>`<button class="chip" data-act="fset" data-f="Goal" data-v="${esc(g.Goal_ID)}" aria-pressed="${d.Goal===g.Goal_ID}">${esc(g.Goal_Name)}</button>`).join('')}</div>`:''}
 <div class="fl">${d.Type==='Account Transfer'?'From':'Paid with'}</div><div class="chips">${METHODS.map(x=>`<button class="chip" data-act="fset" data-f="Payment_Method" data-v="${x}" aria-pressed="${d.Payment_Method===x}">${x}</button>`).join('')}</div>
 ${d.Type==='Account Transfer'?`<div class="fl">To</div><div class="chips">${METHODS.map(x=>`<button class="chip" data-act="fset" data-f="To_Account" data-v="${x}" aria-pressed="${d.To_Account===x}">${x}</button>`).join('')}</div>`:''}
 ${needsCat?`<div class="fl">For</div><div class="chips">${people().map(p=>`<button class="chip" data-act="fset" data-f="For" data-v="${esc(p)}" aria-pressed="${(d.For||'Family')===p}">${esc(p)}</button>`).join('')}</div>`:''}
 <div class="fl">Tags</div><div class="chips">${d.Tags.map(g=>`<button class="tag x" style="--c:${hashColor(g)}" data-act="untag" data-v="${esc(g)}">#${esc(g)} ✕</button>`).join('')}</div>
 <div class="quick" style="margin-top:8px"><input id="m-tag" class="inp" placeholder="Add a tag, e.g. Amazon now" autocomplete="off"><button class="btn" data-act="addtag">Add</button></div>
 <div class="chips sugg" id="tagsugg">${tagSugg.map(g=>`<button class="chip" data-act="picktag" data-v="${esc(g.name)}"><span class="tag" style="--c:${hashColor(g.name)}">#${esc(g.name)}</span></button>`).join('')}</div>
 <div class="two"><div><div class="fl">Date</div><input id="m-date" class="inp" type="date" value="${esc(d.Date)}"></div><div><div class="fl">Note</div><input id="m-desc" class="inp" value="${esc(d.Description)}" placeholder="Optional"></div></div>
 <div class="actions" style="margin-top:20px"><button class="btn pri" data-act="savetx">${d.ID?'Save changes':'Add'}</button>${d.ID?`<button class="btn danger ${m.confirmDel?'on':''}" data-act="deltx">${m.confirmDel?'Tap again to delete':'Delete'}</button>`:''}</div>`}

function catModal(m){const d=m.d;return `<div class="hd"><h2>${m.isNew?'New category':'Edit category'}</h2><button class="icbtn" data-act="close" aria-label="Close">✕</button></div>
 <div class="fl">Name</div><input class="inp" id="m-name" value="${esc(d.Name)}" placeholder="e.g. Travel">
 <div class="two"><div><div class="fl">Icon (emoji)</div><input class="inp" id="m-icon" value="${esc(d.Icon)}" placeholder="✈️"></div><div><div class="fl">Group</div><select class="inp" id="m-group">${GROUPS.map(g=>`<option ${d.Group===g?'selected':''}>${g}</option>`).join('')}</select></div></div>
 <div class="fl">Colour</div><div class="chips">${PAL.map(c=>`<button class="swatch" style="--c:${c}" data-act="fset" data-f="Color" data-v="${c}" aria-pressed="${d.Color===c}" aria-label="Colour ${c}"></button>`).join('')}</div>
 <div class="fl">Show when adding</div><div class="chips"><button class="chip" data-act="fset" data-f="Active" data-v="Yes" aria-pressed="${d.Active!=='No'}">Active</button><button class="chip" data-act="fset" data-f="Active" data-v="No" aria-pressed="${d.Active==='No'}">Hidden</button></div>
 <div class="actions" style="margin-top:20px"><button class="btn pri" data-act="savecat">Save</button>${!m.isNew?delBtn(m,D.Transactions.some(t=>t.Category===d.Category_ID)||D.Sub_Categories.some(s=>s.Category===d.Category_ID)):''}</div>${m.blocked?`<p class="muted">${m.blocked}</p>`:''}`}
function subModal(m){const d=m.d;return `<div class="hd"><h2>${m.isNew?'New sub-category':'Edit sub-category'}</h2><button class="icbtn" data-act="close" aria-label="Close">✕</button></div>
 <div class="fl">Name</div><input class="inp" id="m-name" value="${esc(d.Name)}" placeholder="e.g. Yasma's school">
 <div class="fl">Category</div><div class="catgrid">${D.Categories.filter(c=>isActive(c)||c.Category_ID===d.Category).map(c=>`<button class="catbtn" style="--c:${catColor(c.Category_ID)}" data-act="fset" data-f="Category" data-v="${esc(c.Category_ID)}" aria-pressed="${d.Category===c.Category_ID}"><span class="e">${esc(c.Icon||'•')}</span><span>${esc(c.Name)}</span></button>`).join('')}</div>
 <div class="fl">Kind</div><div class="chips">${KINDS.map(k=>`<button class="chip" data-act="fset" data-f="Kind" data-v="${k}" aria-pressed="${d.Kind===k}">${k}</button>`).join('')}</div>
 <p class="muted" style="margin:6px 2px 0">Fixed, Installment and Variable count toward your monthly target. Exceptional is tracked separately.</p>
 <div class="two"><div><div class="fl">Icon (emoji)</div><input class="inp" id="m-icon" value="${esc(d.Icon)}" placeholder="🎒"></div><div><div class="fl">Budget this month</div><input class="inp num" id="m-bud" inputmode="decimal" value="${esc(m.budget??'')}" placeholder="0"></div></div>
 <div class="fl">Show when adding</div><div class="chips"><button class="chip" data-act="fset" data-f="Active" data-v="Yes" aria-pressed="${d.Active!=='No'}">Active</button><button class="chip" data-act="fset" data-f="Active" data-v="No" aria-pressed="${d.Active==='No'}">Hidden</button></div>
 <div class="actions" style="margin-top:20px"><button class="btn pri" data-act="savesub">Save</button>${!m.isNew?delBtn(m,D.Transactions.some(t=>t.Sub_Category===d.Sub_ID)):''}</div>${m.blocked?`<p class="muted">${m.blocked}</p>`:''}`}
function delBtn(m,used){return used?`<button class="btn" data-act="blocked">Delete</button>`:`<button class="btn danger ${m.confirmDel?'on':''}" data-act="delrow">${m.confirmDel?'Tap again to delete':'Delete'}</button>`}
function goalModal(m){const d=m.d;return `<div class="hd"><h2>${m.isNew?'New goal':'Edit goal'}</h2><button class="icbtn" data-act="close" aria-label="Close">✕</button></div>
 <div class="fl">Name</div><input class="inp" id="m-name" value="${esc(d.Goal_Name)}" placeholder="e.g. Summer trip">
 <div class="two"><div><div class="fl">Target (SAR)</div><input class="inp num" id="m-target" inputmode="decimal" value="${esc(d.Target_Amount)}"></div><div><div class="fl">Target date</div><input class="inp" id="m-tdate" type="date" value="${esc(d.Target_Date)}"></div></div>
 <div class="fl">Already saved before the start date</div><input class="inp num" id="m-open" inputmode="decimal" value="${esc(d.Opening_Saved)}" placeholder="0">
 <div class="actions" style="margin-top:20px"><button class="btn pri" data-act="savegoal">Save</button>${!m.isNew?delBtn(m,D.Transactions.some(t=>t.Goal===d.Goal_ID)):''}</div>${m.blocked?`<p class="muted">${m.blocked}</p>`:''}`}
function renderModal(){const el=$('#modal');const m=S.modal;if(!m){el.innerHTML='';return}
 const ae=document.activeElement;const keep=ae&&ae.id&&ae.id.startsWith('m-')?{id:ae.id,s:ae.selectionStart}:null;
 const body={tx:txModal,cat:catModal,sub:subModal,goal:goalModal}[m.kind](m);
 const prevScroll=el.querySelector('.sheet')?el.querySelector('.sheet').scrollTop:0;
 el.innerHTML=`<div class="scrim" data-act="scrim"><div class="sheet" role="dialog" aria-modal="true">${body}</div></div>`;
 el.querySelector('.sheet').scrollTop=prevScroll;
 if(keep){const k=document.getElementById(keep.id);if(k){k.focus();try{k.setSelectionRange(keep.s,keep.s)}catch(e){}}}}
function readModalInputs(){const m=S.modal;if(!m)return;const v=id=>{const e=document.getElementById(id);return e?e.value:undefined};const d=m.d;
 if(m.kind==='tx'){if(v('m-amt')!==undefined)d.Amount=v('m-amt');if(v('m-date')!==undefined)d.Date=v('m-date');if(v('m-desc')!==undefined)d.Description=v('m-desc')}
 if(m.kind==='cat'||m.kind==='sub'){if(v('m-name')!==undefined)d.Name=v('m-name');if(v('m-icon')!==undefined)d.Icon=v('m-icon');if(v('m-group')!==undefined)d.Group=v('m-group');if(v('m-bud')!==undefined)m.budget=v('m-bud')}
 if(m.kind==='goal'){d.Goal_Name=v('m-name');d.Target_Amount=v('m-target');d.Target_Date=v('m-tdate');d.Opening_Saved=v('m-open')}}

/* ================= Actions ================= */
function saveTx(){readModalInputs();const m=S.modal,d=m.d;const a=num(toLatin(d.Amount));
 if(!(a>0)){toast('Enter an amount.');return}
 const needsCat=['Expense','Refund','Income','Reimbursement'].includes(d.Type);
 if(needsCat&&!d.Sub_Category){m.need=true;renderModal();toast('Pick a category and sub-category.');return}
 if((d.Type==='Transfer to Reserve'||d.Type==='Withdraw from Reserve')&&!d.Goal){toast('Pick a goal.');return}
 if(d.Type==='Account Transfer'&&!d.To_Account){toast('Pick where the money goes.');return}
 const isNew=!d.ID;const row={ID:d.ID||uid('T'),Date:d.Date||today(),Month:(d.Date||today()).slice(0,7),Category:needsCat?d.Category:'',Sub_Category:needsCat?d.Sub_Category:'',
  Description:(d.Description||'').trim(),Amount:r2(a),Payment_Method:d.Payment_Method||'Bank',Type:d.Type,Notes:d.Notes||'',Goal:d.Goal||'',To_Account:d.Type==='Account Transfer'?d.To_Account:'',For:needsCat?(d.For||'Family'):'',Tags:d.Tags.join(', ')};
 S.modal=null;upsert('Transactions',row);if(isNew)afterAdd(row);else toast('Saved.')}
function afterAdd(row){const s=subById(row.Sub_Category);let msg=`Added ${fmt(row.Amount)}${s?' · '+s.Name:''}`;
 if(s&&BUDGETED.includes(s.Kind)){const ym=row.Month;const sp=spentBySub(ym)[s.Sub_ID]||0,b=budgetBySub(ym)[s.Sub_ID]||0;msg+=` · ${fmt(sp)}${b?' / '+fmt(b):''}`}
 toast(msg,{label:'Undo',fn:()=>remove('Transactions',row.ID)})}
function quickAdd(){const el=$('#q');if(!el||!el.value.trim())return;const p=parseQuick(el.value);
 if(!(p.Amount>0)){toast('Add an amount, e.g. groceries 120');return}
 if(!p.Sub_Category){el.value='';openTx(null);Object.assign(S.modal.d,{Amount:String(p.Amount),Type:p.Type,Payment_Method:p.Payment_Method,For:p.For,Tags:p.Tags,Description:p.Description});S.modal.need=true;renderModal();toast('Pick the category.');return}
 const row={ID:uid('T'),Date:today(),Month:curYm(),Category:p.Category,Sub_Category:p.Sub_Category,Description:p.Description,Amount:r2(p.Amount),Payment_Method:p.Payment_Method,Type:p.Type,Notes:'',Goal:'',To_Account:'',For:p.For,Tags:p.Tags.join(', ')};
 el.value='';upsert('Transactions',row);afterAdd(row)}
function quickPreview(){const el=$('#q'),pv=$('#pv');if(!el||!pv)return;if(!el.value.trim()){pv.textContent='Type what and how much. Add tiqmo, credit or cash, a name like yasma, or #tag.';return}
 const p=parseQuick(el.value);const s=subById(p.Sub_Category);
 pv.innerHTML=[p.Type!=='Expense'?`<span class="chip">${p.Type}</span>`:'',s?`<span class="tag" style="--c:${catColor(s.Category)}">${esc(s.Icon||'')} ${esc(s.Name)}</span>`:'<span class="tag" style="--c:var(--warn)">Category: you pick</span>',
  p.Amount?`<span class="chip num">${fmt(p.Amount)}</span>`:'<span class="tag" style="--c:var(--warn)">No amount</span>',`<span class="chip">${p.Payment_Method}</span>`,p.For!=='Family'?`<span class="tag" style="--c:${PERSON_COL[p.For]}">${p.For}</span>`:'',...p.Tags.map(tagHtml)].join('')}
function copyBudgets(){const prev=addYm(S.ym,-1);const rows=D.Budgets.filter(b=>String(b.Month)===prev);if(!rows.length){toast(`No budgets in ${ymLabel(prev)} to copy.`);return}
 batch(rows.map(b=>({action:'upsert',table:'Budgets',row:{Budget_ID:`B-${S.ym}-${b.Sub_Category}`,Month:S.ym,Sub_Category:b.Sub_Category,Budget_Amount:num(b.Budget_Amount)}})));toast(`Copied ${rows.length} budgets from ${ymLabel(prev)}.`)}
function setBudget(sub,val){const n=num(toLatin(val));const ex=D.Budgets.find(b=>String(b.Month)===S.ym&&b.Sub_Category===sub);
 if(ex){if(num(ex.Budget_Amount)===n)return;upsert('Budgets',{Budget_ID:ex.Budget_ID,Month:S.ym,Sub_Category:sub,Budget_Amount:n})}
 else if(n>0)upsert('Budgets',{Budget_ID:`B-${S.ym}-${sub}`,Month:S.ym,Sub_Category:sub,Budget_Amount:n})}
let toastT;
function toast(msg,action){const el=$('#toast');el.innerHTML=`<span>${esc(msg)}</span>${action?`<button id="toastbtn">${esc(action.label)}</button>`:''}`;el.hidden=false;
 if(action)$('#toastbtn').onclick=()=>{el.hidden=true;action.fn()};clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,action?6000:3500)}

document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act,v=el.dataset.v;const m=S.modal;
 if(a==='scrim'){if(e.target===el){S.modal=null;renderModal()}return}
 if(m&&el.closest('#modal'))readModalInputs();
 switch(a){
 case'tab':S.tab=v;S.cat=null;render();scrollTo(0,0);break;
 case'mon':S.ym=addYm(S.ym,+v);S.ymAuto=S.ym===curYm();render();break;
 case'cat':S.cat=v;render();scrollTo(0,0);break;
 case'back':S.cat=null;render();break;
 case'add':openTx(null);break;
 case'edit':{const t=D.Transactions.find(x=>String(x.ID)===v);if(t)openTx(t);break}
 case'quick':quickAdd();break;
 case'person':S.tab='activity';S.fperson=v;S.ftag=null;S.q='';render();scrollTo(0,0);break;
 case'fperson':S.fperson=S.fperson===v?null:v;render();break;
 case'ftag':S.ftag=S.ftag===v?null:v;render();break;
 case'clearf':S.ftag=null;S.fperson=null;S.q='';render();break;
 case'close':S.modal=null;renderModal();break;
 case'ftype':m.d.Type=v;if(!kindForType(v).includes((subById(m.d.Sub_Category)||{}).Kind)){m.d.Sub_Category='';m.d.Category=''}renderModal();break;
 case'fcat':m.d.Category=v;m.d.Sub_Category='';{const subs=D.Sub_Categories.filter(s=>s.Category===v&&isActive(s)&&kindForType(m.d.Type).includes(s.Kind));if(subs.length===1)m.d.Sub_Category=subs[0].Sub_ID}renderModal();break;
 case'fsub':m.d.Sub_Category=v;m.need=false;renderModal();break;
 case'fset':m.d[el.dataset.f]=v;renderModal();break;
 case'addtag':{const i=$('#m-tag');const g=(i&&i.value||'').replace(/#/g,'').trim();if(g){const ex=allTags().find(x=>x.k===norm(g));const name=ex?ex.name:g;if(!m.d.Tags.some(x=>norm(x)===norm(name)))m.d.Tags.push(name)}renderModal();break}
 case'picktag':if(!m.d.Tags.some(x=>norm(x)===norm(v)))m.d.Tags.push(v);renderModal();break;
 case'untag':m.d.Tags=m.d.Tags.filter(x=>x!==v);renderModal();break;
 case'savetx':saveTx();break;
 case'deltx':if(!m.confirmDel){m.confirmDel=true;renderModal();break}{const id=m.d.ID;S.modal=null;remove('Transactions',id);toast('Deleted.')}break;
 case'copybud':copyBudgets();break;
 case'goalmove':{openTx(null);Object.assign(S.modal.d,{Type:el.dataset.t==='in'?'Transfer to Reserve':'Withdraw from Reserve',Goal:v});renderModal();break}
 case'goalnew':S.modal={kind:'goal',isNew:true,d:{Goal_ID:uid('G'),Goal_Name:'',Target_Amount:'',Target_Date:'',Opening_Saved:''}};renderModal();break;
 case'goaledit':{const g=D.Reserves_Goals.find(x=>x.Goal_ID===v);S.modal={kind:'goal',d:{...g}};renderModal();break}
 case'savegoal':{const d=m.d;if(!String(d.Goal_Name||'').trim()){toast('Give the goal a name.');break}
  upsert('Reserves_Goals',{Goal_ID:d.Goal_ID,Goal_Name:d.Goal_Name.trim(),Target_Amount:num(d.Target_Amount),Target_Date:d.Target_Date||'',Opening_Saved:num(d.Opening_Saved)});S.modal=null;renderModal();toast('Goal saved.');break}
 case'catnew':S.modal={kind:'cat',isNew:true,d:{Category_ID:uid('C'),Name:'',Group:'Other',Icon:'',Active:'Yes',Color:PAL[D.Categories.length%PAL.length]}};renderModal();break;
 case'catedit':{const c=catById(v);S.modal={kind:'cat',d:{...c,Color:catColor(v)}};renderModal();break}
 case'savecat':{const d=m.d;if(!String(d.Name||'').trim()){toast('Give it a name.');break}upsert('Categories',{Category_ID:d.Category_ID,Name:d.Name.trim(),Group:d.Group||'Other',Icon:d.Icon||'',Active:d.Active==='No'?'No':'Yes',Color:d.Color||''});S.modal=null;renderModal();toast('Category saved.');break}
 case'subnew':S.modal={kind:'sub',isNew:true,d:{Sub_ID:uid('S'),Name:'',Category:S.cat||'',Kind:'Variable',Icon:'',Active:'Yes'},budget:''};renderModal();break;
 case'subedit':{const s=subById(v);const b=D.Budgets.find(x=>String(x.Month)===S.ym&&x.Sub_Category===v);S.modal={kind:'sub',d:{...s},budget:b?num(b.Budget_Amount):''};renderModal();break}
 case'savesub':{const d=m.d;if(!String(d.Name||'').trim()){toast('Give it a name.');break}if(!d.Category){toast('Pick its category.');break}
  const ops=[{action:'upsert',table:'Sub_Categories',row:{Sub_ID:d.Sub_ID,Name:d.Name.trim(),Category:d.Category,Kind:d.Kind||'Variable',Icon:d.Icon||'',Active:d.Active==='No'?'No':'Yes'}}];
  const bn=num(toLatin(m.budget||''));const ex=D.Budgets.find(x=>String(x.Month)===S.ym&&x.Sub_Category===d.Sub_ID);
  if(ex||bn>0)ops.push({action:'upsert',table:'Budgets',row:{Budget_ID:ex?ex.Budget_ID:`B-${S.ym}-${d.Sub_ID}`,Month:S.ym,Sub_Category:d.Sub_ID,Budget_Amount:bn}});
  S.modal=null;batch(ops);toast('Sub-category saved.');break}
 case'blocked':m.blocked='This is already used, so it can’t be deleted. Set it to Hidden instead — its history stays.';renderModal();break;
 case'delrow':{if(!m.confirmDel){m.confirmDel=true;renderModal();break}const t={cat:['Categories',m.d.Category_ID],sub:['Sub_Categories',m.d.Sub_ID],goal:['Reserves_Goals',m.d.Goal_ID]}[m.kind];S.modal=null;
  if(m.kind==='sub'){const ops=[{action:'delete',table:'Sub_Categories',id:t[1]},...D.Budgets.filter(b=>b.Sub_Category===t[1]).map(b=>({action:'delete',table:'Budgets',id:b.Budget_ID}))];batch(ops)}else remove(t[0],t[1]);toast('Deleted.');break}
 case'logrec':{const r=D.Recurring.find(x=>x.Item===v);const s=subById(r.Sub_Category);openTx(null);Object.assign(S.modal.d,{Amount:String(num(r.Amount)),Category:r.Category||(s&&s.Category)||'',Sub_Category:r.Sub_Category||'',Payment_Method:r.Payment_Method||'Bank'});renderModal();break}
 case'reload':load();toast('Syncing…');break;
 case'signout':ls.del('hb-key');ls.del('hb-cache');location.reload();break;
 }});
document.addEventListener('input',e=>{const id=e.target.id;
 if(id==='q')quickPreview();
 else if(id==='sq'){S.q=e.target.value;render()}
 else if(id==='m-tag'){const q=norm(e.target.value);const box=$('#tagsugg');if(!box)return;const d=S.modal.d;
  box.innerHTML=allTags().filter(g=>!d.Tags.some(x=>norm(x)===g.k)&&(!q||g.k.includes(q))).slice(0,10).map(g=>`<button class="chip" data-act="picktag" data-v="${esc(g.name)}"><span class="tag" style="--c:${hashColor(g.name)}">#${esc(g.name)}</span></button>`).join('')}});
document.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.bud!==undefined){setBudget(t.dataset.bud,t.value);t.blur();render()}
 else if(t.dataset.acc!==undefined){const a=D.Accounts.find(x=>x.Account_ID===t.dataset.acc);upsert('Accounts',{Account_ID:a.Account_ID,Name:a.Name,Opening_Balance:num(toLatin(t.value))});toast(a.Name+' opening balance saved.')}
 else if(t.dataset.set!==undefined){const k=t.dataset.set;const val=k==='Start_Date'?t.value:num(toLatin(t.value));upsert('Settings',{Key:k,Value:val});toast('Saved.')}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const id=e.target.id;
 if(id==='q'){e.preventDefault();quickAdd()}else if(id==='m-tag'){e.preventDefault();$('[data-act="addtag"]').click()}
 else if(e.target.dataset&&(e.target.dataset.bud!==undefined||e.target.dataset.acc!==undefined||e.target.dataset.set!==undefined))e.target.blur()});
document.addEventListener('submit',async e=>{if(e.target.id!=='login')return;e.preventDefault();const u=$('#lg-url');if(u)ls.set('hb-api',u.value.trim());ls.set('hb-key',$('#lg-key').value.trim());
 $('#app').querySelector('.err').textContent='Connecting…';await load()});
function syncToday(){const cur=curYm();if(S.lastMonth!==cur){S.lastMonth=cur;if(S.ymAuto){S.ym=cur;S.cat=null}render()}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){syncToday();if(Date.now()-S.lastSync>30000)load(true)}});
setInterval(syncToday,60000);

/* ================= Boot ================= */
S.lastMonth=curYm();
(function boot(){const c=ls.get('hb-cache');if(c&&api.key()){try{applyData(JSON.parse(c));render()}catch(e){}}
 if(!api.key()){renderLogin();return}load()})();
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
