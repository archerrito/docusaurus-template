// Page layout
import React from 'react';
import {MDXProvider} from '@mdx-js/react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import renderRoutes from '@docusaurus/renderRoutes';
import Layout from '@theme/Layout';
import DocItem from '@theme/DocItem';
import DocSidebar from '@theme/DocSidebar';
import MDXComponents from '@theme/MDXComponents';
import NotFound from '@theme/NotFound';
import {matchPath} from '@docusaurus/router';

import styles from './styles.module.css';

function DocPage(props) {
  const {route: baseRoute, versionMetadata, location, content} = props;
  const {
    permalinkToSidebar,
    docsSidebars,
    version,
    isHomePage,
    homePagePath,
  } = versionMetadata;

  const currentRoute = !isHomePage
    ? baseRoute.routes.find((route) => {
        return matchPath(location.pathname, route);
      }) || {}
    : {};

  const sidebar = (isHomePage
    ? content.metadata.sidebar
    : permalinkToSidebar[currentRoute.path]) || 'docs';

  const {
    siteConfig: {themeConfig: {sidebarCollapsible = true} = {}} = {},
    isClient,
  } = useDocusaurusContext();

  const do404 = (!isHomePage && Object.keys(currentRoute).length === 0);
  if (!isHomePage && Object.keys(currentRoute).length === 0) {
    return <NotFound {...props} />;
  }

  return (
    <Layout
      version={version}
      key={isClient}
      wrapperClassName="main-docs-wrapper"
    >
      <div className={styles.docPage}>
        {sidebar && (
          <div className={styles.docSidebarContainer}>
            <DocSidebar
              docsSidebars={docsSidebars}
              path={isHomePage ? homePagePath : currentRoute.path}
              sidebar={sidebar}
              sidebarCollapsible={sidebarCollapsible}
            />
          </div>
        )}
        <main className={styles.docMainContainer}>
          <MDXProvider components={MDXComponents}>
            {!!do404 && (
              <NotFound {...props} />
            )}
            {!do404 && isHomePage ? (
                <DocItem content={content} />
              ) : (
                renderRoutes(baseRoute.routes)
              )
            }
          </MDXProvider>
        </main>
      </div>
    </Layout>
  );
}

export default DocPage;
