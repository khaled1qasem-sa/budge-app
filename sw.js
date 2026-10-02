// Network-first: every open fetches the newest version; cache is only the offline fallback.
const CACHE='bb-v1';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin) return;
  e.respondWith(fetch(e.request.url,{cache:'no-store'}).then(r=>{const c=r.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)); return r;}).catch(()=>caches.match(e.request)));
});
