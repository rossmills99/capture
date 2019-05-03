import { Injectable } from '@angular/core';

@Injectable()
export class VideoEffectsService {

  constructor() {
  }

  // Inspired by https://github.com/ytiurin/imagefilter/blob/master/apply-filter.js
  edgeDetect(idata) {
    const kernel = [
      [0, -1, 0],
      [-1, 4, -1],
      [0, -1, 0]
    ];

    const width = idata.width;
    const height = idata.height;
    const data = idata.data;

    const newImageData = new ImageData(width, height);

    const kernelLength = kernel.length;
    const kernelHalf = Math.floor(kernel.length / 2);

    for (let imageDataIdx = 0; imageDataIdx < data.length; imageDataIdx++) {
      const pixelChannel = (imageDataIdx % 4);
      const pixelIdx = Math.floor(imageDataIdx / 4);

      // skip alpha channel
      if (pixelChannel === 3) {
        newImageData.data[imageDataIdx] = data[imageDataIdx];
        continue;
      }

      const pixelY = Math.floor(pixelIdx / width);
      const pixelX = (pixelIdx % width);
      let imageDataVal = 0.5;

      // Iterate weights row
      for (let kernelY = 0; kernelY < kernelLength; kernelY++) {
        let gY = pixelY + kernelY - kernelHalf;
        gY = gY < 0 ? 0 : (gY >= height ? height - 1 : gY);
        // continue
        // Iterate weights column in row
        for (let kernelX = 0; kernelX < kernelLength; kernelX++) {
          let gX = pixelX + kernelX - kernelHalf;
          gX = gX < 0 ? 0 : (gX >= width ? width - 1 : gX);

          imageDataVal += data[gY * width * 4 + gX * 4 + pixelChannel]
            * kernel[kernelY][kernelX];
        }
      }
      newImageData.data[imageDataIdx] = imageDataVal;
    }

    return newImageData;
  }

  grey(idata) {
    const data = idata.data;
    let limit = data.length - 4;

    while (limit -= 4) {
      const greyAvg = data[limit] + data[limit + 1] * 3 + data[limit + 2] * 4 >>> 3;
      data[limit] = greyAvg;
      data[limit + 1] = greyAvg;
      data[limit + 2] = greyAvg;
    }
    return new ImageData(data, idata.width);
  }

  red(idata) {
    const data = idata.data;
    let limit = data.length - 4;

    while (limit -= 4) {
      data[limit] += 100;
      data[limit + 1] -= 30;
      data[limit + 2] -= 30;
    }

    return new ImageData(data, idata.width);
  }

  green(idata) {
    const data = idata.data;
    let limit = data.length - 4;

    while (limit -= 4) {
      data[limit] -= 30;
      data[limit + 1] += 100;
      data[limit + 2] -= 30;
    }

    return new ImageData(data, idata.width);
  }

  blue(idata) {
    const data = idata.data;
    let limit = data.length - 4;

    while (limit -= 4) {
      data[limit] -= 30;
      data[limit + 1] -= 30;
      data[limit + 2] += 100;
    }

    return new ImageData(data, idata.width);
  }

  mirror(idata) {
    const data = idata.data;
    const limit = data.length;
    const contextWidth = idata.width;
    const trueWidth = contextWidth * 4;
    const halfRow = Math.floor(trueWidth / 2);
    const numRows = limit / trueWidth;
    for (let row = 0; row < numRows; row++) {
      for (let i = 0; i < halfRow; i += 4) {
        const offset = row * trueWidth;
        const r = data[offset + i];
        const g = data[offset + i + 1];
        const b = data[offset + i + 2];
        const o = data[offset + i + 3];

        const rightPos = offset + trueWidth - i - 4;
        const swapR = data[rightPos];
        const swapG = data[rightPos + 1];
        const swapB = data[rightPos + 2];
        const swapO = data[rightPos + 3];

        data[offset + i] = swapR;
        data[offset + i + 1] = swapG;
        data[offset + i + 2] = swapB;
        data[offset + i + 3] = swapO;

        data[rightPos] = r;
        data[rightPos + 1] = g;
        data[rightPos + 2] = b;
        data[rightPos + 3] = o;
      }
    }
    return new ImageData(data, idata.width);
  }

