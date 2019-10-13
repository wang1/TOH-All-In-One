import { Document } from 'mongoose';

export interface Hero extends Document {
  readonly no: string;
  readonly name: string;
  readonly salary?: number;
  readonly description?: string;
  readonly isTop?: boolean;
}
