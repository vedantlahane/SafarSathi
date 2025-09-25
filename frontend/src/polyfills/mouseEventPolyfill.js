/**
 * Firefox emits deprecation warnings when legacy moz* MouseEvent extensions are accessed.
 * Leaflet and other libraries still probe these fields for backward compatibility.
 * We override the accessors to delegate to the modern PointerEvent APIs without
 * touching the native getter that triggers the console warning.
 */
if (typeof window !== 'undefined') {
  const MouseEventProto = window.MouseEvent && window.MouseEvent.prototype;

  const defineSafeProperty = (proto, prop, getter) => {
    if (!proto) return;

    const descriptor = Object.getOwnPropertyDescriptor(proto, prop);
    if (descriptor && !descriptor.configurable) {
      // If Firefox marks the property as non-configurable, we cannot redefine it safely.
      return;
    }

    try {
      Object.defineProperty(proto, prop, {
        configurable: true,
        enumerable: false,
        get: getter,
        set: () => {
          /* no-op setter: keeps API surface compatible */
        }
      });
    } catch (error) {
      // Silently ignore if the runtime prevents redefining the property.
    }
  };

  const pointerTypeToMozSource = (event) => {
    const type = event.pointerType || (typeof PointerEvent !== 'undefined' && event instanceof PointerEvent ? event.pointerType : undefined);

    switch (type) {
      case 'mouse':
        return 1; // MOZ_SOURCE_MOUSE
      case 'pen':
        return 2; // MOZ_SOURCE_PEN
      case 'touch':
        return 0; // MOZ_SOURCE_TOUCH
      default:
        return event.type && event.type.startsWith('mouse') ? 1 : 0;
    }
  };

  defineSafeProperty(MouseEventProto, 'mozPressure', function mozPressureShim() {
    if (typeof this.pressure === 'number') {
      return this.pressure;
    }
    // Fallback: approximate based on button state for older MouseEvents.
    return this.buttons ? 0.5 : 0;
  });

  defineSafeProperty(MouseEventProto, 'mozInputSource', function mozInputSourceShim() {
    if (typeof this.pointerId === 'number') {
      return pointerTypeToMozSource(this);
    }

    return this.type && this.type.startsWith('mouse') ? 1 : 0;
  });
}
