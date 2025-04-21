// Modified from react-native-keychain (https://github.com/oblador/react-native-keychain)

#import <Security/Security.h>
#import "Data.h"
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>

#if TARGET_OS_IOS || TARGET_OS_VISION
#import <LocalAuthentication/LAContext.h>
#endif

@implementation Data

@synthesize bridge = _bridge;
RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_queue_create("com.oblador.KeychainQueue", DISPATCH_QUEUE_SERIAL);
}

// Messages from the comments in <Security/SecBase.h>
NSString *messageForError(NSError *error)
{
  switch (error.code) {
    case errSecUnimplemented:
      return @"Function or operation not implemented.";

    case errSecIO:
      return @"I/O error.";

    case errSecOpWr:
      return @"File already open with with write permission.";

    case errSecParam:
      return @"One or more parameters passed to a function where not valid.";

    case errSecAllocate:
      return @"Failed to allocate memory.";

    case errSecUserCanceled:
      return @"User canceled the operation.";

    case errSecBadReq:
      return @"Bad parameter or invalid state for operation.";

    case errSecNotAvailable:
      return @"No keychain is available. You may need to restart your computer.";

    case errSecDuplicateItem:
      return @"The specified item already exists in the keychain.";

    case errSecItemNotFound:
      return @"The specified item could not be found in the keychain.";

    case errSecInteractionNotAllowed:
      return @"User interaction is not allowed.";

    case errSecDecode:
      return @"Unable to decode the provided data.";

    case errSecAuthFailed:
      return @"The user name or passphrase you entered is not correct.";

    case errSecMissingEntitlement:
      return @"Internal error when a required entitlement isn't present.";

    default:
      return error.localizedDescription;
  }
}

NSString *codeForError(NSError *error)
{
  return [NSString stringWithFormat:@"%li", (long)error.code];
}

void rejectWithError(RCTPromiseRejectBlock reject, NSError *error)
{
  return reject(codeForError(error), messageForError(error), nil);
}

CFStringRef accessibleValue(NSDictionary *options)
{
  if (options && options[@"accessible"] != nil) {
    NSDictionary *keyMap = @{
      @"AccessibleWhenUnlocked": (__bridge NSString *)kSecAttrAccessibleWhenUnlocked,
      @"AccessibleAfterFirstUnlock": (__bridge NSString *)kSecAttrAccessibleAfterFirstUnlock,
      @"AccessibleAlways": (__bridge NSString *)kSecAttrAccessibleAlways,
      @"AccessibleWhenPasscodeSetThisDeviceOnly": (__bridge NSString *)kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly,
      @"AccessibleWhenUnlockedThisDeviceOnly": (__bridge NSString *)kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      @"AccessibleAfterFirstUnlockThisDeviceOnly": (__bridge NSString *)kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    };
    NSString *result = keyMap[options[@"accessible"]];
    if (result) {
      return (__bridge CFStringRef)result;
    }
  }
  return kSecAttrAccessibleAfterFirstUnlock;
}

NSString *serviceValue(NSDictionary *options)
{
  if (options && options[@"service"] != nil) {
    return options[@"service"];
  }
  return [[NSBundle mainBundle] bundleIdentifier];
}

NSString *serverValue(NSDictionary *options)
{
  if (options && options[@"server"] != nil) {
    return options[@"server"];
  }
  return @"";
}

NSString *accessGroupValue(NSDictionary *options)
{
  if (options && options[@"accessGroup"] != nil) {
    return options[@"accessGroup"];
  }
  return nil;
}

CFBooleanRef cloudSyncValue(NSDictionary *options)
{
  if (options && options[@"cloudSync"]) {
    return kCFBooleanTrue;
  }
  return kCFBooleanFalse;
}

NSString *authenticationPromptValue(NSDictionary *options)
{
  if (options && options[@"authenticationPrompt"] != nil && options[@"authenticationPrompt"][@"title"]) {
    return options[@"authenticationPrompt"][@"title"];
  }
  return nil;
}

