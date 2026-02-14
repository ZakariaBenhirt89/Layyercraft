export type LayoutConfig = {
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  padding?: string;
  width?: string;
  height?: string;
};

export type Behavior = {
  id: string;
  trigger: 'onClick' | 'onHover' | 'onFocus' | 'onLoad';
  action: 'navigate' | 'toggle' | 'submit' | 'custom';
  target?: string;
  params?: Record<string, any>;
};

export type ComponentNode = {
  id: string;
  type: string;
  props: Record<string, any>;
  children: ComponentNode[];
  behaviors?: Behavior[];
  layoutConfig?: LayoutConfig;
  parentId?: string | null;
};
