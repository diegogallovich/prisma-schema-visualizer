import * as monaco from 'monaco-editor';

export const configurePrismaLanguage = () => {
  monaco.languages.register({ id: 'prisma' });

  monaco.languages.setMonarchTokensProvider('prisma', {
    keywords: [
      'datasource', 'generator', 'model', 'enum', 'type', 'interface', 'relation',
      'fields', 'map', 'index', 'unique', 'default', 'updatedAt', 'id', 'autoincrement'
    ],
    typeKeywords: [
      'String', 'Boolean', 'Int', 'Float', 'DateTime', 'Json', 'BigInt', 'Decimal', 'Bytes'
    ],
    operators: ['=', '?', '!'],
    symbols:  /[=><!~?:&|+\-*\/\^%]+/,

    tokenizer: {
      root: [
        [/@?[a-zA-Z][\w$]*/, { 
          cases: { 
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@default': 'identifier' 
          } 
        }],
        { include: '@whitespace' },
        [/[{}()\[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
        [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/\d+/, 'number'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
      ],
      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\*/, 'comment', '@comment'],
        [/\/\/.*$/, 'comment'],
      ],
      comment: [
        [/[^\/*]+/, 'comment' ],
        [/\/\*/, 'comment', '@push' ],
        ["\\*/", 'comment', '@pop'  ],
        [/[\/*]/, 'comment' ]
      ],
    },
  });

  monaco.languages.setLanguageConfiguration('prisma', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
  });
};