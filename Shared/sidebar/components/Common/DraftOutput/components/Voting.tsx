import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store/store";

import { Box } from "@mui/system";
import { ThumbsDownIcon } from "../../../../../common/Icon/ThumbsDownIcon";
import { ThumbsDownIconFilled } from "../../../../../common/Icon/ThumbsDownIconFilled";
import { ThumbsUpIcon } from "../../../../../common/Icon/ThumbsUpIcon";
import { ThumbsUpIconFilled } from "../../../../../common/Icon/ThumbsUpIconFilled";
import useShowWithTimer from "../../../../../../Shared/common/hooks/useShowWithTime";
import { sendVote } from "../../../../store/actions/votingActions";
import { selectIfRequestIsAlreadyVoted, selectVotedRequestById } from "../../../../store/reducers/VotingReducer";

type Props = {
  requestId: string;
  sx?: any;
  showFeedbackMessage?: boolean;
  disableVoting?: boolean;
};

export enum Vote {
  UP = 1,
  DOWN = -1,
}

const VOTING_ANIMATION_DURATION = 2000;

export const Voting: React.FC<Props> = ({ requestId, sx, showFeedbackMessage = true, disableVoting }) => {
  const { showComponent, handleClick } = useShowWithTimer(VOTING_ANIMATION_DURATION);
  const [vote, setVote] = React.useState<Vote | null>(null);
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const requestIsVoted = useSelector(selectIfRequestIsAlreadyVoted(requestId));
  const votedRequest = useSelector(selectVotedRequestById(requestId));

  const handleVote = async (vote: Vote) => {
    if (disableVoting) return;
    setVote(vote);
    handleClick();
    await dispatch(sendVote(requestId, vote as number));
  };

  useEffect(() => {
    if (!showComponent) {
      setVote(null);
    }
  }, [showComponent]);

  return (
    <Box {...(showComponent && showFeedbackMessage && { left: "25px" })} {...(sx && sx)}>
      {showComponent && showFeedbackMessage ? (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          padding={"2px"}
          textAlign={"center"}
          borderRadius={"5px"}
          fontFamily={"Inter"}
          fontSize={"12px"}
          sx={{ backgroundColor: "#F9F9F9" }}
        >
          <Box sx={{ color: "black" }}>{vote === Vote.UP ? <ThumbsUpIconFilled /> : <ThumbsDownIconFilled />}</Box>
          <Box marginLeft={"5px"}>Thank you for your feedback</Box>
        </Box>
      ) : (
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-around"}
          padding={"5px"}
          borderRadius={"5px"}
          width={"45px"}
          height={"20px"}
          sx={{ backgroundColor: "#F9F9F9" }}
        >
          <Box
            onClick={() => !requestIsVoted && handleVote(Vote.UP)}
            sx={{ ...(!requestIsVoted && !disableVoting && { cursor: "pointer" }) }}
          >
            {(requestIsVoted && votedRequest?.vote === 1) || (vote === 1 && !showFeedbackMessage) ? (
              <ThumbsUpIconFilled />
            ) : (
              <ThumbsUpIcon />
            )}
          </Box>
          <Box
            onClick={() => !requestIsVoted && handleVote(Vote.DOWN)}
            sx={{ ...(!requestIsVoted && !disableVoting && { cursor: "pointer" }) }}
          >
            {(requestIsVoted && votedRequest?.vote === -1) || (vote === -1 && !showFeedbackMessage) ? (
              <ThumbsDownIconFilled />
            ) : (
              <ThumbsDownIcon />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
