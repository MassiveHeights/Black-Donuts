import { Device, Black, Orientation } from "black-engine";

export default function LP(landscape, portrait) {
  const viewport = Black.engine.viewport;

  if (viewport.orientationLock == true) {
    if (viewport.orientation === Orientation.UNIVERSAL) {
      const element = viewport.nativeElement;
      const size = element.getBoundingClientRect();
      return size.width > size.height ? landscape : portrait;
    } else {
      return viewport.orientation === Orientation.LANDSCAPE ? landscape : portrait;
    }
  }

  
  return viewport.isLandscape ? landscape : portrait;
}