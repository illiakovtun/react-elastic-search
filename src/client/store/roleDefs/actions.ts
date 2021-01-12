import {SET_LOADING, SET_ROLE_DEFS, SET_SHOW_DELETED} from './types';
import axios from 'axios';
// @ts-ignore
import {batch} from 'react-redux';

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

export const fetchRoleDefs = (showDeleted = false, search = '') => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setShowDeleted(showDeleted));

  const response = await axios.get('http://localhost:3000/searchRoles', {
    params: {
      searchQuery: JSON.stringify({
        from: 0,
        size: 20,
        query: {
          bool: {
            must_not: showDeleted
              ? []
              : [
                {
                  term: {
                    'entityState.itemID': 7
                  }
                }
              ],
            // must: [
            //   {
            //     term: {
            //       'name': search,
            //     }
            //   }
            // ]
          }
        }
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  });

  const roles = response.data.hits ? response.data.hits.hits.map(el => el._source) : []

  console.log(roles);

  batch(() => {
    dispatch(setRoleDefs(roles));
    dispatch(setLoading(false));
  });
};
