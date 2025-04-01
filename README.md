![React Native App Data Sharing - Simform]()

# react-native-app-data-sharing

[![react-native-app-data-sharing on npm](https://img.shields.io/npm/v/react-native-app-data-sharing.svg?style=flat)](https://www.npmjs.com/package/react-native-app-data-sharing) [![react-native-app-data-sharing downloads](https://img.shields.io/npm/dm/react-native-app-data-sharing)](https://www.npmtrends.com/react-native-app-data-sharing) [![react-native-app-data-sharing install size](https://packagephobia.com/badge?p=react-native-app-data-sharing)](https://packagephobia.com/result?p=react-native-app-data-sharing) [![Android](https://img.shields.io/badge/Platform-Android-green?logo=android)](https://www.android.com) [![iOS](https://img.shields.io/badge/Platform-iOS-green?logo=apple)](https://developer.apple.com/ios) [![MIT](https://img.shields.io/badge/License-MIT-green)](https://opensource.org/licenses/MIT)

---

This React Native package facilitates seamless and secure data sharing between applications on the same device. It leverages `SharedPreferences` on Android and `Keychain` on iOS to ensure efficient and protected data transfer. This makes it an excellent solution for cross-app communication and integration, enabling smooth interaction and synchronization of data across multiple apps.

## Quick Access

[Installation](#installation) | [Usage and Examples](#usage)| [Methods](#methods) | [Example Code](#examples) | [License](#license)

## Getting Started

Here's how to get started with `react-native-app-data-sharing` in your React Native project:

### Installation

#### Install the package

```sh
npm install react-native-app-data-sharing
```

Using `Yarn`:

```sh
yarn add react-native-app-data-sharing
```

Install pod for iOS

```sh
npx pod-install
```

## Setting up for CLI

### Android

1. Set Permissions in `manifest.xml`

   Add the following permission to your app's `manifest.xml` file:

   ```xml
   <!-- Instruction: define app-specific permission -->
   <permission
     android:name="${applicationId}.permission.READ_SHARED_PREFS"
     android:protectionLevel="normal" />
   ```

   This permission allows other apps to access shared data when they define the same permission in their `manifest.xml`.

   > Note: Keep `${applicationId}` as-is. It will automatically resolve to your app's bundle ID.

2. Configure the Provider in `manifest.xml`

   Define a provider in your `manifest.xml` file:

   ```xml
   <!-- Instruction: define app-specific provider -->
   <provider
     android:name="com.data.SharedPreferencesProvider"
     android:authorities="${applicationId}.sharedpreferencesprovider"
     android:permission="${applicationId}.permission.READ_SHARED_PREFS"
     android:enabled="true"
     android:exported="true" />
   ```

   This provider facilitates data sharing between apps via the defined provider authority.

   > Note: Keep `${applicationId}` as-is. It will automatically resolve to your app's bundle ID.

3. Declare Permissions for External Apps

   If your app needs to access data from another app, add its permissions to your `manifest.xml` file:

   ```xml
   <!-- Instruction: Declare permission for another app -->
   <uses-permission android:name="${YOUR_APPLICATION_ID/BUNDLE_ID}.permission.READ_SHARED_PREFS" tools:ignore="CustomPermissionTypo" />
   ```

   Replace `${YOUR_APPLICATION_ID/BUNDLE_ID}` with the bundle ID of the target app. For example:

   ```xml
   <!-- Instruction: Declare permission for other app -->
   <uses-permission android:name="com.example.one.permission.READ_SHARED_PREFS" tools:ignore="CustomPermissionTypo" />
   ```

4. Add Queries for Android 11

   Android 11 introduces package visibility restrictions, so you must explicitly define the apps your app intends to query. Add the following inside the

   `<queries>` section of your `manifest.xml`:

   ```xml
     <queries>
       <!-- Instruction: define package of app for Android 11 -->
       <package android:name="${applicationId}" />
       <package android:name="com.example.one" />
     </queries>
   ```

   This ensures your app can detect and interact with the specified apps.

## ⚠️ Note: Recommended to use this package with Android 11 or higher. ⚠️

### iOS

1. Enable Capabilities

   Enable the following capabilities for your app:

   - `App Groups`
   - `Keychain Sharing`

2. Create an App Group ID

   Create an App Group ID via the Developer Console or Xcode. Ensure that both the main app and any extensions share the same App Group and Keychain Sharing group names.

   > Note: Always prepend your App Group ID with $(TeamIdentifierPrefix).

For detailed instructions, refer to:
[App Groups Documentation](https://developer.apple.com/documentation/xcode/configuring-app-groups)
[Keychain Sharing Documentation](https://developer.apple.com/documentation/xcode/configuring-keychain-sharing)

## Setting up via Expo Plugin

### Android

- After installing the package, configure your `app.json` or `app.config.js` as follows:

```js
{
"name": "my app",
"plugins": [
  [
    "react-native-app-data-sharing",
    {
      "appsBundleIds": [
        YOUR_BUNDLE_IDS
      ]
    }
  ]
]
}
```

Replace `YOUR_BUNDLE_IDS` with the same bundle IDs you used when initializing the store. This ensures the required permissions are added to manifest.xml.

### iOS

- Update your configuration as follows:

```js
{
"name": "my app",
"ios": {
  "bundleIdentifier": YOUR_BUNDLE_ID,
  "entitlements": {
    "com.apple.security.application-groups": [
      APP_GROUP_ID
    ],
    "keychain-access-groups": [
      $(TeamIdentifierPrefix).APP_GROUP_ID
    ]
  }
}
}
```

- Replace `YOUR_BUNDLE_ID` and `APP_GROUP_ID` with your app's bundle ID and App Group ID, respectively.

## Usage

### Initialize Store

To enable data sharing between two apps, initialize the store as follows:

```jsx
initializeStore({
  android: {
    appsBundleIds: ['data.example.two'], // Replace with your app's bundle IDs
  },
  ios: {
    accessGroup: appGroupIdentifier, // App Group identifier
    serviceName: serviceName, // Service name
  },
});
```

Android:

- appsBundleIds: Provide an array of the bundle IDs for the apps you want to share data with. For example: ["data.example.two"].

iOS:

- accessGroup: Specify the App Group identifier shared across apps.
- serviceName: Set the service name used for Keychain Sharing.

This setup ensures seamless data sharing between the configured apps on both Android and iOS platforms.

```jsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { saveData, initializeStore, getAllSyncData } from 'react-native-app-data-sharing';

const appGroupIdentifier = YOUR_GROUP_IDENTIFIER_WITH_TEAM_ID;
const serviceName = YOUR_GROUP_IDENTIFIER;

const App: React.FC = () => {
  useEffect(() => {
    initializeStore({
      android: {
        appsBundleIds: //Your app bundle ids i.e. ["data.example.two"]
      },
      ios: {
        accessGroup: appGroupIdentifier, // App Group identifier
        serviceName: serviceName,
      },
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Data-Sharing</Text>
      <Button
        title="Save Data"
        onPress={async () => {
          const newValue = await saveData("email", "example@abc.com");
          console.log(newValue);
        }}
      />
      <Button
        title="Get All Data"
        onPress={async () => {
          const data = await getAllSyncData();
          console.log(data);
        }}
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    alignItems: 'center',
  }
});
```

## Types

### DataOptionsType

```ts
{
  android?: {
    dataSync?: boolean;
  };
  ios?: string | SetOptions | GetOptions;
}
```

---

### InitialProviderType

```ts
{
  android?: {
    appsBundleIds: Array<string>;
  };
  ios?: {
    accessGroup?: string;
    serviceName?: string;
  };
}
```

The `InitialProviderType` defines platform-specific configurations for data sharing.

Android:

- appsBundleIds: Specifies the bundle IDs of other apps that can share data with the current app using SharedPreferences.

iOS:

- accessGroup: (Optional) Specifies an access group for securely sharing Keychain data across multiple apps.
- serviceName: (Optional) Sets a custom service name for Keychain storage.

## Methods

### initializeStore(authorities: InitialProviderType)

```ts
initializeStore(authorities: InitialProviderType): Promise<boolean>;
```

The `initializeStore` method initializes the shared data store with platform-specific configurations provided in authorities.

Parameters:

- authorities: An object adhering to InitialProviderType that defines platform-specific settings for data sharing.

Returns:

- A Promise that resolves to true if the initialization is successful, or false otherwise.

---

### saveData(key, value, options)

```ts
saveData(key: string, value: string, options?: DataOptionsType): void
```

Description:
The `saveData` method stores new data in the shared storage mechanism.

- Android: Saves data using SharedPreferences.
- iOS: Stores data securely in the Keychain.

Parameters:

- key (string): The unique identifier for the data to store.
- value (string): The data to be stored.
- options (optional, DataOptionsType): Platform-specific options for data storage, such as access control.

Return Type:

- void: This method does not return a value.

---

### updateData(key, value, options)

```ts
updateData(key: string, value: string, options?: DataOptionsType): void
```

Description:
The `updateData` method updates or stores data in the shared storage mechanism.

- Android: Uses SharedPreferences to store data.
- iOS: Utilizes Keychain for secure data storage.

Parameters:

- key (string): The unique identifier for the data to update or store.
- value (string): The new value to be stored.
- options (optional, DataOptionsType): Platform-specific options for updating data.

Return Type:

- void: This method does not return a value.

---

### getData(key, options)

```ts
getData(key: string, options?: DataOptionsType): Promise<string | null>
```

Description:
The `getData` method retrieves the stored value associated with the given key.

- Android: Reads data from SharedPreferences.
- iOS: Fetches data securely from the Keychain.

Parameters:

- key (string): The unique identifier for the data to retrieve.
- options (optional, DataOptionsType): Platform-specific options for retrieving data.

Return Type:

- Promise<string | null>: A promise that resolves with the stored value as a string, or null if the key does not exist.

---

### getAllSyncData()

```ts
getAllSyncData(options?: DataOptionsType): Promise<Record<string, string>>
```

Description:
The `getAllSyncData` method retrieves all stored key-value pairs.

- Android: Retrieves all data from SharedPreferences.
- iOS: Fetches all securely stored data from the Keychain.

Parameters:

- options (optional, DataOptionsType): Platform-specific options for retrieving all data.

Return Type:

- Promise<Record<string, string>>: A promise that resolves with an object containing all stored key-value pairs.

---

### deleteData(key)

```ts
deleteData(key: string): Promise<void>
```

Description:
The `deleteData` method removes a specific key-value pair from the shared storage.

- Android: Deletes the key from SharedPreferences.
- iOS: Removes the key securely from the Keychain.

Parameters:

- key (string): The unique identifier for the data to delete.

Return Type:

- Promise<void>: A promise that resolves when the data is successfully deleted.

---

### clearData()

```ts
clearData(): Promise<void>
```

Description:
The clearData method removes all data from the shared storage.

- Android: Deletes all data from SharedPreferences.
- iOS: Wipes all data from the Keychain.

Parameters:

- None.

Return Type:

- Promise<void>: A promise that resolves when all data is successfully cleared.

## Examples

To better understand how to use these methods in a real-world scenario, refer to the following full working example projects:

[ExampleAppOne](./examples/example1/src/App.tsx): Shows the implementation in the first application to share data with the second.

[ExampleAppTwo](./examples/example2/src/App.tsx): Shows the implementation in the second application to get data with the first.

## Find this library useful? ❤️

Support it by joining [stargazers](https://github.com/SimformSolutionsPvtLtd/react-native-app-data-sharing/stargazers) for this repository.⭐

## Bugs / Feature requests / Feedbacks

For bugs, feature requests, and discussion please use [GitHub Issues](https://github.com/SimformSolutionsPvtLtd/react-native-app-data-sharing/issues/new?labels=bug&late=BUG_REPORT.md&title=%5BBUG%5D%3A), [GitHub New Feature](https://github.com/SimformSolutionsPvtLtd/react-native-app-data-sharing/issues/new?labels=enhancement&late=FEATURE_REQUEST.md&title=%5BFEATURE%5D%3A), [GitHub Feedback](https://github.com/SimformSolutionsPvtLtd/react-native-app-data-sharing/issues/new?labels=enhancement&late=FEATURE_REQUEST.md&title=%5BFEEDBACK%5D%3A)

## 🤝 How to Contribute

We'd love to have you improve this library or fix a problem 💪
Check out our [Contributing Guide](CONTRIBUTING.md) for ideas on contributing.

## Awesome Mobile Libraries

- Check out our other [available awesome mobile libraries](https://github.com/SimformSolutionsPvtLtd/Awesome-Mobile-Libraries)

## License

- [MIT License](./LICENSE)
