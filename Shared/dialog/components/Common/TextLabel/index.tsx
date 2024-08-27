import { styled } from "@mui/material/styles";
import InputLabel from "@mui/material/InputLabel";

const TextLabel = styled(InputLabel)(() => ({
  fontFamily: ["Inter"].join(","),
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: 16,
  lineHeight: "19px",
  letterSpacing: "-0.02em",
  transform: "translate(0, 1px) scale(1)",
  "&.Mui-focused": {
    color: "#7468FF",
  },
}));

export default TextLabel;
