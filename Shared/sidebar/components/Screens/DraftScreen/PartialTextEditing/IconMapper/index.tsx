import React from "react";
import { GlobeIcon } from "../../../../../../common/Icon/PartialTextEditing/GlobeIcon";
import { LongerTextIcon } from "../../../../../../common/Icon/PartialTextEditing/LongerTextIcon";
import { ShorterTextIcon } from "../../../../../../common/Icon/PartialTextEditing/ShorterTextIcon";
import { SpeakerIcon } from "../../../../../../common/Icon/PartialTextEditing/SpeakerIcon";
import { TextFormatIcon } from "../../../../../../common/Icon/PartialTextEditing/TextFormatIcon";
import { WandAndStartsIcon } from "../../../../../../common/Icon/PartialTextEditing/WandAndStartsIcon";
import { SuitCaseIcon } from "../../../../../../common/Icon/SuitCaseIcon";
import { HappyFaceIcon } from "../../../../../../common/Icon/HappyFaceIcon";
import { FireIcon } from "../../../../../../common/Icon/FireIcon";
import { HandsIcon } from "../../../../../../common/Icon/HandsIcon";
import { FunnyFaceIcon } from "../../../../../../common/Icon/FunnyFaceIcon";
import { GuyWithTieIcon } from "../../../../../../common/Icon/GuyWithTieIcon";

const iconStyling = {
  width: "20px",
  height: "20px",
  marginRight: "5px",
};

interface IconMapping {
  [key: string]: any;
}

const iconMapping: IconMapping = {
  "icon-short-paragraph": ShorterTextIcon,
  "icon-long-paragraph": LongerTextIcon,
  "icon-volume": SpeakerIcon,
  "icon-magic-wand": WandAndStartsIcon,
  "icon-abc-underline": TextFormatIcon,
  "icon-earth-net": GlobeIcon,
  "icon-briefcase": SuitCaseIcon,
  "icon-suit": GuyWithTieIcon,
  "icon-smile": HappyFaceIcon,
  "icon-fire": FireIcon,
  "icon-pray": HandsIcon,
  "icon-stuck-out-tongue-winking-eye": FunnyFaceIcon,
};

interface IconIconMapperProps {
  icon: string;
  sx?: React.CSSProperties;
}

export const IconMapper: React.FC<IconIconMapperProps> = ({ icon, sx }) => {
  const IconComponent = iconMapping[icon];

  if (IconComponent) {
    return React.createElement(IconComponent, { sx: sx ?? iconStyling });
  }

  // If the icon is not recognized or not found in the mapping, you can return a default icon or null.
  return null;
};
