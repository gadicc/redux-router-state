import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Router from './index.js';

const DefaultLayout = ({Content}) => (
  <Content />
);

function chooseLayout(match, props) {
  if (match.data) {
    if (match.data.Layout)
      return match.data.Layout;
    if (match.data.Layout === null)
      return DefaultLayout;
    if (props.Layout)
      return props.Layout;
    return DefaultLayout;
  }
}

const instances = [];

Router.on('matchedAdd', () => {
  instances.forEach(comp => comp.forceUpdate());
});

class RouterComponent extends Component {
  constructor(props) {
    super(props);

    let children = props.children ?
      (Array.isArray(props.children) ? children : [ children ]) : [];

    children.forEach(route => {
      if (!Router._routes[route.props.name])
        Router.add(route.props.name, route.props.path);
    });

    instances.push(this);
  }

  componentWillUnmount() {
    instances.remove(this);
  }

  render() {
    let Layout, match;

    // from a <Route> element
    if (this.props.children) {
      match = this.props.children.find(
        c => c.props.name === this.props.routeName
      );
      if (match) {
        Layout = chooseLayout(match, this.props);
        return <Layout Content={match} />;
      }
    }

    // from a Router.add with a data: { component: <ReactComponent> }
    match = Router._routes[this.props.routeName];
    if (match) {
      if (match.data && match.data.component) {
        Layout = chooseLayout(match, this.props);
        return <Layout Content={match.data.component} />;
      }
      else
        throw new Error("No { component: <ReactComponent> } data for "
          + this.props.routeName + " (from non-<Router> match)");
    }

    if (!match)
      throw new Error("No match");
  }
}
RouterComponent.propTypes = {
  routeName: PropTypes.string,
  children: PropTypes.node,
  Layout: PropTypes.func
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
