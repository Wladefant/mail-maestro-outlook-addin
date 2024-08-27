import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Screen } from "../../../Shared/sidebar/store/reducers/AppReducer";
import { APP_ROUTES } from "../../../Shared/sidebar/routing/routes";

interface useNavigationProps {
  isOfficeInitialized: boolean;
  screen: Screen;
  token: string | null;
  userDetails: any;
  showSubscriptionExpired: boolean;
  showLitePlanExhaustedScreen: boolean;
  conversationId: string | null;
  isLoading: boolean;
}

export function useNavigation({
  isOfficeInitialized,
  screen,
  token,
  userDetails,
  showSubscriptionExpired,
  showLitePlanExhaustedScreen,
  conversationId,
  isLoading,
}: useNavigationProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOfficeInitialized) {
      return;
    }

    if (!token || !userDetails || !conversationId) {
      navigate(APP_ROUTES.loading.path, { replace: true });
      return;
    }

    if (showSubscriptionExpired) {
      navigate(APP_ROUTES.subscriptionExpired.path, { replace: true });
      return;
    }

    if (showLitePlanExhaustedScreen) {
      navigate(APP_ROUTES.litePlanExhausted.path, { replace: true });
      return;
    }

    switch (screen) {
      case Screen.Loading:
        navigate(APP_ROUTES.loading.path, { replace: true });
        break;
      case Screen.Unauthenticate:
        navigate(APP_ROUTES.unauthenticated.path, { replace: true });
        break;
      case Screen.Debug:
        navigate(APP_ROUTES.debug.path, { replace: true });
        break;
      case Screen.Start:
        navigate(APP_ROUTES.start.path, { replace: true });
        break;
      case Screen.DraftInput:
      case Screen.DraftOutput:
        navigate(APP_ROUTES.draft.path, { replace: true });
        break;
      case Screen.Summary:
        navigate(APP_ROUTES.summary.path, { replace: true });
        break;
      case Screen.TextShortcuts:
        navigate(APP_ROUTES.textShortcuts.path, { replace: true });
        break;
      case Screen.AttachmentsSummary:
        navigate(APP_ROUTES.attachmentsSummary.path, { replace: true });
        break;
      case Screen.MagicTemplates:
        navigate(APP_ROUTES.magicTemplates.path, { replace: true });
        break;
      case Screen.FontPreferences:
        navigate(APP_ROUTES.fontPreferences.path, { replace: true });
        break;
      case Screen.SubscriptionExpired:
        navigate(APP_ROUTES.subscriptionExpired.path, { replace: true });
        break;
      default:
        navigate(APP_ROUTES.loading.path);
    }
  }, [
    isOfficeInitialized,
    isLoading,
    screen,
    token,
    userDetails,
    showSubscriptionExpired,
    showLitePlanExhaustedScreen,
    conversationId,
    navigate,
  ]);
}
