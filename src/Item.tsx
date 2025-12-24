import { toArray } from '@rc-component/util';
import { cloneElement } from 'antd/es/_util/reactNode';
import { ConfigContext } from 'antd/es/config-provider';
import { Col } from 'antd/es/grid';
import { clsx } from 'clsx';
import React, { useContext } from 'react';
import { ListContext } from './context';

export interface ListItemMetaProps {
  avatar?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  description?: React.ReactNode;
  prefixCls?: string;
  style?: React.CSSProperties;
  title?: React.ReactNode;
}

export const Meta: React.FC<ListItemMetaProps> = ({
  prefixCls: customizePrefixCls,
  className,
  avatar,
  title,
  description,
  ...others
}) => {
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('list', customizePrefixCls);
  const classString = clsx(`${prefixCls}-item-meta`, className);
  const content = (
    <div className={`${prefixCls}-item-meta-content`}>
      {title && <h4 className={`${prefixCls}-item-meta-title`}>{title}</h4>}
      {description && <div className={`${prefixCls}-item-meta-description`}>{description}</div>}
    </div>
  );
  return (
    <div {...others} className={classString}>
      {avatar && <div className={`${prefixCls}-item-meta-avatar`}>{avatar}</div>}
      {(title || description) && content}
    </div>
  );
};

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  classNames?: {
    actions?: string;
    extra?: string;
  };
  children?: React.ReactNode;
  prefixCls?: string;
  style?: React.CSSProperties;
  styles?: {
    actions?: React.CSSProperties;
    extra?: React.CSSProperties;
  };
  extra?: React.ReactNode;
  actions?: React.ReactNode[];
  colStyle?: React.CSSProperties;
}

const InternalItem = React.forwardRef<HTMLDivElement, ListItemProps>((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    children,
    actions,
    extra,
    styles,
    className,
    classNames: customizeClassNames,
    colStyle,
    ...others
  } = props;
  const { grid, itemLayout } = useContext(ListContext);
  const { getPrefixCls, list } = useContext(ConfigContext);
  const moduleClass = (moduleName: 'actions' | 'extra') =>
    clsx(list?.item?.classNames?.[moduleName], customizeClassNames?.[moduleName]);
  const moduleStyle = (moduleName: 'actions' | 'extra') => ({
    ...list?.item?.styles?.[moduleName],
    ...styles?.[moduleName],
  });
  const isItemContainsTextNodeAndNotSingular = () => {
    const childNodes = toArray(children);
    const hasTextNode = childNodes.some((node) => typeof node === 'string');
    return hasTextNode && childNodes.length > 1;
  };
  const isFlexMode = () => {
    if (itemLayout === 'vertical') {
      return !!extra;
    }
    return !isItemContainsTextNodeAndNotSingular();
  };
  const prefixCls = getPrefixCls('list', customizePrefixCls);
  const actionsContent = actions && actions.length > 0 && (
    <ul
      className={clsx(`${prefixCls}-item-action`, moduleClass('actions'))}
      key="actions"
      style={moduleStyle('actions') as React.CSSProperties}
    >
      {actions.map((action, i) => (
        <li key={`${prefixCls}-item-action-${i}`}>
          {action}
          {i !== actions.length - 1 && <em className={`${prefixCls}-item-action-split`} />}
        </li>
      ))}
    </ul>
  );
  const Element = grid ? 'div' : 'li';
  const itemChildren = (
    <Element
      {...(others as any)}
      {...(!grid ? { ref } : {})}
      className={clsx(
        `${prefixCls}-item`,
        {
          [`${prefixCls}-item-no-flex`]: !isFlexMode(),
        },
        className,
      )}
    >
      {itemLayout === 'vertical' && extra
        ? [
            <div className={`${prefixCls}-item-main`} key="content">
              {children}
              {actionsContent}
            </div>,
            <div
              className={clsx(`${prefixCls}-item-extra`, moduleClass('extra'))}
              key="extra"
              style={moduleStyle('extra') as React.CSSProperties}
            >
              {extra}
            </div>,
          ]
        : [children, actionsContent, cloneElement(extra, { key: 'extra' })]}
    </Element>
  );
  return grid ? (
    <Col ref={ref} flex={1} style={colStyle as any}>
      {itemChildren}
    </Col>
  ) : (
    itemChildren
  );
});

InternalItem.displayName = 'ListItem';

export type ListItemTypeProps = typeof InternalItem & {
  Meta: typeof Meta;
};
const Item = InternalItem as typeof InternalItem & {
  Meta: typeof Meta;
};

Item.Meta = Meta;

export default Item;
