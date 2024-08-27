import axios from "axios";
import { API_ENDPOINTS } from "../../../../sidebar/apis/endpoints";
import { MagicTemplateBuilderVariable } from "../../../store/reducers/magicTemplateBuilder";
import { toSnakeCase } from "../../../utils/string";

export type MagicTemplateMetadata = {
  title: string;
  templateText: string;
  templateSubject: string;
  variables: MagicTemplateBuilderVariable[];
  isStatic: boolean;
};

export const createOrUpdateMagicTemplate = async (
  authToken: string,
  magicTemplateMetadata: MagicTemplateMetadata,
  templateId?: string,
): Promise<{
  status: string;
}> => {
  const { title, templateText, variables, isStatic, templateSubject } = magicTemplateMetadata;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${authToken}`,
  };

  const magicTemplateFields = variables.map((variable, index) => ({
    type: "string",
    rank: variables.length - 1 - index,
    placeholder: "",
    help_text: "",
    name: toSnakeCase(variable.name),
    label: variable.name,
  }));

  const apiParams = {
    kinds: ["COMPOSE", "REPLY"],
    title: title || "Untitled template",
    description: "",
    template: templateText,
    subject_template: templateSubject,
    fields: magicTemplateFields,
    static: isStatic,
  };

  try {
    if (templateId) {
      await axios.put(`${API_ENDPOINTS.MAGIC_TEMPLATES}${templateId}/`, apiParams, { headers });
      return {
        status: "updated",
      };
    } else {
      await axios.post(API_ENDPOINTS.MAGIC_TEMPLATES, apiParams, { headers });
      return {
        status: "created",
      };
    }
  } catch (error) {
    console.error("Error creating or updating magic template:", error);
    return {
      status: "Error creating or updating magic template",
    };
  }
};

export const deleteMagicTemplate = async (
  authToken: string,
  templateId: string,
): Promise<{
  status: string;
}> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${authToken}`,
  };

  try {
    await axios.delete(`${API_ENDPOINTS.MAGIC_TEMPLATES}${templateId}`, { headers });
    return {
      status: "deleted",
    };
  } catch (error) {
    console.error("Error deleting magic template:", error);
    return {
      status: "Error deleting magic template",
    };
  }
};
