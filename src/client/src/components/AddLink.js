import React, { Component, PropTypes }  from 'react';
import { gql, graphql }                 from 'react-apollo';
import { Link, withRouter }             from 'react-router';

import { linksListQuery } from './LinksListWithData';


class AddLink extends Component {
    constructor(props) {
        super(props);

        this.state = { error: null };
    }

    render() {
        const { mutate } = this.props;
        const { error } = this.state;

        const handleKeyUp = (evt) => {
            this.setState({ error: null });
            if (evt.keyCode === 13) {
                evt.persist();
                mutate({
                    variables:      { url: evt.target.value },
                    refetchQueries: [{ query: linksListQuery }],
                })
                .then(() => {
                    evt.target.value = '';
                    this.props.router.push('/');
                }).catch(err => {
                    this.setState({ error: err.message });
                });
            }
        };
        return (
            <div>
                <Link to="/">
                    Back to list
                </Link><br />
                <label htmlFor="addLinkInput">Press Enter to validate your URL</label>
                <input
                    id="addLinkInput"
                    className="addLinkBtn"
                    type="text"
                    placeholder="New link"
                    onKeyUp={handleKeyUp}
                />
                <span className="error">{ error }</span>
            </div>
        );
    }
}

const addLinkMutation     = gql`
  mutation addLink($url: String!) {
    addLink(url: $url) {
      id
      url
      title
      votes
    }
  }
`;

const AddLinkWithMutation = graphql(
    addLinkMutation
)(AddLink);


AddLink.propTypes = {
    mutate: PropTypes.func.isRequired,
};

export default withRouter(AddLinkWithMutation);
