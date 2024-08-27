import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MenuItem, SelectChangeEvent, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useSelector } from "react-redux";
import { QuestionMarkIcon } from "../../../../../common/Icon/QuestionMarkIcon";
import { AttachmentDetails } from "../../../../store/reducers/AttachmentsReducer";
import { RootState } from "../../../../store/store";
import { CustomTooltip } from "../../../Common/Tooltip";
import PrimaryButton from "../../../Common/UI/PrimaryButton";
import SecondaryButton from "../../../Common/UI/SecondaryButton";
import { OptionBoxContainer, StyledSelect } from "./styles";
import { StarIcon } from "../../../../../common/Icon/SubscriptionExpired/StarIcon";

export type AttachmentsUIProps = {
  icon: React.ReactNode;
  notAccessible: boolean;
  onSummarizeClick?: () => void;
  onUpgradeToPremiumClick?: () => void;
  onSelectAttachment?: (event: SelectChangeEvent<unknown>) => void;
};

const ATTACHMENTS_TOOLTIP_MESSAGE =
  "Summarization is currently limited to PDF, DOCX, and TXT attachments and to max. file size of 1MB. " +
  "More formats and larger sizes coming soon.";

export const AttachmentsUI: React.FC<AttachmentsUIProps> = ({
  icon,
  notAccessible,
  onSummarizeClick,
  onUpgradeToPremiumClick,
  onSelectAttachment,
}) => {
  const attachments = useSelector((state: RootState) => state.attachments.attachments);
  const selectedAttachmentId = useSelector((state: RootState) => state.attachments.selectedAttachmentId);
  const selectedAttachment = attachments.find((attachment) => attachment.id === selectedAttachmentId);

  const renderButton = () => {
    return notAccessible ? (
      <SecondaryButton
        width="100%"
        sx={{ marginLeft: "10px", marginRight: "10px", padding: "0" }}
        onClick={onUpgradeToPremiumClick}
      >
        Summarize <StarIcon sx={{ marginLeft: "5px" }} />
      </SecondaryButton>
    ) : (
      <PrimaryButton
        width="100%"
        sx={{ marginLeft: "10px", marginRight: "10px", padding: "0" }}
        onClick={onSummarizeClick}
        disabled={!selectedAttachment?.processable}
      >
        Summarize
      </PrimaryButton>
    );
  };

  return (
    <OptionBoxContainer onClick={() => {}}>
      <Box display={"flex"} padding={"10px"} flexDirection={"row"} sx={{ width: "100%" }}>
        {icon}
        <Typography align="left" fontSize={"14px"} fontFamily={"Inter"} fontWeight={"400"} marginLeft={"45px"}>
          Attachments
        </Typography>
        <Box sx={{ position: "absolute", top: "10px", right: "10px" }}>
          <CustomTooltip
            placement="top-start"
            sx={{ position: "absolute", top: "0", right: "0" }}
            title={ATTACHMENTS_TOOLTIP_MESSAGE}
          >
            <Box>
              <QuestionMarkIcon sx={{ position: "absolute", top: "0", right: "0" }} />
            </Box>
          </CustomTooltip>
        </Box>
      </Box>
      <Box padding={"10px"} flexDirection={"row"} sx={{ width: "100%", paddingTop: 0, paddingBottom: 0 }}>
        <StyledSelect
          IconComponent={ExpandMoreIcon}
          value={selectedAttachmentId || ""}
          variant="standard"
          disableUnderline
          defaultValue={null}
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: "10px",
                border: "1px solid #E8E7FF",
                "& .MuiMenu-list": {
                  padding: "8px",
                  "& .MuiMenuItem-root": {
                    padding: "3px 10px 3px 10px",
                    "& .MuiTypography-root": {
                      fontSize: "14px",
                      padding: "3px",
                    },
                    borderRadius: "6px",
                    "&:hover": {
                      backgroundColor: "#E8E7FF",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#FFFFFF",
                      color: "#7468FF",
                      textDecoration: "underline",
                    },
                  },
                },
              },
            },
          }}
          renderValue={(selected) => {
            const selectedAttachment = attachments.find((option) => option.id === selected);
            return (
              <Typography
                fontSize={"10px"}
                overflow={"hidden"}
                textOverflow={"ellipsis"}
                color={selectedAttachment?.processable ? "#131313" : "#999"}
              >
                {selectedAttachment?.name}
              </Typography>
            );
          }}
          onChange={onSelectAttachment}
        >
          {attachments.map((option: AttachmentDetails) => (
            <MenuItem
              key={option.id}
              value={option.id}
              sx={{
                minHeight: "20px",
                padding: "0px",
                fontSize: "14px",
                fontFamily: "Inter",
              }}
              disabled={!option.processable}
            >
              <Typography fontSize={"10px"} overflow={"hidden"} textOverflow={"ellipsis"}>
                {option.name}
              </Typography>
            </MenuItem>
          ))}
        </StyledSelect>
      </Box>
      <Box display={"flex"} padding={"10px"} flexDirection={"row"} sx={{ width: "100%" }}>
        {!selectedAttachment?.processable && !notAccessible ? (
          <CustomTooltip title={ATTACHMENTS_TOOLTIP_MESSAGE}>
            <span
              style={{
                display: "flex",
                width: "100%",
              }}
            >
              {renderButton()}
            </span>
          </CustomTooltip>
        ) : (
          renderButton()
        )}
      </Box>
    </OptionBoxContainer>
  );
};
