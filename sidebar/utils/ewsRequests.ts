/*
    EWS Request to get current users sent emails
*/
export const sentEmailsEWSRequest =
  '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
  ' xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages"' +
  ' xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"' +
  ' xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
  "<soap:Header>" +
  '<t:RequestServerVersion Version="Exchange2013"/>' +
  "</soap:Header>" +
  "<soap:Body>" +
  '<m:FindItem Traversal="Shallow">' +
  `<m:ItemShape>
      <t:BaseShape>IdOnly</t:BaseShape>
      <t:AdditionalProperties>
          <t:FieldURI FieldURI="item:Subject" />
          <t:FieldURI FieldURI="item:DateTimeSent" />
      </t:AdditionalProperties>
  </m:ItemShape> ` +
  '<m:IndexedPageItemView MaxEntriesReturned="500" Offset="0" BasePoint="Beginning" />' +
  "<m:ParentFolderIds>" +
  '<t:DistinguishedFolderId Id="sentitems"/>' +
  "</m:ParentFolderIds>" +
  "</m:FindItem>" +
  "</soap:Body>" +
  "</soap:Envelope>";

/*
    Format SOAP request for getConversations EWS endpoint
  */
export const createEwsGetConversationsSOAP = (conversationId: string) => {
  return (
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<soap:Envelope xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance"' +
    '               xmlns:xsd="https://www.w3.org/2001/XMLSchema"' +
    '               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"' +
    '               xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">' +
    "  <soap:Header>" +
    '    <RequestServerVersion Version="Exchange2013" xmlns="http://schemas.microsoft.com/exchange/services/2006/types" soap:mustUnderstand="0" />' +
    "  </soap:Header>" +
    "  <soap:Body>" +
    '    <GetConversationItems xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">' +
    "      <ItemShape>" +
    "        <t:BaseShape>IdOnly</t:BaseShape>" +
    "        <t:AdditionalProperties>" +
    '            <t:FieldURI FieldURI="item:Subject"/>' +
    '            <t:FieldURI FieldURI="item:Body" />' +
    "        </t:AdditionalProperties>" +
    "      </ItemShape>" +
    "      <FoldersToIgnore>\n" +
    '            <t:DistinguishedFolderId Id="deleteditems" />\n' +
    '            <t:DistinguishedFolderId Id="drafts" />\n' +
    "     </FoldersToIgnore>" +
    '      <Conversations><t:Conversation><t:ConversationId Id="' +
    conversationId +
    '"/></t:Conversation></Conversations>' +
    "    </GetConversationItems>" +
    "  </soap:Body>" +
    "</soap:Envelope>"
  );
};

/*
 * EWS SOAP request to get calendar events between two times
 *
 * start and end must be in ISO format
 */
export const getCalendarEventsEWSRequest = (start: string, end: string) => {
  return `<?xml version="1.0" encoding="utf-8"?>
    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
                xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages"
                xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
        <s:Header>
            <t:RequestServerVersion Version="Exchange2013_SP1" />
        </s:Header>
        <s:Body>
            <m:FindItem Traversal="Shallow">
                <m:ItemShape>
                    <t:BaseShape>Default</t:BaseShape>
                </m:ItemShape>
                <m:CalendarView MaxEntriesReturned="100" StartDate="${start}" EndDate="${end}"/>
                <m:ParentFolderIds>
                    <t:DistinguishedFolderId Id="calendar"/>
                </m:ParentFolderIds>
            </m:FindItem>
        </s:Body>
    </s:Envelope>
    `;
};