NSString *usernameValue(NSDictionary *options) {
  id username = options[@"username"];
  if ([username isKindOfClass:[NSString class]]) {
    return (NSString *)username;
  }
  return nil;
}

#pragma mark - Proposed functionality - Helpers

#define kAuthenticationType @"authenticationType"
#define kAuthenticationTypeBiometrics @"AuthenticationWithBiometrics"

#define kAccessControlType @"accessControl"
#define kAccessControlUserPresence @"UserPresence"
#define kAccessControlBiometryAny @"BiometryAny"
#define kAccessControlBiometryCurrentSet @"BiometryCurrentSet"
#define kAccessControlDevicePasscode @"DevicePasscode"
#define kAccessControlApplicationPassword @"ApplicationPassword"
#define kAccessControlBiometryAnyOrDevicePasscode @"BiometryAnyOrDevicePasscode"
#define kAccessControlBiometryCurrentSetOrDevicePasscode @"BiometryCurrentSetOrDevicePasscode"

#define kBiometryTypeTouchID @"TouchID"
#define kBiometryTypeFaceID @"FaceID"
#define kBiometryTypeOpticID @"OpticID"

#if TARGET_OS_IOS || TARGET_OS_VISION
LAPolicy authPolicy(NSDictionary *options)
{
  if (options && options[kAuthenticationType]) {
    if ([ options[kAuthenticationType] isEqualToString:kAuthenticationTypeBiometrics ]) {
      return LAPolicyDeviceOwnerAuthenticationWithBiometrics;
    }
  }
  return LAPolicyDeviceOwnerAuthentication;
}
#endif

SecAccessControlCreateFlags accessControlValue(NSDictionary *options)
{
  if (options && options[kAccessControlType] && [options[kAccessControlType] isKindOfClass:[NSString class]]) {
    if ([options[kAccessControlType] isEqualToString: kAccessControlUserPresence]) {
      return kSecAccessControlUserPresence;
    }
    else if ([options[kAccessControlType] isEqualToString: kAccessControlBiometryAny]) {
      return kSecAccessControlTouchIDAny;
    }
    else if ([options[kAccessControlType] isEqualToString: kAccessControlBiometryCurrentSet]) {
      return kSecAccessControlTouchIDCurrentSet;
    }
    else if ([options[kAccessControlType] isEqualToString: kAccessControlDevicePasscode]) {
      return kSecAccessControlDevicePasscode;
    }
    else if ([options[kAccessControlType] isEqualToString: kAccessControlBiometryAnyOrDevicePasscode]) {
      return kSecAccessControlTouchIDAny|kSecAccessControlOr|kSecAccessControlDevicePasscode;
    }
    else if ([options[kAccessControlType] isEqualToString: kAccessControlBiometryCurrentSetOrDevicePasscode]) {
      return kSecAccessControlTouchIDCurrentSet|kSecAccessControlOr|kSecAccessControlDevicePasscode;
    }
    else if ([options[kAccessControlType] isEqualToString: kAccessControlApplicationPassword]) {
      return kSecAccessControlApplicationPassword;
    }
  }
  return 0;
}

