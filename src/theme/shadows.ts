import { ViewStyle } from "react-native";

const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  } satisfies ViewStyle,
};

export default Shadows;