/** The header bar's message tab (Site settings → Header message), or '' when it is off or empty. */
export const resolveHeaderMessage = (site) =>
  site?.headerMessage?.show === false ? '' : site?.headerMessage?.text?.trim() || ''
