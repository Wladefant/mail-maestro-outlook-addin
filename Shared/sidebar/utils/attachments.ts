import { AttachmentDetails } from "../store/reducers/AttachmentsReducer";
import { getAttachmentContentById, getPlatformAttachments } from "@platformSpecific/sidebar/utils/officeMisc";

export const getAttachments = async (messageId: string | null): Promise<AttachmentDetails[]> => {
  return await getPlatformAttachments(messageId as string);
};

export const isAttachmentProcessable = (attachment: any) => {
  if (!["pdf", "docx", "txt"].includes(getFileExtension(attachment.name) || "")) {
    return false;
  }
  const MAX_FILE_SIZE = 1000000; // 1MB
  return attachment.size <= MAX_FILE_SIZE;
};

export const getAttachmentContent = (itemId: string, attachmentId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    getAttachmentContentById(attachmentId, itemId, (content: string | null) => {
      console.log("In callback");
      if (content) {
        resolve(content);
      } else {
        reject("Attachment content not found");
      }
    });
  });
};

export const getFileExtension = (filename: string): string | null => {
  const parts = filename.split(".");
  // If there's no '.' in filename or it's the first character
  if (parts.length < 2 || (parts.length === 2 && !parts[0])) {
    return null;
  }

  return parts.pop()?.toLowerCase() || null;
};
