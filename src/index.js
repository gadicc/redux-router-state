import { createStore, combineReducers } from 'redux';

const Router = {

  _routes: {},
  _store: null,
  _state: {},
  _history: window.history,

  add(name, _pattern, data) {
    const pattern = this._toRegex(_pattern);

    this._routes[name] = {
      name,
      origPattern: _pattern,
      regexp: pattern.regexp,
      params: pattern.params,
      data
    };
  },
 
  init(store) {
    this._configureStore(store);
    this._configureStoreSubscription();
  },

  /* --- Link generation --- */

  pathFor(name, options) {
    if (!options)
      return this._pathnameFor(name);

    let path = this._pathnameFor(name, options.params)
    if (options.queryParams)
      path += this._toEncodedURI(options.queryParams, '?');
    if (options.hashParams)
      path += this._toEncodedURI(options.hashParams, '#');

    return path;
  },

  _pathnameFor(name, params) {
    const route = this._routes[name];
    if (!route)
      throw new Error("No such route '" + name + "'");

    let path = route.origPattern;
    return params ? path.replace(/:(\w+)/g, (m, name) => params[name]) : path;
  },

  /* --- Navigation / updating of URL state --- */

  go(routeName, options = {}) {
    const nextState = {
      routeName,
      data: this._routes[routeName].data,
      pathname: this._pathnameFor(routeName, options.params),
      params: this._stringify(options.params) || {},
      queryParams: this._stringify(options.queryParams) || {},
      hashParams: this._stringify(options.hashParams) || {}
    };
    this._updateState(nextState);
  },

  setParams(params) {

  },

  /* --- redux integration: all methods accessing this._store methods --- */

  reducer(state, action) {
    if (!state) {
      Router._state = Router._matchAll(window.location);
      return Router._state;
    }
    if (action.type === 'ROUTE_UPDATE')
      return action.state;
    return state;
  },

  _configureStore(store) {
    if (store)
      this._store = store;
    else
      this._store = createStore(combineReducers({
        route: this.reducer,
      }));        
  },

  _configureStoreSubscription() {
    this._store.subscribe(() => {
      const nextState = this._store.getState().route;
      //console.log('store change', nextState);
      this._updateHistoryFromState(this._state, nextState);
      this._state = nextState;    
    });
  },

  _updateState(state) {
    this._store.dispatch({
      type: 'ROUTE_UPDATE',
      state,
    });
  },

  _updateHistoryFromState(prev, next) {
    if (next.pathname !== prev.pathname)
      return this._history.pushState(null, null, this.pathFor(next.routeName, next))
  },

  /* matching functions; extract router state from window.location */

  _matchAll(location) {
    return {
      ...this._matchPathname(location.pathname),
      queryParams: this._matchSearchOrHash(location.search, '?'),
      hashParams: this._matchSearchOrHash(location.hash, '#'),
    };
  },

  _matchPathname(pathname) {
    const params = {};
    let routeName = null, route, match;

    for (routeName in this._routes) {
      route = this._routes[routeName];
      match = pathname.match(route.regexp);
      if (match) {
        for (let i = 0; i < route.params.length; i++)
          params[route.params[i]] = match[i + 1];
        break;
      }
    }

    return {
      routeName,
      pathname,
      params,
      data: route ? route.data : undefined,
    };
  },

  _matchSearchOrHash(search, firstChar) {
    const params = {};
    if (search[0] === firstChar) {
      const parts = search.substr(1).split('&');
      parts.forEach((part) => {
        const parts = part.split('=');
        if (parts[0].endsWith('[]')) {
          const name = parts[0].substr(0, parts[0].length-2);
          if (!params[name])
            params[name] = [];
          params[name].push(parts[1]);
        } else
          params[parts[0]] = parts[1];
      });
    }
    return params;
  },

  /* utility functions */

  _toEncodedURI(obj, firstChar) {
    let out = firstChar;
    for (let key in obj)
      out += key + '=' + encodeURIComponent(obj[key]) + '&';
    return out.substr(0, out.length-1);
  },

  _toRegex(_pattern) {
    const params = [];
    const pattern = _pattern.replace(/:(\w+)/g, (match, name) => {
      params.push(name);
      return '([^/]+?)';
    });
    return {
      regexp: new RegExp('^' + pattern + '$'),
      params,
    };
  },

  /*
   * Given an object of depth 1, make sure all it's values are Strings
   */
  _stringify(obj) {
    const out = {};
    for (let key in obj)
      out[key] = obj[key].toString();
    return out;
  },

  /* Useful for testing or obscure cases */

  _clearRoutes() {
    for (const name in this._routes)
      delete this._routes[name];
  },

  _hrefRE: /(.+?:)\/\/(.+?)(\/.+?)(\?.+?)?(#.+)?$/,
  _locationFromUrl(href) {
    const match = href.match(this._hrefRE);
    return {
      href,
      protocol: match[1],
      host: match[2],
      pathname: match[3],
      search: match[4],
      hash: match[5],
    };
  },

};

/*
window.onpopstate = function(event) {
  console.log("popstate: " + document.location + ", state: " + JSON.stringify(event.state));
};

window.onhashchange = function() {
  console.log("hashchange: " + document.location + ", state: " + JSON.stringify(event.state));
};
*/

export default Router;
