{ pkgs }: {
	deps = [
   pkgs.youtube-dl
   pkgs.sox
		pkgs.nodejs-18_x
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn
    pkgs.replitPackages.jest
	];
}