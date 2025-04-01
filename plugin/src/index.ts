import {
  createRunOncePlugin,
  withAndroidManifest,
  type AndroidManifest,
  type ConfigPlugin,
} from '@expo/config-plugins';
import { type ManifestApplication } from '@expo/config-plugins/build/android/Manifest';

/**
 * Interface for the plugin config
 */
interface ConfigProps {
  appsBundleIds: string[];
}

/**
 * Interface for the manifest
 */
type NewManifestApplication = ManifestApplication & {
  provider?: any;
};

/**
 * Interface for the plugin
 */
type DataShareConfig = ConfigPlugin<ConfigProps>;

/**
 * Adds custom `<queries>` entries to the AndroidManifest.xml.
 * This function ensures that a `<package>` array exists within `<queries>`.
 * It adds specified package names to the `<queries>` section, avoiding duplicates.
 *
 * @param {AndroidManifest} androidManifest - The AndroidManifest.xml as a JavaScript object.
 * @param {string[]} packages - Array of package names to add to the `<queries>` section.
 * @returns {AndroidManifest} - The modified AndroidManifest.xml.
 */
const addCustomQueries = (
  androidManifest: AndroidManifest,
  packages: string[]
) => {
  if (!androidManifest.manifest.queries) {
    androidManifest.manifest.queries = [];
  }

  // Ensure `package` array exists inside `queries`
  if (!androidManifest.manifest.queries.some((q) => q.package)) {
    androidManifest.manifest.queries.push({ package: [] });
  }

  const defaultPackages = ['${applicationId}'];
  const allPackages = [...new Set([...defaultPackages, ...packages])];

  const packageQuery = androidManifest.manifest.queries.find((q) => q.package);

  const existingPackages = new Set(
    packageQuery?.package?.map((pkg) => pkg.$?.['android:name'])
  );

  const newPackages = allPackages
    .filter((pkg) => !existingPackages.has(pkg))
    .map((pkg) => ({ $: { 'android:name': pkg } }));

  packageQuery?.package?.push(...newPackages);

  return androidManifest;
};

/**
 * Helper function to add permissions dynamically.
 * @param {object} androidManifest - The AndroidManifest.xml as a JavaScript object.
 * @param {string[]} permissions - Array of permissions to add.
 */
const addUsesPermissions = (
  androidManifest: AndroidManifest,
  permissions: string[]
) => {
  if (!androidManifest.manifest['uses-permission']) {
    androidManifest.manifest['uses-permission'] = [];
  }

  // Check if the permission already exists
  const existingUsesPermissions = androidManifest.manifest[
    'uses-permission'
  ].map((p) => {
    return p.$['android:name'];
  });
  // Add the permission if it doesn't exist
  permissions.forEach((permission) => {
    if (
      !existingUsesPermissions.includes(
        `${permission}.permission.READ_SHARED_PREFS`
      )
    ) {
      androidManifest.manifest['uses-permission']?.push({
        $: {
          'android:name': `${permission}.permission.READ_SHARED_PREFS`,
        },
      });
    }
  });

  return androidManifest;
};

/**
 * Helper function to add custom `<permission>` and `<provider>` entries.
 * @param {object} androidManifest - The AndroidManifest.xml as a JavaScript object.
 */
const addCustomEntriesToManifest = (androidManifest: AndroidManifest) => {
  const appIdPlaceholder = '${applicationId}';
  const manifestApplication: NewManifestApplication[] | undefined =
    androidManifest.manifest.application;

  // Define the custom permission
  const permission = {
    $: {
      'android:name': `${appIdPlaceholder}.permission.READ_SHARED_PREFS`,
      'android:protectionLevel': 'normal',
    },
  };

  // Add the permission to <manifest>
  if (!androidManifest.manifest.permission) {
    androidManifest.manifest.permission = [];
  }
  // Check if the permission already exists
  const existingPermissions = androidManifest.manifest.permission.map(
    (p) => p.$['android:name']
  );
  // Add the permission if it doesn't exist
  if (!existingPermissions.includes(permission.$['android:name'])) {
    androidManifest.manifest.permission.push(permission);
  }

  // Add the provider entry to <application>
  const provider = {
    $: {
      'android:name': 'com.data.SharedPreferencesProvider',
      'android:authorities': `${appIdPlaceholder}.sharedpreferencesprovider`,
      'android:permission': `${appIdPlaceholder}.permission.READ_SHARED_PREFS`,
      'android:enabled': 'true',
      'android:exported': 'true',
    },
  };

  // Add the provider to <application>
  if (!manifestApplication?.[0]?.provider) {
    //@ts-ignore
    manifestApplication[0].provider = [];
  }
  // Check if the provider already exists
  const existingProviders = manifestApplication?.[0]?.provider.map(
    (p: any) => p.$['android:name']
  );
  // Add the provider if it doesn't exist
  if (!existingProviders.includes(provider.$['android:name'])) {
    manifestApplication?.[0]?.provider.push(provider);
  }

  return androidManifest;
};

/**
 * Main Expo plugin function to modify the AndroidManifest.xml.
 * @param {object} config - The Expo app configuration.
 * @param {object} options - Plugin options (e.g., permissions array).
 */
const withCustomManifest: DataShareConfig = (config, props) => {
  const { appsBundleIds = [] } = props;

  return withAndroidManifest(config, (ownConfig) => {
    ownConfig.modResults = addUsesPermissions(ownConfig.modResults, [
      ...new Set(appsBundleIds),
    ]);
    ownConfig.modResults = addCustomEntriesToManifest(ownConfig.modResults);
    ownConfig.modResults = addCustomQueries(ownConfig.modResults, [
      ...new Set(appsBundleIds),
    ]);
    return ownConfig;
  });
};

const withDataSharing: DataShareConfig = (config, props) => {
  config = withCustomManifest(config, props);
  return config;
};

const pak = require('react-native-app-data-sharing/package.json');
export default createRunOncePlugin(withDataSharing, pak.name, pak.version);
