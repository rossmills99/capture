import { TestBed, inject } from '@angular/core/testing';

import { VideoEffectsServiceService } from './video-effects-service.service';

describe('VideoEffectsServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VideoEffectsServiceService]
    });
  });

  it('should be created', inject([VideoEffectsServiceService], (service: VideoEffectsServiceService) => {
    expect(service).toBeTruthy();
  }));
});
