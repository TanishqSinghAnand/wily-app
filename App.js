import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { createAppContainer } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";
import TransactionScreen from "./screens/TransactionScreen";
import SearchScreen from "./screens/SearchScreen";

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightGrey",
    alignItems: "center",
    justifyContent: "center",
  },
});

const TabNavigator = createBottomTabNavigator(
  {
    Search: { screen: SearchScreen },
    Transaction: { screen: TransactionScreen },
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: () => {
        const rootName = navigation.state.routeName;
        if (rootName == "Transaction") {
          return (
            <Image
              style={{ width: 20, height: 20 }}
              source={require("./assets/book.png")}
            />
          );
        } else if (rootName == "Search") {
          return (
            <Image
              style={{ width: 20, height: 20 }}
              source={require("./assets/searchingbook.png")}
            />
          );
        }
      },
    }),
  }
);

const AppContainer = createAppContainer(TabNavigator);
