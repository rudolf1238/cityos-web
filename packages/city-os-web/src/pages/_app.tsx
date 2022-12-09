import { AppProps } from 'next/app';
import DateFnsUtils from '@date-io/date-fns';
import React, { FunctionComponent, useEffect } from 'react';
import i18next from 'i18next';

import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import CssBaseline from '@material-ui/core/CssBaseline';
import Head from 'next/head';

import * as i18n from 'city-os-common/libs/i18n';
import { StoreProvider } from 'city-os-common/reducers';

import ExitDialog from 'city-os-common/modules/ExitDialog';
import WindowVhDetector from 'city-os-common/modules/WindowVhDetector';

import useWebTranslation from '../hooks/useWebTranslation';

import ApolloProvider from '../modules/ApolloProvider';
import I18nWebProvider from '../modules/I18nWebTranslationProvider';
import QueryString from '../modules/QueryString';
import ThemeProvider from '../modules/ThemeProvider';
import ThemeSnackbar from '../modules/ThemeSnackbar';

import '../styles/globals.scss';

const App: FunctionComponent<AppProps> = function ({ Component, pageProps }) {
  const { t } = useWebTranslation('common');

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  // TODO: remove log
  useEffect(() => {
    const onClick = () => {
      console.log('click');
    };
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('lang', i18next.language); // fix landing page lang
    i18next.on('languageChanged', (language) => {
      document.documentElement.setAttribute('lang', language);
    });
  }, []);

  return (
    <I18nWebProvider>
      <Head>
        <title>{t('City OS')}</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <StoreProvider>
        <ThemeProvider>
          <CssBaseline />
          <WindowVhDetector />
          <ApolloProvider>
            <QueryString />
            <MuiPickersUtilsProvider
              utils={DateFnsUtils}
              locale={i18n.localesMap?.[i18next.language] || i18n.localesMap.default}
            >
              <Component {...pageProps} />
            </MuiPickersUtilsProvider>
          </ApolloProvider>
          <ThemeSnackbar />
          <ExitDialog />
        </ThemeProvider>
      </StoreProvider>
    </I18nWebProvider>
  );
};

export default App;
