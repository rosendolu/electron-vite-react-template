interface Window {
  $bridge: {
    scrapper: any;
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