- (void)insertKeychainEntry:(NSDictionary *)attributes
                withOptions:(NSDictionary * __nullable)options
                   resolver:(RCTPromiseResolveBlock)resolve
                   rejecter:(RCTPromiseRejectBlock)reject
{
  NSString *accessGroup = accessGroupValue(options);
  CFStringRef accessible = accessibleValue(options);
  SecAccessControlCreateFlags accessControl = accessControlValue(options);

  NSMutableDictionary *mAttributes = attributes.mutableCopy;

  if (@available(macOS 10.15, iOS 13.0, *)) {
      mAttributes[(__bridge NSString *)kSecUseDataProtectionKeychain] = @(YES);
  }

  if (accessControl) {
    NSError *aerr = nil;
    #if TARGET_OS_IOS || TARGET_OS_VISION
    BOOL canAuthenticate = [[LAContext new] canEvaluatePolicy:LAPolicyDeviceOwnerAuthentication error:&aerr];
    if (aerr || !canAuthenticate) {
      return rejectWithError(reject, aerr);
    }
    #endif

    CFErrorRef error = NULL;
    SecAccessControlRef sacRef = SecAccessControlCreateWithFlags(kCFAllocatorDefault,
                                                                 accessible,
                                                                 accessControl,
                                                                 &error);

    if (error) {
      return rejectWithError(reject, aerr);
    }
    mAttributes[(__bridge NSString *)kSecAttrAccessControl] = (__bridge id)sacRef;
  } else {
    mAttributes[(__bridge NSString *)kSecAttrAccessible] = (__bridge id)accessible;
  }

  if (accessGroup != nil) {
    mAttributes[(__bridge NSString *)kSecAttrAccessGroup] = accessGroup;
  }

  attributes = [NSDictionary dictionaryWithDictionary:mAttributes];

  OSStatus osStatus = SecItemAdd((__bridge CFDictionaryRef) attributes, NULL);

  if (osStatus != noErr && osStatus != errSecItemNotFound) {
    // Handle other OSStatus errors
    NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
    return reject(@"SAVE_ERROR", @"Error saving data.", error);
  } else {
    NSString *service = serviceValue(options);
    return resolve(@{
      @"service": service,
      @"storage": @"keychain"
    });
  }
}

- (void)setDefaultValue:(NSString *)value forKey:(NSString *)key {
    if (!key || [key length] == 0) {
        return;
    }

    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:value forKey:key];
    [defaults synchronize]; // Ensure the changes are saved immediately
}

- (NSString *)getValueForKey:(NSString *)key {
    if (!key || [key length] == 0) {
        return nil;
    }

    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    id value = [defaults objectForKey:key];
    if (!value) {
    }
    return value;
}

// Method to store values in UserDefaults
RCT_EXPORT_METHOD(initializeStore:(NSString *)groupAccess
                  serviceName:(NSString *)serviceName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  @try {
    // Validate inputs
    if (!groupAccess || [groupAccess length] == 0) {
      return reject(@"INVALID_INPUT", @"GroupAccess is missing or invalid.", nil);
    }

    if (!serviceName || [serviceName length] == 0) {
      return reject(@"INVALID_INPUT", @"ServiceName is missing or invalid.", nil);
    }

    // Store values in UserDefaults
    [self setDefaultValue:groupAccess forKey:@"accessGroup"];
    [self setDefaultValue:serviceName forKey:@"serviceName"];

    // Resolve success
    resolve(@{@"success": @YES, @"message": @"Values stored successfully."});
  }
  @catch (NSException *exception) {
    // Handle unexpected errors
    NSError *error = [NSError errorWithDomain:@"RCTUserDefaultsManagerErrorDomain"
                                         code:-1
                                     userInfo:@{NSLocalizedDescriptionKey: exception.reason}];
    reject(@"UNEXPECTED_ERROR", @"An unexpected error occurred.", error);
  }
}

