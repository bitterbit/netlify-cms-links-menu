import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import React from 'react';
import { Container, GroupListItem, PlusListItem, LinkListItem } from './components.js';
import { fromJS } from 'immutable';

import AsyncSelect from 'react-select/lib/Async';
import { reduce } from 'rxjs/operators';

const defaultLinks = [
	{title: "One",   href: "#one"},
	{title: "Two",   href: "#two"},
	{title: "Three", href: "#three"},
	{title: "Four",  children: [
		{title: "Four point One", href: "#four.one"}
	]},
];

function renderLinkItem(item, index){
  const key="render-item"+index + Math.random();
  return <LinkListItem key={key} value={item.get("href")}>{item.get("title")}</LinkListItem>;
}

/* React Async Select Styles */
const customStyles = {
  control: (base, state) => ({
    ...base,
    height: '32px',
    minHeight: '32px',
    border: 'none',
    boxShadow: 'none',
  }),
  
  valueContainer: (base, state) => ({
      ...base,
      padding: '0',
  }),
};

const customTheme = theme => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: 'rgb(223, 223, 227)',
  }
});

export default class Control extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    forID: PropTypes.string.isRequired,
    value: PropTypes.node,
    field: ImmutablePropTypes.map,
    query: PropTypes.func.isRequired,
    queryHits: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    classNameWrapper: PropTypes.string.isRequired,
    setActiveStyle: PropTypes.func.isRequired,
    setInactiveStyle: PropTypes.func.isRequired,
  };


  getValue = () => {
    return this.props.value || fromJS(defaultLinks);
  }

  renderLinkItems = () => {
    const value = this.getValue();
    return value.map((item, index) => {
      let children = item.get("children");
      
      if (children !== undefined && children.size > 0) {
        const childrenItems = children.map((child, i) => {
          return renderLinkItem(child, i);
        });

        return <GroupListItem key={index}>{item.get("title")}
            <ul>{childrenItems}</ul>
          </GroupListItem>;
      }
      
      return renderLinkItem(item, index); 
    });
  }

  handleAdd = (title) => {
    const listValue = this.getValue();
    const { onChange } = this.props;
    const parsedValue = fromJS({title: title, href: "#new!"});
    console.log(parsedValue);
    onChange((listValue || List()).push(parsedValue));
  }

  handleKeyUp = (e) => {
    e.preventDefault();
    if (e.which == 13) { // Enter
      let content = e.target.textContent;
      e.target.textContent = "";
      this.handleAdd(content); 
    }
  }

  handleFocus = (e) => {
    if (e.target.textContent === "New Item") {
      e.target.textContent = "";
    }
  }

  handleUnFocus = (e) => {
    if (e.target.textContent.length == 0) { 
      e.target.textContent = "New Item";
    }
  }

  loadOptions = (inputValue, callback) => {
    const { query, forID } = this.props;
    query(forID, "presentations",  ["title"], inputValue).then(({payload}) => {
      let results = payload.response.hits || [];
      callback(results.map((item) => {
        return {value: item.data.title, label: item.data.title};
      }));
    });
  };

  handleInputChange = (newValue) => {
    console.log("input change", newValue);
    return newValue;
  };

  render() {
    const {
      forID,
      value,
      onChange,
      classNameWrapper,
      query,
    } = this.props;

    console.log("onrender query", query, "ForID", forID);
    const linkItems = this.renderLinkItems();
    
    return (
      <Container>
        {linkItems}
        <PlusListItem 
          key="plus-list-item"
          onKeyUp={this.handleKeyUp}
          onFocus={this.handleFocus} 
          onBlur={this.handleUnFocus}>
          <div contenteditable="true">New Item</div>
        </PlusListItem>

        <PlusListItem>
          <AsyncSelect
            loadOptions={this.loadOptions}
            onInputChange={this.handleInputChange}
            styles={customStyles}
            theme={customTheme}
            placeholder={'New Item...'}
          />
        </PlusListItem>
        
      </Container>
    );
  }
}