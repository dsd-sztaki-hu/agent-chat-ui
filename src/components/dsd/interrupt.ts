

export function isInterruptedUiMessage(
  value: unknown,
)  {
  const valueAsObject = Array.isArray(value) ? value[0] : value;
  return (
    valueAsObject &&
    typeof valueAsObject === "object" &&
    "interrupted_ui_message" in valueAsObject
  );
}