RCT_EXPORT_METHOD(saveSharedData:(NSDictionary *)options
                  withUsername:(NSString *)username
                  withPassword:(NSString *)password
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        // Check if options are provided, else get from UserDefaults
        NSMutableDictionary *finalOptions = [options mutableCopy];
        if ((![options objectForKey:@"accessGroup"] || ![options objectForKey:@"service"])) {
            NSString *accessGroup = [self getValueForKey:@"accessGroup"];
            NSString *service = [self getValueForKey:@"serviceName"];
            
            if (!accessGroup || !service) {
                return reject(@"ACTION_ERROR", @"AccessGroup or Service is missing.", nil);
            }
            
            [finalOptions setObject:accessGroup forKey:@"accessGroup"];
            [finalOptions setObject:service forKey:@"service"];
        }
        
        // Validate username
        if (!username || [username length] == 0) {
            return reject(@"KEY_ERROR", @"Key is missing or empty.", nil);
        }
        
        // Validate password
        if (!password || [password length] == 0) {
            return reject(@"VALUE_ERROR", @"Value is missing or empty.", nil);
        }
        NSString *service = serviceValue(finalOptions);
        CFBooleanRef cloudSync = cloudSyncValue(finalOptions);
        NSDictionary *attributes = attributes = @{
            (__bridge NSString *)kSecClass: (__bridge id)(kSecClassGenericPassword),
            (__bridge NSString *)kSecAttrService: service,
            (__bridge NSString *)kSecAttrAccount: username,
            (__bridge NSString *)kSecAttrSynchronizable: (__bridge id)(cloudSync),
            (__bridge NSString *)kSecValueData: [password dataUsingEncoding:NSUTF8StringEncoding]
        };
        
        [self insertKeychainEntry:attributes withOptions:finalOptions resolver:resolve rejecter:reject];
    }
    @catch (NSException *exception) {
        // Handle unexpected runtime errors
    NSError *error = [NSError errorWithDomain:@"RCTKeychainModuleErrorDomain"
                                         code:-1
                                     userInfo:@{NSLocalizedDescriptionKey: exception.reason}];
    return reject(@"UNEXPECTED_ERROR", @"An unexpected error occurred while setting the password.", error);
  }
}

RCT_EXPORT_METHOD(getAllSharedData:(NSDictionary * __nullable)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        // Check if options are provided, else get from UserDefaults
        NSMutableDictionary *finalOptions = [options mutableCopy];
        if ((![options objectForKey:@"accessGroup"] || ![options objectForKey:@"service"])) {
            NSString *accessGroup = [self getValueForKey:@"accessGroup"];
            NSString *service = [self getValueForKey:@"serviceName"];
            
            if (!accessGroup || !service) {
                return reject(@"ACTION_ERROR", @"AccessGroup or Service is missing.", nil);
            }
            
            [finalOptions setObject:accessGroup forKey:@"accessGroup"];
            [finalOptions setObject:service forKey:@"service"];
        }
        
        NSString *service = serviceValue(finalOptions);
        NSString *authenticationPrompt = authenticationPromptValue(finalOptions);
        CFBooleanRef cloudSync = cloudSyncValue(finalOptions);
        
        NSDictionary *query = @{
            (__bridge NSString *)kSecClass: (__bridge id)(kSecClassGenericPassword),
            (__bridge NSString *)kSecAttrService: service,
            (__bridge NSString *)kSecAttrSynchronizable: (__bridge id)(cloudSync),
            (__bridge NSString *)kSecReturnAttributes: (__bridge id)kCFBooleanTrue,
            (__bridge NSString *)kSecReturnData: (__bridge id)kCFBooleanTrue,
            (__bridge NSString *)kSecMatchLimit: (__bridge NSString *)kSecMatchLimitAll,
            (__bridge NSString *)kSecUseOperationPrompt: authenticationPrompt
        };
        
        // Look up service in the keychain
        NSDictionary *found = nil;
        CFArrayRef resultArray = NULL;
        OSStatus osStatus = SecItemCopyMatching((__bridge CFDictionaryRef)query, (CFTypeRef *)&resultArray);
        
        if (osStatus != noErr && osStatus != errSecItemNotFound) {
            // Handle other OSStatus errors
            NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
            return reject(@"ACTION_ERROR", @"No valid data found.", error);
        }
        
        if (!resultArray) {
            return resolve(@{});
        }
        
        NSArray *foundItems = (__bridge_transfer NSArray *)resultArray;
        NSMutableDictionary *result = [@{} mutableCopy];
        for (NSDictionary *item in foundItems) {
            NSString *username = (NSString *)[item objectForKey:(__bridge id)(kSecAttrAccount)];
            NSString *password = [[NSString alloc] initWithData:[item objectForKey:(__bridge id)(kSecValueData)] encoding:NSUTF8StringEncoding];
            if (username && password) {
                result[username] = password;
            }
        }
        
        return resolve(result);
    }@catch (NSException *exception) {
        // Handle unexpected runtime errors
        NSError *error = [NSError errorWithDomain:@"RCTKeychainModuleErrorDomain"
                                             code:-1
                                         userInfo:@{NSLocalizedDescriptionKey: exception.reason}];
        return reject(@"UNEXPECTED_ERROR", @"An unexpected error occurred while fetching passwords.", error);
      }
}

