import { components, ComponentType } from 'src/layout/index';
import type { SummaryLookups } from 'src/components/summary/SummaryContext';
import type { PropsFromGenericComponent } from 'src/layout/index';
import type { ComponentSummaryData, ComponentTypes, RegularComponent } from 'src/layout/layout';
import type { NodeOf } from 'src/utils/layout/hierarchy.types';

export interface SummaryRendererProps<Type extends RegularComponent> {
  targetNode: NodeOf<'resolved', Type>;
  lookups: SummaryLookups; // TODO: Get this from the context, not directly from props?
}

export abstract class LayoutComponent<Type extends RegularComponent, SummaryData = ComponentSummaryData<Type>> {
  /**
   * Given properties from GenericComponent, render this layout component
   */
  abstract render(props: PropsFromGenericComponent<Type>): JSX.Element | null;

  /**
   * Direct render? Override this and return true if you want GenericComponent to omit rendering grid,
   * validation messages, etc.
   */
  directRender(_props: PropsFromGenericComponent<Type>): boolean {
    return false;
  }

  /**
   * Return false to render this component without the label (in GenericComponent.tsx)
   */
  renderWithLabel(): boolean {
    return true;
  }

  /**
   * Should GenericComponent render validation messages for simpleBinding outside of this component?
   * This has no effect if:
   *  - Your component renders directly, using directRender()
   *  - Your component uses a different data binding (you should handle validations yourself)
   */
  renderDefaultValidations(): boolean {
    return true;
  }

  /**
   * Is this a form component that has formData and should be displayed differently in summary/pdf?
   * Purly presentational components with no interaction should override and return ComponentType.Presentation.
   */
  getComponentType(): ComponentType {
    return ComponentType.Form;
  }

  /**
   * Given a node (with group-index-aware data model bindings) and some form data, this method should return
   * a proper 'value' for the current component/node. This is the same value as is passed to renderSummary().
   */
  abstract getSummaryData(props: SummaryRendererProps<Type>): SummaryData;

  /**
   * Given some SummaryData, render a summary for this component. For most components, this will either:
   *  1. Return a null (indicating that it's not possible to summarize the value in this component, or that it cannot
   *     possibly have a value attached to it). This is used for static components such as Header, Paragraph, Button.
   *     Hint: Your component is probably a PresentationLayoutComponent. Inherit that instead to avoid having to
   *     implement this.
   *  2. Return a <StringSummary node={node} data={data} />, for when the summary can be simply rendered as a string.
   */
  abstract renderSummary(props: SummaryRendererProps<Type>): JSX.Element | null;
}

/**
 * A presentation component describes all components that just present something statically, and never interface with
 * the data model or otherwise need to show data, render a summary, etc.
 */
export abstract class PresentationLayoutComponent<Type extends RegularComponent> extends LayoutComponent<Type, null> {
  getSummaryData(): null {
    return null;
  }

  renderSummary(): JSX.Element | null {
    return null;
  }
}

export function getLayoutComponentObject<T extends ComponentTypes | undefined>(
  type: T,
): T extends RegularComponent ? LayoutComponent<T, any> : undefined {
  const typeAsString = type as string;
  if (!(typeAsString in components)) {
    return undefined as any;
  }

  return components[typeAsString];
}
