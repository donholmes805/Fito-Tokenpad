import React from 'react';

function Footer(): React.ReactNode {
  const links = [
    { name: 'X', href: 'https://x.com/fitochain' },
    { name: 'Telegram', href: 'https://t.me/fitochain' },
    { name: 'Support', href: 'mailto:support@fitotechnology.com' },
  ];

  return (
    <footer className="mt-12 border-t border-slate-200 pt-8 text-center text-slate-500 text-sm">
      <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-2 mb-6">
        {links.map((link) => {
          const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
          return (
            <a
              key={link.name}
              href={link.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {link.name}
            </a>
          );
        })}
      </div>
      <p>
        Powered by <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-600 hover:text-slate-900">Google Gemini</a>.
      </p>
      <p className="mt-2">
        Always review and test generated smart contracts before deployment.
      </p>
    </footer>
  );
}

export default Footer;
