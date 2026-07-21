const CACHE='rintaro-world-v62-20260721a';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
function isPage(req){
  if(req.mode==='navigate')return true;
  const p=new URL(req.url).pathname;
  return p.endsWith('/')||p.endsWith('/index.html');
}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(isPage(e.request)){
    e.respondWith(
      fetch(e.request).then(r=>{
        if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>{c.put('./index.html',cp.clone());c.put('./',cp);});}
        return r;
      }).catch(()=>caches.match('./index.html',{ignoreSearch:true}))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request,{ignoreSearch:true}).then(hit=>hit||fetch(e.request).then(r=>{
      if(r.ok&&new URL(e.request.url).origin===location.origin){
        const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));
      }
      return r;
    }))
  );
});
