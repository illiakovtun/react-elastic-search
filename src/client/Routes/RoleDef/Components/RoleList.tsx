import * as React from 'react';
import {themr, ThemedComponentClass} from '@friendsofreactjs/react-css-themr';
import {classNames} from '@shopify/react-utilities/styles';

import {AllowedEntityStatusColor} from 'Types/Domain';
import {IRoleDef} from 'Types/Domain';

import DrawerSpinner from '../../../Common/Components/DrawerSpinner';

import {
  Badge,
  Button,
  Checkbox,
  Dropdown,
  FlexBox,
  Column,
  Heading,
  Icon,
  Table,
  TextField
} from 'engage-ui';

import {
  getAllowedMemberType,
  getBadgeStatus,
  getStatus
} from '../../../Common/Utilities';

import {RoleListState} from './RoleListState';
import {RoleListProp} from './RoleListProp';
import {ROLE} from '../../../ThemeIdentifiers';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {
  fetchRoleDefs,
  fetchWithSearch,
  fetchWithShowDeleted,
  toggleSelectedRow
} from '../../../store/roleDefs/actions';
import {
  getRoleDefsList,
  getRoleDefsLoading, getRoleDefsSearch, getRoleDefsSelectedRows,
  getRoleDefsShowDeleted
} from '../../../store/roleDefs/selectors';
import {values} from 'mobx';
import {useEffect} from 'react';

const baseTheme = require('../Styles/RoleList.scss');
const TableStyle = require('../../../Theme/Table.scss');
const CommonStyle = require('../../../Theme/ListTheme.scss');

/**
 * Component to display role def list & show different actions like filter, delete, individual actions
 * @extends React.Component
 */

type MapStateToPropsType = {
  loading: boolean,
  roleDefs: RoleListState[],
  showDeleted: boolean,
  search: string,
  selectedRows: number[]
}

type MapStateToDispatchType = {
  fetchRoleDefs: () => void,
  fetchWithSearch: (search: string) => void,
  fetchWithShowDeleted: (showDeleted: boolean) => void,
  toggleSelectedRow: (selectedRows: number[]) => void
}
class RoleListComponent extends React.Component<MapStateToDispatchType & MapStateToPropsType & RoleListProp> {
  sortQuery: string = '[{"id":{"order":"desc"}}]';
  /*
   label: Table header lable which will be visible
   key: Match it with json data, this will help to get specific value from the data
   headerValue: In case of custom component, if any value is required, here it can be stored
   classname: any custom classname, this can be used to set width or any other style
   style: same like class but for inline styling
   noSort: if sorting="all" & we want to disable sorting of specifc column
   sort: Enable sorting for specific column
   injectBody: To inject custom component in td
   injectHeader: To inject custom component in th
   */
  state = {
    actionInProgress: false,
    activeEntityId: 0,
    appDefId: 0,
    bulkAction: {
      selectedRow: []
    },
    callBackAction: undefined,
    callChildCallback: false,
    dropdownEle: {} as { [key: string]: HTMLElement },
    editMember: false,
    filterConfig: {
      searchKey: '',
      search: false,
      field: 'name'
    },
    hideRow: {},
    loadingRole: false,
    nestedChildData: []
  };

  private nestedColumnConfig: Array<{}> = [
    {
      label: 'ID',
      key: 'id',
      sortBy: 'id',
      sort: true,
      style: {width: '150px'}
    },
    {
      label: 'Name',
      key: 'name',
      sort: true,
      sortBy: 'name',
      style: {width: '200px'}
    }, {
      label: 'Description',
      key: 'description',
      noSort: true,
      style: {width: '300px'}
    }, {
      label: 'Status',
      key: 'entityState',
      style: {width: '120px'},
      sort: true,
      sortBy: 'entityState',
      injectBody: (value: IRoleDef) =>
        <Badge working={value.processing}
               status={AllowedEntityStatusColor[value.processing ? 8 : getBadgeStatus(
                 value)]}>{value.processing ? value.processing : getStatus(value)}</Badge>
    }, {
      label: 'Type',
      key: 'allowedMemberTypes',
      style: {width: '250px'},
      sort: true,
      sortBy: 'allowedMemberTypes',
      injectBody: (value: IRoleDef) => getAllowedMemberType(value.allowedMemberTypes)
    }
  ];

  constructor(props) {
    super(props);
  }

