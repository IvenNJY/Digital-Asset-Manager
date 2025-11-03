// types.ts
export type Version = {
  version_id: number;
  version_number: number;
  uploaded_by: string;
  uploaded_at: string;
  changes_note: string;
  file_path: string;
  size_bytes?: number;
  snapshot: {
    asset: {
      name: string;
      description?: string;
      asset_type: string;
    };
    metadata: Array<{ key: string; value: string; data_type: string }>;
    tags: string[];
  };
};