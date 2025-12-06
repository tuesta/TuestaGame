{
  description = "angular";
  nixConfig.bash-prompt = "[nix]λ. ";

  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  outputs = { self, flake-utils, nixpkgs }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in
      {
        devShells.default = with pkgs; mkShell {
          packages = [
            nodejs_24
            pnpm
          ];

          shellHook = ''
            alias viteRun="pnpm run dev -- --host 0.0.0.0 --port 3000"
          '';

        };
      });
}
