// eslint-disable-next-line
const typescriptTransform = require('karma-typescript-es6-transform');
// eslint-disable-next-line
process.env.CHROME_BIN = require('puppeteer').executablePath();

/**
 * Karma runner configuration.
 *
 * @param config - Karma configuration.
 */
module.exports = (config) => {
  const { SAUCE, SAUCE_USERNAME, SAUCE_ACCESS_KEY, TEST_TIMEOUT, BUILD_NUMBER, NODE_ENV } =
    process.env;

  const browsers = ['chrome'];
  const appName = 'webrtc-core';
  const environment = NODE_ENV || 'dev';
  const buildNumber = BUILD_NUMBER || new Date().toUTCString();
  const buildName = `${appName}-tests-${environment}#${buildNumber}`;
  const useSauceConnect = SAUCE === 'true';
  const timeout = TEST_TIMEOUT || 60000;

  const sharedSauceOptions = {
    screenResolution: '1600x1200',
    extendedDebugging: true,
    capturePerformance: true,
    connectRetries: 2,
    connectRetryTimeout: 2000,
  };

  const firefoxOptions = {
    prefs: {
      'devtools.chrome.enabled': true,
      'devtools.debugger.prompt-connection': false,
      'devtools.debugger.remote-enabled': true,
      'dom.webnotifications.enabled': false,
      'media.navigator.streams.fake': true,
      'media.getusermedia.screensharing.enabled': true,
      'media.navigator.permission.disabled': true,
      'media.getusermedia.video.enabled': true,
      'media.getusermedia.audio.enabled': true,
    },
  };

  const chromeOptions = {
    args: [
      'start-maximized',
      'disable-infobars',
      'ignore-gpu-blacklist',
      'test-type',
      'disable-gpu',
      '--no-sandbox',
      '--disable-features=WebRtcHideLocalIpsWithMdns',
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      '--enable-experimental-web-platform-features',
      '--allow-insecure-localhost',
      '--unsafely-treat-insecure-origin-as-secure',
    ],
  };

  const chromeSauceOptions = {
    base: 'SauceLabs',
    browserName: 'chrome',
    'goog:chromeOptions': chromeOptions,
    'sauce:options': {
      ...sharedSauceOptions,
      tags: ['w3c-chrome'],
    },
  };

  /**
   * Utility method to create config object of all supported chrome versions on all supported platforms.
   *
   * @returns Sauce lab config object for chrome browser.
   */
  const getChromeLaunchers = () => {
    const chromeVersions = [
      '80',
      '81',
      '83',
      '84',
      '85',
      '86',
      '87',
      '88',
      '89',
      '90',
      '91',
      '92',
      '93',
      '94',
      '95',
      '96',
      '97',
    ];
    const platforms = ['Windows 10', 'macOS 11', 'macOS 12'];
    const chromeLaunchers = {};
    platforms.forEach((platform) => {
      chromeVersions.forEach((version) => {
        chromeLaunchers[`chrome_${version}_${platform}`] = {
          ...chromeSauceOptions,
          browserVersion: version,
          platformName: platform,
        };
      });
    });
    return chromeLaunchers;
  };

  const firefoxSauceOptions = {
    base: 'SauceLabs',
    browserName: 'firefox',
    'moz:firefoxOptions': firefoxOptions,
    'sauce:options': {
      ...sharedSauceOptions,
      tags: ['w3c-firefox'],
    },
  };

  /**
   * Utility method to create config object of all supported firefox versions on all supported platforms.
   *
   * @returns Sauce lab config object for firefox browser.
   */
  const getFirefoxLaunchers = () => {
    const firefoxVersions = [
      '70',
      '71',
      '72',
      '73',
      '74',
      '75',
      '76',
      '77',
      '78',
      '79',
      '80',
      '81',
      '82',
      '83',
      '84',
      '85',
      '86',
      '87',
      '88',
      '89',
      '90',
      '91',
      '92',
      '93',
      '94',
      '95',
      '96',
    ];
    const platforms = ['Windows 10', 'Windows 11', 'macOS 11', 'macOS 12'];
    const firefoxLaunchers = {};
    platforms.forEach((platform) => {
      firefoxVersions.forEach((version) => {
        firefoxLaunchers[`firefox_${version}_${platform}`] = {
          ...firefoxSauceOptions,
          browserVersion: version,
          platformName: platform,
        };
      });
    });
    return firefoxLaunchers;
  };

  const safariSauceOptions = {
    base: 'SauceLabs',
    browserName: 'Safari',
    'sauce:options': {
      ...sharedSauceOptions,
      tags: ['w3c-safari'],
    },
  };

  /**
   * Utility method to create config object of all supported safari versions on all supported platforms.
   *
   * @returns Sauce lab config object for safari browser.
   */
  const getSafariLaunchers = () => {
    const safariLaunchers = {
      'safari_14_macOS 11': {
        ...safariSauceOptions,
        browserVersion: '14',
        platformName: 'macOS 11',
      },
      'safari_15_macOS 12': {
        ...safariSauceOptions,
        browserVersion: '15',
        platformName: 'macOS 12',
      },
    };
    return safariLaunchers;
  };

  const edgeSauceOptions = {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    'ms:edgeOptions': chromeOptions,
    'sauce:options': {
      ...sharedSauceOptions,
      tags: ['w3c-edge'],
    },
  };

  /**
   * Utility method to create config object of all supported edge versions on all supported platforms.
   *
   * @returns Sauce lab config object for edge browser.
   */
  const getEdgeLaunchers = () => {
    const edgeVersions = [
      '80',
      '81',
      '83',
      '84',
      '85',
      '86',
      '87',
      '88',
      '89',
      '90',
      '91',
      '92',
      '93',
      '94',
      '95',
      '96',
      '97',
    ];
    const platforms = ['Windows 10', 'Windows 11'];
    const edgeLaunchers = {};
    platforms.forEach((platform) => {
      edgeVersions.forEach((version) => {
        edgeLaunchers[`edge_${version}_${platform}`] = {
          ...edgeSauceOptions,
          browserVersion: version,
          platformName: platform,
        };
      });
    });
    return edgeLaunchers;
  };

  const localLaunchers = {
    chrome: {
      base: 'ChromeHeadless',
      flags: [
        '--no-sandbox',
        '--disable-web-security',
        '--use-fake-device-for-media-stream',
        '--use-fake-ui-for-media-stream',
      ],
    },
    firefox: {
      base: 'Firefox',
      flags: firefoxOptions.prefs,
    },
    safari: {
      base: 'Safari',
      flags: {
        'webkit:WebRTC': {
          DisableInsecureMediaCapture: true,
        },
      },
    },
  };

  const chromeLaunchers = getChromeLaunchers();
  const firefoxLaunchers = getFirefoxLaunchers();
  const safariLaunchers = getSafariLaunchers();
  const edgeLaunchers = getEdgeLaunchers();

  if (useSauceConnect && !SAUCE_USERNAME && !SAUCE_ACCESS_KEY) {
    // eslint-disable-next-line no-console
    console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
    process.exit(1);
  }

  const files = ['src/**/*.ts'];

  const karmaConfig = {
    basePath: '.',
    frameworks: ['mocha', 'chai', 'karma-typescript'],
    files,
    preprocessors: {
      'src/**/*.ts': ['karma-typescript'],
    },
    exclude: [],
    reporters: ['junit', 'karma-typescript', 'saucelabs', 'mocha', 'coverage'],
    port: 9876,
    logLevel: config.DEBUG,
    autoWatch: false,
    singleRun: true,
    concurrency: 4,
    timeout,
    captureTimeout: 240000,
    karmaTypescriptConfig: {
      tsconfig: './tsconfig.json',
      compilerOptions: {
        allowJs: true,
        module: 'commonjs',
        resolveJsonModule: false,
      },
      bundlerOptions: {
        debug: true,
        addNodeGlobals: false,
        entrypoints: config.integration ? /\.integration-test\.ts/i : /\.test\.ts$/i,
        transforms: [typescriptTransform()],
      },
      coverageOptions: {
        exclude: [/\.(d|spec|test)\.ts$/i],
      },
    },
    sauceLabs: {
      build: buildName,
      recordScreenshots: true,
      recordVideo: true,
      tags: ['web-rtc-core'],
      testName: `${config.integration ? 'Integration Tests' : 'Unit Tests'}`,
      connectOptions: {
        logfile: './sauce.log',
        noSslBumpDomains: [
          'idbroker.webex.com',
          'idbrokerbts.webex.com',
          '127.0.0.1',
          'localhost',
          '*.wbx2.com',
          '*.ciscospark.com',
        ],
        tunnelDomains: ['127.0.0.1', 'localhost'],
      },
    },
    coverageReporter: {
      type: 'html',
      dir: 'coverage',
    },
    junitReporter: {
      outputDir: 'coverage',
      outputFile: 'junit.xml',
    },
  };

  let sauceLaunchers = {};
  if (useSauceConnect) {
    if (config.chrome) {
      sauceLaunchers = { ...chromeLaunchers };
    } else if (config.firefox) {
      sauceLaunchers = { ...firefoxLaunchers };
    } else if (config.edge) {
      sauceLaunchers = { ...edgeLaunchers };
    } else if (config.safari) {
      sauceLaunchers = { ...safariLaunchers };
    }
  }
  karmaConfig.customLaunchers = { ...localLaunchers, ...sauceLaunchers };
  karmaConfig.browsers = useSauceConnect ? Object.keys(sauceLaunchers) : browsers;

  config.set(karmaConfig);
};
