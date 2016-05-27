import jsdom from 'jsdom';
import { expect } from 'chai';

/* globals describe it */

const document = jsdom.jsdom('<!doctype html><html><body></body></html>', {
  url: 'http://127.0.0.1:3000/'
});

const window = document.defaultView;
global.document = document;
global.window = window;

propagateToGlobal(window);

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
function propagateToGlobal (window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) continue
    if (key in global) continue

    global[key] = window[key]
  }
}

const Router = require('./index.js').default;
Router.start();

describe('Router', () => {

  describe('matches', () => {

    it('pathnames', () => {
      let result;
      Router._clearRoutes();
      Router.add('issues_id', '/issues/:id');
      Router.add('issues_action', '/issues/:id/:action');

      result = Router._matchPathname('/issues/1');
      expect(result).to.deep.equal({
        routeName: 'issues_id',
        pathname: '/issues/1',
        params: { id: '1' }
      });

      result = Router._matchPathname('/issues/1/edit');
      expect(result).to.deep.equal({
        routeName: 'issues_action',
        pathname: '/issues/1/edit',
        params: { id: '1', action: 'edit' }
      });
    });

    describe('queries/search/hash', () => {
      it('none', () => {
        const result = Router._matchSearchOrHash('', '?');
        expect(result).to.deep.equal({});   
      });

      it('one', () => {
        const result = Router._matchSearchOrHash('?a=1', '?');
        expect(result).to.deep.equal({ a: '1' });
      });

      it('many', () => {
        const result = Router._matchSearchOrHash('?a=1&b=2', '?');
        expect(result).to.deep.equal({ a: '1', b: '2' });
      });

      it('arrays', () => {
        const result = Router._matchSearchOrHash('?a[]=1&a[]=2', '?');
        expect(result).to.deep.equal({ a: ['1','2'] });
      });
    });

    it('everything', () => {
      Router._clearRoutes();
      Router.add('issues', '/issues/:id');
      const url = "http://x.com/issues/1?a=1&b=2#c=3&d=4";
      const result = Router._matchAll(Router._locationFromUrl(url));

      expect(result).to.deep.equal({
        routeName: 'issues',
        pathname: '/issues/1',
        params: { id: '1' },
        query: { a: '1', b: '2' },
        hash: { c: '3', d: '4' }
      });

    });

  }); /* matches */

  describe('detects route changes', () => {

    it('on startup', () => {
    });

  });

  describe('redux', () => {

    it('has initial state', () => {
      const state = Router._store.getState().route;
      console.log(state);

      expect(state).to.deep.equal({
        routeName: null,
        pathname: '/',
        params: {},
        query: {},
        hash: {}
      });
    });

    it('updates with go', () => {
      Router._clearRoutes();
      Router.add('issues', '/issues/:id');

      Router.go('issues', {
        params: { id: 1 }
      });

      const state = Router._store.getState().route;
      expect(state).to.deep.equal({
        routeName: 'issues',
        pathname: '/issues/1',
        hash: {},
        query: {},
        params: {
          id: '1'
        }
      });
    });

  });

  describe('linking', () => {

    it('with pathFor', () => {
      Router._clearRoutes();
      Router.add('issues', '/issues/:id');

      const path = Router.pathFor('issues', {
        params: { id: 1 },
        query: { a: 2, b: 3 },
        hash: { c: 4, d: 5 }
      });
      expect(path).to.equal('/issues/1?a=2&b=3#c=4&d=5');
    });

  }); /* describe linking */

}); /* describe Router */
