import PropTypes from 'prop-types';
import React from 'react';
import {Container, GroupListItem, PlusListItem, LinkListItem} from './components.js';
import { fromJS } from 'immutable';

import AsyncSelect from 'react-select/lib/Async';

console.log(AsyncSelect);

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

export default class Control extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    forID: PropTypes.string,
    value: PropTypes.node,
    classNameWrapper: PropTypes.string.isRequired,
  }

  static defaultProps = {
    value: '',
  }

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
    console.log("load options", inputValue);
    callback([
      { value: "AAA", label: "aaa"},
      { value: "BBB", label: "bbb"},
      { value: "CCC", label: "ccc"},
    ]);
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
    } = this.props;

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
        <AsyncSelect
          loadOptions={this.loadOptions}
          onInputChange={this.handleInputChange}
        />
        
      </Container>
    );
  }
}