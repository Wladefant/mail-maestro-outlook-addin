import MuiAlert, { AlertProps } from "@mui/material/Alert";
import * as React from "react";

export const AlertMessage = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
