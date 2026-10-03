const nonTextInputTypes: ReadonlySet<string> = new Set([
  "button",
  "checkbox",
  "color",
  "date",
  "datetime-local",
  "file",
  "hidden",
  "image",
  "month",
  "radio",
  "range",
  "reset",
  "submit",
  "time",
  "week",
]);

export const isTextEntry = (element: unknown): element is HTMLElement => {
  if (element instanceof HTMLTextAreaElement) return !element.readOnly;
  if (element instanceof HTMLInputElement) {
    return !element.readOnly && !nonTextInputTypes.has(element.type);
  }
  return element instanceof HTMLElement && element.isContentEditable;
};
