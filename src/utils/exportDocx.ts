import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { saveAs } from 'file-saver';
import { marked, type Token, type Tokens } from 'marked';
import { CATEGORY_LABELS, type Recipe } from '../types/recipe';
import { getRecipesOrderedForCookbook } from './recipes';

interface InlineStyle {
  bold?: boolean;
  italics?: boolean;
  strike?: boolean;
  code?: boolean;
}

function headingLevelForDepth(depth: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
  switch (depth) {
    case 1:
    case 2:
      return HeadingLevel.HEADING_2;
    case 3:
      return HeadingLevel.HEADING_3;
    default:
      return HeadingLevel.HEADING_4;
  }
}

function inlineTokensToRuns(
  tokens: readonly Token[] | undefined,
  style: InlineStyle = {},
): TextRun[] {
  if (!tokens || tokens.length === 0) {
    return [];
  }

  const runs: TextRun[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        const textToken = token as Tokens.Text;
        if (textToken.tokens && textToken.tokens.length > 0) {
          runs.push(...inlineTokensToRuns(textToken.tokens, style));
        } else {
          runs.push(
            new TextRun({
              text: textToken.text,
              bold: style.bold,
              italics: style.italics,
              strike: style.strike,
              font: style.code ? 'Courier New' : undefined,
            }),
          );
        }
        break;
      }
      case 'strong': {
        const strongToken = token as Tokens.Strong;
        runs.push(...inlineTokensToRuns(strongToken.tokens, { ...style, bold: true }));
        break;
      }
      case 'em': {
        const emToken = token as Tokens.Em;
        runs.push(...inlineTokensToRuns(emToken.tokens, { ...style, italics: true }));
        break;
      }
      case 'del': {
        const delToken = token as Tokens.Del;
        runs.push(...inlineTokensToRuns(delToken.tokens, { ...style, strike: true }));
        break;
      }
      case 'codespan': {
        const codeToken = token as Tokens.Codespan;
        runs.push(
          new TextRun({
            text: codeToken.text,
            bold: style.bold,
            italics: style.italics,
            font: 'Courier New',
          }),
        );
        break;
      }
      case 'link': {
        const linkToken = token as Tokens.Link;
        if (linkToken.tokens && linkToken.tokens.length > 0) {
          runs.push(...inlineTokensToRuns(linkToken.tokens, style));
        } else {
          runs.push(new TextRun({ text: linkToken.text || linkToken.href, ...style }));
        }
        break;
      }
      case 'br': {
        runs.push(new TextRun({ break: 1 }));
        break;
      }
      case 'escape': {
        const escapeToken = token as Tokens.Escape;
        runs.push(new TextRun({ text: escapeToken.text, ...style }));
        break;
      }
      default: {
        if ('text' in token && typeof token.text === 'string' && token.text.length > 0) {
          runs.push(new TextRun({ text: token.text, ...style }));
        }
        break;
      }
    }
  }

  return runs;
}

function listItemToParagraphs(
  item: Tokens.ListItem,
  ordered: boolean,
  index: number,
  level: number,
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const inlineRuns: TextRun[] = [];
  const nestedLists: Tokens.List[] = [];

  for (const child of item.tokens) {
    if (child.type === 'list') {
      nestedLists.push(child as Tokens.List);
    } else if ('tokens' in child && Array.isArray(child.tokens)) {
      inlineRuns.push(...inlineTokensToRuns(child.tokens as Token[]));
    } else if ('text' in child && typeof child.text === 'string') {
      inlineRuns.push(new TextRun({ text: child.text }));
    }
  }

  if (inlineRuns.length === 0 && item.text) {
    inlineRuns.push(new TextRun({ text: item.text }));
  }

  if (ordered) {
    paragraphs.push(
      new Paragraph({
        indent: { left: 360 * (level + 1) },
        spacing: { after: 80 },
        children: [
          new TextRun({ text: `${index + 1}. `, bold: true }),
          ...inlineRuns,
        ],
      }),
    );
  } else {
    paragraphs.push(
      new Paragraph({
        bullet: { level },
        spacing: { after: 80 },
        children: inlineRuns,
      }),
    );
  }

  for (const nestedList of nestedLists) {
    paragraphs.push(...listTokenToParagraphs(nestedList, level + 1));
  }

  return paragraphs;
}

