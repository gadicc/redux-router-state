# redux-router-state

Store router state in Redux and route via redux

## Goals:

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
Router.add('issue_id', '/issues/:id');

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
    }
  }
}
```

## React Helpers

Optional react-router inspired config:

```js
<Provider store={Store} />
  <Router>
    <Route name="home" path="/">
      <Home />
    </Route>
    <Route name="issues" path="/issues/:id">
      <Issues />
    </Route>
  </Router>
</Provider>
```

Creating links:

```js
<Link to="issues" params={{id: 1}}>Issue #1</Link>
```

### Related projects:

* Similar to [universal-redux-router](https://www.npmjs.com/package/universal-redux-router)
  but works in a slightly different (and imho simpler) way, i.e. no need to define your
  own reducers for each part of every route.

* Dissimilar to [react-router-redux](https://github.com/reactjs/react-router-redux) and
  react-router which stores state in a hidden redux store just for timetravel.
