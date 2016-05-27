# redux-router-state

Store router state in Redux and route via redux

## Goals:

* Storing router state in redux is a design principle, not an after thought
* `Router.go()`, `Router.setParams()`, etc dispatch actions to the redux store.
* `pushState, replaceState etc fire on changes to *redux* state (i.e. time travel works great out the box).
* The (optional) react <Router> component subscribes to redux router state for changes
* See "Related Projects" at the bottom of the README for (dis)similar alternatives

## Usage:

```js
import Router from 'redux-router-state';

Router.add('issue_id', '/issues/:id');
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

### Related projects:

* Similar to [universal-redux-router](https://www.npmjs.com/package/universal-redux-router)
  but works in a slightly different (and imho simpler) way, i.e. no need to define your
  own reducers for each part of every route.

* Dissimilar to [react-router-redux](https://github.com/reactjs/react-router-redux) and
  react-router which stores state in a hidden redux store just for timetravel.
