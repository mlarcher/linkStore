import React, { Component } from 'react';
import '../style/app.css'; // eslint-disable-line
import {
    ApolloClient,
    ApolloProvider,
    createNetworkInterface, // <-- this line is new!
} from 'react-apollo';

import { typeDefs } from '../graphql/schema';
import { apiBaseURL } from '../../public/config.json';


import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
// import { mockNetworkInterfaceWithSchema } from 'apollo-test-utils';


const schema = makeExecutableSchema({ typeDefs });
addMockFunctionsToSchema({ schema });
/*
 const mockNetworkInterface = mockNetworkInterfaceWithSchema({ schema });

 const client = new ApolloClient({
 networkInterface: mockNetworkInterface,
 });*/

const networkInterface = createNetworkInterface({
    uri: apiBaseURL,
});
const client           = new ApolloClient({
    networkInterface,
});

class App extends Component {
    render() {
        return (
            <ApolloProvider client={client}>
                <div className="App">
                    <h1 className="pageTitle">LinkStore</h1>
                    { this.props.children }
                </div>
            </ApolloProvider>
        );
    }
}

export default App;
