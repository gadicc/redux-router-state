import React from 'react';
import { Provider } from 'react-redux';

import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import jsdom from 'jsdom';

import Router from './index';
import { Router as RouterComp, Route, Link, connectRouter } from './react';

const document = jsdom.jsdom('<!doctype html><html><body></body></html>', {
  url: 'http://127.0.0.1:3000/'
});

const window = document.defaultView;
global.document = document;
global.window = window;
global.navigator = window.navigator; // for reactDOM

Router.init();

/* globals describe it */

describe('React components', () => {

  const TestComp = () => ( <div>test</div> );

  describe('Router', () => {

    it("passes through the correct child", () => {
      Router._clearRoutes();
      Router.add('users', '/users');
      Router.add('home', '/');
      Router.go('home');

      const wrapper = mount(
        <Provider store={Router._store}>
          <Router>
            <Route name="home" component={TestComp} />
          </Router>
        </Provider>
      );

      console.log(wrapper.find(TestComp));
      expect(wrapper.find(TestComp)).to.be.true;

    });

    if(0)
    it("calls Router.add for new routes", () => {
      Router._clearRoutes();
      Router.add('home', '/');
      Router.go('home');

      shallow(
        <Provider store={Router._store}>
          <Router>
            <Route name="users" path="/users" component={TestComp} />
          </Router>
        </Provider>
      );

      expect(Router._routes['users']).to.exist;
    });
  });

  describe('Route', () => {
    it("renders it's component", () => {
      const wrapper = mount(
        <Route name="irrelevent" component={TestComp} mapRouteToProps={false} />
      );

      expect(wrapper.html()).to.equal('<div>test</div>');
    });

    it('by default provides route params as props.params', () => {
      Router._clearRoutes();
      Router.add('issue', '/issues/:id');
      Router.go('issue', { params: { id: 1 }});

      const wrapper = mount(
        <Provider store={Router._store}>
          <Route name="issue" path="/issues/:id" component={TestComp} />
        </Provider>
      );
      expect(wrapper.find(TestComp).props().params.id).to.equal('1');
    });

    it('accepts a mapRouteToProps', () => {
      Router._clearRoutes();
      Router.add('issue', '/issues/:id');
      Router.go('issue', { params: { id: 1 }});

      const wrapper = mount(
        <Provider store={Router._store}>
          <Route name="issue" path="/issues/:id" component={TestComp}
            mapRouteToProps={route => ({ id: route.params.id })} />
        </Provider>
      );
      expect(wrapper.find(TestComp).props().id).to.equal('1');
    });
  });

  describe('Link', () => {

    before(() => {
      Router._clearRoutes();
      Router.add('issues', '/issues/:id');
    });

    it('creates correct anchor tag', () => {
      const wrapper = mount(
        <Link to="issues" params={{id:1}} title="Test"
          queryParams={{action:'edit'}}>test</Link>
      );

      expect(wrapper.html()).to
        .equal('<a href="/issues/1?action=edit" title="Test">test</a>')
    });

    it('prevents default', () => {

    });

    it('routes correctly', () => {

    });
  });

  describe('connectRouter', () => {

    it('has a default map', () => {
      Router.go('issues', { params: { id: 1 }});

      const Container = connectRouter(TestComp);

      const wrapper = shallow(<Container store={Router._store}/>);
      expect(wrapper.props().route).to.deep.equal({
        routeName: 'issues',
        data: undefined,
        pathname: '/issues/1',
        params: { id: '1' },
        queryParams: {},
        hashParams: {}
      });
    });

    it('accepts a custom map', () => {
      Router.go('issues', { params: { id: 1 }});

      const Container = connectRouter(
        route => ({ id: route.params.id }),
        TestComp
      );

      const wrapper = shallow(<Container store={Router._store}/>);
      expect(wrapper.props().id).to.equal('1');
    });

  });

});
