import { CircularProgress, Divider, Link, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { default as React } from "react";
import { useSelector } from "react-redux";
import { selectRemainingCredits } from "../../../../store/reducers/AuthReducer";
import { selectIsLoadingSummary } from "../../../../store/reducers/SummaryReducer";
import { Voting } from "../../../Common/DraftOutput/components/Voting";
import PrimaryButton from "../../../Common/UI/PrimaryButton";
import { SummaryLanguageSelector } from "../../../Common/UserInput/components/LanguageSelector/Summary";
import { OptionBoxContainer, SummaryWrapper } from "./styles";
import { StarIcon } from "../../../../../common/Icon/SubscriptionExpired/StarIcon";

interface SummaryUIProps {
  summary: string;
  icon: React.ReactNode;
  requestId: string;
  notAccessible: boolean;
  onGetDetailedSummary?: () => void;
  onGoPremiumClick?: () => void;
}

const SummaryUI: React.FC<SummaryUIProps> = ({
  summary,
  icon,
  requestId,
  notAccessible = false,
  onGetDetailedSummary,
  onGoPremiumClick,
}) => {
  const isLoadingSummary = useSelector(selectIsLoadingSummary);
  const remainingCredits = useSelector(selectRemainingCredits);

  return (
    <OptionBoxContainer onClick={() => {}}>
      <Box display={"flex"} padding={"10px"} flexDirection={"row"} sx={{ width: "100%" }}>
        {icon}
        <Typography align="left" fontSize={"14px"} fontFamily={"Inter"} fontWeight={"400"} marginLeft={"45px"}>
          Thread summary
        </Typography>
        {isLoadingSummary && (
          <CircularProgress sx={{ position: "absolute", top: "13px", left: "165px" }} size={"15px"} />
        )}
        <Voting
          showFeedbackMessage={false}
          requestId={requestId}
          sx={{ position: "absolute", right: "10px", top: "8px", bottom: "0" }}
          disableVoting={notAccessible}
        />
      </Box>
      <SummaryWrapper>
        <Typography
          margin={"0 15px 0 15px"}
          align="left"
          fontSize={"14px"}
          fontFamily={"Inter"}
          fontWeight={"400"}
          sx={{ wordBreak: "break-word", ...(notAccessible && { filter: "blur(5px)", userSelect: "none" }) }}
        >
          {summary}
        </Typography>
      </SummaryWrapper>
      {notAccessible && remainingCredits > 0 && (
        <PrimaryButton
          sx={{
            position: "absolute",
            top: "40%",
            width: "auto",
            padding: "5px 10px",
          }}
          onClick={onGoPremiumClick}
        >
          Go Premium <StarIcon sx={{ marginLeft: "5px" }} />
        </PrimaryButton>
      )}
      <Divider sx={{ width: "calc(100% - 20px)" }} variant="middle" />
      <Box width={"100%"} display={"flex"} padding={"10px"} flexDirection={"row"} alignItems={"center"}>
        <Box
          display={"flex"}
          alignItems={"center"}
          paddingRight={"10px"}
          width={"100%"}
          justifyContent={"space-between"}
        >
          <Link
            onClick={onGetDetailedSummary}
            sx={{ cursor: notAccessible ? "not-allowed" : "pointer" }}
            color={notAccessible ? "#B3B3B3" : "#7468FF"}
            fontFamily={"Inter"}
            fontWeight={"400"}
            fontSize={"14px"}
            marginLeft={"10px"}
          >
            Get detailed summary
          </Link>
          <SummaryLanguageSelector disableSelect={notAccessible} />
        </Box>
      </Box>
    </OptionBoxContainer>
  );
};

export default SummaryUI;
