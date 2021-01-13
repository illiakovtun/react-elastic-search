import {
  SET_LOADING,
  SET_ROLE_DEFS,
  SET_SEARCH,
  SET_SHOW_DELETED,
  SET_SELECTED_ROW
} from './types';
import axios from 'axios';
// @ts-ignore
import {batch} from 'react-redux';
import {debounce} from 'debounce';
import store from '../store';
import {RoleDefsState} from './reducer';

export const setRoleDefs = (roleDefs: RoleDefsState[]) => ({
  type: SET_ROLE_DEFS,
  payload: {roleDefs}
});

export const setLoading = (loading: boolean) => ({
  type: SET_LOADING,
  payload: {loading}
});

export const setShowDeleted = (showDeleted: boolean) => ({
  type: SET_SHOW_DELETED,
  payload: {showDeleted}
});

export const setSearch = (search: string) => ({
  type: SET_SEARCH,
  payload: {search}
});

export const toggleSelectedRow = (selectedRows: number[]) => ({
  type: SET_SELECTED_ROW,
  payload: {selectedRows}
})

const debounceSearch = debounce(() => {
  store.dispatch(fetchRoleDefs());
}, 200);

export const fetchWithSearch = (search: string) => (dispatch) => {
  dispatch(setSearch(search));
  debounceSearch();
};

export const fetchWithShowDeleted = (showDeleted: boolean) => (dispatch) => {
  dispatch(setShowDeleted(showDeleted));
  dispatch(fetchRoleDefs());
};

export const fetchRoleDefs = () => async (dispatch, getState) => {
  dispatch(setLoading(true));

  const response = await axios.get('http://localhost:3000/searchRoles', {
    params: {
      searchQuery: JSON.stringify({
        from: 0,
        size: 20,
        query: {
          bool: {
            must: [
              {
                query_string: {
                  query: `*${getState().search}*`,
                  fields: ['name', 'description']
                }
              }
            ],
            must_not: getState().showDeleted
              ? []
              : [
                {
                  term: {
                    'entityState.itemID': 7
                  }
                }
              ]
          }
        }
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  });

  const roles = response.data.hits ? response.data.hits.hits.map(el => el._source) : [];

  batch(() => {
    dispatch(setRoleDefs(roles));
    dispatch(setLoading(false));
  });
};
