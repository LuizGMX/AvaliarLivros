import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Input, Button, Rating } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import base64 from "react-native-base64";

async function storeData(value) {
  try {
    await AsyncStorage.setItem("1", value);
  } catch (e) {
    // saving error
  }
}

function Login() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    alert(
      "Caso seja seu primeiro acesso, digite um nome de usuario no campo e clique no botão azul. Nos próximos acessos, basta preenche-lo com o usuario criado, não clique no botão azul novamente."
    );
  }, []);

  function insert_usuarios() {
    getData();
    setLoading(true);
    async function getData() {
      try {
        const value = await AsyncStorage.getItem("1");
        if (value !== null) {
          axios
            .post(
              `https://avaliarlivros.herokuapp.com/insert_usuarios?usuario=${value}`
            )
            .then(function (response) {
              setLoading(false);
              if (response.data === "INSERT usuarios SUCCESS") {
                alert("Usuário criado com SUCESSO");
              } else {
                alert("Erro na criação do usuário, tente outro.");
              }
            });
        }
      } catch (e) {
        setLoading(false);
        // error reading value
      }
    }
  }

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
          icon={
            <Icon
              name="plus"
              size={24}
              color="white"
              style={{ marginRight: 10 }}
            />
          }
        />
        <ActivityIndicator size="large" color="#414192" animating={loading} />
      </SafeAreaView>
    </>
  );
}

function MeusLivros() {
  const [data, setData] = useState([]);
  const [mostrar, setMostrar] = useState(true);
  const [loading, setLoading] = useState(false);

  async function getLivro() {
    setLoading(true);
    var todosLivros = [];
    try {
      const value = await AsyncStorage.getItem("1");
      if (value !== null) {
        axios
          .get(
            `https://avaliarlivros.herokuapp.com/select_livros?usuario=${value}`
          )
          .then(function (response) {
            for (var i = 0; i < response.data.length; i++) {
              var book_id = response.data[i].book_id;

              var rating = response.data[i].nota;

              var id = response.data[i].id;

              var title = response.data[i].title;

              var image = base64.decode(response.data[i].cover);

              todosLivros.push({
                book_id: book_id,
                rating: rating,
                id: id,
                title: title,
                image: image,
              });

              console.log(todosLivros);

              setData(todosLivros);

              setLoading(false);
            }
          });
      }
    } catch (e) {
      // error reading value
    }
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
                    uri: item.image,
                  }}
                  style={{ width: 100, height: 100 }}
                />

                <Text style={styles.text}>{item.title}</Text>

                <Rating
                  type="heart"
                  ratingCount={5}
                  imageSize={30}
                  startingValue={item.rating}
                />
              </View>
            </>
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <></>
      )}

      <Button
        title={"Atualizar Livros"}
        style={{ marginTop: 50 }}
        onPress={() => getLivro()}
        icon={
          <Icon
            name="refresh"
            size={15}
            color="white"
            style={{ marginRight: 10 }}
          />
        }
      />
      <ActivityIndicator size="large" color="#414192" animating={loading} />
    </SafeAreaView>
  );
}

const Tab = createBottomTabNavigator();

function DarNotas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [mostrar, setMostrar] = useState(false);

  function ratingCompleted(rating, bookID, imageURL, title) {
    //console.log("Rating is: " + rating + "bookID: " + bookID);
    insert_livro(rating, bookID, imageURL, title);
  }

  function insert_livro(Rating, bookID, imageURL, title) {
    imageURL = base64.encode(imageURL);
    getData();

    async function getData() {
      try {
        const value = await AsyncStorage.getItem("1");
        if (value !== null) {
          axios
            .post(
              `https://avaliarlivros.herokuapp.com/insert_livros?book_id=${bookID}&nota=${Rating}&usuario=${value}&imageURL=${imageURL}&title=${title}`
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
        var myArray = response.data.items;

        myArray = myArray.filter(function (obj) {
          return obj.volumeInfo.imageLinks !== undefined;
        });

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
                  onFinishRating={(Rating) =>
                    ratingCompleted(
                      Rating,
                      item.id,
                      item.volumeInfo.imageLinks.thumbnail,
                      item.volumeInfo.title
                    )
                  }
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
        title={"Toque para buscar"}
        icon={
          <Icon
            name="search"
            size={15}
            color="white"
            style={{ marginRight: 10 }}
          />
        }
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
    marginTop: 15,
  },
  droidSafeArea: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    //paddingTop: Platform.OS === "android" ? 35 : 0,
  },
});
