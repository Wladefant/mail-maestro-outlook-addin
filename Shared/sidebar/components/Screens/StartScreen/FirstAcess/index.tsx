import { Box, Checkbox, Link, Typography } from "@mui/material";

import { isNativeApp } from "@platformSpecific/sidebar/utils/officeMisc";
import React, { useState } from "react";
import { CaretRight } from "../../../../../common/Icon/CaretRight";
import ButtonPrimary from "../../../../../dialog/components/Common/ButtonPrimary";
import Header from "../../../Common/Header";
import { CheckboxesWrapper, TermsLabel } from "./styles";

type Props = {
  startOnboarding: () => void;
};

const FirstAccess: React.FC<Props> = ({ startOnboarding }) => {
  const isNative = isNativeApp();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [llmAccepted, setllmAccepted] = useState(false);

  const platformType = process.env.PLATFORM_TYPE as string;

  return (
    <>
      <Header isNative={isNative} startScreen={true} isFirstRun={true} />
      <Box
        marginTop={"1rem"}
        padding={"1rem 1.5rem"}
        sx={{ textAlign: "center" }}
        height={"100%"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
      >
        <Box>
          <img
            src={"../../assets/logo.svg"}
            alt="title"
            style={{
              height: "28px",
              marginBottom: "1.5rem",
            }}
          />
          <Typography color="#131313" fontFamily={"DM Sans"} fontWeight={"700"} fontSize={"20px"} lineHeight={"28px"}>
            Write better emails faster
          </Typography>
          <img
            src={"../../assets/front_image.svg"}
            alt="front_image"
            style={{
              marginTop: "1rem",
              width: "100%",
            }}
          />
          <Typography color="#595D62" fontFamily={"DM Sans"} fontWeight={"400"} fontSize={"14px"} lineHeight={"20px"}>
            Write faster, quality emails in your preferred tone and language, securely encrypted.
          </Typography>
          {platformType === "chrome_extension" && (
            <CheckboxesWrapper>
              <Box display={"flex"} alignItems={"center"} width={"300px"}>
                <Checkbox
                  sx={{
                    color: "#7468FF",
                    "&.Mui-checked": {
                      color: "#7468FF",
                    },
                  }}
                  checked={termsAccepted}
                  onChange={() => {
                    setTermsAccepted(!termsAccepted);
                  }}
                />
                <TermsLabel>
                  I agree to MailMaestro's{" "}
                  <Link
                    sx={{
                      "&.MuiTypography-root": {
                        color: "#7468FF",
                        fontWeight: "700",
                      },
                    }}
                    href="https://www.maestrolabs.com/terms"
                    target="_blank"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    sx={{
                      "&.MuiTypography-root": {
                        color: "#7468FF",
                        fontWeight: "700",
                      },
                    }}
                    href="https://www.maestrolabs.com/privacy"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                  .
                </TermsLabel>
              </Box>
              <Box display={"flex"} alignItems={"center"} width={"300px"}>
                <Checkbox
                  sx={{
                    color: "#7468FF",
                    "&.Mui-checked": {
                      color: "#7468FF",
                    },
                  }}
                  checked={llmAccepted}
                  onChange={() => {
                    setllmAccepted(!llmAccepted);
                  }}
                />
                <TermsLabel>
                  I understand that MailMaestro{" "}
                  <Link
                    sx={{
                      "&.MuiTypography-root": {
                        color: "#7468FF",
                        fontWeight: "700",
                      },
                    }}
                    href="https://maestrolabs.notion.site/Security-and-Data-Privacy-White-Paper-bd31fb87a6c94ffb86813e6f4bb8f255#f9e74872278047bfb9486aed63469ec0"
                    target="_blank"
                  >
                    shares anonymized email
                  </Link>{" "}
                  data with third party LLM providers.
                </TermsLabel>
              </Box>
            </CheckboxesWrapper>
          )}
        </Box>

        <Box marginBottom={"50px"}>
          <ButtonPrimary
            onClick={startOnboarding}
            sx={{
              width: "100%",
              fontSize: "13px",
              fontWeight: "400",
              fontFamily: "Inter",
              borderRadius: "6px",
            }}
            {...(platformType === "chrome_extension" && {
              disabled: !termsAccepted || !llmAccepted,
            })}
          >
            Let’s write an AI email
            <CaretRight
              sx={{
                marginLeft: "5px",
                height: "18px",
              }}
            />
          </ButtonPrimary>
        </Box>
      </Box>
    </>
  );
};

export default FirstAccess;
