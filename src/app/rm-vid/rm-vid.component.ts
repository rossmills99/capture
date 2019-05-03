import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

/** Inspired by: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#Embedded_workers */
function effectToUrl(fn) {
  const blob = new Blob(['onmessage = (e) => { postMessage(('+fn.toString()+')(e.data)); }'], {type: 'application/javascript'});
  return URL.createObjectURL(blob)
}

export interface IVidDescription {
  video: HTMLVideoElement,
  effect: (any) => any,
  title: string,
  suppressWebWorker?: boolean
}

@Component({
  selector: 'rm-vid',
  templateUrl: './rm-vid.component.html',
  styleUrls: ['./rm-vid.component.css']
})
export class RmVidComponent implements OnInit {

  @Input() vid: IVidDescription;
  @ViewChild('canvas') canvas: ElementRef;

  constructor() { }

  ngOnInit() {
    const w = this.vid.video.clientWidth;
    const h = this.vid.video.clientHeight;
    const canvas = <HTMLCanvasElement>this.canvas.nativeElement;
    const vid = this.vid;
    
    canvas.width = w;
    canvas.height = h;

    const bcanvas = document.createElement('canvas');
    bcanvas.width = w;
    bcanvas.height = h

    const context: CanvasRenderingContext2D = canvas.getContext('2d');
    const bcontext: CanvasRenderingContext2D = bcanvas.getContext('2d');

    const attemptedFps = 25;
    const attemptedRedrawMs = 1000 / attemptedFps;
    
    let webWorker: Worker;
    if (!vid.suppressWebWorker) {
      const webWorkerUrl = effectToUrl(vid.effect);
      webWorker = new Worker(webWorkerUrl);
      
      webWorker.onmessage = (e) => {
        context.putImageData(e.data, 0, 0);
        setTimeout(draw, attemptedRedrawMs, video, context, bcontext, w, h);
      };
    }

    const draw = (video, context: CanvasRenderingContext2D, bcontext: CanvasRenderingContext2D, w: number, h: number) => {
      if(video.paused || video.ended) {
        console.log("video paused/ended");
        return false;
      }
      bcontext.drawImage(video, 0, 0, w, h);

      const idata = bcontext.getImageData(0, 0, w, h);

      if (vid.suppressWebWorker) {
        const effected = vid.effect(idata);
        context.putImageData(effected, 0, 0);
        setTimeout(draw, attemptedRedrawMs, video, context, bcontext, w, h);
      }
      else {
        webWorker.postMessage(idata);
      }
    };
    
    const video = vid.video;
    video.addEventListener('play', () => {
      draw(video, context, bcontext, w, h);	
    });
  }
}
