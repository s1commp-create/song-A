const CACHE = 'toolbox-v2';  // ← 每次更新改这个版本号
const ASSETS = ['./index.html', './manifest.json'];

// 安装：预缓存
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求：网络优先（始终尝试获取最新，离线才用缓存）
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // 更新缓存
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});

// 通知页面有新版本
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
