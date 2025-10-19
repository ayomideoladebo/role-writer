// Convert markdown bold syntax to HTML bold tags
export const convertMarkdownBold = (text: string): string => {
  // Replace **text** with <strong>text</strong>
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
};

// Render text with HTML bold tags safely
export const renderFormattedText = (text: string): { __html: string } => {
  const formatted = convertMarkdownBold(text);
  return { __html: formatted };
};
