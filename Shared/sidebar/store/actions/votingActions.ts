import { updateEmailStatuses } from "../../apis/draft";
import { addVotedRequest } from "../reducers/VotingReducer";
import { RootState } from "../store";

export const sendVote = (requestId: string, vote: number) => async (dispatch: any, getState: () => RootState) => {
  const state = getState();
  const authToken = state.auth.token;

  if (authToken) {
    await updateEmailStatuses(
      {
        request_id: requestId,
        request_rating: vote,
      },
      authToken,
    );
    dispatch(
      addVotedRequest({
        id: requestId,
        vote,
      }),
    );
  }
};
