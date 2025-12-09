declare module "latex.js" {
  export class Generator {
    constructor(options?: Record<string, any>);
    domFragment(): { innerHTML: string };
  }
  export function parse(
    latex: string,
    options?: { generator?: Generator },
  ): void;
}
