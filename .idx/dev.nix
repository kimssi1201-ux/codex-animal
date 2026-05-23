{ pkgs, ... }: {
    # Which nixpkgs channel to use.
    channel = "stable-23.11"; # or "unstable"
    # Use https://search.nixos.org/packages to find packages
    packages = [
      pkgs.nodejs_20
      pkgs.python3
      pkgs.pip
      pkgs.python3Packages.openai
    ];
    # Sets environment variables in the workspace
    env = {};
    # Fast way to run commands without creating a separate script.
    # Also see .idx/previews.json for preview definitions.
    onCreate = {
      # ExampleDevServer = "npm run dev";
    };
    # The image of the workspace. Use this to run custom commands when the
    # workspace is created.
    onCreate.init = '''
      # Example
      # npm install
    ''';
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = [
            "npm"
            "run"
            "dev"
          ];
          manager = "web";
        };
      };
    };
  }