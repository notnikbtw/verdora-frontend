import type { FooterSection } from '@/types/footer';

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Shop',
    type: 'links',
    items: [
      { name: 'All Products', href: '/catalog' },
      { name: 'Discounts & Sales', href: '/catalog?discount=true' },
    ],
  },
  {
    title: 'Contact us',
    type: 'contact',
    items: [
      {
        type: 'email',
        value: 'vedora@gmail.com',
        href: 'mailto:vedora@gmail.com',
      },
      {
        type: 'phone',
        value: '+380984769000',
        href: 'tel:+380984769000',
      },
      {
        type: 'address',
        value: 'New Scotland Avenue St. 567, Albany',
      },
    ],
  },
];

export const SHOP_LINKS = [
  { text: 'All Products', to: '/catalog' },
  { text: 'Discounts & Sales', to: '/catalog?discount=true' },
];
