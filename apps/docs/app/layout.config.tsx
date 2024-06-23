import Title from '@/components/title';
import { type BaseLayoutProps } from 'fumadocs-ui/layout';

// basic configuration here
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: <Title/>,
  },
  links: [
    {
      text: 'GitHub',
      url: 'https://github.com/sahilm416/anjum',
      active: 'nested-url',
    },
  ],
};
