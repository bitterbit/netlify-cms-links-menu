import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import React from 'react';

import { fromJS } from 'immutable';
import AsyncSelect from 'react-select/lib/Async';
import AsyncSelectCreatable from 'react-select/lib/AsyncCreatable';

import { Container, PlusListItem, UL } from './components.js';
import ListItem from './ListItem.js'

const ROOT_ID = 'root';

const FIELD_TITLE = 'title';
const FIELD_CHILDREN = 'children';
const FIELD_HREF = 'href';

const defaultLinks = [
	{title: "One",   href: "#one"},
	{title: "Two",   href: "#two"},
	{title: "Three", href: "#three"},
	{title: "Four",  children: [
    {title: "Four point One", href: "#four.one"},
    {title: "Four point Two", href: "#four.two"}
	]},
];

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
      
      if (children !== undefined && children.size >= 0) {
        const parent = item.get("title");
        const childrenItems = children.map((child, i) => {
          return <ListItem 
            mode="link"
            title={child.get(FIELD_TITLE)} 
            href={child.get(FIELD_HREF)} 
            parent={parent}
            onDelete={this.handleDelete}
            onClickUp={this.handleMoveUp}
            onClickDown={this.handleMoveDown}
            key={parent+"-item-"+i}/>;
        });

        const addNewItem = this.renderSelect(item.get(FIELD_TITLE));
        return <ListItem mode="group" parent={ROOT_ID} 
                title={item.get(FIELD_TITLE)}
                onDelete={this.handleDelete}
                onClickUp={this.handleMoveUp}
                onClickDown={this.handleMoveDown}
                key={parent+"-group-"+index}>
                
                
            <UL key={parent+"-ul"+index}>
              {childrenItems}
              {addNewItem}
            </UL>
          </ListItem>;
      }
      
      return <ListItem 
        mode="link"
        title={item.get(FIELD_TITLE)} 
        href={item.get(FIELD_HREF)}
        parent={ROOT_ID}
        onDelete={this.handleDelete}
        onClickUp={this.handleMoveUp}
        onClickDown={this.handleMoveDown}
        key={"root-item-"+index}/>;
    });
  }

  renderSelect = parent => {
    
    if (parent === ROOT_ID){
      return <PlusListItem>
        <AsyncSelectCreatable
          onChange={this.handleSelectChangedFor(ROOT_ID)}
          cacheOptions
          defaultOptions
          loadOptions={this.loadOptions}
          styles={customStyles}
          theme={customTheme}
          placeholder={'New Item...'}
        />
      </PlusListItem>
    }
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
    const { onChange } = this.props;
    let listValue = this.getValue() || List();
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

  addGroupItem = title => {
    const { onChange } = this.props;
    const listValue = this.getValue() || List();
    const parsedValue = fromJS({title: title, children: []});
    onChange(listValue.push(parsedValue));
  };

  loadOptions = (inputValue, callback) => {
    const { query, forID, field } = this.props;
    const collections = field.get("collections") || new Array();

    // query all given collections
    Promise.all(collections.map(collection => {
      return query(forID, collection, ["title"], inputValue);
    })).then(values => {
      let results = values.map(x => x.payload.response.hits);
      results = results.flat(1);
      results = results.map(item => {
        return {value: item.slug, label: item.data.title};
      });
      callback(results);
    });
  };

  handleSelectChangedFor = parent => {
    return (newValue, event) => this.handleSelectChange(newValue, event, parent);
  }

  handleSelectChange = (newValue, event, parent) => {
    if (event.action === 'select-option'){
      this.addItem(parent, newValue.label, newValue.value);
      return;
    }

    if (event.action === 'create-option'){
      this.addGroupItem(newValue.value);
      return;
    }
  };

  handleDelete = (e, item) => {
    if (item.parent == ROOT_ID){
      return this.deleteRootItem(item);
    }
    return this.deleteChildItem(item);
  }

  deleteRootItem = (item) => {
    const { onChange } = this.props;
    const index = this.getValue().findIndex(x => item.title === x.get(FIELD_TITLE));
    onChange(
      this.getValue().delete(index)
    );
  };

  deleteChildItem = (item) => {
    const { onChange } = this.props;
    let list = this.getValue();
    const parentIndex = list.findIndex(x => item.parent == x.get(FIELD_TITLE));
    let parent = list.get(parentIndex);
    let children = parent.get(FIELD_CHILDREN);
    let index = children.findIndex(x => item.title === x.get(FIELD_TITLE));
    children = children.delete(index);
    parent = parent.set(FIELD_CHILDREN, children);
    list = list.set(parentIndex, parent);
    onChange(list);
  };

  moveRootItem = (item, up) => {
    const { onChange } = this.props;
    const size = this.getValue().size;
    const index = this.getValue().findIndex(x => item.title === x.get(FIELD_TITLE));
    if (index <= 0 && up || index >= size && !up){
      return; // nothing to do
    }
    const offset = up ? -1 : 1;
    const listItem = this.getValue().get(index);
    const newList = this.getValue().delete(index).insert(index+offset, listItem);
    onChange(newList);
  }

  moveChildItem = (item, up) => {
    const { onChange } = this.props;
    let list = this.getValue();
    const size = list.size;
    const parentIndex = list.findIndex(x => item.parent == x.get(FIELD_TITLE));
    let parent = list.get(parentIndex);
    let children = parent.get(FIELD_CHILDREN);
    let index = children.findIndex(x => item.title === x.get(FIELD_TITLE));
    if (index <= 0 && up || index >= size && !up){
      return; // nothing to do
    }
    const child = children.get(index);
    const offset = up ? -1 : 1;
    const newChildren = children.delete(index).insert(index+offset, child);
    parent = parent.set(FIELD_CHILDREN, newChildren);
    list = list.set(parentIndex, parent);
    onChange(list);
  }

  handleMoveUp = (e, item) => {
    if (item.parent === ROOT_ID){
      return this.moveRootItem(item, true);
    } 
    this.moveChildItem(item, true);
  };

  handleMoveDown = (e, item) => {
    if (item.parent === ROOT_ID){
      return this.moveRootItem(item, false);
    }
    this.moveChildItem(item, false);
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