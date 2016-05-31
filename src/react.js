import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Router from './index.js';

class RouterComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const match = this.props.children.find(
      c => c.props.name === this.props.routeName
    );

    if (!match) {
      throw new Error("No match");
    }

    return match;
  }
}
RouterComponent.propTypes = {
  routeName: PropTypes.string,
  children: PropTypes.node.isRequired
};

const RouterContainer = connect(
  state => ({ routeName: state && state.route && state.route.routeName })
)(RouterComponent);

const defaultMapRouteToProps = (route) => ({ params: route.params });

const Route = ({component, mapRouteToProps}) => {
  if (mapRouteToProps === undefined)
    mapRouteToProps = defaultMapRouteToProps;

  return mapRouteToProps
    ? React.createElement(connectRouter(mapRouteToProps, component))
    : React.createElement(component);
};
Route.propTypes = {
  component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  mapRouteToProps: PropTypes.oneOfType([PropTypes.bool, PropTypes.func])
};

const Link = ({to, children, params, queryParams, hashParams, title}) => {
  const path = Router.pathFor(to, { params, queryParams, hashParams });
  const onClick = (event) => {
    Router.go(to, { params, queryParams, hashParams });
    event.preventDefault();
    return false;
  };

  return (
    <a href={path} title={title} onClick={onClick}>{children}</a>
  );
};
Link.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  params: PropTypes.object,
  queryParams: PropTypes.object,
  hashParams: PropTypes.object,
  title: PropTypes.string
};

const connectRouter = (map, Component) => {
  if (!Component) {
    Component = map;
    map = route => ({ route: route });
  }

  return connect(state => map(state && state.route))(Component);
};

export { RouterContainer as Router, Route, Link, connectRouter };
