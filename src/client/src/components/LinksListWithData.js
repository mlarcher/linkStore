import React, { PropTypes } from 'react';
import {
    gql,
    graphql,
} from 'react-apollo';
import { Link }             from 'react-router';

import UpVote from './UpVote';
import DownVote from './DownVote';

const LinksList = ({ data: { loading, error, links } }) => {
    if (loading) {
        return <p>Loading ...</p>;
    }
    if (error) {
        return <p>{error.message}</p>;
    }
    return (
        <div className="linksList">
            <Link to="/add">
                Add link
            </Link>
            <ol className="links">
                { links.map((link, i) => (
                    <li
                        key={link.id}
                        className="links_item"
                    >
                        <span className="links_rank">{i + 1}.</span>
                        <a
                            className="links_link"
                            href={link.url}
                            target="_blank"
                        >
                            <span className="links_linkTitle">{link.title} </span>
                            <span className="links_linkUrl">({link.url})</span>
                        </a>
                        [{link.votes} points]
                        <UpVote url={link.url}/>
                        <DownVote url={link.url}/>
                    </li>
                ))}
            </ol>

        </div>
    );
};

export const linksListQuery = gql`
  query {
    links {
      id
      url
      title
      votes
    }
  }
`;

LinksList.propTypes = {
    data: PropTypes.object.isRequired,
};

export default graphql(linksListQuery)(LinksList);
