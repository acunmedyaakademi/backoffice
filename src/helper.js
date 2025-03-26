export function getPage(routes, url) {
  return routes.findLast(x => url.startsWith(x.url)) ?? notFound;
}

export function getlUrlParam() {
  return location.href.replace(location.origin, '').split('/').at(-1);
}