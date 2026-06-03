{
  description = "ひづけサムネ — streaming/video thumbnail creation tool";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            nodejs_22
          ];

          shellHook = ''
            echo "hizuke-thumb dev shell"
            echo "  bun dev     — start dev server"
            echo "  bun build   — production build"
            echo "  bun test    — run tests"
          '';
        };
      }
    );
}
