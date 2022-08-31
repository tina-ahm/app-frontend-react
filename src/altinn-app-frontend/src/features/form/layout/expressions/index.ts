import dot from 'dot-object';

import {
  ExpressionRuntimeError,
  LookupNotFound,
  NodeNotFoundWithoutContext,
  UnexpectedType,
} from 'src/features/form/layout/expressions/errors';
import { ExpressionContext } from 'src/features/form/layout/expressions/ExpressionContext';
import { asLayoutExpression } from 'src/features/form/layout/expressions/validation';
import type { ILayoutComponent, ILayoutGroup } from 'src/features/form/layout';
import type { ContextDataSources } from 'src/features/form/layout/expressions/ExpressionContext';
import type {
  BaseToActual,
  BaseValue,
  FuncDef,
  ILayoutExpression,
  ILayoutExpressionLookupFunctions,
  LayoutExpressionDefaultValues,
  ResolvedLayoutExpression,
} from 'src/features/form/layout/expressions/types';
import type { LayoutNode } from 'src/utils/layout/hierarchy';

export interface EvalExprOptions {
  defaultValue?: any;
  errorIntroText?: string;
}

export interface EvalExprInObjArgs<T> {
  input: T;
  node: LayoutNode<any> | NodeNotFoundWithoutContext;
  dataSources: ContextDataSources;
  defaults?: LayoutExpressionDefaultValues<T>;
  skipPaths?: Set<string | keyof T>;
}

/**
 * This function is the brains behind the useLayoutExpression() hook, as it will find any expressions inside a deep
 * object and resolve them.
 * @see useLayoutExpression
 */
export function evalExprInObj<T>(
  args: EvalExprInObjArgs<T>,
): ResolvedLayoutExpression<T> {
  if (!args.input) {
    return args.input as ResolvedLayoutExpression<T>;
  }

  return evalExprInObjectRecursive(
    args.input,
    args as Omit<EvalExprInObjArgs<T>, 'input'>,
    [],
  );
}

/**
 * Recurse through an input object/array/any, finds layout expressions and evaluates them
 */
function evalExprInObjectRecursive<T>(
  input: any,
  args: Omit<EvalExprInObjArgs<T>, 'input'>,
  path: string[],
) {
  if (typeof input !== 'object') {
    return input;
  }
  const pathString = path.join('.');
  if (args.skipPaths && args.skipPaths.has(pathString)) {
    return input;
  }

  if (Array.isArray(input)) {
    const newPath = [...path];
    const lastLeg = newPath.pop() || '';
    return input.map((item, idx) =>
      evalExprInObjectRecursive(item, args, [...newPath, `${lastLeg}[${idx}]`]),
    );
  }

  const expression = asLayoutExpression(input);
  if (expression) {
    return evalExprInObjectCaller(expression, args, path);
  }

  const out = {};
  for (const key of Object.keys(input)) {
    out[key] = evalExprInObjectRecursive(input[key], args, [...path, key]);
  }

  return out;
}

/**
 * Extracted function for evaluating expressions in the context of a larger object
 */
function evalExprInObjectCaller<T>(
  expr: ILayoutExpression,
  args: Omit<EvalExprInObjArgs<T>, 'input'>,
  path: string[],
) {
  const pathString = path.join('.');
  const nodeId =
    args.node instanceof NodeNotFoundWithoutContext
      ? args.node.nodeId
      : args.node.item.id;

  const exprOptions: EvalExprOptions = {
    errorIntroText: `Evaluated expression for '${pathString}' in component '${nodeId}'`,
  };

  if (args.defaults) {
    const defaultValue = dot.pick(pathString, args.defaults);
    if (typeof defaultValue !== 'undefined') {
      exprOptions.defaultValue = defaultValue;
    }
  }

  return evalExpr(expr, args.node, args.dataSources, exprOptions);
}

/**
 * Run/evaluate a layout expression. You have to provide your own context containing functions for looking up external
 * values. If you need a more concrete implementation:
 * @see evalExprInObj
 * @see useLayoutExpression
 */
export function evalExpr(
  expr: ILayoutExpression,
  node: LayoutNode<any> | NodeNotFoundWithoutContext,
  dataSources: ContextDataSources,
  options?: EvalExprOptions,
) {
  let ctx = ExpressionContext.withBlankPath(expr, node, dataSources);
  try {
    return innerEvalExpr(ctx);
  } catch (err) {
    if (err instanceof ExpressionRuntimeError) {
      ctx = err.context;
    }
    if (options && 'defaultValue' in options) {
      // When we know of a default value, we can safely print it as an error to the console and safely recover
      ctx.trace(err, {
        defaultValue: options.defaultValue,
        ...(options.errorIntroText
          ? { introText: options.errorIntroText }
          : {}),
      });
      return options.defaultValue;
    } else {
      // We cannot possibly know the expected default value here, so there are no safe ways to fail here except
      // throwing the exception to let everyone know we failed.
      throw new Error(ctx.prettyError(err));
    }
  }
}

