import extendsObject from 'antd/es/_util/extendsObject';
import { responsiveArray } from 'antd/es/_util/responsiveObserver';
import { ConfigContext } from 'antd/es/config-provider';
import { useComponentConfig } from 'antd/es/config-provider/context';
import DefaultRenderEmpty from 'antd/es/config-provider/defaultRenderEmpty';
import useSize from 'antd/es/config-provider/hooks/useSize';
import type { RowProps } from 'antd/es/grid';
import { Row } from 'antd/es/grid';
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';
import useStyle from 'antd/es/list/style';
import type { PaginationConfig } from 'antd/es/pagination';
import Pagination from 'antd/es/pagination';
import type { SpinProps } from 'antd/es/spin';
import Spin from 'antd/es/spin';
import { clsx } from 'clsx';
import * as React from 'react';
import { ListContext } from './context';
import Item from './Item';

export type { ListConsumerProps } from './context';
export type { ListItemMetaProps, ListItemProps } from './Item';

export type ColumnCount = number;
export type ColumnType = 'gutter' | 'column' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface ListGridType {
  gutter?: RowProps['gutter'];
  column?: ColumnCount;
  xs?: ColumnCount;
  sm?: ColumnCount;
  md?: ColumnCount;
  lg?: ColumnCount;
  xl?: ColumnCount;
  xxl?: ColumnCount;
}

export type ListSize = 'small' | 'default' | 'large';
export type ListItemLayout = 'horizontal' | 'vertical';

export interface ListLocale {
  emptyText: React.ReactNode;
}

export interface ListProps<T> {
  bordered?: boolean;
  className?: string;
  rootClassName?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  dataSource?: T[];
  extra?: React.ReactNode;
  grid?: ListGridType;
  id?: string;
  itemLayout?: ListItemLayout;
  loading?: boolean | SpinProps;
  loadMore?: React.ReactNode;
  pagination?: PaginationConfig | false;
  prefixCls?: string;
  rowKey?: ((item: T) => React.Key) | keyof T;
  renderItem?: (item: T, index: number) => React.ReactNode;
  size?: ListSize;
  split?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  locale?: ListLocale;
}

