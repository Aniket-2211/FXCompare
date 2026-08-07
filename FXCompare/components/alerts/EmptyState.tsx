import React from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

type Props={icon:keyof typeof Ionicons.glyphMap;title:string;message:string};

export default function EmptyState({icon,title,message}:Props){
 return(
  <View style={s.card}>
   <Ionicons name={icon} size={39} color="#67869C"/>
   <Text style={s.title}>{title}</Text>
   <Text style={s.text}>{message}</Text>
  </View>
 );
}
const s=StyleSheet.create({
 card:{minHeight:180,alignItems:'center',justifyContent:'center',backgroundColor:'#0E2C43',borderRadius:22,borderWidth:1,borderColor:'#194661',paddingHorizontal:25,marginBottom:18},
 title:{color:'#FFF',fontSize:17,fontWeight:'800',marginTop:13},
 text:{color:'#829CAF',fontSize:12,lineHeight:18,textAlign:'center',marginTop:7}
});