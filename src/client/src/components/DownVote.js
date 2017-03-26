import React, { PropTypes } from 'react';
import { gql, graphql } from 'react-apollo';
import { linksListQuery } from './LinksListWithData';

// TODO: mutualize with upVote
const DownVote = ({ mutate, url }) => {

    const handleClick = () => {
        mutate({
            variables:      { url },
            refetchQueries: [{ query: linksListQuery }],
        });
    };

    return (
        <button
            className="voteBtn voteBtn--downVote"
            onClick={handleClick}
            name="downVote"
        >-
        </button>
    );
};

const downVoteMutation = gql`
  mutation downVoteLink($url: String!) {
    downVoteLink(url: $url) {
      id
      url
      title
      votes
    }
  }
`;

const DownVoteWithMutation = graphql(
    downVoteMutation
)(DownVote);


DownVote.propTypes = {
    mutate: PropTypes.func.isRequired,
    url:    PropTypes.string.isRequired,
};

export default DownVoteWithMutation;
