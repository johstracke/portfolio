import { z } from 'zod';
import {
  ContentBlockSchema,
  ProjectSchema,
  BlogPostSchema,
  ProfileSchema,
  TagSchema,
} from '@/lib/schemas';

export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Tag = z.infer<typeof TagSchema>;
