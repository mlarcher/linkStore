import React, { Component } from 'react';
import '../style/app.css'; // eslint-disable-line
import LinksListWithData from '../components/LinksListWithData';
import {
    ApolloClient,
    ApolloProvider,
    createNetworkInterface, // <-- this line is new!
} from 'react-apollo';

import { typeDefs } from '../graphql/schema';


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
    uri: 'http://localhost:8080/graphql',
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
                    <LinksListWithData />
                </div>
            </ApolloProvider>
        );
    }
}

export default App;
