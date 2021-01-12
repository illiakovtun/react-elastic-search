import {SET_LOADING, SET_ROLE_DEFS} from './types';
import axios from 'axios';
// @ts-ignore
import {batch} from 'react-redux'

export const setRoleDefs = (roleDefs) => ({
  type: SET_ROLE_DEFS,
  payload: {roleDefs}
});

export const setLoading = (loading) => ({
  type: SET_LOADING,
  payload: {loading}
});

export const fetchRoleDefs = () => async (dispatch) => {
  dispatch(setLoading(true))

  const response = await axios.get('http://localhost:3000/searchRoles', {
    params: {
      searchQuery: JSON.stringify({
        from: 0,
        size: 20,
        query: {
          bool: {
            must: [
              {
                term: {
                  'entityState.itemID': 5
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

  console.log(response.data.hits.hits.map(el => el._source));

  batch(() => {
    dispatch(setRoleDefs(response.data.hits.hits.map(el => el._source)));
    dispatch(setLoading(false))
  })
};