  splitMirror(idata) {
    const data = idata.data;
    const limit = data.length;
    const contextWidth = idata.width;
    const trueWidth = contextWidth * 4;
    const halfRow = Math.floor(trueWidth / 2);
    const numRows = limit / trueWidth;
    for (let row = 0; row < numRows; row++) {
      for (let i = 0; i < halfRow; i += 4) {
        const offset = row * trueWidth;
        const r = data[offset + i];
        const g = data[offset + i + 1];
        const b = data[offset + i + 2];
        const o = data[offset + i + 3];

        const rightPos = offset + trueWidth - i - 4;
        const swapR = data[rightPos];
        const swapG = data[rightPos + 1];
        const swapB = data[rightPos + 2];
        const swapO = data[rightPos + 3];

        data[offset + i] = swapR;
        data[offset + i + 1] = swapG;
        data[offset + i + 2] = swapB;
        data[offset + i + 3] = swapO;
      }
    }
    return new ImageData(data, idata.width);
  }

  darkEdges(idata) {
    const data = idata.data;
    const limit = data.length;
    const trueWidth = idata.width * 4;
    const rows = limit / trueWidth;
    const middleRow = rows / 2;
    const middleWidth = trueWidth / 2;

    for (let row = 0; row < rows; row++) {
      const offset = row * trueWidth;
      for (let i = 0; i < trueWidth; i += 4) {
        const it = offset + i;
        let inc = -(Math.abs(middleRow - row) / middleRow) * 180;
        inc = inc + -(Math.abs(middleWidth - i) / middleWidth) * 180;

        data[it] = (data[it] - inc);
        data[it + 1] = data[it + 1] - inc;
        data[it + 2] = data[it + 2] - inc;
      }
    }
    return new ImageData(data, idata.width);
  }

  private variance = 0;
  slices(idata) {
    console.log('what is this', this);
    this.variance = (this.variance + 5) % 629 + 1;
    const numSlices = 40;

    const data = idata.data;
    const trueWidth = idata.width * 4;
    const limit = data.length;
    const rows = limit / trueWidth;
    const rowsPerSlice = Math.ceil(rows / numSlices);
    const sliceLen = rowsPerSlice * trueWidth;

    const shift = this.variance ? this.variance : 5;
   
    let shiftAmount = shift * 4;

    for (let sliceStart = 0; sliceStart < limit; sliceStart += sliceLen) {
      // Used to determine slice shift direction
      shiftAmount = -shiftAmount;
      if (sliceStart % trueWidth != 0) throw 'invalid sliceStart';
      for (let rowStart = 0; rowStart < sliceLen; rowStart += trueWidth) {

        if (rowStart % trueWidth != 0) throw 'invalid rowStart';
        const hold = [];
        for (let i = 0; i < trueWidth; i += 4) {
          const swapOffset = i + shiftAmount < 0 ?
            trueWidth + (i + shiftAmount) :
            (i + shiftAmount) % trueWidth;

          const swapIdx = sliceStart + rowStart + swapOffset;

          hold[i] = data[swapIdx];
          hold[i + 1] = data[swapIdx + 1];
          hold[i + 2] = data[swapIdx + 2];
          hold[i + 3] = data[swapIdx + 3];
        }
        for (let j = 0; j < hold.length; j += 4) {
          const idx2 = sliceStart + rowStart + j;
          data[idx2] = hold[j];
          data[idx2 + 1] = hold[j + 1];
          data[idx2 + 2] = hold[j + 2];
          data[idx2 + 3] = hold[j + 3];
        }
      }
    }

    return new ImageData(data, idata.width);
  }  
}
