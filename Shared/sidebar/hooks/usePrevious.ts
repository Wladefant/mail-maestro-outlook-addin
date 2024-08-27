import { useEffect, useRef } from "react";

/**
 * `usePrevious` is a custom hook that allows you to access the previous
 * state or props in a functional component.
 *
 * @param {any} value - The state or prop value that you want to track changes for.
 * @returns {any} - The previous value of the state or prop before the last render.
 *
 * @example
 * ```tsx
 *  const YourComponent = ({ prop }) => {
 *    const prevProp = usePrevious(prop);
 *
 *    useEffect(() => {
 *      if (prevProp !== prop) {
 *        console.log('prop has changed');
 *      }
 *    }, [prop]);
 *
 *    // render your component here
 *  }
 * ```
 *
 * Note: This hook does not cause a re-render. It updates the ref during the
 * "commit phase" after the component has already been updated, hence it does not
 * capture the value for the initial render. For the initial render, the returned value is `undefined`.
 */
export const usePrevious = (value: any) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};
