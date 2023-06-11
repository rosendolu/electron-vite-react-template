interface Window {
  $bridge: {
    versions: {
      node: string;
      chrome: string;
      electron: string;
    };
    msg: {
      hello: () => string;
    };
  };
}
