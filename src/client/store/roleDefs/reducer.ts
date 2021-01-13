import {RoleListState} from '../../Routes/RoleDef/Components/RoleListState';
import {
  SET_LOADING,
  SET_ROLE_DEFS,
  SET_SEARCH,
  SET_SHOW_DELETED,
  SET_SELECTED_ROW
} from './types';

export type RoleDefsState = {
  loading: boolean
  roleDefs: RoleListState[]
  showDeleted: boolean,
  search: string
  selectedRows: number[]
}

const initialState: RoleDefsState = {
  loading: false,
  roleDefs: [],
  showDeleted: false,
  search: '',
  selectedRows: []
};

export const roleDefsReducer = (state = initialState, {type, payload}) => {
  switch (type) {
    case SET_ROLE_DEFS:
    case SET_LOADING:
    case SET_SHOW_DELETED:
    case SET_SEARCH:
    case SET_SELECTED_ROW:
      return {...state, ...payload};
    default:
      return state;
  }
};
