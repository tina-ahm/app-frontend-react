import React from 'react';

import { Button } from '@digdir/designsystemet-react';

import type { PropsFromGenericComponent } from '..';

import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { ButtonColor, ButtonVariant } from 'src/layout/Button/WrappedButton';
import type { LinkStyle } from 'src/layout/Link/config.generated';

export const buttonStyles: {
  [style in Exclude<LinkStyle, 'link'>]: { color: ButtonColor; variant: ButtonVariant };
} = {
  primary: { variant: 'primary', color: 'success' },
  secondary: { variant: 'secondary', color: 'first' },
};

export type ILinkComponent = PropsFromGenericComponent<'Link'>;

export function LinkComponent({ node }: ILinkComponent) {
  const { id, style, openInNewTab, textResourceBindings } = node.item;
  const { langAsString } = useLanguage();
  const parentIsPage = node.parent instanceof LayoutPage;

  if (style === 'link') {
    return (
      <div style={{ marginTop: parentIsPage ? 'var(--button-margin-top)' : undefined }}>
        <a
          id={`link-${id}`}
          href={langAsString(textResourceBindings?.target)}
          target={openInNewTab ? '_blank' : undefined}
          rel={openInNewTab ? 'noreferrer' : undefined}
        >
          <Lang id={textResourceBindings?.title} />
        </a>
      </div>
    );
  } else {
    const { color, variant } = buttonStyles[style];

    return (
      <Button
        id={`link-${id}`}
        style={{ marginTop: parentIsPage ? 'var(--button-margin-top)' : undefined }}
        color={color}
        variant={variant}
        size='small'
        onClick={() => window.open(langAsString(textResourceBindings?.target), openInNewTab ? '_blank' : '_self')}
      >
        <Lang id={textResourceBindings?.title} />
      </Button>
    );
  }
}
