import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  SafeAreaView,
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

function insert_usuarios() {
  getData();
  async function getData() {
    try {
      const value = await AsyncStorage.getItem("1");
      if (value !== null) {
        axios
          .post(
            `https://avaliarlivros.herokuapp.com/insert_usuarios?usuario=${value}`
          )
          .then(function (response) {
            if (response.data === "INSERT usuarios SUCCESS") {
              alert("Usuário criado com SUCESSO");
            } else {
              alert("Erro na criação do usuário, tente outro.");
            }
          });
      }
    } catch (e) {
      // error reading value
    }
  }
}

function Login() {
  return (
    <>
      <SafeAreaView style={styles.droidSafeArea}>
        <Input
          placeholder="Digite o nome do seu usuário"
          onChangeText={(value) => {
            storeData(value);
          }}
          leftIcon={<Icon name="user" size={24} color="black" />}
        />
        <Button
          title={"Criar Usuário Digitado Acima"}
          onPress={() => insert_usuarios()}
        />
      </SafeAreaView>
    </>
  );
}

function MeusLivros() {
  const [data, setData] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const [nota, setNota] = useState(0);

  useEffect(() => {
    getLivro();
    console.log("useEffect");
  }, []);

  function getLivro() {
    var todosLivros = [];

    axios
      .get(`https://avaliarlivros.herokuapp.com/select_livros`)
      .then(function (response) {
        for (var i = 0; i < response.data.length; i++) {
          var book_id = response.data[i].book_id;

          var nota = response.data[i].nota;

          setNota(nota);

          axios
            .get(`https://www.googleapis.com/books/v1/volumes/${book_id}`)
            .then(function (response) {
              todosLivros.push(response.data);
            })
            .then(function () {
              setData(todosLivros.flat());
              console.log(todosLivros.flat());
              setMostrar(true);
            });
        }
      });
  }

  return (
    <SafeAreaView style={styles.droidSafeArea}>
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
                  readonly
                />
              </View>
            </>
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <></>
      )}

      <Button title={"Atualizar Livros"} onPress={() => getLivro()} />
    </SafeAreaView>
  );
}

const Tab = createBottomTabNavigator();

function DarNotas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    // getLivro(
    //   "*@&#*@&*#&*#@&*#&@*&#)@&#@&#*@)&#*@)@#&@)*#&@#*@&*)@#@#&*@#)&BDWHBHDWBHW"
    // );

    console.log("useEffect");
  }, []);

  function ratingCompleted(rating, bookID) {
    console.log("Rating is: " + rating + "bookID: " + bookID);
    insert_livro(rating, bookID);
  }

  function insert_livro(Rating, bookID) {
    getData();

    async function getData() {
      try {
        const value = await AsyncStorage.getItem("1");
        if (value !== null) {
          //alert(value);

          axios
            .post(
              `https://avaliarlivros.herokuapp.com/insert_livros?book_id=${bookID}&nota=${Rating}&usuario=${value}`
            )
            .then(function (response) {
              //alert(response.data);
              if (response.data === "INSERT livros SUCCESS") {
                alert("Nota salva com sucesso");
              } else {
                alert(
                  "Houve um erro ao dar nota a este livro, talvez você já o tenha classificado"
                );
              }
            });
        }
      } catch (e) {
        // error reading value
      }
    }
  }

  function getLivro(searchQuery) {
    axios
      .get(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}`)
      .then(function (response) {
        //alert(response.data.items.length);

        var myArray = response.data.items;

        myArray = myArray.filter(function (obj) {
          return obj.volumeInfo.imageLinks !== undefined;
        });

        console.log(myArray);

        setData(myArray);
        setMostrar(true);
      });
  }

  return (
    <SafeAreaView style={styles.droidSafeArea}>
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
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                />

                <Text style={styles.text}>{item.volumeInfo.title}</Text>
                <Rating
                  type="heart"
                  ratingCount={5}
                  imageSize={30}
                  startingValue={1}
                  onFinishRating={(Rating) => ratingCompleted(Rating, item.id)}
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
        placeholder="Busque pelo nome do livro ou autora"
        onChangeText={(value) => {
          setSearchQuery(value);
        }}
        leftIcon={<Icon name="book" size={24} color="black" />}
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
        <Tab.Screen
          options={() => ({
            tabBarIcon: ({}) => {
              return <Icon name="home" size={26} color="#000" />;
            },
          })}
          name="Login"
          component={Login}
        />
        <Tab.Screen
          options={() => ({
            tabBarIcon: ({}) => {
              return <Icon name="heart" size={26} color="#000" />;
            },
          })}
          name="Dar Notas"
          component={DarNotas}
        />
        <Tab.Screen
          options={() => ({
            tabBarIcon: ({}) => {
              return <Icon name="book" size={26} color="#000" />;
            },
          })}
          name="Meus Livros"
          component={MeusLivros}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {},
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
  droidSafeArea: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? 35 : 0,
  },
});
