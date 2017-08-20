function wordpress_publish(mscript_name, img_location, img_format, author_name, copyright, options)
%wordpress_publish Publish M-script for Wordpress blog
%   wordpress_publish(mscript_name, img_location, img_format, author_name,
%   copyright, options) uses MATLAB's publish function with a custom XSL file to
%   create HTML suitable for copying into a Wordpress blog entry.  All input
%   arguments other than mscript_name are optional.
%
%   img_location is an optional string that will be prepended to the src
%   attribute for img tags.
%
%   img_format can be either 'png' or 'jpg'.  It specifies whether to 
%   capture figure screen shots as PNG or JPEG.
%
%   author_name, if nonempty, causes an author line to be added at the
%   end of the M-code launched by the "Get MATLAB code for this example
%   link."
%
%   copyright, if specified and nonempty, causes a copyright line to be added
%   at the end of the M-code launched by the "Get MATLAB code for this
%   example link." If not specified, a standard copyright is generated for
%   the current year (ie, Copyright 2009 The MathWorks, Inc.).
%
%   options is the OPTIONS struct to pass to PUBLISH and allows you to set
%   options in addition to ones already accessible from the input list such
%   as img_format.
%
%   The resulting HTML file is placed in a subdirectory called
%   wordpress_html, and the file is loaded automatically into the editor.
%   Any captured figure images are placed in the same directory.
%
%   Example
%   -------
%       wordpress_publish('image_synthesis', 'wp-content/images/19/', ...
%                         'png', 'Steve Eddins', ...
%                         'Copyright 2006 The MathWorks, Inc.')

% Steve Eddins

if nargin < 5 || ~isempty(copyright)
    %change: 1/9/09 rbemis
    %copyright = '';
    copyright = ['Copyright ',datestr(now,'yyyy'),' The MathWorks, Inc.'];
    %Help text expanded too, describing different default behavior.
    %end change
end

if nargin < 4
    author_name = '';
end

if nargin < 3 || isempty(img_format)
    img_format = 'png';
end

if nargin < 2
   img_location = '';
end

options.outputDir = 'wordpress_html';
options.stylesheet = 'mxdom2wordpresshtml.xsl';
options.imageFormat = img_format;

publish(mscript_name, options);

[pathstr, name] = fileparts(mscript_name);
html_name = fullfile(pathstr, options.outputDir, [name, '.html']);

html_str = getFileChars(html_name);

%change: 10/9/08 rbemis
%for absolute image locations remove "root folder" placeholder
html_str = strrep(html_str,'IMG_LOCATIONhttp://','http://');
%end change

html_str = regexprep(html_str, 'IMG_LOCATION', img_location);

html_str = regexprep(html_str, 'REPLACE_AUTHOR_NAME', author_name);

html_str = regexprep(html_str, 'REPLACE_COPYRIGHT', copyright);

html_str = strrep(html_str, '<script language="JavaScript">', sprintf('%s\n%s\n', '<script language="JavaScript">', '<!--'));

html_str = strrep(html_str, '</script>', sprintf('\n%s\n%s', '-->', '</script>'));

grab_code_id = getGrabCodeId();
html_str = regexprep(html_str, 'REPLACE_GRABCODE_ID', grab_code_id);

putFileChars(html_name, html_str);

edit(html_name);

%==========================================================================
function str = getGrabCodeId()

str = char(java.util.UUID.randomUUID());
str = strrep(str, '-', '');

%==========================================================================
function str = getFileChars(infile)

fid = fopen(infile, 'r');
if fid < 0
    error('getFileChars:openFailed', 'Could not open file for reading.');
end

str = fread(fid, Inf, '*char');
fclose(fid);

str = str(:).';

%==========================================================================
function putFileChars(outfile, fileString)

fid = fopen(outfile, 'w');
if fid < 0
    error('putFileChars:openFailed', 'Could not open file for writing.');
end

fwrite(fid, fileString, 'char');
fclose(fid);



