export const ALLOWED_COMPONENT_TYPES = [
  'Container',
  'Card',
  'Button',
  'Text',
  'Heading',
  'Input',
  'Image',
  'NavHeader',
] as const;

export const CONTAINER_COMPONENT_TYPES = new Set(['Container', 'Card']);

export const isContainerType = (type: string) => CONTAINER_COMPONENT_TYPES.has(type);
