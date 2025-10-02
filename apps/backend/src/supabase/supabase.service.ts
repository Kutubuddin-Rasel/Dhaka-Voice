import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;
  private bucket: string;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    // Ensure URL and Key are loaded before creating the client
    if (!url || !key) {
      throw new Error('Supabase URL or Service Role Key is missing from environment variables.');
    }

    // --- THIS IS THE FIX ---
    // Initialize the client and assign it to the class property
    this.client = createClient(url, key);
    // --- END OF FIX ---

    this.bucket = this.config.get<string>('SUPABASE_BUCKET', 'complaint-images');
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getBucket(): string {
    return this.bucket;
  }

  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string | null> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      // Suppress noisy storage errors (e.g., object not found) and return null
      return null;
    }
    return data.signedUrl;
  }
}