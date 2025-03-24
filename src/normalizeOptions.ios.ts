import { STORAGE_TYPE } from './enums.ios';
import type {
  AuthenticationPrompt,
  BaseOptions,
  GetOptions,
  SetOptions,
} from './types';

// Default authentication prompt options
export const AUTH_PROMPT_DEFAULTS: AuthenticationPrompt = {
  title: 'Authenticate to retrieve secret',
  cancel: 'Cancel',
};

/**
 * Normalizes the storage options for keychain functions.
 *
 * @param options - The options object which includes storage configuration.
 *                  It can be of type SetOptions or GetOptions.
 * @returns A SetOptions object with the deprecated 'AES' storage type converted to 'AES_CBC'.
 *          If the 'AES' storage type is not used, the original options are returned unmodified.
 * @deprecated The use of 'AES' as a storage option is deprecated and will be removed in a future major release.
 */
export function normalizeStorageOptions(
  options: SetOptions | GetOptions
): SetOptions {
  if ('storage' in options && options.storage === STORAGE_TYPE.AES) {
    console.warn(
      `You passed 'AES' as a storage option to one of the react-native-keychain functions.
            This way of passing storage is deprecated and will be removed in a future major.`
    );
    return { ...options, storage: STORAGE_TYPE.AES_CBC };
  }
  return options;
}

/**
 * Normalizes the service option for keychain functions.
 *
 * @param serviceOrOptions - Either a service string or an options object
 *                           which includes service configuration.
 * @returns A BaseOptions object with the service set to the provided string,
 *          or the original options object if it was provided.
 * @deprecated Passing a service string is deprecated and will be removed in a future major release.
 */
export function normalizeServiceOption(
  serviceOrOptions?: string | BaseOptions
): BaseOptions {
  if (typeof serviceOrOptions === 'string') {
    console.warn(
      `You passed a service string as an argument to one of the react-native-keychain functions.
            This way of passing service is deprecated and will be removed in a future major.
            Please update your code to use { service: ${JSON.stringify(
              serviceOrOptions
            )} }`
    );
    return { service: serviceOrOptions };
  }
  return serviceOrOptions || {};
}

/**
 * Normalizes the server option for keychain functions.
 *
 * @param serverOrOptions - Either a server string or an options object
 *                          which includes server configuration.
 * @returns A BaseOptions object with the server set to the provided string,
 *          or the original options object if it was provided.
 * @deprecated Passing a server string is deprecated and will be removed in a future major release.
 */
export function normalizeServerOption(
  serverOrOptions?: string | BaseOptions
): BaseOptions {
  if (typeof serverOrOptions === 'string') {
    console.warn(
      `You passed a server string as an argument to one of the react-native-keychain functions.
            This way of passing service is deprecated and will be removed in a future major.
            Please update your code to use { service: ${JSON.stringify(
              serverOrOptions
            )} }`
    );
    return { server: serverOrOptions };
  }
  return serverOrOptions || {};
}

/**
 * Normalizes the options for keychain functions.
 *
 * @param serviceOrOptions - Either a service string, a SetOptions object, or a GetOptions object.
 * @returns A SetOptions object if the passed options are of type SetOptions,
 *          and a GetOptions object if the passed options are of type GetOptions.
 * @deprecated Passing a service string or an options object with a string for the authenticationPrompt property is deprecated and will be removed in a future major release.
 */
export function normalizeOptions(
  serviceOrOptions?: string | SetOptions | GetOptions
): SetOptions | GetOptions {
  const options = normalizeStorageOptions({
    authenticationPrompt: AUTH_PROMPT_DEFAULTS,
    ...normalizeServiceOption(serviceOrOptions),
  });

  const { authenticationPrompt } = options;

  if (typeof authenticationPrompt === 'string') {
    console.warn(
      `You passed a authenticationPrompt string as an argument to one of the react-native-keychain functions.
            This way of passing authenticationPrompt is deprecated and will be removed in a future major.
            Please update your code to use { authenticationPrompt: { title: ${JSON.stringify(
              authenticationPrompt
            )} }`
    );
    options.authenticationPrompt = {
      ...AUTH_PROMPT_DEFAULTS,
      title: authenticationPrompt,
    };
  } else {
    options.authenticationPrompt = {
      ...AUTH_PROMPT_DEFAULTS,
      ...authenticationPrompt,
    };
  }

  return options;
}
