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

    return match.props.children;
  }
}
RouterComponent.propTypes = {
  routeName: PropTypes.string,
  children: PropTypes.node.isRequired
};

const RouterContainer = connect(
  state => ({ routeName: state && state.route && state.route.routeName })
)(RouterComponent);

function defaultMapRouteToProps(route) {
  return { ...route.params };
}

// This is only so complicated to support mapStateToProps, but it's a useful
// shortcut.
class Route extends Component {
  constructor(props) {
    super(props);

    let mapStateToProps;
    if (props.mapRouteToProps)
      mapStateToProps = props.mapRouteToProps;
    else if (props.mapRouteToProps === false)
      mapStateToProps = false;
    else
      mapStateToProps = defaultMapRouteToProps;

    if (mapStateToProps) {
      this.state = mapStateToProps(Router._store.getState().route);
      this._unsubsribe = Router._store.subscribe(() => {
        this.state = mapStateToProps(Router._store.getState().route);
      });
    } else
      this.state = {};
  }

  compnoentWillUnmount() {
    this._unsubsribe();
  }

  render() {
    return React.cloneElement(
      this.props.component || this.props.children,
      this.state
    );
  }
}
Route.propTypes = {
  component: PropTypes.node,
  children: PropTypes.node,
  mapRouteToProps: PropTypes.oneOfType([PropTypes.bool, PropTypes.func])
};

const Link = ({to, children, params, queryParams, hashParams, title}) => {
  const path = Router.pathFor(to, { params, queryParams, hashParams });
  const onClick = (event) => {
    Router.go(to, { params, query: queryParams, hashParams });
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