RCT_EXPORT_METHOD(updateSharedData:(NSDictionary *)options
                  withUsername:(NSString *)username
                  withNewPassword:(NSString *)newPassword
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        // Check if options are provided, else get from UserDefaults
        NSMutableDictionary *finalOptions = [options mutableCopy];
        if ((![options objectForKey:@"accessGroup"] || ![options objectForKey:@"service"])) {
            NSString *accessGroup = [self getValueForKey:@"accessGroup"];
            NSString *service = [self getValueForKey:@"serviceName"];
            
            if (!accessGroup || !service) {
                return reject(@"ACTION_ERROR", @"AccessGroup or Service is missing.", nil);
            }
            
            [finalOptions setObject:accessGroup forKey:@"accessGroup"];
            [finalOptions setObject:service forKey:@"service"];
        }
        
        // Validate username
        if (!username || [username length] == 0) {
          return reject(@"KEY_ERROR", @"Key is missing or empty.", nil);
        }

        // Validate newPassword
        if (!newPassword || [newPassword length] == 0) {
          return reject(@"VALUE_ERROR", @"Value is missing or empty.", nil);
        }
        
        NSString *service = serviceValue(finalOptions);
        CFBooleanRef cloudSync = cloudSyncValue(finalOptions);
        
        // Query to find the item
        NSDictionary *query = @{
            (__bridge NSString *)kSecClass: (__bridge id)(kSecClassGenericPassword),
            (__bridge NSString *)kSecAttrService: service,
            (__bridge NSString *)kSecAttrAccount: username,
            (__bridge NSString *)kSecAttrSynchronizable: (__bridge id)(cloudSync)
        };
        
        // Attributes to update
        NSDictionary *attributesToUpdate = @{
            (__bridge NSString *)kSecValueData: [newPassword dataUsingEncoding:NSUTF8StringEncoding]
        };
        
        // Perform the update
        OSStatus osStatus = SecItemUpdate((__bridge CFDictionaryRef)query, (__bridge CFDictionaryRef)attributesToUpdate);
        
        if (osStatus == noErr) {
            return resolve(@(YES));
        } else if (osStatus == errSecItemNotFound) {
            NSString *errorMessage = [NSString stringWithFormat:@"No key '%@' found in keychain.", username];
            NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
            return reject(@"UPDATE_ERROR", errorMessage, error);
        } else {
        // Handle other OSStatus errors
          NSString *errorMessage = [NSString stringWithFormat:@"Failed to update the item for key '%@' from keychain.", username];
          NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
          return reject(@"UPDATE_ERROR", errorMessage, error);
        }
    }@catch (NSException *exception) {
        NSError *error = [NSError errorWithDomain:@"RCTKeychainModuleErrorDomain"
                                             code:-1
                                         userInfo:@{NSLocalizedDescriptionKey: exception.reason}];
        return reject(@"UPDATE_ERROR", @"An unexpected error occurred while updating the password.", error);
      }
}

