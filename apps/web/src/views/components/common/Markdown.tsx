// Minimal, dependency-free Markdown renderer for AI responses.
// Supports: **bold**, *italic*, `code`, bullet lists (-, *), numbered lists,
// headings (#), and paragraphs. Good enough for chat / report narratives.

import { Fragment, type ReactNode } from 'react';

/** Render inline emphasis (**bold**, *italic*, `code`) within a line. */
function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith('**')) nodes.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) nodes.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushList = (key: string) => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={`${key}-li-${i}`}>{inline(it, `${key}-${i}`)}</li>);
    blocks.push(list.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>);
    list = null;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    const bullet = /^[-*]\s+(.*)/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)/.exec(line);
    const heading = /^(#{1,3})\s+(.*)/.exec(line);

    if (bullet) {
      if (!list || list.ordered) flushList(`l-${idx}`);
      list = list ?? { ordered: false, items: [] };
      list.items.push(bullet[1]);
    } else if (numbered) {
      if (!list || !list.ordered) flushList(`l-${idx}`);
      list = list ?? { ordered: true, items: [] };
      list.items.push(numbered[1]);
    } else if (heading) {
      flushList(`l-${idx}`);
      const lvl = heading[1].length;
      const content = inline(heading[2], `h-${idx}`);
      blocks.push(lvl === 1 ? <h4 key={idx}>{content}</h4> : <h5 key={idx}>{content}</h5>);
    } else if (line === '') {
      flushList(`l-${idx}`);
    } else {
      flushList(`l-${idx}`);
      blocks.push(<p key={idx}>{inline(line, `p-${idx}`)}</p>);
    }
  });
  flushList('l-end');

  return <div className="md">{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>;
}
