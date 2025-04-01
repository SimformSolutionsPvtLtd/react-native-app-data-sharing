import { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  saveData,
  initializeStore,
  getData,
  updateData,
  deleteData,
  clearData,
  getAllSyncData,
} from 'react-native-app-data-sharing';
import { Strings } from './contants';

const appGroupIdentifier = '{YOUR_TEAM_ID}.group.com.demo.simform.app';
const serviceName = 'group.com.demo.simform.app';

export default function App() {
  const [result, setResult] = useState<string | undefined>();
  const [key, setKey] = useState<string>('');
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    initializeStore({
      android: {
        appsBundleIds: ['data.example.two'],
      },
      ios: {
        accessGroup: appGroupIdentifier, // App Group identifier
        serviceName: serviceName, // Service name
      },
    });
  }, []);

  const allSyncData = async () => {
    try {
      const data = await getAllSyncData();
      setResult(JSON.stringify(data));
    } catch (e) {
      console.log(e, 'getAllSyncData: ERROR');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.innerView}>
          <Text style={styles.text}>Example App 1</Text>
          <Text style={styles.text}>Result: {result}</Text>
          <TextInput
            placeholder={Strings.enterKey}
            value={key}
            onChangeText={setKey}
            style={styles.textInput}
          />
          <TextInput
            placeholder={Strings.enterValue}
            value={value}
            onChangeText={setValue}
            style={styles.textInput}
          />
          <Button
            title={Strings.saveData}
            onPress={async () => {
              const newValue = await saveData(key, value);
              if (newValue) {
                await allSyncData();
                setValue('');
                setKey('');
              }
            }}
          />
          <Button
            title={Strings.getData}
            onPress={async () => {
              try {
                const newValue = await getData(key);
                setResult(JSON.stringify(newValue));
              } catch (e) {
                console.log(e, 'getData: ERROR');
              }
            }}
          />
          <Button title={Strings.getAllSyncData} onPress={allSyncData} />
          <Button
            title={Strings.updateData}
            onPress={async () => {
              const newValue = await updateData(key, value);
              if (newValue) {
                await allSyncData();
                setValue('');
                setKey('');
              }
            }}
          />
          <Button
            title={Strings.deleteData}
            onPress={async () => {
              const newValue = await deleteData(key);
              if (newValue) {
                await allSyncData();
                setValue('');
                setKey('');
              }
            }}
          />
          <Button
            title={Strings.deleteAllData}
            onPress={async () => {
              const newValue = await clearData();
              if (newValue) {
                await allSyncData();
                setValue('');
                setKey('');
              }
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    rowGap: 10,
    marginHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  scroll: { marginTop: 100 },
  innerView: { rowGap: 5 },
  text: { color: 'black' },
  textInput: {
    padding: 10,
    height: 40,
    borderColor: 'red',
    borderRadius: 10,
    borderWidth: 1,
    color: 'black',
  },
});
