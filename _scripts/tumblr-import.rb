require "jekyll-import";

JekyllImport::Importers::Tumblr.run({
    "url"            => "https://aymanbagabas.tumblr.com",
    "format"         => "html", # "md" misses links and images etc
	"grab_images"    => false,  # whether to download images as well.
	"add_highlights" => false,  # whether to wrap code blocks (indented 4 spaces) in a Liquid "highlight" tag
	"rewrite_urls"   => false   # whether to write pages that redirect from the old Tumblr paths to the new Jekyll paths

})
