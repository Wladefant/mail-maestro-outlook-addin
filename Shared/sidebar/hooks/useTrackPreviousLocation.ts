import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setPreviousLocation } from "../store/reducers/AppReducer";

const useTrackPreviousLocation = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPreviousLocation(location));
  }, [location, dispatch]);
};

export default useTrackPreviousLocation;
