package com.data

import android.content.Context
import android.content.SharedPreferences
import com.data.SharedPreferencesHelper.addData
import com.data.SharedPreferencesHelper.clearAllData
import com.data.SharedPreferencesHelper.deleteData
import com.data.SharedPreferencesHelper.getAllData
import com.data.SharedPreferencesHelper.getData
import com.data.SharedPreferencesHelper.updateData
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap

class DataModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var sharedPreferences: SharedPreferences = reactContext!!.getSharedPreferences("provider_list", Context.MODE_PRIVATE)

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun initializeStore(authorities: ReadableMap) {
    if (authorities.hasKey(DataConstants.appsBundleIds)) {
      val appsBundleIdsArray = authorities.getArray(DataConstants.appsBundleIds)
      val appsBundleIds = convertReadableArrayToList(appsBundleIdsArray)
      val appsBundleIdsString = appsBundleIds.joinToString(separator = ",")
      sharedPreferences.edit().putString(DataConstants.appsBundleIds, appsBundleIdsString).apply()
    }
  }

  @ReactMethod
  fun saveSharedData(options: ReadableMap? = null, key: String, value: String, promise: Promise) {
    if (key.isEmpty()){
      promise.reject(DataConstants.KEY_ERROR, DataConstants.keyErrorMessage)
      return
    }
    if (value.isEmpty()){
      promise.reject(DataConstants.VALUE_ERROR, DataConstants.valueErrorMessage)
      return
    }
    performActionOnAuthorities(key, options, promise) { authority ->
      addData(reactApplicationContext, key, value, authority, promise)
    }
  }

  @ReactMethod
  fun getSharedData(options: ReadableMap? = null, key: String, promise: Promise) {
    performActionOnAuthorities(key, options, promise, returnOnFirstSuccess = true) { authority ->
      getData(reactApplicationContext, key, authority) { result ->
        if (result != null) {
          promise.resolve(result)
          return@getData // Stop iteration when data is found
        }
        false // Continue to next authority
      }
    }
  }

  @ReactMethod
  fun getAllSharedData(options: ReadableMap? = null, promise: Promise) {
    val combinedDataMap = WritableNativeMap()
    val packageName = reactApplicationContext.packageName
    performActionOnAuthorities("", options, promise, false) { authority ->
      getAllData(reactApplicationContext, authority) { key, value ->
        if (key != null && value != null) {
          combinedDataMap.putString(key.toString(), value.toString())
          addData(reactApplicationContext, key.toString(), value.toString(), packageName)
        }
      }
      false // Always continue to aggregate data from all authorities
    }
    promise.resolve(combinedDataMap)
  }

  @ReactMethod
  fun updateSharedData(options: ReadableMap? = null, key: String, value: String, promise: Promise) {
    if (key.isEmpty()){
      promise.reject(DataConstants.KEY_ERROR, DataConstants.keyErrorMessage)
      return
    }
    if (value.isEmpty()){
      promise.reject(DataConstants.VALUE_ERROR, DataConstants.valueErrorMessage)
      return
    }
    performActionOnAuthorities(key, options, promise) { authority ->
      updateData(reactApplicationContext, key, value, authority, promise)
    }
  }

  @ReactMethod
  fun deleteSharedData(options: ReadableMap? = null, key: String, promise: Promise) {
    if (key.isEmpty()){
      promise.reject(DataConstants.KEY_ERROR, DataConstants.keyErrorMessage)
      return
    }
    performActionOnAuthorities(key, options, promise) { authority ->
      deleteData(reactApplicationContext, key, authority, promise)
    }
  }

  @ReactMethod
    fun clearSharedData(options: ReadableMap? = null, promise: Promise) {
    val authority = reactApplicationContext.packageName
    try {
      var syncEnabled = true
      if (options != null) {
        if (options.hasKey(DataConstants.dataSync)) {
          syncEnabled = options.getBoolean(DataConstants.dataSync)
        }
      }
      if(syncEnabled){
        val storedBundleIds = getStoredAuthorities(syncEnabled)
        try {
          for (newAuthority in storedBundleIds) {
            if (newAuthority.isNotEmpty()) {
              clearAllData(reactApplicationContext, newAuthority, promise)
            }
          }
        } catch (e: Exception){
          promise.reject(DataConstants.CLEAR_ERROR, DataConstants.clearDataErrorMessage, e)
        }
      } else {
        clearAllData(reactApplicationContext, authority, promise)
      }
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject(DataConstants.CLEAR_ERROR, DataConstants.clearDataErrorMessage, e)
    }
  }

  private fun performActionOnAuthorities(
    key: String,
    options: ReadableMap? = null,
    promise: Promise,
    returnOnFirstSuccess: Boolean = false,
    action: (String) -> Unit
  ) {
    var syncEnabled = true
    if (options != null) {
      if (options.hasKey(DataConstants.dataSync)) {
        syncEnabled = options.getBoolean(DataConstants.dataSync)
      }
    }
    val storedBundleIds = getStoredAuthorities(syncEnabled)
    try {
      if (key.isEmpty() && returnOnFirstSuccess) {
        promise.reject(DataConstants.KEY_ERROR, DataConstants.keyErrorMessage)
        return
      }
      for (authority in storedBundleIds) {
        if (authority.isNotEmpty()) {
          action(authority)
          if (returnOnFirstSuccess) break
        }
      }
      if (returnOnFirstSuccess) {
        promise.reject(DataConstants.NO_DATA_FOUND_ERROR, "${DataConstants.noValidDataErrorMessage} $key")
      }
    } catch (e: Exception) {
      promise.reject(DataConstants.ACTION_ERROR, DataConstants.iterationErrorMessage, e)
    }
  }

  private fun getStoredAuthorities(syncEnabled: Boolean): List<String> {
    val storedBundleIdsString = sharedPreferences.getString(DataConstants.appsBundleIds, null)
    val storedBundleIds = mutableListOf(reactApplicationContext.packageName)
    if (!storedBundleIdsString.isNullOrEmpty() && syncEnabled) {
      storedBundleIds.addAll(storedBundleIdsString.split(","))
    }
    return storedBundleIds
  }

  companion object {
    const val NAME = "Data"
  }

  private fun convertReadableArrayToList(readableArray: ReadableArray?): List<String> {
    val list = mutableListOf<String>()
    readableArray?.let {
      for (i in 0 until it.size()) {
        list.add(it.getString(i) ?: "")
      }
    }
    return list
  }
}
