import React, { Fragment } from 'react'
import { parse } from 'ultrahtml'
import { decode } from 'tiny-decode'

import { normalizeProps, extractText } from './utils'

import AccountHoverWrapper from '@/components/mastodon/AccountHoverWrapper'
import TagHoverWrapper from '@/components/mastodon/TagHoverWrapper'
import ContentCode from '@/components/mastodon/ContentCode'

const ELEMENT_NODE = 1
const TEXT_NODE = 2
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

/** 把富文本字符串转换为React VNode */
export function contentToReactNode(content: string): React.ReactNode {
  const tree = parse(content)

  return (
    <>
      {(tree.children || []).map((node: any, i: number) => (
        <Fragment key={i}>{treeToReactNode(node)}</Fragment>
      ))}
    </>
  )
}

function renderChildrenWithKeys(children: any[] = []): React.ReactNode[] {
  return children.map((child: any, i: number) => (
    <Fragment key={i}>{treeToReactNode(child)}</Fragment>
  ))
}

function treeToReactNode(node: any): React.ReactNode {
  if (!node) return null

  if (node.type === TEXT_NODE) {
    return decode(node.value)
  }

  if (node.type === ELEMENT_NODE) {
    return elementToReactNode(node)
  }

  return null
}

function elementToReactNode(node: any): React.ReactNode {
  const { name, attributes = {}, children = [] } = node

  // mention / hashtag
  if (name === 'a' && attributes.class?.includes('mention')) {
    const handled = handleMention(node)
    if (handled) return handled
  }

  // code block
  if (name === 'pre') {
    const handled = handleCodeBlock(node)
    if (handled) return handled
  }

  // link
  if (name === 'a') {
    return renderLink(node)
  }

  if (VOID_ELEMENTS.has(name)) {
    return React.createElement(name, normalizeProps(attributes))
  }

  return React.createElement(
    name,
    normalizeProps(attributes),
    renderChildrenWithKeys(children),
  )
}

function handleMention(node: any): React.ReactNode | null {
  const href = node.attributes?.href
  if (!href) return null

  // user
  const userMatch = href.match(/https?:\/\/([^/]+)\/@([^/]+)/)
  if (userMatch) {
    const [, server, username] = userMatch
    const handle = `${username}@${server}`

    return (
      <AccountHoverWrapper handle={handle}>
        <a href={`/${server}/@${username}`} className="text-primary">
          {renderChildrenWithKeys(node.children)}
        </a>
      </AccountHoverWrapper>
    )
  }

  // hashtag
  const tagMatch = href.match(/\/tags\/(.+)/)
  if (tagMatch) {
    const tag = tagMatch[1]

    return (
      <TagHoverWrapper tagName={tag}>
        <a href={`/tags/${tag}`} className="text-primary">
          {renderChildrenWithKeys(node.children)}
        </a>
      </TagHoverWrapper>
    )
  }

  return null
}

function renderLink(node: any): React.ReactNode {
  const { attributes = {}, children = [] } = node

  return (
    <a {...normalizeProps(attributes)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline cursor-pointer">
      {children.map((child: any, i: number) => {
        if (
          child?.type === ELEMENT_NODE &&
          child.name !== 'bdi' &&
          child.attributes?.class?.includes('ellipsis')
        ) {
          return <bdi key={i}>{renderChildrenWithKeys(child.children)}</bdi>
        }

        return <Fragment key={i}>{treeToReactNode(child)}</Fragment>
      })}
    </a>
  )
}

function handleCodeBlock(node: any): React.ReactNode | null {
  if (node.name === 'pre' && node.children?.[0]?.name === 'code') {
    const codeEl = node.children[0]

    const classes = codeEl.attributes?.class || ''
    const lang = classes
      .split(/\s+/)
      .find((i: string) => i.startsWith('language-'))
      ?.replace('language-', '')

    const code = extractText(codeEl)

    return <ContentCode code={encodeURIComponent(code)} lang={lang} />
  }

  return null
}