RCT_EXPORT_METHOD(deleteSharedData:(NSDictionary *)options
                  withUsername:(NSString *)username
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        // Check if options are provided, else get from UserDefaults
        NSMutableDictionary *finalOptions = [options mutableCopy];
        if ((![options objectForKey:@"accessGroup"] || ![options objectForKey:@"service"])) {
            NSString *accessGroup = [self getValueForKey:@"accessGroup"];
            NSString *service = [self getValueForKey:@"serviceName"];
            
            if (!accessGroup || !service) {
                return reject(@"ACTION_ERROR", @"AccessGroup or Service is missing.", nil);
            }
            
            [finalOptions setObject:accessGroup forKey:@"accessGroup"];
            [finalOptions setObject:service forKey:@"service"];
        }
        
        // Validate username
        if (!username || [username length] == 0) {
            return reject(@"KEY_ERROR", @"Key is missing or empty.", nil);
        }
        
        NSString *service = serviceValue(finalOptions);
        CFBooleanRef cloudSync = cloudSyncValue(finalOptions);
        
        // Query to find the item to delete
        NSDictionary *query = @{
            (__bridge NSString *)kSecClass: (__bridge id)(kSecClassGenericPassword),
            (__bridge NSString *)kSecAttrService: service,
            (__bridge NSString *)kSecAttrAccount: username,
            (__bridge NSString *)kSecAttrSynchronizable: (__bridge id)(cloudSync)
        };
        
        // Perform the deletion
        OSStatus osStatus = SecItemDelete((__bridge CFDictionaryRef)query);
        
        if (osStatus == noErr) {
            return resolve(@(YES));
        } else if (osStatus == errSecItemNotFound) {
            NSString *errorMessage = [NSString stringWithFormat:@"No key '%@' found in keychain.", username];
            NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
            return reject(@"DELETE_ERROR", errorMessage, error);
        } else {
            // Handle other OSStatus errors
          NSString *errorMessage = [NSString stringWithFormat:@"Failed to delete the item for key '%@' from keychain.", username];
          NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
          return reject(@"DELETE_ERROR", errorMessage, error);
        }
    }
    @catch (NSException *exception) {
        // Handle unexpected runtime errors
        NSError *error = [NSError errorWithDomain:@"RCTKeychainModuleErrorDomain"
                                             code:-1
                                         userInfo:@{NSLocalizedDescriptionKey: exception.reason}];
        return reject(@"UNEXPECTED_ERROR", @"An unexpected error occurred while deleting the password.", error);
      }
}

