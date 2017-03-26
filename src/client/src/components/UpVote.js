import React, { PropTypes } from 'react';
import { gql, graphql } from 'react-apollo';
import { linksListQuery } from './LinksListWithData';

const UpVote = ({ mutate, url }) => {

    const handleClick = () => {
        mutate({
            variables:      { url },
            refetchQueries: [{ query: linksListQuery }],
        });
    };

    return (
        <button
            className="voteBtn voteBtn--upVote"
            onClick={handleClick}
            name="upVote"
        >+
        </button>
    );
};

const upVoteMutation = gql`
  mutation upVoteLink($url: String!) {
    upVoteLink(url: $url) {
      id
      url
      title
      votes
    }
  }
`;

const UpVoteWithMutation = graphql(
    upVoteMutation
)(UpVote);


UpVote.propTypes = {
    mutate: PropTypes.func.isRequired,
    url:    PropTypes.string.isRequired,
};

export default UpVoteWithMutation;
