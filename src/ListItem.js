import React from 'react';
import styled from "styled-components";
import { Trash, ArrowUp, ArrowDown } from 'react-feather';
import { LinkListItem, GroupListItem } from './components.js';

export default class ListItem extends React.Component {
    state = { hover: false };

    onMouseEnter = e => {
        this.setState({hover: true});
    }

    onMouseLeave = e => {
        this.setState({hover: false});
    }

    onClickDelete = e => {
        if (this.props.onDelete !== undefined){
            this.props.onDelete(e, this.getData());
        }
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

        const AlignedSpan = styled.span`
            vertical-align: middle;
            display: inline-block;
        `;

        const color="#4e5c6e";
        const arrowUp   = this.state.hover ? <AlignedSpan><ArrowUp size='18' color={color} onClick={this.onClickUp} /></AlignedSpan> : "";
        const arrowDown = this.state.hover ? <AlignedSpan><ArrowDown size='18' color={color} onClick={this.onClickDown} /></AlignedSpan> : "";
        const deleteBtn = this.state.hover ? <AlignedSpan><Trash size='17' color={color} onClick={this.onClickDelete} /></AlignedSpan> : "";

        if (this.props.mode !== undefined && this.props.mode === 'group'){
            return <GroupListItem>
                    <span onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
                        {deleteBtn}
                        {arrowDown}
                        {arrowUp}
                        <AlignedSpan>{title}</AlignedSpan>
                    </span>
                    {this.props.children}
                </GroupListItem>;
        }

        // mode: link (default)
        return <LinkListItem 
                value={href}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}>
                    <span>
                        {deleteBtn}
                        {arrowDown}
                        {arrowUp}
                        <AlignedSpan>{title}</AlignedSpan>
                    </span>
        </LinkListItem>;
    }
}