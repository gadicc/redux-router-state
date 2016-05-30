import React from 'react';

import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import jsdom from 'jsdom';

import Router from './index';
import { Router as RouterComp, Route, Link } from './react';

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
        <Route name="irrelevent">
          <TestComp>hi</TestComp>
        </Route>
      );

      expect(wrapper.html()).to.equal('<div>test</div>');
    });
  });

  describe('Link', () => {

    it('creates correct anchor tag', () => {
      Router._clearRoutes();
      Router.add('issues', '/issues/:id');
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

});