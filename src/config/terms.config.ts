export const TERMS_PAGE_TITLE = 'Terms of Service and Privacy Policy';
export const TERMS_CONTACT_EMAIL = 'vedora@gmail.com';

export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  lastUpdated: '2026-11-15',
  sections: [
    {
      id: 'collection',
      title: 'What we collect',
      text: 'your name, email, phone number, password and delivery address. If you log in with Google, we also receive your name and email from Google.',
    },
    {
      id: 'purpose',
      title: 'Why',
      text: 'to run your account, cart, orders and favorites. We don’t use your data for advertising and don’t sell or share it.',
    },
    {
      id: 'storage',
      title: 'Where',
      text: 'your data is stored on our hosting (GitHub Pages and Render). Your cart and login are kept in your browser.',
    },
    {
      id: 'demo-data',
      title: 'Tip',
      text: 'this is a demo project, so please use test data instead of your real details.',
    },
    {
      id: 'control',
      title: 'Your control',
      text: 'you can edit your profile or delete your account in your profile settings.',
    },
  ],
} as const;

export const TERMS_OF_SERVICE = {
  title: 'Terms of Service',
  notice: 'The Terms of Service have not been published yet.',
} as const;
