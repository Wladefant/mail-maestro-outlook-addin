import { Box } from "@mui/system";
import React from "react";
import { useSelector } from "react-redux";
import { Screen, selectScreen } from "../../../store/reducers/AppReducer";
import DraftInput from "./DraftInput";
import DraftOutput from "./DraftOutput";

const DraftScreen = () => {
  const screen = useSelector(selectScreen);

  return (
    <Box sx={{ background: "linear-gradient(180deg, #FFF 0%, #ECEBFF 100%)" }}>
      {screen === Screen.DraftInput ? <DraftInput /> : <DraftOutput />}
    </Box>
  );
};

export default DraftScreen;