  // Callback function when any row gets selected
  handleSelectRowCallback = (selectedRows: number[]) => {
    this.props.toggleSelectedRow(selectedRows)
  };

  // Toggle dropdowns present in this component
  toggleDropdown = (event: React.FormEvent<HTMLElement>, currentDropdown: string) => {
    this.setState({
      dropdownEle: {[currentDropdown]: event.currentTarget as HTMLElement}
    });
  };

  componentDidMount() {
    this.props.fetchRoleDefs();
  }

  /**
   * Render the component to the DOM
   * @returns {}
   */
  render() {
    const {
      actionInProgress,
      bulkAction,
      dropdownEle,
      filterConfig,
      hideRow,
      loadingRole
    } = this.state;
    const {
      roleDefs,
      loading,
      showDeleted,
      theme,
      search,
      selectedRows
    } = this.props;

    const searchFieldStyle = classNames(
      theme.commonLeftMargin,
      theme.searchField
    );

    return (
      <FlexBox justify={'Center'}>
        <Column medium="4-4">
          {
            loading ?
              <div className={theme.spinnerContainer} style={{opacity: 0.5}}>
                <DrawerSpinner componentClass={theme.espinner} spinnerText="Loading Roles"/>
              </div> : null
          }

          <div className={theme.pageContainer}>
            <Heading element="h2" theme={CommonStyle}>Roles</Heading>

            <FlexBox
              direction="Row"
              align="Start"
              justify="Start"
              componentClass={theme.tableActions}
            >
              <div>
                <Button
                  componentSize="large"
                  disclosure={true}
                  onClick={(event: React.FormEvent<HTMLElement>) => this.toggleDropdown(event,
                    'bulkAction')}
                  disabled={!selectedRows.length}
                >
                  Bulk Actions {selectedRows.length
                  ? `(${selectedRows.length})`
                  : ''}
                </Button>

                <Dropdown
                  dropdownItems={[{content: 'Bulk Actions'}]}
                  anchorEl={dropdownEle.bulkAction}
                  preferredAlignment="left"
                />
              </div>

              <div className={searchFieldStyle}>
                <TextField
                  label="Find a Role..."
                  suffix={<Icon source="search" componentColor="inkLighter"/>}
                  value={search}
                  onChange={(newValue) => {
                    this.props.fetchWithSearch(newValue);
                  }}
                />
              </div>

              <div className={theme.commonLeftMargin}>
                <Button
                  componentSize="large"
                  icon="horizontalDots"
                  onClick={(event: React.FormEvent<HTMLElement>) => {
                    this.toggleDropdown(event, 'filter');
                  }}
                />
                <Dropdown
                  closeOnClickOption={false}
                  dropdownItems={[
                    {
                      content: <Checkbox
                        checked={showDeleted} label={'Show Deleted'}
                        onChange={(newValue) => {
                          this.props.fetchWithShowDeleted(newValue);
                        }}/>
                    }
                  ]}
                  anchorEl={dropdownEle.filter}
                  preferredAlignment="right"
                />
              </div>
            </FlexBox>
            {
              roleDefs ?
                <Table
                  actionInProgress={actionInProgress}
                  columnFirstChildWidth="25px"
                  hideRow={hideRow}
                  bordered={true}
                  checkedRowsId={selectedRows}
                  highlight
                  sorting="all"
                  data={roleDefs}
                  column={this.nestedColumnConfig}
                  filterData={filterConfig}
                  rowAction={[]}
                  responsive
                  rowCallbackValue="id"
                  selectRow="checkbox"
                  selectRowCallback={this.handleSelectRowCallback}
                  theme={TableStyle}
                /> : null
            }
          </div>
        </Column>
      </FlexBox>
    );
  }
}

const mapStateToProps = (state) => ({
  loading: getRoleDefsLoading(state),
  roleDefs: getRoleDefsList(state),
  showDeleted: getRoleDefsShowDeleted(state),
  search: getRoleDefsSearch(state),
  selectedRows: getRoleDefsSelectedRows(state)
});

export default compose(
  connect<MapStateToPropsType, MapStateToDispatchType, {}>(mapStateToProps,
    {fetchRoleDefs, fetchWithSearch, fetchWithShowDeleted, toggleSelectedRow}),
  themr(ROLE, baseTheme)
)(RoleListComponent);
