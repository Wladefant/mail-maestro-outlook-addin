import { Button } from "@mui/material";
import { styled } from "@mui/system";

type StyledButtonProps = {
  istextselected: boolean;
};

export const StyledButton = styled(Button)<StyledButtonProps>`
  position: initial;
  border-radius: 4px;
  height: 30px;
  background-color: ${(props) => (!props.istextselected ? "FFFFFF" : "#7468FF")};
  font-size: 11px;
  text-transform: none;
  padding: 3px 10px;
  font-family: Inter;
  font-style: normal;
  ${(props) => props.istextselected && "border: 1px solid #7468FF;"}
  margin: 0;
  color: ${(props) => (!props.istextselected ? "#7468ff" : "#FFFFFF")}; !important;
  ${(props) => !props.istextselected && "border: none;"}
  ${(props) => !props.istextselected && "padding-left: 5px;"}
  ${(props) => props.istextselected && "&:hover {color: #7468ff;}"} !important;
`;
