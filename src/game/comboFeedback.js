export function getComboFeedbackText(value) {
  if (value > 0 && value % 10 === 0) {
    return `连击 x${value}，节奏拉满`;
  }

  if (value > 0 && value % 5 === 0) {
    return `连击 x${value}`;
  }

  return '';
}

export function withComboFeedback(message, value) {
  const comboFeedback = getComboFeedbackText(value);
  return comboFeedback ? `${message} · ${comboFeedback}` : message;
}
