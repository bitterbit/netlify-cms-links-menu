import React from 'react';
import { LinkListItem, GroupListItem, ArrowUp, ArrowDown } from './components.js';

export default class ListItem extends React.Component {
    state = { hover: false };

    onMouseEnter = e => {
        this.setState({hover: true});
    }

    onMouseLeave = e => {
        this.setState({hover: false});
    }

    onClickUp = e => {
        if (this.props.onClickUp !== undefined){
            this.props.onClickUp(e, this.getData());
        }
    }

    onClickDown = e => {
        if (this.props.onClickDown !== undefined){
            this.props.onClickDown(e, this.getData());
        }
    }

    getData = () => {
        return {
            title: this.props.title, 
            href: this.props.href, 
            parent: this.props.parent,
        }
    }

    render() {
        const {title, href}  = this.props;
        const arrowUp   = this.state.hover ? <ArrowUp onClick={this.onClickUp} /> : "";
        const arrowDown = this.state.hover ? <ArrowDown onClick={this.onClickDown} /> : "";

        if (this.props.mode !== undefined && this.props.mode === 'group'){
            return <GroupListItem>
                    <span onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
                    {arrowUp}
                    {arrowDown}
                    {title}
                    </span>
                    {this.props.children}
                </GroupListItem>;
        }

        // mode: link (default)
        return <LinkListItem 
                value={href}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}>
                    {arrowUp}
                    {arrowDown}
                    {title}
        </LinkListItem>;
    }
}