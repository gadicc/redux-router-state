import { createStore, combineReducers } from 'redux';

const Router = {

  _routes: {},
  _store: null,
  _state: {},

  add(name, _pattern) {
    const pattern = this._toRegex(_pattern);

    this._routes[name] = {
      name,
      origPattern: _pattern,
      regexp: pattern.regexp,
      params: pattern.params,
    };
  },
 
  start(store) {
    if (!this._store) {
      if (!store)
        this._store = createStore(combineReducers({
          route: this.reducer
        }));        
      else
        this._store = store;
    }

    const nextState = this._matchAll(window.location);
    this._updateState(nextState);


    this._store.subscribe(() => {
      const nextState = this._store.getState().route;
      //console.log('store change', nextState);
      this._updateHistoryFromState(this._state, nextState);
      this._state = nextState;
    });
  },

  _updateHistoryFromState(prev, next) {
    if (next.pathname !== prev.pathname)
      return history.pushState(null, null, this.pathFor(next.routeName, next))
  },

  /* --- */

  pathFor(name, options) {
    if (!options)
      return this._pathnameFor(route);

    let path = this._pathnameFor(name, options.params)
    if (options.query)
      path += this._toEncodedURI(options.query, '?');
    if (options.hash)
      path += this._toEncodedURI(options.hash, '#');

    return path;
  },

  _pathnameFor(name, params) {
    const route = this._routes[name];
    if (!route)
      throw new Error("No such route '" + name + '"');

    let path = route.origPattern;
    return params ? path.replace(/:(\w+)/g, (m, name) => params[name]) : path;
  },

  /* --- typical router navigation --- */

  go(routeName, options) {
    const nextState = {
      routeName,
      pathname: this._pathnameFor(routeName, options.params),
      params: this._stringify(options.params) || {},
      query: this._stringify(options.query) || {},
      hash: this._stringify(options.hash) || {}
    };
    this._updateState(nextState);
  },

  setParams(params) {

  },

  _stringify(obj) {
    const out = {};
    for (let key in obj)
      out[key] = obj[key].toString();
    return out;
  },

  /* --- */

  _updateState(state) {
    this._store.dispatch({
      type: 'ROUTE_UPDATE',
      state
    });
  },

  reducer(state, action) {
    if (!state)
      return Router._matchAll(window.location);
    if (action.type === 'ROUTE_UPDATE')
      return action.state;
    return state;
  },

  _toEncodedURI(obj, firstChar) {
    let out = firstChar;
    for (let key in obj)
      out += key + '=' + encodeURIComponent(obj[key]) + '&';
    return out.substr(0, out.length-1);
  },

  _matchAll(location) {
    return {
      ...this._matchPathname(location.pathname),
      query: this._matchSearchOrHash(location.search, '?'),
      hash: this._matchSearchOrHash(location.hash, '#'),
    };
  },

  _matchPathname(pathname) {
    const params = {};
    let routeName = null;

    for (routeName in this._routes) {
      const route = this._routes[routeName];
      const match = pathname.match(route.regexp);
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
 * TODO
 *  - popstate, pushstate
 *  -
 */

/*
window.onbeforeunload = function(e) {
  console.log(e);
}
*/

window.onpopstate = function(event) {
  console.log("popstate: " + document.location + ", state: " + JSON.stringify(event.state));
};

window.onhashchange = function() {
  console.log("hashchange: " + document.location + ", state: " + JSON.stringify(event.state));
};

window.onload = function() {
  Router.start();
};

export default Router;
