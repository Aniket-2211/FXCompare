import React, { useMemo, useRef, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";

import BottomSheet from "@gorhom/bottom-sheet";


type Currency = {
  code: string;
  name: string;
  flag: string;
};


type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
};



const currencies: Currency[] = [

  {
    code: "USD",
    name: "US Dollar",
    flag: "🇺🇸",
  },

  {
    code: "INR",
    name: "Indian Rupee",
    flag: "🇮🇳",
  },

  {
    code: "EUR",
    name: "Euro",
    flag: "🇪🇺",
  },

  {
    code: "GBP",
    name: "British Pound",
    flag: "🇬🇧",
  },

  {
    code: "JPY",
    name: "Japanese Yen",
    flag: "🇯🇵",
  },

  {
    code: "AUD",
    name: "Australian Dollar",
    flag: "🇦🇺",
  },

];



export default function CurrencyPicker({
  visible,
  onClose,
  onSelect,
}: Props) {


  const sheetRef = useRef<BottomSheet>(null);


  const snapPoints = useMemo(
    () => ["55%"],
    []
  );



  useEffect(() => {

    if (visible) {

      sheetRef.current?.expand();

    } else {

      sheetRef.current?.close();

    }

  }, [visible]);



  return (

    <BottomSheet

      ref={sheetRef}

      index={-1}

      snapPoints={snapPoints}

      enablePanDownToClose

      onClose={onClose}

      backgroundStyle={{
        backgroundColor: "#102842",
      }}

    >


      <View style={styles.container}>


        <Text style={styles.title}>
          Select Currency
        </Text>



        <FlatList

          data={currencies}

          keyExtractor={(item) => item.code}


          renderItem={({ item }) => (

            <Pressable

              style={styles.item}

              onPress={() => {

                onSelect(item);

              }}

            >


              <Text style={styles.flag}>
                {item.flag}
              </Text>



              <View>

                <Text style={styles.code}>
                  {item.code}
                </Text>


                <Text style={styles.name}>
                  {item.name}
                </Text>


              </View>


            </Pressable>

          )}

        />


      </View>


    </BottomSheet>

  );

}



const styles = StyleSheet.create({

container:{

  padding:22,

},


title:{

  color:"#fff",

  fontSize:22,

  fontWeight:"800",

  marginBottom:20,

},


item:{

  flexDirection:"row",

  alignItems:"center",

  paddingVertical:16,

},


flag:{

  fontSize:32,

  marginRight:18,

},


code:{

  color:"#fff",

  fontSize:18,

  fontWeight:"700",

},


name:{

  color:"#91A8C8",

  fontSize:14,

},


});