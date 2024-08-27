import React from "react";
import { useSelector } from "react-redux";
import { selectUserPermissions, UserPermissions } from "../../../store/reducers/AuthReducer";

/*
 * This HOC is used to wrap components that require certain permissions to be rendered.
 * If the user does not have the required permission, the component will be rendered with an additional injected property.
 */
interface WithNotAccessible {
  notAccessible: boolean;
}

type WrappedComponentType<P extends WithNotAccessible> = React.ComponentType<P>;

export const PermissionHOC = <P extends WithNotAccessible>(
  WrappedComponent: WrappedComponentType<P>,
  permission: keyof UserPermissions,
) => {
  return function EnhancedComponent(props: Omit<P, "notAccessible">) {
    const userPermissions = useSelector(selectUserPermissions);
    if (!userPermissions?.[permission]) {
      return <WrappedComponent {...(props as P)} notAccessible={true} />;
    }
    return <WrappedComponent {...(props as P)} notAccessible={false} />;
  };
};
