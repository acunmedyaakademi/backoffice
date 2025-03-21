export function getPage(routes, url) {
  // BUG: eğer sayfa adresi / ile başlıyorsa ve sayfa yoksa anasayfaya gönderiyor
  // TODO: anasayfa için ekstra kontrol eklemeliyiz.
  return routes.findLast(x => url.startsWith(x.url)) ?? notFound;
}

export function getlUrlParam() {
  return location.href.replace(location.origin, '').split('/').at(-1);
}