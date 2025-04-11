// Modified from react-native-keychain (https://github.com/oblador/react-native-keychain)

/**
 * Enum representing when a keychain item is accessible.
 */
export enum ACCESSIBLE {
  /** The data in the keychain item can be accessed only while the device is unlocked by the user. */
  WHEN_UNLOCKED = 'AccessibleWhenUnlocked',
  /** The data in the keychain item cannot be accessed after a restart until the device has been unlocked once by the user. */
  AFTER_FIRST_UNLOCK = 'AccessibleAfterFirstUnlock',
  /** The data in the keychain item can always be accessed regardless of whether the device is locked. */
  ALWAYS = 'AccessibleAlways',
  /** The data in the keychain can only be accessed when the device is unlocked. Only available if a passcode is set on the device. Items with this attribute never migrate to a new device. */
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 'AccessibleWhenPasscodeSetThisDeviceOnly',
  /** The data in the keychain item can be accessed only while the device is unlocked by the user. Items with this attribute do not migrate to a new device. */
  WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'AccessibleWhenUnlockedThisDeviceOnly',
  /** The data in the keychain item cannot be accessed after a restart until the device has been unlocked once by the user. Items with this attribute never migrate to a new device. */
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 'AccessibleAfterFirstUnlockThisDeviceOnly',
}

/**
 * Enum representing access control options.
 */
export enum ACCESS_CONTROL {
  /** Constraint to access an item with either Touch ID or passcode. */
  USER_PRESENCE = 'UserPresence',
  /** Constraint to access an item with Touch ID for any enrolled fingers. */
  BIOMETRY_ANY = 'BiometryAny',
  /** Constraint to access an item with Touch ID for currently enrolled fingers. */
  BIOMETRY_CURRENT_SET = 'BiometryCurrentSet',
  /** Constraint to access an item with the device passcode. */
  DEVICE_PASSCODE = 'DevicePasscode',
  /** Constraint to use an application-provided password for data encryption key generation. */
  APPLICATION_PASSWORD = 'ApplicationPassword',
  /** Constraint to access an item with Touch ID for any enrolled fingers or passcode. */
  BIOMETRY_ANY_OR_DEVICE_PASSCODE = 'BiometryAnyOrDevicePasscode',
  /** Constraint to access an item with Touch ID for currently enrolled fingers or passcode. */
  BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE = 'BiometryCurrentSetOrDevicePasscode',
}

/**
 * Enum representing authentication types.
 */
export enum AUTHENTICATION_TYPE {
  /** Device owner is going to be authenticated by biometry or device passcode. */
  DEVICE_PASSCODE_OR_BIOMETRICS = 'AuthenticationWithBiometricsDevicePasscode',
  /** Device owner is going to be authenticated using a biometric method (Touch ID or Face ID). */
  BIOMETRICS = 'AuthenticationWithBiometrics',
}

/**
 * Enum representing types of biometric authentication supported by the device.
 */
export enum BIOMETRY_TYPE {
  /** Device supports authentication with Touch ID.
   * @platform iOS
   */
  TOUCH_ID = 'TouchID',
  /** Device supports authentication with Face ID.
   * @platform iOS
   */
  FACE_ID = 'FaceID',
  /** Device supports authentication with Optic ID.
   *  @platform visionOS
   */
  OPTIC_ID = 'OpticID',
}
