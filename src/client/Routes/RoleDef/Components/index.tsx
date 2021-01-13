import * as React from 'react';
import RoleListComponent from './RoleList';

/**
 * Root component which calls the list component to show the existing role list
 * Then list component calls different other components like create, members, etc
 * @extends React.Component
 */
export default class RoleDefComponent extends React.Component {
  /**
   * Render the component to the DOM
   * @returns {}
   */

  render() {
    // @ts-ignore
    return <RoleListComponent/>;
  }
}
