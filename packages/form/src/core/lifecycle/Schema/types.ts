export type ParsedSchema = Record<string, any>;

export type ParsedSchemas = ParsedSchema[];

export type Metadata = {
  path: string;
  setter: (...args: any[]) => any;
  propertyKey?: string;
  processedSetter?: (processedValue: any, jumpConsume?: boolean) => void;
};
