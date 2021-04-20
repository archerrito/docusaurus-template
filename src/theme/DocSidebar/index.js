import React, {useState, useCallback} from 'react';
import classnames from 'classnames';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useLockBodyScroll from '@theme/hooks/useLockBodyScroll';
import Logo from '@theme/Logo';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import SearchBar from '@theme/SearchBar'

import styles from './styles.module.css';


const generateLabels = (labels=[]) => {
  return (
    <span className={styles.labels}>
      {labels.map(label=>(
        <span className={classnames(styles.label, {
          [styles.labelNew]: label==='new',
        })}>{label}</span>
      ))}
    </span>
  );
}


const MOBILE_TOGGLE_SIZE = 24;

function DocSidebarItem({
  item,
  onItemClick,
  collapsible,
  activePath,
  ...props
}) {
  const {items, href, type} = item;
  const [collapsed, setCollapsed] = useState(item.collapsed);
  const [prevCollapsedProp, setPreviousCollapsedProp] = useState(null);

  // If the collapsing state from props changed, probably a navigation event
  // occurred. Overwrite the component's collapsed state with the props'
  // collapsed value.
  if (item.collapsed !== prevCollapsedProp) {
    setPreviousCollapsedProp(item.collapsed);
    setCollapsed(item.collapsed);
  }

  const handleItemClick = useCallback((e) => {
    e.preventDefault();
    e.target.blur();
    setCollapsed((state) => !state);
  });

  const [label, ...tags] = item.label.split(':');

  switch (type) {
    case 'category':
      return (
        items.length > 0 && (
          <li
            className={classnames('menu__list-item', {
              'menu__list-item--collapsed': collapsed,
            })}
            key={label}>
            <a
              className={classnames('menu__link', {
                'menu__link--sublist': collapsible,
                'menu__link--active': collapsible && !item.collapsed,
              })}
              href="#!"
              onClick={collapsible ? handleItemClick : undefined}
              {...props}>
              {generateLabels(tags)}
              {label}
            </a>
            <ul className="menu__list">
              {items.map((childItem,i) => (
                <DocSidebarItem
                  tabIndex={collapsed ? '-1' : '0'}
                  key={i+'_'+childItem.label}
                  item={childItem}
                  onItemClick={onItemClick}
                  collapsible={collapsible}
                  activePath={activePath}
                />
              ))}
            </ul>
          </li>
        )
      );

    case 'link':
    default:
      return (
        <li className="menu__list-item" key={label+href}>
          <Link
            className={classnames('menu__link', {
              'menu__link--active': href === activePath,
            })}
            to={href}
            {...(isInternalUrl(href)
              ? {
                  isNavLink: true,
                  exact: true,
                  onClick: onItemClick,
                }
              : {
                  target: '_blank',
                  rel: 'noreferrer noopener',
                })}
            {...props}>
            {label}
            {generateLabels(tags)}
          </Link>
        </li>
      );
  }
}

// Calculate the category collapsing state when a page navigation occurs.
// We want to automatically expand the categories which contains the current page.
function mutateSidebarCollapsingState(item, path) {
  const {items, href, type} = item;
  switch (type) {
    case 'category': {
      const anyChildItemsActive =
        items
          .map((childItem) => mutateSidebarCollapsingState(childItem, path))
          .filter((val) => val).length > 0;
      // eslint-disable-next-line no-param-reassign
      item.collapsed = !anyChildItemsActive;
      return anyChildItemsActive;
    }

    case 'link':
    default:
      return href === path;
  }
}

const DocSidebar = (props) => {

  const [showResponsiveSidebar, setShowResponsiveSidebar] = useState(false);
  const {
    siteConfig: {
      themeConfig: {navbar: {title, hideOnScroll = false} = {}},
    } = {},
    isClient,
  } = useDocusaurusContext();
  const {
    docsSidebars,
    path,
    sidebar: currentSidebar,
    sidebarCollapsible,
  } = props;

  useLockBodyScroll(showResponsiveSidebar);

  if (!currentSidebar) {
    return null;
  }
  console.log('current sidebar', currentSidebar)

  const sidebarData = docsSidebars[currentSidebar];

  console.log('sidebar data', sidebarData)

  if (!sidebarData) {
    throw new Error(
      `Cannot find the sidebar "${currentSidebar}" in the sidebar config!`,
    );
  }

  if (sidebarCollapsible) {
    sidebarData.forEach((sidebarItem) =>
      mutateSidebarCollapsingState(sidebarItem, path),
    );
  }

  return (
    <div
    className={classnames(styles.sidebar, {
      [styles.sidebarWithHideableNavbar]: hideOnScroll,
    })}>
      <div
        className={classnames(
          'menu',
          'menu--responsive',
          styles.menu, {
          'menu--show': showResponsiveSidebar
        })}>
        <ul className="menu__list">
          <li className="menu__list-item">
            <Logo className={styles.sidebarLogo} />
          </li>
          <li className="menu__list-item">
            <SearchBar />
          </li>

          {sidebarData.map((item,i) => (
              <DocSidebarItem
                key={i+'_'+item.label}
                item={item}
                onItemClick={(e) => {
                  e.target.blur();
                  setShowResponsiveSidebar(false);
                }}
                collapsible={sidebarCollapsible}
                activePath={path}
              />
            ))}
        </ul>
      </div>
    </div>
  )
}


export default DocSidebar;
