import React from 'react';

import { GenericComponent } from 'src/layout/GenericComponent';
import { DisplayGroupContainer } from 'src/layout/Group/DisplayGroupContainer';
import { RepeatingGroupContainer } from 'src/layout/Group/RepeatingGroupContainer';
import { RepeatingGroupProvider } from 'src/layout/Group/RepeatingGroupContext';
import { RepeatingGroupsFocusProvider } from 'src/layout/Group/RepeatingGroupsFocusContext';
import { RepeatingGroupsLikertContainer } from 'src/layout/Likert/RepeatingGroupsLikertContainer';
import { PanelGroupContainer } from 'src/layout/Panel/PanelGroupContainer';
import { PanelReferenceGroupContainer } from 'src/layout/Panel/PanelReferenceGroupContainer';
import type { PropsFromGenericComponent } from 'src/layout';

export type GroupRendererProps = PropsFromGenericComponent<'Group'>;

export function GroupRenderer({ node }: GroupRendererProps) {
  if (node.isRepGroupLikert()) {
    return <RepeatingGroupsLikertContainer node={node} />;
  }

  if (node.isRepGroup()) {
    return (
      <RepeatingGroupsFocusProvider>
        <RepeatingGroupProvider node={node}>
          <RepeatingGroupContainer
            node={node}
            key={node.item.id}
          />
        </RepeatingGroupProvider>
      </RepeatingGroupsFocusProvider>
    );
  }

  // panel with groupReference
  if (node.isNonRepPanelGroup() && node.item.panel.groupReference) {
    return (
      <PanelReferenceGroupContainer
        key={node.item.id}
        node={node}
      />
    );
  }

  // regular panel group
  if (node.isNonRepPanelGroup()) {
    return (
      <PanelGroupContainer
        key={node.item.id}
        node={node}
      />
    );
  }

  // Treat as regular components
  if (node.isNonRepGroup()) {
    return (
      <DisplayGroupContainer
        key={node.item.id}
        groupNode={node}
        renderLayoutNode={(n) => (
          <GenericComponent
            key={n.item.id}
            node={n}
          />
        )}
      />
    );
  }

  // Invalid configuration
  window.logErrorOnce(`Group ${node.item.id} has an invalid configuration.`);
  return null;
}
