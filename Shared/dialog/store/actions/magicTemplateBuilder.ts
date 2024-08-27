import { createAsyncThunk } from "@reduxjs/toolkit";
import { uuid4 } from "../../../sidebar/utils/uuid";
import { toSnakeCase } from "../../utils/string";
import { addMagicTemplateVariable, MagicTemplateBuilderVariable } from "../reducers/magicTemplateBuilder";
import { RootState } from "../store";

export const extractVariables = createAsyncThunk(
  "magicTemplateBuilder/extract",
  async (content: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const variables = state.magicTemplateBuilder.magicTemplateVariables;

    const variableNames = new Set<string>();

    content.replace(/\{\{([a-zA-Z_]+)\}\}/g, (_, varName) => {
      variableNames.add(varName);
      return _;
    });

    const newVariables: MagicTemplateBuilderVariable[] = [];
    for (const varName of variableNames) {
      const variableName = varName.replace(/_/g, " ").toLowerCase();
      let variable = variables.find((v) => toSnakeCase(v.name.toLowerCase()) === toSnakeCase(variableName));
      if (!variable) {
        const newVariable = {
          id: uuid4(),
          name: variableName,
        };
        await dispatch(addMagicTemplateVariable(newVariable));
        newVariables.push(newVariable);
      }
    }

    return [...variables, ...newVariables];
  },
);
