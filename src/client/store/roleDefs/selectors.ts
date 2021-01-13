import {RoleDefsState} from './reducer';

export const getRoleDefsLoading = (state: RoleDefsState) => state.loading;
export const getRoleDefsList = (state: RoleDefsState) => state.roleDefs;
export const getRoleDefsShowDeleted = (state: RoleDefsState) => state.showDeleted;
export const getRoleDefsSearch = (state: RoleDefsState) => state.search;
export const getRoleDefsSelectedRows = (state: RoleDefsState) => state.selectedRows;