function innerEvalExpr(context: ExpressionContext) {
  const expr = context.getExpr();

  const argTypes =
    expr.function in context.lookup
      ? ['string']
      : layoutExpressionFunctions[expr.function].args;
  const returnType =
    expr.function in context.lookup
      ? 'string'
      : layoutExpressionFunctions[expr.function].returns;

  const computedArgs = expr.args.map((arg, idx) => {
    const argContext = ExpressionContext.withPath(context, [
      ...context.path,
      `args[${idx}]`,
    ]);

    const argValue =
      typeof arg === 'object' && arg !== null ? innerEvalExpr(argContext) : arg;

    return castValue(argValue, argTypes[idx], argContext);
  });

  const actualFunc: (...args: any) => any =
    expr.function in context.lookup
      ? context.lookup[expr.function]
      : layoutExpressionFunctions[expr.function].impl;

  const returnValue = actualFunc.apply(context, computedArgs);
  return castValue(returnValue, returnType, context);
}

function castValue<T extends BaseValue>(
  value: any,
  toType: T,
  context: ExpressionContext,
): BaseToActual<T> {
  if (!(toType in layoutExpressionCastToType)) {
    throw new Error(`Cannot cast to type: ${JSON.stringify(toType)}`);
  }

  return layoutExpressionCastToType[toType].apply(context, [value]);
}

function defineFunc<Args extends BaseValue[], Ret extends BaseValue>(
  def: FuncDef<Args, Ret>,
): FuncDef<Args, Ret> {
  return def;
}

export const layoutExpressionFunctions = {
  equals: defineFunc({
    impl: (arg1, arg2) => arg1 === arg2,
    args: ['string', 'string'],
    returns: 'boolean',
  }),
  notEquals: defineFunc({
    impl: (arg1, arg2) => arg1 !== arg2,
    args: ['string', 'string'],
    returns: 'boolean',
  }),
  greaterThan: defineFunc({
    impl: (arg1, arg2) => {
      if (arg1 === null || arg2 === null) {
        return false;
      }

      return arg1 > arg2;
    },
    args: ['number', 'number'],
    returns: 'boolean',
  }),
  greaterThanEq: defineFunc({
    impl: (arg1, arg2) => {
      if (arg1 === null || arg2 === null) {
        return false;
      }

      return arg1 >= arg2;
    },
    args: ['number', 'number'],
    returns: 'boolean',
  }),
  lessThan: defineFunc({
    impl: (arg1, arg2) => {
      if (arg1 === null || arg2 === null) {
        return false;
      }

      return arg1 < arg2;
    },
    args: ['number', 'number'],
    returns: 'boolean',
  }),
  lessThanEq: defineFunc({
    impl: (arg1, arg2) => {
      if (arg1 === null || arg2 === null) {
        return false;
      }

      return arg1 <= arg2;
    },
    args: ['number', 'number'],
    returns: 'boolean',
  }),
};

export const layoutExpressionLookupFunctions: ILayoutExpressionLookupFunctions =
  {
    instanceContext: function (key) {
      return this.dataSources.instanceContext[key];
    },
    applicationSettings: function (key) {
      return this.dataSources.applicationSettings[key];
    },
    component: function (id) {
      const component = this.failWithoutNode().closest(
        (c) => c.id === id || c.baseComponentId === id,
      );
      if (
        component &&
        component.item.dataModelBindings &&
        component.item.dataModelBindings.simpleBinding
      ) {
        return this.dataSources.formData[
          component.item.dataModelBindings.simpleBinding
        ];
      }

      throw new LookupNotFound(
        this,
        'component',
        id,
        'or it does not have a simpleBinding',
      );
    },
    dataModel: function (path) {
      const newPath = this.failWithoutNode().transposeDataModel(path);
      return this.dataSources.formData[newPath] || null;
    },
  };

function isLikeNull(arg: any) {
  return arg === 'null' || arg === null || typeof arg === 'undefined';
}

export const layoutExpressionCastToType: {
  [Type in BaseValue]: (
    this: ExpressionContext,
    arg: any,
  ) => BaseToActual<Type>;
} = {
  boolean: function (arg) {
    if (typeof arg === 'boolean') {
      return arg;
    }
    if (typeof arg === 'string') {
      if (arg === 'true') return true;
      if (arg === 'false') return false;
      if (arg === '1') return true;
      if (arg === '0') return false;
    }
    if (typeof arg === 'number') {
      if (arg === 1) return true;
      if (arg === 0) return false;
    }
    if (isLikeNull(arg)) {
      return null;
    }
    throw new UnexpectedType(this, 'boolean', arg);
  },
  string: function (arg) {
    if (typeof arg === 'boolean' || typeof arg === 'number') {
      return JSON.stringify(arg);
    }
    if (isLikeNull(arg)) {
      return null;
    }

    return `${arg}`;
  },
  number: function (arg) {
    if (typeof arg === 'number' || typeof arg === 'bigint') {
      return arg as number;
    }
    if (typeof arg === 'string') {
      if (arg.match(/^\d+$/)) {
        return parseInt(arg, 10);
      }
      if (arg.match(/^[\d.]+$/)) {
        return parseFloat(arg);
      }
    }
    if (isLikeNull(arg)) {
      return null;
    }

    throw new UnexpectedType(this, 'number', arg);
  },
};

export const ExprDefaultsForComponent: LayoutExpressionDefaultValues<ILayoutComponent> =
  {
    readOnly: false,
    required: false,
    hidden: false,
  };

export const ExprDefaultsForGroup: LayoutExpressionDefaultValues<ILayoutGroup> =
  {
    ...ExprDefaultsForComponent,
    edit: {
      addButton: true,
      deleteButton: true,
      saveButton: true,
    },
  };