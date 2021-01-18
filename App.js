import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  SafeAreaView,
  TextInput,
} from "react-native";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Input, Button, Rating } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function storeData(value) {
  try {
    await AsyncStorage.setItem("1", value);
  } catch (e) {
    // saving error
  }
}

function Login() {
  // const [usuario, setUsuario] = useState("");

  return (
    <>
      <Input
        placeholder="Digite o nome do seu usuário"
        onChangeText={(value) => {
          storeData(value);
        }}
        leftIcon={<Icon name="user" size={24} color="black" />}
      />
      <Button title={"Não tenho um usuário"} />
      <Button title={"get data"} onPress={() => getData()} />
    </>
  );
}

function MeusLivros() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const [nota, setNota] = useState(0);

  useEffect(() => {
    getLivro();
    console.log("useEffect");
  }, []);

  function ratingCompleted(rating) {
    console.log("Rating is: " + rating);
    insert_livro(rating);
  }

  function getLivro() {
    setMostrar(true);
    axios.get(`http://localhost:3000/select_livros`).then(function (response) {
      var book_id = response.data[0].book_id;
      var nota = response.data[0].nota;
      setNota(nota);
      axios
        .get(`https://www.googleapis.com/books/v1/volumes?q=${book_id}`)
        .then(function (response) {
          var myArray = response.data.items;

          myArray = myArray.filter(function (obj) {
            return obj.volumeInfo.imageLinks !== undefined;
          });

          console.log(myArray);

          setData(myArray);
        });
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      {mostrar ? (
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <>
              <View style={styles.containerLivro}>
                <Image
                  source={{
                    uri: item.volumeInfo.imageLinks.thumbnail,
                  }}
                  style={{ width: 100, height: 100 }}
                />

                <Text style={styles.text}>{item.volumeInfo.title}</Text>

                <Rating
                  type="heart"
                  ratingCount={5}
                  imageSize={30}
                  startingValue={nota}
                  showRating
                  onFinishRating={(Rating) => ratingCompleted(Rating)}
                />
              </View>
            </>
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <></>
      )}

      <Input
        placeholder="Busque pelo nome do livro ou autora ou editora"
        onChangeText={(value) => {
          setSearchQuery(value);
        }}
        onKeyPress={(value) => {
          setSearchQuery(value);
        }}
        leftIcon={<Icon name="user" size={24} color="black" />}
      />
      <Button
        onPress={() => {
          getLivro(searchQuery);
        }}
        icon={<Icon name="search" size={15} color="white" />}
      />
    </SafeAreaView>
  );
}

const Tab = createBottomTabNavigator();

function DarNotas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    getLivro("Trono de Vidro");
    console.log("useEffect");
  }, []);

  function ratingCompleted(rating) {
    console.log("Rating is: " + rating);
    insert_livro(rating);
  }

  function insert_livro(Rating) {
    getData();

    async function getData() {
      try {
        const value = await AsyncStorage.getItem("1");
        if (value !== null) {
          alert(value);

          axios
            .post(
              `http://localhost:3000/insert_livros?book_id=Mi7rDwAAQBAJ&nota=${Rating}&usuario=${value}`
            )
            .then(function (response) {
              alert(response.data);
            });
        }
      } catch (e) {
        // error reading value
      }
    }
  }

  function getLivro(searchQuery) {
    // if (searchQuery !== "sevgAAAAQBAJ") {
    //   setMostrar(true);
    // }
    setMostrar(true);
    //var searchQuery = searchQuery.replace(" ", "%");

    axios
      .get(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}`)
      .then(function (response) {
        console.log(response.data.items);

        var myArray = response.data.items;

        myArray = myArray.filter(function (obj) {
          return obj.volumeInfo.imageLinks !== undefined;
        });

        console.log(myArray);

        setData(myArray);
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      {mostrar ? (
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <>
              <View style={styles.containerLivro}>
                <Image
                  source={{
                    uri: item.volumeInfo.imageLinks.thumbnail,
                  }}
                  style={{ width: 100, height: 100 }}
                />

                <Text style={styles.text}>{item.volumeInfo.title}</Text>
                <Rating
                  type="heart"
                  ratingCount={5}
                  imageSize={30}
                  startingValue={1}
                  showRating
                  onFinishRating={(Rating) => ratingCompleted(Rating)}
                />
              </View>
            </>
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <></>
      )}

      <Input
        placeholder="Busque pelo nome do livro ou autora ou editora"
        onChangeText={(value) => {
          setSearchQuery(value);
        }}
        onKeyPress={(value) => {
          setSearchQuery(value);
        }}
        leftIcon={<Icon name="user" size={24} color="black" />}
      />
      <Button
        onPress={() => {
          getLivro(searchQuery);
        }}
        icon={<Icon name="search" size={15} color="white" />}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Login" component={Login} />
        <Tab.Screen name="Dar Notas" component={DarNotas} />
        <Tab.Screen name="Meus Livros" component={MeusLivros} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  containerLivro: {
    display: "flex",
    flexDirection: "column",
  },
  rating: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 200,

    elevation: 4,
    shadowOffset: { width: 5, height: 5 },
    shadowColor: "grey",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});
