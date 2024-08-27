import { alpha, styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";

const TextInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: "25px",
  },
  "& .MuiInputBase-input": {
    borderRadius: 10,
    position: "relative",
    backgroundColor: theme.palette.mode === "light" ? "#fff" : "#2b2b2b",
    border: "1px solid #E8E7FF",
    fontSize: 16,
    width: "auto",
    padding: "10px 12px",
    transition: theme.transitions.create(["border-color", "background-color", "box-shadow"]),
    fontFamily: ["Inter"].join(","),
    "&:focus": {
      boxShadow: "none",
      borderColor: "#7468FF",
    },
  },
}));

export default TextInput;
