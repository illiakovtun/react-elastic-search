import {RoleListState} from '../../Routes/RoleDef/Components/RoleListState';
import {SET_LOADING, SET_ROLE_DEFS, SET_SEARCH, SET_SHOW_DELETED} from './types';

export type RoleDefsState = {
  loading: boolean
  roleDefs: RoleListState[]
  showDeleted: boolean,
  search: string
}

const initialState = {
  loading: false,
  roleDefs: [],
  showDeleted: false,
  search: ''
};

export const roleDefsReducer = (state = initialState, {type, payload}) => {
  switch (type) {
    case SET_ROLE_DEFS:
    case SET_LOADING:
    case SET_SHOW_DELETED:
    case SET_SEARCH:
      return {...state, ...payload};
    default:
      return state;
  }
};
