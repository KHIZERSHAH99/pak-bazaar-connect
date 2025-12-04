declare module 'postscribe' {
  function postscribe(
    element: Element | string,
    html: string,
    options?: {
      done?: () => void;
      error?: (error: Error) => void;
      releaseAsync?: boolean;
    }
  ): void;
  export default postscribe;
}
