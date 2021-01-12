import {applyMiddleware, createStore, Store} from 'redux';
import {roleDefsReducer, RoleDefsState} from './roleDefs/reducer';
import {composeWithDevTools} from 'redux-devtools-extension';
import thunk from 'redux-thunk';

const store: Store<RoleDefsState> = createStore(roleDefsReducer, composeWithDevTools(applyMiddleware(thunk)));

export default store;
