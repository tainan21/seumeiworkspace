import type { ReactNode } from 'react';
import Body from '../Body';
import type { Background } from '../Body';
import Footer from './Footer';
import Navigation from './Navigation';

export default function Container({
  children,
  background = 'base',
}: {
  children: ReactNode;
  background?: Background;
}) {
  return (
    <Body background={background}>
      <Navigation />
      <div className="flex flex-col justify-between lg:items-center">
        {children as any}
        <Footer />
      </div>
    </Body>
  );
}
