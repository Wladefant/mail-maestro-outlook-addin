import { convert } from "html-to-text";
import showdown from "showdown";

const converter = new showdown.Converter();

export const convertHTMLToText = (html: string) => {
  // convert HTML to text because we want to display it in a textarea
  const options = {
    wordwrap: 130,
    selectors: [
      {
        selector: "ul",
        options: {
          itemPrefix: "- ",
          leadingLineBreaks: 1,
          trailingLineBreaks: 1,
        },
      },
      {
        selector: "p",
        options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
      },
    ],
  };
  return convert(html, options).trim();
};

export function checkUserDraftContentIsEmpty(userDraft: string) {
  return convertHTMLToText(userDraft).length === 0;
}

export const splitOutlookWebDraft = (text: string) => {
  let prevThread = text.split('<div id="appendonsend"></div>')[1] || "";
  prevThread = '<div id="appendonsend"></div>' + prevThread;

  const parser = new DOMParser();
  const html = parser.parseFromString(text, "text/html");
  const signature = html.getElementById("Signature")?.outerHTML || "";

  // remove appendonsend part
  let messageToImprove = text.split('<div id="appendonsend"></div>')[0];
  // remove signature part
  messageToImprove = messageToImprove.split('<div id="Signature">')[0];
  // remove <br> tags and <br/>
  messageToImprove = messageToImprove.replace(/<br>/g, "");

  return { prevThread, messageToImprove, signature };
};

export const splitOutlookNativeDraft = (text: string) => {
  // MacOS and Win11 way
  // Signature starts with an <a name="_MailAutoSig"
  // Previous thread starts with an <a name="_MailOriginal"
  // Explain code below:
  // We are going to loop through all the nodes of the body
  // We are going to check if we are in the signature part or in the previous thread part
  const parser = new DOMParser();
  const html = parser.parseFromString(text, "text/html");

  let signatureFlag = false;
  let previousThreadFlag = false;
  const nodes = html.getElementsByTagName("body")[0]?.firstElementChild?.children;

  let prevThread = "";
  let messageToImprove = "";
  let signature = "";

  Array.from(nodes || []).forEach((el) => {
    // This means we are in "Signature" part
    if (el?.getElementsByTagName("a")[0]?.name == "_MailAutoSig") {
      signatureFlag = true;
      previousThreadFlag = false;
    }
    // This means we are in "Previous Thread" part
    if (el?.getElementsByTagName("a")[0]?.name == "_MailOriginal") {
      previousThreadFlag = true;
      signatureFlag = false;
      prevThread = '<div style="border: none; border-top: solid #e1e1e1 1pt; padding: 3pt 0 0 0;"></div>';
    }

    if (previousThreadFlag) {
      prevThread = prevThread + el.outerHTML;
    }
    if (signatureFlag) {
      signature = signature + el.outerHTML;
    }
    if (!signatureFlag && !previousThreadFlag) {
      messageToImprove = messageToImprove + el.outerHTML;
    }
  });

  return { prevThread, messageToImprove, signature };
};

export function addBreakTagsBetweenPTags(input: string): string {
  const regex = /<\/p>\s*<p>/g; // Match "</p><p>" with optional white space
  const replacement = "</p><br><p>"; // Replace with "</p><br><p>"

  return input.replace(regex, replacement);
}

export function convertMarkdownToHTML(input: string): string {
  const html = converter.makeHtml(input);
  return html;
}

export function convertNewlinesToBr(str: string): string {
  return str.replace(/(\r\n|\n|\r)/gm, "<br>");
}
