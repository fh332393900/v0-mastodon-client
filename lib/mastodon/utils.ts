export function normalizeProps(attrs: Record<string, any>) {
  const props: Record<string, any> = {}

  for (const key in attrs) {
    if (key === 'class') {
      props.className = attrs[key]
    } else if (key === 'style') {
      props.style = parseStyle(attrs[key])
    } else {
      props[key] = attrs[key]
    }
  }

  return props
}

function parseStyle(style: string) {
  const obj: any = {}

  style.split(';').forEach((item) => {
    const [key, value] = item.split(':')
    if (!key || !value) return
    obj[key.trim()] = value.trim()
  })

  return obj
}

export function extractText(node: any): string {
  if (!node) return ''

  if (node.type === 3) return node.value

  if (node.children) {
    return node.children.map(extractText).join('')
  }

  return ''
}
