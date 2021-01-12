import {RoleListState} from '../../Routes/RoleDef/Components/RoleListState';
import {SET_LOADING, SET_ROLE_DEFS} from './types';

export type RoleDefsState = {
  loading: boolean
  roleDefs: RoleListState[]
}

const initialState = {
  loading: false,
  roleDefs: []
};

export const roleDefsReducer = (state = initialState, {type, payload}) => {
  switch (type) {
    case SET_ROLE_DEFS:
    case SET_LOADING:
      return {...state, ...payload}
    default:
      return state;
  }
};