function listTokenToParagraphs(listToken: Tokens.List, level = 0): Paragraph[] {
  const start = typeof listToken.start === 'number' ? listToken.start - 1 : 0;
  return listToken.items.flatMap((item, idx) =>
    listItemToParagraphs(item, listToken.ordered, start + idx, level),
  );
}

function blockTokensToParagraphs(tokens: readonly Token[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const headingToken = token as Tokens.Heading;
        paragraphs.push(
          new Paragraph({
            heading: headingLevelForDepth(headingToken.depth),
            spacing: { before: 220, after: 100 },
            children: inlineTokensToRuns(headingToken.tokens),
          }),
        );
        break;
      }
      case 'paragraph': {
        const paragraphToken = token as Tokens.Paragraph;
        paragraphs.push(
          new Paragraph({
            spacing: { after: 120 },
            children: inlineTokensToRuns(paragraphToken.tokens),
          }),
        );
        break;
      }
      case 'list': {
        paragraphs.push(...listTokenToParagraphs(token as Tokens.List));
        break;
      }
      case 'blockquote': {
        const quoteToken = token as Tokens.Blockquote;
        const innerText = quoteToken.text.trim();
        if (innerText) {
          paragraphs.push(
            new Paragraph({
              indent: { left: 480 },
              spacing: { before: 100, after: 120 },
              border: {
                left: {
                  color: 'B45309',
                  size: 12,
                  style: BorderStyle.SINGLE,
                  space: 8,
                },
              },
              children: [new TextRun({ text: innerText, italics: true })],
            }),
          );
        }
        break;
      }
      case 'code': {
        const codeToken = token as Tokens.Code;
        paragraphs.push(
          new Paragraph({
            spacing: { before: 100, after: 120 },
            children: [new TextRun({ text: codeToken.text, font: 'Courier New' })],
          }),
        );
        break;
      }
      case 'hr': {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 120, after: 120 },
            border: {
              bottom: {
                color: 'D6D3D1',
                size: 6,
                style: BorderStyle.SINGLE,
                space: 4,
              },
            },
          }),
        );
        break;
      }
      case 'space':
        break;
      default: {
        if ('text' in token && typeof token.text === 'string' && token.text.trim()) {
          paragraphs.push(
            new Paragraph({
              spacing: { after: 120 },
              children: [new TextRun({ text: token.text.trim() })],
            }),
          );
        }
        break;
      }
    }
  }

  return paragraphs;
}

function buildMetadataLine(recipe: Recipe): string {
  const parts: string[] = [
    `Kategorie: ${CATEGORY_LABELS[recipe.category]}`,
    recipe.healthy ? 'Zdravé' : 'Nezdravé',
  ];

  if (recipe.prepTime) {
    parts.push(`Čas: ${recipe.prepTime}`);
  }
  if (recipe.servings) {
    parts.push(`Porce: ${recipe.servings}`);
  }
  if (recipe.tags.length > 0) {
    parts.push(`Tagy: ${recipe.tags.join(', ')}`);
  }

  return parts.join('  •  ');
}

export function buildRecipeDocxBlocks(
  recipe: Recipe,
  options: { pageBreakBefore?: boolean } = {},
): Paragraph[] {
  const titleParagraph = new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: options.pageBreakBefore ?? false,
    spacing: { after: 100 },
    children: [new TextRun({ text: recipe.title, bold: true })],
  });

  const metaParagraph = new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({
        text: buildMetadataLine(recipe),
        italics: true,
        color: '57534E',
        size: 20,
      }),
    ],
  });

  const tokens = marked.lexer(recipe.content);
  const contentParagraphs = blockTokensToParagraphs(tokens);

  return [titleParagraph, metaParagraph, ...contentParagraphs];
}

export function createCookbookDocument(
  recipes: readonly Recipe[],
  title = 'Kuchařka',
): Document {
  const children = recipes.flatMap((recipe, index) =>
    buildRecipeDocxBlocks(recipe, { pageBreakBefore: index > 0 }),
  );

  return new Document({
    title,
    creator: 'Kuchařka SPA',
    sections: [
      {
        children,
      },
    ],
  });
}

export async function exportRecipeToDocx(recipe: Recipe): Promise<void> {
  const doc = createCookbookDocument([recipe], recipe.title);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${recipe.slug}.docx`);
}

export async function exportCookbookToDocx(recipes: readonly Recipe[]): Promise<void> {
  const ordered = getRecipesOrderedForCookbook(recipes);
  const doc = createCookbookDocument(ordered, 'Kuchařka');
  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'kucharka.docx');
}
