# RestCountriesExample
Example implementation for Rest Countries API using a React "single page app" frontend which makes AJAX calls to server side code in PHP, which in turn uses Rest Countries API via cURL.
## How to Use
With PHP installed and its folder in your shell's PATH, run `runPhpBuiltinServer.bat` then the example will be live at `http://localhost:8000/` .
If you wish to run the command from the bat file manually instead of running the bat file, just be sure to do it in the same directory.
The command in the batch file attempts to use the `-c` option to enable the cURL extension, but it does it in a way that may only work on Windows. On other platforms you may need to edit the included php.ini with the appropriate extension_dir location for your platform.
