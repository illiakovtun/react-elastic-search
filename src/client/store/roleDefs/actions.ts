import {SET_LOADING, SET_ROLE_DEFS, SET_SEARCH, SET_SHOW_DELETED} from './types';
import axios from 'axios';
// @ts-ignore
import {batch} from 'react-redux';
import {debounce} from 'debounce';
import store from '../store';

export const setRoleDefs = (roleDefs) => ({
  type: SET_ROLE_DEFS,
  payload: {roleDefs}
});

export const setLoading = (loading) => ({
  type: SET_LOADING,
  payload: {loading}
});

export const setShowDeleted = (showDeleted) => ({
  type: SET_SHOW_DELETED,
  payload: {showDeleted}
});

export const setSearch = (search) => ({
  type: SET_SEARCH,
  payload: {search}
});

const debounceSearch = debounce(() => {
  store.dispatch(fetchRoleDefs());
}, 200);

export const fetchWithSearch = (search) => (dispatch, getState) => {
  dispatch(setSearch(search));
  debounceSearch();
};

export const fetchWithShowDeleted = (showDeleted) => (dispatch) => {
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
  console.log(response.data);
  const roles = response.data.hits ? response.data.hits.hits.map(el => el._source) : [];

  console.log(roles);

  batch(() => {
    dispatch(setRoleDefs(roles));
    dispatch(setLoading(false));
  });
};
