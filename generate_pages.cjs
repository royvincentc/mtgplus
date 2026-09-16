const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir);

const pages = [
  'WelcomePage',
  'DashboardPage',
  'RoomsPage',
  'DecksPage',
  'DeckEditorPage',
  'ProfilePage',
  'CardsPage',
  'CommunityPage',
  'AssistantPage',
];

pages.forEach(page => {
  const content = `import React from 'react';

export const ${page}: React.FC = () => {
  return (
    <div className="p-8 w-full h-full text-white">
      <h1 className="text-3xl font-bold text-[#b8860b] mb-4">${page.replace('Page', '')}</h1>
      <p className="text-gray-400">This feature is currently under construction.</p>
    </div>
  );
};
`;
  fs.writeFileSync(path.join(pagesDir, `${page}.tsx`), content);
});

console.log('Pages generated!');
