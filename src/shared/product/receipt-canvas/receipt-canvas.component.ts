import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AsyncSubject,
  BehaviorSubject,
  combineLatest,
  merge,
  ReplaySubject,
  Subject,
} from 'rxjs';
import {
  switchMap,
  takeUntil,
  tap,
  take,
  filter,
  map,
  shareReplay,
} from 'rxjs/operators';

interface WriteTextOption {
  text: string;
  fontSize: number;
  fontStyle: 'bold' | 'normal';
}

@Component({
  selector: 'app-receipt-canvas',
  templateUrl: './receipt-canvas.component.html',
  styleUrls: ['./receipt-canvas.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ReceiptCanvasComponent implements OnInit, OnDestroy {
  @ViewChild('canvasEl', { read: ElementRef }) set canvasEl(
    el: ElementRef<HTMLCanvasElement> | null
  ) {
    if (el) {
      this.canvasEl$.next(el);
    }
  }

  get canvasEl() {
    return this.canvasEl$.value;
  }

  @ViewChild('qrCodePayment', { read: ElementRef })
  qrCodePaymentRef!: ElementRef<HTMLImageElement>;

  canvasEl$ = new BehaviorSubject<ElementRef<HTMLCanvasElement> | null>(null);
  onLoadedCanvasElement$ = this.canvasEl$.pipe(
    filter((el): el is ElementRef<HTMLCanvasElement> => el !== null),
    map((ref) => ref.nativeElement),
    shareReplay(1)
  );
  onWriteText$ = new Subject<WriteTextOption>();

  onDrawQrCode$ = new Subject<void>();

  onNewline$ = new Subject<{ fontSize: number }>();

  onDestroy$ = new AsyncSubject<void>();

  onDownload$ = new Subject<void>();

  onClearReceipt$ = new Subject<void>();

  topOffset = 0;
  height$ = new ReplaySubject<number>(1);

  constructor() {
    combineLatest({ canvas: this.onLoadedCanvasElement$, height: this.height$ })
      .pipe(
        switchMap(({ canvas, height }) => {
          const qrPaymentImage = this.qrCodePaymentRef.nativeElement;
          canvas.width = qrPaymentImage.width + 32;
          canvas.height = height;
          canvas.style.backgroundColor = 'white';

          const writeText$ = this.writeTextOnCanvas(canvas);
          const qrPayment$ = this.drawQrCodeOnCanvas(canvas);
          const downloadReceipt$ = this.downloadOnCanvas(canvas);
          const newline$ = this.newlineOnCanvas(canvas);
          const clearReceipt$ = this.clearReceiptOnCanvas(canvas);
          return merge(
            writeText$,
            qrPayment$,
            downloadReceipt$,
            newline$,
            clearReceipt$
          );
        }),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }
  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {}

  writeText(text: string) {
    this.onWriteText$.next({ text, fontSize: 16, fontStyle: 'normal' });
  }

  writeHeadText(text: string) {
    this.onWriteText$.next({ text, fontSize: 16, fontStyle: 'bold' });
  }

  drawQrCode() {
    this.onDrawQrCode$.next();
  }

  download() {
    this.onDownload$.next();
  }

  newline() {
    this.onNewline$.next({ fontSize: 16 });
  }

  clearReceipt() {
    this.onClearReceipt$.next();
  }

  writeReceiptDate() {
    const receiptDate = new Date().toLocaleDateString('th-TH');
    this.writeText(`receipt date: ${receiptDate}`);
  }

  private drawBackground(
    canvas: HTMLCanvasElement,
    option: { x: number; y: number; height: number }
  ) {
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    const qrPaymentImage = this.qrCodePaymentRef.nativeElement;

    const maxWidthScreen = qrPaymentImage.width + 32;
    ctx.fillRect(option.x, option.y, maxWidthScreen, option.height);
    ctx.fill();
  }

  private newlineOnCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');

    return this.onNewline$.pipe(
      tap(({ fontSize }) => {
        const newlineMarginTop = fontSize / 2;
        this.drawBackground(canvas, {
          x: 0,
          y: this.topOffset,
          height: newlineMarginTop,
        });
        // new line
        this.topOffset += newlineMarginTop;
      })
    );
  }

  private clearReceiptOnCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;

    return this.onClearReceipt$.pipe(
      tap(() => {
        this.topOffset = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      })
    );
  }

  clearCanvas() {
    const canvas = this.canvasEl!.nativeElement;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.height = 0;
  }

  calNewline(topOffset: number) {
    const fontSize = 16;
    const newlineMarginTop = fontSize / 2;
    return topOffset + newlineMarginTop;
  }

  calDrawQrCode(topOffset: number) {
    const newlineMarginTop = 20;
    const qrPaymentImage = this.qrCodePaymentRef.nativeElement;

    const backgroundHeight = newlineMarginTop + qrPaymentImage.height + 16;
    return topOffset + backgroundHeight;
  }

  calWriteNormalText(topOffset: number, text: string) {
    return this.calWriteText(topOffset, {
      text,
      fontSize: 16,
      fontStyle: 'normal',
    });
  }

  calWriteHeadText(topOffset: number, text: string) {
    return this.calWriteText(topOffset, {
      text,
      fontSize: 16,
      fontStyle: 'bold',
    });
  }

  calWriteText(topOffset: number, option: WriteTextOption) {
    const { fontSize } = option;
    const newlineMarginTop = fontSize / 2;
    const newlineBeforeWriteText = fontSize;
    const newlineMarginBottom = newlineMarginTop;
    let height = 0;

    if (topOffset === 0) {
      height += newlineBeforeWriteText;
    }
    height += newlineMarginTop + newlineBeforeWriteText;
    return topOffset + height;
  }

  private writeTextOnCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;

    return this.onWriteText$.pipe(
      tap(({ text, fontSize, fontStyle }) => {
        const newlineMarginTop = fontSize / 2;
        const newlineBeforeWriteText = fontSize;
        const newlineMarginBottom = newlineMarginTop;
        if (this.topOffset === 0) {
          this.drawBackground(canvas, {
            x: 0,
            y: 0,
            height: newlineBeforeWriteText,
          });
        }
        this.drawBackground(canvas, {
          x: 0,
          y: this.topOffset + newlineBeforeWriteText,
          height:
            newlineMarginTop + newlineBeforeWriteText + newlineMarginBottom,
        });
        // new line
        this.topOffset += newlineMarginTop;

        ctx.textAlign = 'left';
        ctx.font = `${fontStyle} ${fontSize}px tahoma`;
        this.topOffset += newlineBeforeWriteText;

        ctx.fillStyle = 'black';
        ctx.fillText(text, 16, this.topOffset);
      })
    );
  }

  private drawQrCodeOnCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;

    return this.onDrawQrCode$.pipe(
      tap(() => {
        const newlineMarginTop = 20;
        const qrPaymentImage = this.qrCodePaymentRef.nativeElement;

        const qrImageHeight = qrPaymentImage.height + 16;
        const backgroundHeight = newlineMarginTop + qrImageHeight;

        this.drawBackground(canvas, {
          x: 0,
          y: this.topOffset,
          height: backgroundHeight,
        });
        // new line
        this.topOffset += newlineMarginTop;

        ctx.drawImage(qrPaymentImage, 16, this.topOffset);

        this.topOffset += qrPaymentImage.height;
      })
    );
  }

  private downloadOnCanvas(canvas: HTMLCanvasElement) {
    return this.onDownload$.pipe(
      tap(() => {
        const data = canvas.toDataURL('image/png');
        const anchor = document.createElement('a');
        anchor.href = data;
        anchor.download = 'receipt.png';
        anchor.click();
        setTimeout(() => {
          anchor.remove();
        });
      })
    );
  }
}