RCT_EXPORT_METHOD(getSharedData:(NSDictionary *)options
                  withUsername:(NSString *)username
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        // Check if options are provided, else get from UserDefaults
        NSMutableDictionary *finalOptions = [options mutableCopy];
        if ((![options objectForKey:@"accessGroup"] || ![options objectForKey:@"service"])) {
            NSString *accessGroup = [self getValueForKey:@"accessGroup"];
            NSString *service = [self getValueForKey:@"serviceName"];
            
            if (!accessGroup || !service) {
                return reject(@"ACTION_ERROR", @"AccessGroup or Service is missing.", nil);
            }
            
            [finalOptions setObject:accessGroup forKey:@"accessGroup"];
            [finalOptions setObject:service forKey:@"service"];
        }
        
        // Validate username
        if (!username || [username length] == 0) {
            return reject(@"KEY_ERROR", @"Key is missing or empty.", nil);
        }
        NSString *service = serviceValue(finalOptions);
        CFBooleanRef cloudSync = cloudSyncValue(finalOptions);
        
        NSDictionary *query = @{
            (__bridge NSString *)kSecClass: (__bridge id)(kSecClassGenericPassword),
            (__bridge NSString *)kSecAttrService: service,
            (__bridge NSString *)kSecAttrAccount: username,
            (__bridge NSString *)kSecAttrSynchronizable: (__bridge id)(cloudSync),
            (__bridge NSString *)kSecReturnAttributes: (__bridge id)kCFBooleanTrue,
            (__bridge NSString *)kSecReturnData: (__bridge id)kCFBooleanTrue,
            (__bridge NSString *)kSecMatchLimit: (__bridge NSString *)kSecMatchLimitOne
        };
        
        CFTypeRef foundTypeRef = NULL;
        OSStatus osStatus = SecItemCopyMatching((__bridge CFDictionaryRef)query, &foundTypeRef);
        
        if (osStatus == errSecItemNotFound) {
            NSString *errorMessage = [NSString stringWithFormat:@"No key '%@' found in keychain.", username];
            NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
            return reject(@"ACTION_ERROR", errorMessage, error);
        }
        
        if (osStatus != noErr) {
            // Handle other OSStatus errors
          NSString *errorMessage = [NSString stringWithFormat:@"Failed to getting the item for key '%@' from keychain.", username];
          NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
          return reject(@"ACTION_ERROR", errorMessage, error);
        }
        
        NSDictionary *found = (__bridge_transfer NSDictionary *)foundTypeRef;
        NSString *password = [[NSString alloc] initWithData:[found objectForKey:(__bridge id)(kSecValueData)] encoding:NSUTF8StringEncoding];
        
        NSMutableDictionary *result = [NSMutableDictionary dictionary];
        if (username && password) {
            result[username] = password;
        }
        return resolve(password);
    }
    @catch (NSException *exception) {
        // Handle unexpected runtime errors
        NSError *error = [NSError errorWithDomain:@"RCTKeychainModuleErrorDomain"
                                             code:-1
                                         userInfo:@{NSLocalizedDescriptionKey: exception.reason}];
        return reject(@"UNEXPECTED_ERROR", @"An unexpected error occurred while getting the password.", error);
      }
}

RCT_EXPORT_METHOD(clearSharedData:(NSDictionary * __nullable)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        // Check if options are provided, else get from UserDefaults
        NSMutableDictionary *finalOptions = [options mutableCopy];
        if ((![options objectForKey:@"accessGroup"] || ![options objectForKey:@"service"])) {
            NSString *accessGroup = [self getValueForKey:@"accessGroup"];
            NSString *service = [self getValueForKey:@"serviceName"];
            
            if (!accessGroup || !service) {
                return reject(@"ACTION_ERROR", @"AccessGroup or Service is missing.", nil);
            }
            
            [finalOptions setObject:accessGroup forKey:@"accessGroup"];
            [finalOptions setObject:service forKey:@"service"];
        }
        
        NSString *service = serviceValue(finalOptions);
        CFBooleanRef cloudSync = cloudSyncValue(finalOptions);
        
        NSMutableDictionary *query = [NSMutableDictionary dictionary];
        query[(__bridge NSString *)kSecClass] = (__bridge id)(kSecClassGenericPassword);
        
        if (service) {
            query[(__bridge NSString *)kSecAttrService] = service;
        }
        if (cloudSync) {
            query[(__bridge NSString *)kSecAttrSynchronizable] = (__bridge id)(cloudSync);
        }
        
        OSStatus osStatus = SecItemDelete((__bridge CFDictionaryRef)query);
        
        if (osStatus == noErr || osStatus == errSecItemNotFound) {
            // `noErr` indicates success, and `errSecItemNotFound` means there was nothing to delete.
            return resolve(@(YES));
        } else {
            // Handle other OSStatus errors
          NSString *errorMessage = [NSString stringWithFormat:@"Failed to clear all the items from keychain."];
          NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
          return reject(@"CLEAR_ERROR", errorMessage, error);
        }
    }
    @catch (NSException *exception) {
    // Handle unexpected runtime errors
    NSError *error = [NSError errorWithDomain:@"RCTKeychainModuleErrorDomain"
                                         code:-1
                                     userInfo:@{NSLocalizedDescriptionKey: exception.reason}];
    return reject(@"UNEXPECTED_ERROR", @"An unexpected error occurred while deleting all the password.", error);
  }
}


@end
