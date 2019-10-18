import PropTypes from 'prop-types';
import React from 'react';
import YAML from 'js-yaml';

export default function Preview({ value }) {
  const content = YAML.dump(value.toJS()); 
  return <div><pre>
    { content }
  </pre></div>;
}

Preview.propTypes = {
  value: PropTypes.node,
};
