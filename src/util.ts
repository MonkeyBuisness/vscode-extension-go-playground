import 'reflect-metadata';

export interface Type<T> {
    new(...args: any[]): T;
}

export const Injector = new class {
  resolve<T>(target: Type<any>): T {
    // tokens are required dependencies, while injections are resolved tokens from the Injector
    let tokens = Reflect.get(target, 'design:paramtypes') || [],
      injections = tokens.map((token: any) => Injector.resolve<any>(token));

    return new target(...injections);
  }
};
