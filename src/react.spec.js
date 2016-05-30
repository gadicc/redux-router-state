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

/* globals describe it */

describe('React components', () => {

  describe('Router', () => {

    it("passes through the correct child", () => {
      Router._clearRoutes();
      Router.add('home', '/');
      Router.add('users', '/users');

      const TestComp = () => { return ( <div>test</div> ); };
    });
  });

  describe('Route', () => {
    it('passes through it\'s child', () => {
      const TestComp = () => { return ( <div>test</div> ); };

      const wrapper = mount(
        <Route name="irrelevent" mapRouteToProps={false}>
          <TestComp>hi</TestComp>
        </Route>
      );

      expect(wrapper.html()).to.equal('<div>test</div>');
    });

    it('by default provides route params as props', () => {
      Router._clearRoutes();
      Router.add('issue', '/issues/:id');
      Router.init();
      Router.go('issue', { params: { id: 1 }});
      const Div = () => (<div />);

      const wrapper = mount(
        <Provider store={Router._store}>
          <Route name="issue" path="/issues/:id"><Div/></Route>
        </Provider>
      );
      expect(wrapper.find(Div).props().id).to.equal('1');
    });

    it('accepts a mapRouteToProps', () => {
      Router._clearRoutes();
      Router.add('issue', '/issues/:id');
      Router.init();
      Router.go('issue', { params: { id: 1 }});
      const Div = () => (<div />);

      const wrapper = mount(
        <Provider store={Router._store}>
          <Route name="issue" path="/issues/:id"
            mapRouteToProps={route => ({ id: route.params.id })}
          ><Div /></Route>
        </Provider>
      );
      console.log(wrapper.find(Div).props());
      expect(wrapper.find(Div).props().id).to.equal('1');
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
      Router.init();
      Router.go('issues', { params: { id: 1 }});

      const TestComp = () => { return ( <div>test</div> ); };
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
      Router.init();
      Router.go('issues', { params: { id: 1 }});

      const TestComp = () => { return ( <div>test</div> ); };
      const Container = connectRouter(
        route => ({ id: route.params.id }),
        TestComp
      );

      const wrapper = shallow(<Container store={Router._store}/>);
      expect(wrapper.props().id).to.equal('1');
    });

  });

});
