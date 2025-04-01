package com.data

import android.annotation.SuppressLint
import android.content.ContentValues
import android.net.Uri
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import android.content.Context
import android.database.Cursor
import android.util.Log

object SharedPreferencesHelper {

  fun getAllData(context: Context, authority:String, callback: ((args: Any?, Any?) -> Unit)? = null) {
    val sharedPreferencesProvider = SharedPreferencesProvider();
    try {
      if (sharedPreferencesProvider.isProviderDeclared(context, authority)) {
        val uri = Uri.parse("${DataConstants.contentURL}${authority}${DataConstants.authorityPreference}")
        val cursor = context.contentResolver.query(uri, null, null, null, null)
        if (cursor != null) {
          val keyColumnIndex = cursor.getColumnIndex("key")
          val valueColumnIndex = cursor.getColumnIndex("value")

          while (cursor.moveToNext()) {
            val key = cursor.getString(keyColumnIndex)
            val value = cursor.getString(valueColumnIndex)
            // Check if callback is provided before calling it
            callback?.invoke(key, value)
          }
          cursor.close()
        }
      }
    } catch (_: Exception) {
    }
  }

  @SuppressLint("Range")
  fun getData(context: Context, key:String, authority:String, callback: ((args: Any?) -> Unit)? = null){
    val sharedPreferencesProvider = SharedPreferencesProvider();
   try {
      if (sharedPreferencesProvider.isProviderDeclared(context, authority)) {
        val uri = Uri.parse("${DataConstants.contentURL}${authority}${DataConstants.authorityPreference}")
        // Query the ContentProvider to retrieve data
        val cursor: Cursor? =
          context.contentResolver.query(uri, null, key, null, null)
        if (cursor != null && cursor.moveToFirst()) {
          val valueB = cursor.getString(cursor.getColumnIndex("value"))
          callback?.invoke(valueB)
          cursor.close()
          return
        }
        cursor?.close()
      }
    }catch (_: Exception){

    }
    callback?.invoke(null) // Explicitly invoke the callback with null when no data is found
  }

  fun addData(context: Context, key:String, value:String, authority:String, promise: Promise?=null, callback: Callback? = null){
    val sharedPreferencesProvider = SharedPreferencesProvider();
    val contentValues = ContentValues().apply {
      put("key", key)
      put("value", value)
    }
    try {
      if(sharedPreferencesProvider.isProviderDeclared(context, authority)) {
        val uri = Uri.parse("${DataConstants.contentURL}${authority}${DataConstants.authorityPreference}")
        context.contentResolver.insert(uri, contentValues)
        callback?.invoke()
        promise?.resolve(true)
      }
    } catch (e: Exception) {
      promise?.reject(DataConstants.SAVE_ERROR, DataConstants.savingErrorMessage, e)
    }
  }

  fun updateData(context: Context, key: String, newValue: String, authority: String, promise: Promise? = null, callback: Callback? = null) {
    val sharedPreferencesProvider = SharedPreferencesProvider();
    val uri = Uri.parse("${DataConstants.contentURL}${authority}${DataConstants.authorityPreference}")
    val contentValues = ContentValues().apply {
      put("value", newValue)
    }
    try {
      if(sharedPreferencesProvider.isProviderDeclared(context, authority)) {
        val rowsUpdated = context.contentResolver.update(uri, contentValues, key, null)
        if (rowsUpdated > 0) {
          callback?.invoke()
          promise?.resolve(true)
        } else {
          promise?.reject(DataConstants.UPDATE_ERROR, "${DataConstants.keyLabel} $key ${DataConstants.updateKeyNotFoundErrorMessage}")
        }
      }
    } catch (e: Exception) {
      promise?.reject(DataConstants.UPDATE_ERROR, "${DataConstants.updateDataErrorMessage} $key", e)
    }
  }

  fun deleteData(context: Context, key: String, authority: String, promise: Promise? = null, callback: Callback? = null) {
    val sharedPreferencesProvider = SharedPreferencesProvider();
    val uri = Uri.parse("${DataConstants.contentURL}${authority}${DataConstants.authorityPreference}")
    try {
      if(sharedPreferencesProvider.isProviderDeclared(context, authority)) {
        val rowsDeleted = context.contentResolver.delete(uri, key, null)
        if (rowsDeleted > 0) {
          callback?.invoke()
          promise?.resolve(true)
        } else {
          promise?.reject(DataConstants.DELETE_ERROR, "${DataConstants.keyLabel} $key ${DataConstants.deleteKeyNotFoundErrorMessage}")
        }
      }
    } catch (e: Exception) {
      promise?.reject(DataConstants.DELETE_ERROR, "${DataConstants.deleteDataErrorMessage} $key", e)
    }
  }

  fun clearAllData(context: Context, authority: String,promise: Promise? = null) {
    val sharedPreferencesProvider = SharedPreferencesProvider()

    if (sharedPreferencesProvider.isProviderDeclared(context, authority)) {
      val uri = Uri.parse("${DataConstants.contentURL}${authority}${DataConstants.authorityPreference}")

      try {
        // Query to retrieve all keys
        val cursor = context.contentResolver.query(uri, null, null, null, null)

        if (cursor != null) {
          val keyColumnIndex = cursor.getColumnIndex("key")

          while (cursor.moveToNext()) {
            val key = cursor.getString(keyColumnIndex)
            // Delete each key
            deleteData(context, key, authority, promise, null)
          }
          cursor.close()
        }
        // Resolve the promise after clearing all data
        promise?.resolve(true)
      } catch (e: Exception) {
        // Reject the promise in case of any errors
        promise?.reject(DataConstants.CLEAR_ERROR, DataConstants.clearDataKeyNotFoundErrorMessage, e)
      }
    }
  }

}
