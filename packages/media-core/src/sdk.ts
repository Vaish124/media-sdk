import { EventEmitter } from './emitter';
import { PexelsClient } from './client';
import type { MediaEvent, SDKConfig } from './types';

export class MediaSDK {
  readonly client: PexelsClient;
  private emitter = new EventEmitter<MediaEvent>();

  constructor(config: SDKConfig) {
    this.client = new PexelsClient(config);
    // Default listener — always present, always logs
    this.emitter.subscribe(event => {
      console.log(`[MediaSDK:${event.type}]`, {
        id: event.itemId,
        itemType: event.itemType,
        at: new Date(event.timestamp).toISOString(),
      });
    });
  }

  emit(event: Omit<MediaEvent, 'timestamp'>): void {
    this.emitter.emit({ ...event, timestamp: Date.now() });
  }

  subscribe(fn: (event: MediaEvent) => void): () => void {
    return this.emitter.subscribe(fn);
  }
}
