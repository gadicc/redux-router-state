import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Router from './index.js';

class RouterComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <RouteSelectorContainer children={this.props.children} />
    );
  }
}

const RouteSelectorContainer = connect(
  state => ({ routeName: state && state.route && state.route.routeName })
)(function RouteSelector(props) {
  const match = props.children.find(
    c => c.props.name === props.routeName
  );

  if (!match) {
    throw new Error("No match");
  }

  return match.props.children;
});

const Route = (props) => {
  return props.children;
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

export { RouterComponent as Router, Route, Link };
