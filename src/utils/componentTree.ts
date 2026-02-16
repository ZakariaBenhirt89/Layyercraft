import type { ComponentNode } from '../types/component';

export function addComponent(
  tree: ComponentNode[],
  component: ComponentNode,
  parentId?: string
): ComponentNode[] {
  if (!parentId) {
    return [...tree, component];
  }
  return tree.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...node.children, { ...component, parentId }],
      };
    }
    return { ...node, children: addComponent(node.children, component, parentId) };
  });
}

export function removeComponent(tree: ComponentNode[], id: string): ComponentNode[] {
  return tree
    .filter((node) => node.id !== id)
    .map((node) => ({
      ...node,
      children: removeComponent(node.children, id),
    }));
}

export function updateComponent(
  tree: ComponentNode[],
  id: string,
  updates: Partial<ComponentNode>
): ComponentNode[] {
  return tree.map((node) => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    return { ...node, children: updateComponent(node.children, id, updates) };
  });
}

export function mergeComponentUpdates(
  tree: ComponentNode[],
  id: string,
  updates: Partial<ComponentNode>
): ComponentNode[] {
  return tree.map((node) => {
    if (node.id === id) {
      return {
        ...node,
        ...updates,
        props: updates.props ? { ...node.props, ...updates.props } : node.props,
        layoutConfig: updates.layoutConfig
          ? { ...node.layoutConfig, ...updates.layoutConfig }
          : node.layoutConfig,
        children: updates.children ?? node.children,
      };
    }
    return { ...node, children: mergeComponentUpdates(node.children, id, updates) };
  });
}

export function findComponent(tree: ComponentNode[], id: string): ComponentNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const child = findComponent(node.children, id);
    if (child) return child;
  }
  return null;
}
