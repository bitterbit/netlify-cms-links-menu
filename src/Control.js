import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import React from 'react';
import { Container, GroupListItem, PlusListItem, LinkListItem } from './components.js';
import { fromJS } from 'immutable';
import AsyncSelect from 'react-select/lib/Async';

const ROOT_ID = 'root';

const FIELD_TITLE = 'title';
const FIELD_CHILDREN = 'children';
const FIELD_HREF = 'href';

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
  return <LinkListItem 
    key={key} 
    value={item.get(FIELD_HREF)}>
      {item.get(FIELD_TITLE)}
  </LinkListItem>;
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
      let children = item.get(FIELD_CHILDREN);
      
      if (children !== undefined && children.size > 0) {
        const childrenItems = children.map((child, i) => {
          return renderLinkItem(child, i);
        });

        const addNewItem = this.renderSelect(item.get(FIELD_TITLE));
        return <GroupListItem key={index}>{item.get(FIELD_TITLE)}
            <ul>
              {childrenItems}
              {addNewItem}
            </ul>
          </GroupListItem>;
      }
      
      return renderLinkItem(item, index); 
    });
  }

  renderSelect = parent => {
    return <PlusListItem>
      <AsyncSelect
        onChange={this.handleSelectChangedFor(parent)}
        cacheOptions
        defaultOptions
        loadOptions={this.loadOptions}
        styles={customStyles}
        theme={customTheme}
        placeholder={'New Item...'}
      />
    </PlusListItem>;
  };

  addItem = (parent, title, href) => {
    let listValue = this.getValue() || List();
    const { onChange } = this.props;
    const parsedValue = fromJS({title: title, href: href});

    if (parent != ROOT_ID){
      listValue = listValue.update(
        listValue.findIndex(item => item.get(FIELD_TITLE) === parent), 
        item => {
          const newchildren = item.get(FIELD_CHILDREN).push(parsedValue);
          return item.set(FIELD_CHILDREN, newchildren);
        }
      );
    } else {
      // Add to root
      listValue = listValue.push(parsedValue);
    }
    
    onChange(listValue);
  }

  loadOptions = (inputValue, callback) => {
    const { query, forID } = this.props;
    query(forID, "presentations",  ["title"], inputValue).then(({payload}) => {
      let results = payload.response.hits || [];
      callback(results.map((item) => {
        console.log("result", item);
        return {value: item.slug, label: item.data.title};
      }));
    });
  };

  handleSelectChangedFor = parent => {
    return (newValue, event) => this.handleSelectChange(newValue, event, parent);
  }

  handleSelectChange = (newValue, event, parent) => {
    if (event.action === 'select-option'){
      this.addItem(parent, newValue.label, newValue.value);
    }
  };

  render() {
    const linkItems = this.renderLinkItems();
    const addNewItem = this.renderSelect(ROOT_ID);
    return (
      <Container>
        {linkItems}
        {addNewItem}
      </Container>
    );
  }
}