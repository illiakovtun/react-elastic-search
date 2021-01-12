import {RoleListState} from '../../Routes/RoleDef/Components/RoleListState';
import {SET_LOADING, SET_ROLE_DEFS, SET_SHOW_DELETED} from './types';

export type RoleDefsState = {
  loading: boolean
  roleDefs: RoleListState[]
  showDeleted: boolean
}

const initialState = {
  loading: false,
  roleDefs: [],
  showDeleted: false
};

export const roleDefsReducer = (state = initialState, {type, payload}) => {
  switch (type) {
    case SET_ROLE_DEFS:
    case SET_LOADING:
    case SET_SHOW_DELETED:
      return {...state, ...payload}
    default:
      return state;
  }
};
