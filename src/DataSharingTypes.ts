// Modified from react-native-keychain (https://github.com/oblador/react-native-keychain)

import type {
  ACCESS_CONTROL,
  ACCESSIBLE,
  AUTHENTICATION_TYPE,
} from './DataSharingEnums.ios';

/**
 * Interface for shared data options
 * @property {boolean} dataSync
 * - whether to sync data to other apps
 * - default: true
 */
export interface DataOptionsType {
  android?: {
    dataSync?: boolean;
  };
  ios?: string | SetOptions | GetOptions;
}

/**
 * Interface for initial provider
 * @property {Array<string>} appsBundleIds
 * - array of other apps bundle ids
 */
export interface InitialProviderType {
  android?: {
    appsBundleIds: Array<string>;
  };
  ios?: {
    accessGroup?: string;
    serviceName?: string;
  };
}

export enum ErrorCode {
  VALUE_ERROR = 'VALUE_ERROR',
  KEY_ERROR = 'KEY_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  NO_DATA_FOUND_ERROR = 'NO_DATA_FOUND_ERROR',
  ACTION_ERROR = 'ACTION_ERROR',
  SAVE_ERROR = 'SAVE_ERROR',
  UPDATE_ERROR = 'UPDATE_ERROR',
  DELETE_ERROR = 'DELETE_ERROR',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

// Define the error type
export interface ErrorType {
  code: ErrorCode;
  message: string;
}

/**
 *
 * * * * * IOS Options for keychain functions. * * * *
 *
 */

/**
 * Options for authentication prompt displayed to the user.
 */
export type AuthenticationPrompt = {
  /** The title for the authentication prompt. */
  title?: string;
};

export type BaseOptions = {
  /** The service name to associate with the keychain item.
   * @default 'App bundle ID'
   */
  service?: string;
  /** The server name to associate with the keychain item. */
  server?: string;
  /** Whether to synchronize the keychain item to iCloud.
   * @platform iOS
   */
  cloudSync?: boolean;
};

/** Base options for keychain functions. */
export type SetOptions = {
  /** The access group to share keychain items between apps.
   * @platform iOS, visionOS
   */
  accessGroup?: string;
  /** Specifies when a keychain item is accessible.
   * @platform iOS, visionOS
   * @default ACCESSIBLE.AFTER_FIRST_UNLOCK
   */
  accessible?: ACCESSIBLE;
  /** Authentication prompt details or a title string.
   * @default
   * ```json
   * {
   *   "title": "Authenticate to retrieve secret",
   *   "cancel": "Cancel"
   * }
   * ```
   *
   */
  authenticationPrompt?: string | AuthenticationPrompt;
} & BaseOptions &
  AccessControlOption;

/** Base options for keychain functions. */
export type GetOptions = {
  /** The access control policy to use for the keychain item. */
  accessControl?: ACCESS_CONTROL;
  /** Authentication prompt details or a title string.
   * @default
   * ```json
   * {
   *   "title": "Authenticate to retrieve secret",
   * }
   * ```
   *
   */
  authenticationPrompt?: string | AuthenticationPrompt;
} & BaseOptions &
  AccessControlOption;

export type AccessControlOption = {
  /** The access control policy to use for the keychain item. */
  accessControl?: ACCESS_CONTROL;
};

export type AuthenticationTypeOption = {
  /** Authentication type for retrieving keychain item.
   * @platform iOS, visionOS
   * @default AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS
   */
  authenticationType?: AUTHENTICATION_TYPE;
};

/**
 * Result returned by keychain functions.
 */
export type Result = {
  /** The service name associated with the keychain item. */
  service: string;
};

/**
 * User credentials returned by keychain functions.
 */
export type UserCredentials = {
  /** The username associated with the keychain item. */
  username: string;
  /** The password associated with the keychain item. */
  password: string;
} & Result;

/**
 * Shared web credentials returned by keychain functions.
 * @platform iOS
 */
export type SharedWebCredentials = {
  /** The server associated with the keychain item. */
  server: string;
} & UserCredentials;
