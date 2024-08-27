import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { ValidIcon } from "../../../../common/Icon/SubscriptionExpired/ValidIcon";
import { InvalidIcon } from "../../../../common/Icon/SubscriptionExpired/InvalidIcon";
import { DottedCheckIcon } from "../../../../common/Icon/SubscriptionExpired/DottedCheckIcon";

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    color: "#7468FF",
    border: "none",
    padding: "5px",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 12,
    borderBottom: "none",
  },
}));

const StyledTableRow = styled(TableRow)(() => ({
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "& td, & th": {
    border: "none",
  },
  "& table": {
    border: "none",
  },
  "& .MuiDivider-root": {
    boxShadow: "none",
  },
}));

const NoShadowPaper = styled(Paper)({
  boxShadow: "none",
  background: "transparent",
});

function createFeatureData(feature: string, free: string | JSX.Element, premium: string | JSX.Element) {
  return { feature, free, premium };
}

const rows = [
  createFeatureData("Compose", <DottedCheckIcon />, <ValidIcon />),
  createFeatureData("Reply", <DottedCheckIcon />, <ValidIcon />),
  createFeatureData("Forward", <DottedCheckIcon />, <ValidIcon />),
  createFeatureData("Improve drafts", <DottedCheckIcon />, <ValidIcon />),
  createFeatureData("Magic templates", <ValidIcon />, <ValidIcon />),
  createFeatureData("Summarize emails", <InvalidIcon />, <ValidIcon />),
  createFeatureData("Summarize attachments", <InvalidIcon />, <ValidIcon />),
  createFeatureData("Smart scheduling", <InvalidIcon />, <ValidIcon />),
  createFeatureData("Improve selected text", <InvalidIcon />, <ValidIcon />),
  createFeatureData("Remove watermark", <InvalidIcon />, <ValidIcon />),
];

export default function PricingTable() {
  return (
    <TableContainer component={NoShadowPaper}>
      <Table aria-label="customized table" size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell></StyledTableCell>
            <StyledTableCell
              sx={{
                color: "#7468FF",
                fontWeight: "500",
                lineHeight: "16px",
              }}
              align="center"
            >
              Free
            </StyledTableCell>
            <StyledTableCell
              sx={{
                color: "#7468FF",
                fontWeight: "500",
                lineHeight: "16px",
              }}
              align="center"
            >
              Premium
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <StyledTableRow key={row.feature}>
              <StyledTableCell
                sx={{
                  color: "#7468FF",
                  fontWeight: "500",
                  lineHeight: "16px",
                }}
                component="th"
                scope="row"
              >
                {row.feature}
              </StyledTableCell>
              <StyledTableCell
                sx={{
                  color: "#000",
                  fontWeight: "500",
                  lineHeight: "16px",
                }}
                align="center"
              >
                {row.free}
              </StyledTableCell>
              <StyledTableCell align="center">{row.premium}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
