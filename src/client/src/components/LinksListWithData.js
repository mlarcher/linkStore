import React, { PropTypes } from 'react';
import {
    gql,
    graphql,
} from 'react-apollo';
import AddLink from './AddLink';

const LinksList = ({ data: { loading, error, links } }) => {
    if (loading) {
        return <p>Loading ...</p>;
    }
    if (error) {
        return <p>{error.message}</p>;
    }
    return (
        <div className="linksList">
            <AddLink />
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
