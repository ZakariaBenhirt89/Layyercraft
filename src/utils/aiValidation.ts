import type { ComponentNode } from '../types/component';
import { ALLOWED_COMPONENT_TYPES, isContainerType } from './componentTypes';

const MAX_NODES = 50;
const MAX_DEPTH = 5;

export type AIValidationResult = {
  valid: boolean;
  errors: string[];
  normalized: ComponentNode[];
};

const normalizeContentProps = (node: ComponentNode) => {
  const props = { ...node.props };
  if (props.children && !props.content) {
    props.content = props.children;
    delete props.children;
  }
  return props;
};

const ensureId = (node: ComponentNode, index: number) => {
  if (node.id && typeof node.id === 'string') return node.id;
  return `${node.type?.toLowerCase() || 'component'}-${Date.now()}-${index}`;
};

const normalizeNode = (
  node: ComponentNode,
  depth: number,
  index: number,
  errors: string[]
): ComponentNode => {
  if (depth > MAX_DEPTH) {
    errors.push(`Max depth ${MAX_DEPTH} exceeded.`);
  }

  const type = node.type;
  if (!ALLOWED_COMPONENT_TYPES.includes(type as any)) {
    errors.push(`Unknown component type: ${type}`);
  }

  const childrenArray = Array.isArray(node.children) ? node.children : [];
  if (!isContainerType(type) && childrenArray.length > 0) {
    errors.push(`Component type ${type} cannot have children.`);
  }
  const normalizedChildren = isContainerType(type)
    ? childrenArray.map((child, childIndex) => normalizeNode(child, depth + 1, childIndex, errors))
    : [];

  return {
    ...node,
    id: ensureId(node, index),
    type,
    props: normalizeContentProps(node),
    children: normalizedChildren,
  };
};

const countNodes = (nodes: ComponentNode[]): number =>
  nodes.reduce((total, node) => total + 1 + countNodes(node.children), 0);

const ensureUniqueIds = (nodes: ComponentNode[]) => {
  const seen = new Set<string>();
  const ensureNode = (node: ComponentNode, index: number): ComponentNode => {
    let id = node.id;
    if (seen.has(id)) {
      id = `${id}-${Date.now()}-${index}`;
    }
    seen.add(id);
    return {
      ...node,
      id,
      children: node.children.map((child, childIndex) => ensureNode(child, childIndex)),
    };
  };
  return nodes.map((node, index) => ensureNode(node, index));
};

export const validateAIComponents = (nodes: ComponentNode[]): AIValidationResult => {
  const errors: string[] = [];
  const normalized = nodes.map((node, index) => normalizeNode(node, 1, index, errors));
  const count = countNodes(normalized);

  if (count > MAX_NODES) {
    errors.push(`Max node count ${MAX_NODES} exceeded (${count}).`);
  }

  const uniqueNormalized = ensureUniqueIds(normalized);

  return {
    valid: errors.length === 0,
    errors,
    normalized: uniqueNormalized,
  };
};
