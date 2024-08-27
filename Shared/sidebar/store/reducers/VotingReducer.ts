import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Vote } from "../../components/Common/DraftOutput/components/Voting";
import { RootState } from "../store";

export type VotedRequest = {
  id: string;
  vote: Vote;
};

interface VotingState {
  votedRequests: VotedRequest[];
}

const initialState: VotingState = {
  votedRequests: [],
};

const improveSlice = createSlice({
  name: "voting",
  initialState,
  reducers: {
    addVotedRequest: (state, action: PayloadAction<VotedRequest>) => {
      state.votedRequests = state.votedRequests.concat(action.payload);
    },
  },
});

export const selectIfRequestIsAlreadyVoted = (requestId: string) => (state: RootState) =>
  state.voting.votedRequests.some((request: VotedRequest) => request.id === requestId);
export const selectVotedRequestById = (requestId: string) => (state: RootState) =>
  state.voting.votedRequests.find((request: VotedRequest) => request.id === requestId);

export const { addVotedRequest } = improveSlice.actions;

export default improveSlice.reducer;
