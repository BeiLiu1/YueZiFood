export type UiTheme = 'peach-kitchen' | 'mint-bento'

export function useGlobalTheme() {
  const theme = useState<UiTheme>('global-ui-theme', () => 'mint-bento')
  function setTheme(value: UiTheme) { theme.value = value }
  return { theme, setTheme }
}
