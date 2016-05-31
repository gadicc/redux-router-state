# redux-router-state

Store router state in Redux and route via redux

[![npm](https://img.shields.io/npm/v/redux-router-state.svg?maxAge=2592000)](https://www.npmjs.com/package/redux-router-state) [![Circle CI](https://circleci.com/gh/gadicc/redux-router-state.svg?style=shield)](https://circleci.com/gh/gadicc/redux-router-state) [![Coverage Status](https://coveralls.io/repos/github/gadicc/redux-router-state/badge.svg?branch=master)](https://coveralls.io/github/gadicc/redux-router-state?branch=master) ![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

Copyright (c) 2016 Gadi Cohen &lt;dragon@wastelands.net&gt;, released under the MIT license.

## Design Goals:

* Storing router state in redux is a design principle, not an after thought
* `Router.go()`, `Router.setParams()`, etc dispatch actions to the redux store.
* `pushState, replaceState etc fire on changes to *redux* state (i.e. time travel works great out the box).
* The (optional) react <Router> component subscribes to redux router state for changes
* See "Related Projects" at the bottom of the README for (dis)similar alternatives

## Setup and Pure-JS (no react usage)

*See below for React helpers*

```js
import { combineReducers, createStore } from 'redux';
import Router from 'redux-router-state';

// Add your routes BEFORE creating your Store with the reducer
// This step could be done for via the React helper, see below.
Router.add('home', '/');
Router.add('issue_id', '/issues/:id', optionalData);

// Include Router.reducer when setting up your reducers
const reducers = combineReducers({
  route: Router.reducer
});

// However you usually create your store
const Store = createStore(reducers, {},
  window.devToolsExtension && window.devToolsExtension()
);

// Initialize the Router with your store.
Router.init(Store);
```

State:

```js
{
  // http://x.com/issues/1/?action=edit#mode=markdown
  Router: {
    name: 'issue_id',
    pathname: '/issues/1/'
    params: {
      id: 1
    },
    query: {
      action: 'edit'
    },
    hash: {
      mode: 'markdown'
    },
    data: optionalData
  }
}
```

**What about feature XXX?  What about forced login?**

Get out of the habit of thinking about the Router as a separate entity, and realize that it's now just like any other state in your store.  A lot of the the things we needed before as router features can now just be done by subscribing to state changes or with additional reducer functions.  e.g.

```js
Router.add('inbox', '/inbox', { requiresLogin: true });

// Not implemented yet, still planning...
const customRouteReducer = (routeState) => {
  routeState = Router.reduce(routeState);
  if (routeState.data.requiresLogin && !loggedIn)
    Router.rewriteState(routerState, 'loginPage');
  return routerState;
};

// With your other reducers...
const reducers = combineReducers({
  route: customRouteReducer
});
```

May still go with groups, `onReduce`, and/or similar methods.

## React

**Optional react-router inspired config:**

```js
const App = () => (
  <Provider store={Store} />
    <Router>
      <Route name="home" path="/" component={Home} />

      <Route name="issues" path="/issues/:id" component={ShowIssue} />

      <Route name="users" path="/users" component={ShowUsers}
        mapRouteToProps={route => {asc: route.queryParams.asc}} />

      <Route name={null} component={NotFound} />
    </Router>
  </Provider>
);

const ShowIssue({params}) => (
  <h1>Issue #{params.id}</h1>
);

const ShowUsers({asc}) => (
  <h1>Users ({asc?"Asceending":"Descending")</h1>
);

```

**Creating links:**

```js
<Link to="issues" params={{id: 1}}>Issue #1</Link>
```

**Accessing route info:**

**NB: all params are provided as Strings**, since they come from the URL.  It's up to you to convert to Numbers, if needed (e.g. before comparisons).

By default, only the route params are passed down as individual props, to avoid unnecessary re-rendering.  You can override this with the `mapRouteToProps` attribute (as above), and/or, use the `connectRouter` HOC on individual compoents that works pretty much how you'd expect:

`connectRouter([optionalMappingFunction], Component)`

```js
const showIssue = routerConnect(
  // optional mapping function, provides 'id' as the only prop
  (route) => { id: route.params.id },

  // display component, could be an existing constant
  (id) => ( <h1>Issue #{id}</h1> )
);
```

// Without the optional mapping function, a "route" prop is given, with the
// entire router state.  This may lead to unnecessary re-rendering.
```

Like `react-redux`'s `connect` (which we use), it assumes a `<Provider>` ancestor.

**Anything more complicated?**

Don't forget, the above are just convenience helpers.  Your entire route state is available in the redux store, that you can use just like any other state.

### Related projects:

* Similar to [universal-redux-router](https://www.npmjs.com/package/universal-redux-router)
  but works in a slightly different (and imho simpler) way, i.e. no need to define your
  own reducers for each part of every route.

* Dissimilar to [react-router-redux](https://github.com/reactjs/react-router-redux) and
  react-router which stores state in a hidden redux store just for timetravel.
