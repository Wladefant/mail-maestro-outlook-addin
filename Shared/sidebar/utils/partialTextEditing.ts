import { ImproveActionOptions } from "../store/reducers/PartialTextEditingReducer";

const ImproveTextOptionsSortOrder = ["rephrase", "fix_grammar", "shorter", "longer", "change_tone", "translate"];

export function sortImproveActions(a: ImproveActionOptions, b: ImproveActionOptions): number {
  const indexA = ImproveTextOptionsSortOrder.indexOf(a.name);
  const indexB = ImproveTextOptionsSortOrder.indexOf(b.name);

  return indexA - indexB;
}