const InternalList = <T,>(
  props: ListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
): React.JSX.Element => {
  const {
    pagination = false,
    prefixCls: customizePrefixCls,
    bordered = false,
    split = true,
    className,
    rootClassName,
    style,
    children,
    itemLayout,
    loadMore,
    grid,
    dataSource = [],
    size: customizeSize,
    header,
    footer,
    loading = false,
    rowKey,
    renderItem,
    locale,
    ...rest
  } = props;

  const paginationObj = pagination && typeof pagination === 'object' ? pagination : {};
  const [paginationCurrent, setPaginationCurrent] = React.useState(
    paginationObj.defaultCurrent || 1,
  );
  const [paginationSize, setPaginationSize] = React.useState(paginationObj.defaultPageSize || 10);

  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
  } = useComponentConfig('list');
  const { renderEmpty } = React.useContext(ConfigContext);

  const defaultPaginationProps = {
    current: 1,
    total: 0,
    position: 'bottom' as const,
  };

  const triggerPaginationEvent = (eventName: string) => (page: number, pageSize: number) => {
    setPaginationCurrent(page);
    setPaginationSize(pageSize);
    if (pagination) {
      (pagination as PaginationConfig)?.[eventName as keyof PaginationConfig]?.(page, pageSize);
    }
  };

  const onPaginationChange = triggerPaginationEvent('onChange');
  const onPaginationShowSizeChange = triggerPaginationEvent('onShowSizeChange');

  const renderInternalItem = (item: T, index: number) => {
    if (!renderItem) {
      return null;
    }
    let key: any;
    if (typeof rowKey === 'function') {
      key = rowKey(item);
    } else if (rowKey) {
      key = (item as Record<string | number | symbol, React.Key>)[rowKey];
    } else {
      key = (item as any).key;
    }
    if (!key) {
      key = `list-item-${index}`;
    }
    return <React.Fragment key={key}>{renderItem(item, index)}</React.Fragment>;
  };

  const isSomethingAfterLastItem = !!(loadMore || pagination || footer);
  const prefixCls = getPrefixCls('list', customizePrefixCls);

  // Style
  const [hashId, cssVarCls] = useStyle(prefixCls);

  let loadingProp = loading;
  if (typeof loadingProp === 'boolean') {
    loadingProp = {
      spinning: loadingProp,
    };
  }
  const isLoading = !!(loadingProp as SpinProps)?.spinning;
  const mergedSize = useSize(customizeSize);

  // large => lg
  // small => sm
  let sizeCls = '';
  switch (mergedSize) {
    case 'large':
      sizeCls = 'lg';
      break;
    case 'small':
      sizeCls = 'sm';
      break;
    default:
      break;
  }

  const classString = clsx(
    prefixCls,
    {
      [`${prefixCls}-vertical`]: itemLayout === 'vertical',
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-split`]: split,
      [`${prefixCls}-bordered`]: bordered,
      [`${prefixCls}-loading`]: isLoading,
      [`${prefixCls}-grid`]: !!grid,
      [`${prefixCls}-something-after-last-item`]: isSomethingAfterLastItem,
      [`${prefixCls}-rtl`]: direction === 'rtl',
    },
    contextClassName,
    className,
    rootClassName,
    hashId,
    cssVarCls,
  );

  const paginationProps = extendsObject(
    defaultPaginationProps,
    {
      total: dataSource.length,
      current: paginationCurrent,
      pageSize: paginationSize,
    },
    pagination || {},
  );

  const largestPage = Math.ceil(paginationProps.total / paginationProps.pageSize);
  paginationProps.current = Math.min(paginationProps.current, largestPage);

  const paginationContent =
    pagination &&
    ((
      <div className={clsx(`${prefixCls}-pagination`)}>
        <Pagination
          align="end"
          {...paginationProps}
          onChange={onPaginationChange}
          onShowSizeChange={onPaginationShowSizeChange}
        />
      </div>
    ) as React.ReactNode);

  let splitDataSource = [...dataSource];
  if (pagination) {
    if (dataSource.length > (paginationProps.current - 1) * paginationProps.pageSize) {
      splitDataSource = [...dataSource].splice(
        (paginationProps.current - 1) * paginationProps.pageSize,
        paginationProps.pageSize,
      );
    }
  }

  const needResponsive = Object.keys(grid || {}).some((key) =>
    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].includes(key),
  );
  const screens = useBreakpoint(needResponsive);
  const currentBreakpoint = React.useMemo(() => {
    for (let i = 0; i < responsiveArray.length; i += 1) {
      const breakpoint = responsiveArray[i];
      if (screens[breakpoint]) {
        return breakpoint;
      }
    }
    return undefined;
  }, [screens]);

  const colStyle = React.useMemo(() => {
    if (!grid) {
      return undefined;
    }
    const breakpointKey = currentBreakpoint as keyof ListGridType;
    const columnCount = Number(
      currentBreakpoint && grid[breakpointKey] ? grid[breakpointKey] : grid.column,
    );
    if (columnCount) {
      return {
        width: `${100 / columnCount}%`,
        maxWidth: `${100 / columnCount}%`,
      };
    }
    return undefined;
  }, [JSON.stringify(grid), currentBreakpoint]);

  let childrenContent: React.ReactNode = isLoading && (
    <div
      style={{
        minHeight: 53,
      }}
    />
  );

  if (splitDataSource.length > 0) {
    const items = splitDataSource.map(renderInternalItem);
    childrenContent = grid ? (
      <Row gutter={grid.gutter}>
        {React.Children.map(items, (child) => (
          <div key={(child as React.ReactElement)?.key} style={colStyle}>
            {child}
          </div>
        ))}
      </Row>
    ) : (
      <ul className={`${prefixCls}-items`}>{items}</ul>
    );
  } else if (!children && !isLoading) {
    childrenContent = (
      <div className={`${prefixCls}-empty-text`}>
        {locale?.emptyText ||
          renderEmpty?.('List') ||
          ((<DefaultRenderEmpty componentName="List" />) as React.ReactNode)}
      </div>
    );
  }

  const paginationPosition = paginationProps.position as 'top' | 'bottom' | 'both';
  const contextValue = React.useMemo(
    () => ({
      grid,
      itemLayout,
    }),
    [JSON.stringify(grid), itemLayout],
  );

  // if (process.env.NODE_ENV !== 'production') {
  //   const warning = devUseWarning('List');
  //   warning(
  //     false,
  //     'deprecated',
  //     'The `List` component is deprecated. And will be removed in next major version.',
  //   );
  // }

  return (
    <ListContext.Provider value={contextValue}>
      <div
        ref={ref}
        style={
          {
            ...contextStyle,
            ...style,
          } as React.CSSProperties
        }
        className={classString}
        {...rest}
      >
        {(paginationPosition === 'top' || paginationPosition === 'both') && paginationContent}
        {header && <div className={`${prefixCls}-header`}>{header}</div>}
        <Spin {...(loadingProp as SpinProps)}>
          {childrenContent}
          {children}
        </Spin>
        {footer && <div className={`${prefixCls}-footer`}>{footer}</div>}
        {loadMore ||
          ((paginationPosition === 'bottom' || paginationPosition === 'both') && paginationContent)}
      </div>
    </ListContext.Provider>
  );
};

const ListWithForwardRef = React.forwardRef(InternalList) as (<T>(
  props: ListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof InternalList>) &
  Pick<React.FC, 'displayName'>;

if (process.env.NODE_ENV !== 'production') {
  ListWithForwardRef.displayName = 'Deprecated.List';
}

type CompoundedComponent = typeof ListWithForwardRef & {
  Item: typeof Item;
};

const List = ListWithForwardRef as CompoundedComponent;
List.Item = Item;

export default List;
