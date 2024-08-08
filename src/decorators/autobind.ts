// AutoBind decorator
export default function AutoBind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
  const originalDescriptor = descriptor.value;
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalDescriptor.bind(this);
    }
  };
  return newDescriptor;
}