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
import {fetchRoleDefs} from '../../../store/roleDefs/actions';

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
  showDeleted: boolean
}

type MapStateToDispatchType = {
  fetchRoleDefs: (showDeleted?: boolean) => void
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
      style: {width: '150px'}
    },
    {
      label: 'Name',
      key: 'name',
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
      sortBy: 'entityState',
      injectBody: (value: IRoleDef) =>
        <Badge working={value.processing}
               status={AllowedEntityStatusColor[value.processing ? 8 : getBadgeStatus(
                 value)]}>{value.processing ? value.processing : getStatus(value)}</Badge>
    }, {
      label: 'Type',
      key: 'allowedMemberTypes',
      style: {width: '250px'},
      sortBy: 'allowedMemberTypes',
      injectBody: (value: IRoleDef) => getAllowedMemberType(value.allowedMemberTypes)
    }
  ];

  constructor(props) {
    super(props);
  }

  // Callback function when any row gets selected
  handleSelectRowCallback = (val: React.ReactText[]) => {

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
      theme
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
                  // disabled={!bulkAction.selectedRow.length
                >
                  Bulk Actions {bulkAction.selectedRow.length
                  ? `(${bulkAction.selectedRow.length})`
                  : ''}
                </Button>

                <Dropdown
                  dropdownItems={[{content: 'fdj'}]}
                  anchorEl={dropdownEle.bulkAction}
                  preferredAlignment="left"
                />
              </div>

              <div className={searchFieldStyle}>
                <TextField
                  label="Find a Role..."
                  suffix={<Icon source="search" componentColor="inkLighter"/>}
                  value={filterConfig.searchKey}
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
                          this.props.fetchRoleDefs(newValue);
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
                  highlight={true}
                  sorting="all"
                  data={roleDefs}
                  column={this.nestedColumnConfig}
                  filterData={filterConfig}
                  rowAction={[]}
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
  loading: state.loading,
  roleDefs: state.roleDefs,
  showDeleted: state.showDeleted
});

export default compose(
  connect<MapStateToPropsType, MapStateToDispatchType, {}>(mapStateToProps, {fetchRoleDefs}),
  themr(ROLE, baseTheme)
)(RoleListComponent);
