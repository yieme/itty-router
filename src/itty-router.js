function Router({ base = '', routes = {} } = {}) {
  return {
    __proto__: new Proxy({}, {
      get: (target, prop, receiver) => (route, ...handlers) =>
        routes[prop.toUpperCase()].push([
          RegExp(`^${(base + route)
            .replace(/(\/?)\*/g, '($1.*)?')                             // trailing wildcard
            .replace(/\/$/, '')                                         // remove trailing slash
            .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')         // named params
            .replace(/\.(?=[\w(])/, '\\.')                              // dot in path
            .replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.') // optional image format
          }/*$`),
          handlers,
        ]) && receiver
    }),
    routes,
    async handle (request, ...args) {
      let methodRoutes, response, match, url = new URL(request.url)
      request.query = Object.fromEntries(url.searchParams)
      methodRoutes = routes[request.method] || routes.ALL || []
      for (let [route, handlers] of methodRoutes) {
        if ((match = url.pathname.match(route))) {
          request.params = match.groups
          for (let handler of handlers) {
            if ((response = await handler(request.proxy || request, ...args)) !== undefined) return response
          }
        }
      }
    }
  }
}

module.exports = {
  Router
}
