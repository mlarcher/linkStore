import React from 'react';
import ReactDOM from 'react-dom';
import { Provider }                    from 'react-redux';
import {
    Router,
    Route,
    IndexRoute,
    hashHistory,
} from 'react-router';

import configureStore                  from './store/configureStore';
import App from './containers/App';
import './style/index.css';
import Links from './components/LinksListWithData';
import AddLink from './components/AddLink';
import Version                         from './components/Version';

const store = configureStore();

ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Links}/>
                <Route path="add" component={AddLink}/>
                <Route path="version" component={Version}/>
            </Route>
        </Router>
    </Provider>,
    document.getElementById('root')
);
