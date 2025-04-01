package com.data

import android.content.ContentProvider
import android.content.ContentValues
import android.content.Context
import android.content.SharedPreferences
import android.database.Cursor
import android.database.MatrixCursor
import android.net.Uri

class SharedPreferencesProvider : ContentProvider() {

  private lateinit var sharedPreferences: SharedPreferences

  override fun onCreate(): Boolean {
    val providerName = context!!.packageName + "_preference";
    sharedPreferences = context!!.getSharedPreferences(providerName, Context.MODE_PRIVATE)
    return true
  }

  override fun query(uri: Uri, projection: Array<String>?, selection: String?, selectionArgs: Array<String>?, sortOrder: String?): Cursor? {
    val matrixCursor = MatrixCursor(arrayOf("key", "value"))
    if (context != null) {
      if (selection.isNullOrEmpty()) { // Fetch all data if no specific key is passed
        val allEntries = sharedPreferences.all
        for ((key, value) in allEntries) {
          matrixCursor.addRow(arrayOf(key, value.toString()))
        }
      } else {
        val value = sharedPreferences.getString(selection, null)
        if (value != null) {
          matrixCursor.addRow(arrayOf(selection, value))
        }
      }
    }
    return matrixCursor
  }

  override fun insert(uri: Uri, values: ContentValues?): Uri? {
    val key = values?.getAsString("key")
    val value = values?.getAsString("value")
    sharedPreferences.edit().putString(key, value).apply()
    return uri
  }

  override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<String>?): Int {
    if (selection.isNullOrEmpty() || values == null) {
      return 0
    }

    val value = values.getAsString("value")
    val fullKey = selection

    return if (sharedPreferences.contains(fullKey)) {
      sharedPreferences.edit().putString(fullKey, value).apply()
      1 // Indicate one row updated
    } else {
      0 // Indicate no rows updated
    }
  }

  override fun delete(uri: Uri, selection: String?, selectionArgs: Array<String>?): Int {
    if (selection.isNullOrEmpty()) {
      return 0
    }
    val fullKey = selection
    return if (sharedPreferences.contains(fullKey)) {
      sharedPreferences.edit().remove(fullKey).apply()
      1 // Indicate one row deleted
    } else {
      0 // Indicate no rows deleted
    }
  }


  override fun getType(uri: Uri): String? {
    return "vnd.android.cursor.item/vnd.com.data.sharedpreferences"
  }

  fun isProviderDeclared(context: Context, authority: String): Boolean {
    val providerInfo = context.packageManager.resolveContentProvider("$authority${DataConstants.authorityPreference}", 0)
    return providerInfo != null
  }
}
