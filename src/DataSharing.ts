import { NativeModules, Platform } from 'react-native';
import {
  ErrorCode,
  type DataOptionsType,
  type ErrorType,
  type InitialProviderType,
} from './DataSharingTypes';
import { normalizeOptions } from './NormalizeOptionsUtils.ios';

const LINKING_ERROR =
  `The package 'react-native-app-data-sharing' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const Data = NativeModules.Data
  ? NativeModules.Data
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const IS_ANDROID = Platform.OS === 'android';

/**
 * Handles an error by checking its type and logging an appropriate message.
 * If the error is of type `ErrorType`, it logs the error code and message,
 * then throws a new error with the same information. If the error is not of type
 * `ErrorType`, it throws a generic error indicating an unknown error occurred.
 *
 * @param error - The error to be handled, which can be of any type.
 * @throws Will throw an error with a specific message based on the error code
 * if the error is of type `ErrorType`, or a generic unknown error message otherwise.
 */

const handleError = (error: unknown) => {
  if (isErrorType(error)) {
    switch (error.code) {
      case ErrorCode.VALUE_ERROR:
        console.error(`${ErrorCode.VALUE_ERROR}: ${error.message}`);
        throw new Error(`${ErrorCode.VALUE_ERROR}: ${error.message}`);
      case ErrorCode.KEY_ERROR:
        console.error(`${ErrorCode.KEY_ERROR}: ${error.message}`);
        throw new Error(`${ErrorCode.KEY_ERROR}: ${error.message}`);
      case ErrorCode.SAVE_ERROR:
        console.error(`${ErrorCode.SAVE_ERROR}: ${error.message}`);
        throw new Error(`${ErrorCode.SAVE_ERROR}: ${error.message}`);
      case ErrorCode.UPDATE_ERROR:
        console.error(`${ErrorCode.UPDATE_ERROR}: ${error.message}`);
        throw new Error(`${ErrorCode.UPDATE_ERROR}: ${error.message}`);
      case ErrorCode.DELETE_ERROR:
        console.error(`${ErrorCode.DELETE_ERROR}: ${error.message}`);
        throw new Error(`${ErrorCode.DELETE_ERROR}: ${error.message}`);
      case ErrorCode.CLEAR_ERROR:
        console.error(`${ErrorCode.CLEAR_ERROR}: ${error.message}`);
        throw new Error(`${ErrorCode.CLEAR_ERROR}: ${error.message}`);
      case ErrorCode.NO_DATA_FOUND_ERROR:
        console.error(`${ErrorCode.NO_DATA_FOUND_ERROR}: ${error.message}`);
        throw new Error(`${ErrorCode.NO_DATA_FOUND_ERROR}: ${error.message}`);
      case ErrorCode.ACTION_ERROR:
        console.error(`${ErrorCode.ACTION_ERROR}: ${error.message}`);
        throw new Error(`${ErrorCode.ACTION_ERROR}: ${error.message}`);
      case ErrorCode.UNEXPECTED_ERROR:
        console.error(`${ErrorCode.UNEXPECTED_ERROR}: ${error.message}`);
        throw new Error(`${ErrorCode.UNEXPECTED_ERROR}: ${error.message}`);
    }
  } else {
    throw new Error('An unknown error occurred.');
  }
};

/**
 * Checks if an error is of type `ErrorType`.
 * @param error - The error to be checked
 * @returns `true` if the error is of type `ErrorType`, `false` otherwise
 */
function isErrorType(error: unknown): error is ErrorType {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * Saves a key-value pair to the shared storage.
 *
 * @param key - The key to be saved
 * @param value - The value to be saved
 * @param options - An optional object containing configuration options
 * @returns A promise that resolves to an empty value if the data was saved successfully,
 * or rejects with an error if the data could not be saved.
 */
export const saveData = async (
  key: string,
  value: string,
  options?: DataOptionsType
): Promise<boolean> => {
  try {
    const platformOptions = IS_ANDROID
      ? options?.android
      : normalizeOptions(options?.ios);

    const result = await Data.saveSharedData(
      platformOptions,
      key.toLowerCase(),
      value
    );
    return Promise.resolve(result);
  } catch (e: unknown) {
    return handleError(e);
  }
};

/**
 * Initializes the shared storage with the provided authorities.
 *
 * @param authorities - An object containing configuration options for the shared storage,
 * with keys for Android and iOS platforms.
 * @returns A promise that resolves to an empty value if the store was initialized successfully,
 * or rejects with an error if the store could not be initialized.
 */
export const initializeStore = (
  authorities: InitialProviderType
): Promise<boolean> => {
  const { android, ios } = authorities || {};

  const storeParams = IS_ANDROID
    ? [android]
    : [ios?.accessGroup, ios?.serviceName];

  return Data.initializeStore(...storeParams);
};

/**
 * Retrieves a value from the shared storage.
 *
 * @param key - The key of the data to be retrieved.
 * @param options - An optional object containing configuration options.
 * @returns A promise that resolves to the value stored under the key,
 * or rejects with an error if the value could not be retrieved.
 */
export const getData = async (
  key: string,
  options?: DataOptionsType
): Promise<string> => {
  try {
    const platformOptions = IS_ANDROID
      ? options?.android
      : normalizeOptions(options?.ios);

    const result = await Data.getSharedData(platformOptions, key.toLowerCase());
    return Promise.resolve(result);
  } catch (e: unknown) {
    return handleError(e);
  }
};

/**
 * Retrieves all key-value pairs from the shared storage.
 *
 * @param options - An optional object containing configuration options.
 * @returns A promise that resolves to an object with keys as strings and values as strings,
 * or rejects with an error if the data could not be retrieved, or is undefined if no data is found.
 */
export const getAllSyncData = async (
  options?: DataOptionsType
): Promise<Record<string, string> | undefined> => {
  try {
    const platformOptions = IS_ANDROID
      ? options?.android
      : normalizeOptions(options?.ios);

    const result = Data.getAllSharedData(platformOptions);
    return Promise.resolve(result);
  } catch (e: unknown) {
    return handleError(e);
  }
};

/**
 * Updates a key-value pair in the shared storage.
 *
 * @param key - The key of the data to be updated.
 * @param value - The new value for the key.
 * @param options - An optional object containing configuration options.
 * @returns A promise that resolves to an empty value if the data was updated successfully,
 * or rejects with an error if the data could not be updated.
 */
export const updateData = async (
  key: string,
  value: string,
  options?: DataOptionsType
): Promise<boolean> => {
  try {
    const platformOptions = IS_ANDROID
      ? options?.android
      : normalizeOptions(options?.ios);

    const result = await Data.updateSharedData(
      platformOptions,
      key.toLowerCase(),
      value
    );
    return Promise.resolve(result);
  } catch (e: unknown) {
    return handleError(e);
  }
};

/**
 * Deletes a key-value pair from the shared storage.
 *
 * @param key - The key of the data to be deleted.
 * @param options - An optional object containing configuration options.
 * @returns A promise that resolves to an empty value if the data was deleted successfully,
 * or rejects with an error if the data could not be deleted.
 */
export const deleteData = async (
  key: string,
  options?: DataOptionsType
): Promise<boolean> => {
  try {
    const platformOptions = IS_ANDROID
      ? options?.android
      : normalizeOptions(options?.ios);

    const result = await Data.deleteSharedData(
      platformOptions,
      key.toLowerCase()
    );
    return Promise.resolve(result);
  } catch (e: unknown) {
    return handleError(e);
  }
};

/**
 * Clears all data from the shared storage.
 *
 * @param options - An optional object containing configuration options.
 * @returns A promise that resolves to an empty value if the data was cleared successfully,
 * or rejects with an error if the data could not be cleared.
 */
export const clearData = async (
  options?: DataOptionsType
): Promise<boolean> => {
  try {
    const platformOptions = IS_ANDROID
      ? options?.android
      : normalizeOptions(options?.ios);

    const result = await Data.clearSharedData(platformOptions);
    return Promise.resolve(result);
  } catch (e: unknown) {
    return handleError(e);
  }
};
