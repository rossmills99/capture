import { Component, OnInit, ViewChild } from '@angular/core';
import { IVidDescription } from '../rm-vid/rm-vid.component';
import { VideoEffectsService } from '../video-effects.service';
let done = false;

@Component({
  selector: 'app-capture',
  templateUrl: './capture.component.html',
  styleUrls: ['./capture.component.css']
})
export class CaptureComponent implements OnInit {
  
  public playing: boolean = false;
  public vids: IVidDescription[] = [];

  private stream: MediaStream;
  
  @ViewChild('myVideo') video;

  constructor(private videoEffects: VideoEffectsService) {}

  play() {
    const video = this.video.nativeElement as HTMLVideoElement;
    this.playing = true;
    navigator.mediaDevices.getUserMedia(
      { // Options
        video: true, 
        audio: false
      }).then((localMediaStream) => { // Success
        this.stream = localMediaStream;
        // Fallback to src if srcObject is not supported: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
        try {
          video.srcObject = localMediaStream;
        }
        catch(ex) {
          video.src = URL.createObjectURL(this.stream);
        }
        video.addEventListener('canplay', () => {
          this.vids = [
            {
              video: video,
              effect: this.videoEffects.edgeDetect,
              title: "Edge detect"
            },
            {
              video: video,
              effect: this.videoEffects.splitMirror,
              title: "Mirror Split"
            },
            {
              video: video,
              effect: this.videoEffects.slices.bind(this.videoEffects),
              title: "Slices",
              suppressWebWorker: true
            },
            {
              video: video,
              effect: this.videoEffects.darkEdges,
              title: "Vignette"
            },
            {
              video: video,
              effect: this.videoEffects.mirror,
              title: "Mirror"
            },
            {
              video: video,
              effect: this.videoEffects.grey,
              title: "Greyscale"
            },
            {
              video: video,
              effect: this.videoEffects.red,
              title: "Redness"
            },
            {
              video: video,
              effect: this.videoEffects.blue,
              title: "Blueness"
            },
            // {
            //   video: video,
            //   effect: effects.green,
            //   title: "Greenness"
            // }
          ];
          video.play();
        });
      }).catch(function(err) { // Failure
        console.error('getUserMedia failed', err);
        alert('getUserMedia failed');
      });
  }
  
  stop() {
    this.stream.getTracks().forEach(track => track.stop());
  }
  
  ngOnInit() {
    
  }
}