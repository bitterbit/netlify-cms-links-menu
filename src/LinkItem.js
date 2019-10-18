import React from 'react';
import { LinkListItem, ArrowUp } from './components.js';

export default class LinkItem extends React.Component {
    
    onMouseEnter = e => {
        console.log("on mouse enter", e);
    }

    onMouseLeave = e => {
        console.log("on mouse leave", e);
    }

    render() {
        const {title, href}  = this.props;

        return <LinkListItem 
                value={href}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}>
                    {title}
                    <ArrowUp onClick={e => console.log("onClick", e) } />
        </LinkListItem>;
    }
}