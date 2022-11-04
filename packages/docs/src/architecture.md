- Development

  - SSR
    - Adapter does not read any manifest
    - Adapter calls SSR server
      - Adapter prepares page so it can resolve the dependencies via **absolute paths**
      - Adapter passes page client manifest to SSR server so it can generate the preload links
    - Adapter renders page
  - ## Client

- Production
  - SSR
    - Adapter reads SSR and client manifest
    - Adapter calls SSR server
      - Adapter prepares page using SSR manifest so it can resolve the **built** dependencies via **absolute paths**
      - Adapter passes page client manifest to SSR server so it can generate the preload links
    - Adapter renders page using client manifest
  - Client
