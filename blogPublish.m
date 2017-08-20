function blogPublish(script_name, img_location, varargin)
%blogPublish Publish MATLAB script for Wordpress blog
%
%   SYNTAX
%
%   blogPublish(script_name, img_location)
%   blogPublish(script_name, img_location, name, value)
%
%   DESCRIPTION
%
%   Uses the MATLAB publish function with a custom XSL file
%   (mxdom2bloghtml.xsl) to create HTML suitable to copying into a
%   Wordpress blog entry on blogs.mathworks.com. img_location is the URL
%   where you will upload the publish-generated graphics files (for
%   example, 'http://blogs.mathworks.com/images/steve/2012/').
%
%   script_name and img_location may be followed by any of the name-value
%   pairs accepted by the publish function except for 'stylesheet' and
%   'outputDir'. blogPublish always uses mxdom2bloghtml.xsl for the
%   stylesheet and wordpress_html for the output directory.
%
%   The resulting HTML file is placed in a subdirectory called
%   wordpress_html, and the file is loaded automatically into the editor.
%   Any captured graphics files are placed in the same directory.
%
%   Example
%   -------
%   Generate HTML for a Wordpress post using the default options.
%
%       blogPublish('shuffle_label_colors', ...
%           'http://blogs.mathworks.com/images/steve/2012')
%
%   Generate HTML for a Wordpress post using png graphics files.
%
%       blogPublish('shuffle_label_colors', ...
%           'http://blogs.mathworks.com/images/steve/2012', ...
%           'imageFormat', 'png')

% Steve Eddins

copyright = ['Copyright ',datestr(now,'yyyy'),' The MathWorks, Inc.'];

if nargin < 2
    img_location = '';
end

if ~isempty(img_location) && (img_location(end) ~= '/')
    img_location = [img_location, '/'];
end

html_name = publish(script_name, varargin{:}, ...
    'stylesheet', 'mxdom2bloghtml.xsl', ...
    'outputDir', 'wordpress_html');

html_str = getFileChars(html_name);

html_str = regexprep(html_str,'<!DOCTYPE.*?>','');

% For absolute image locations remove "root folder" placeholder
html_str = strrep(html_str,'IMG_LOCATIONhttp://','http://');

html_str = regexprep(html_str, 'IMG_LOCATION', img_location);

html_str = regexprep(html_str, 'REPLACE_COPYRIGHT', copyright);

html_str = regexprep(html_str, '<script language="JavaScript">(.*?)</script>', ...
    '<script language="JavaScript"> <!-- $1 --> </script>');

grab_code_id = getGrabCodeId();
html_str = regexprep(html_str, 'REPLACE_GRABCODE_ID', grab_code_id);

html_str = fixContentsLinks(html_str);

html_str = joinAdjacentMATLABCodeSections(html_str);


putFileChars(html_name, html_str);

edit(html_name);

%==========================================================================
function out = fixContentsLinks(in)
out = in;
tokens = regexp(out,'<a href="\#(\d+?)">','tokens');
for k = 1:numel(tokens)
    link = char(java.util.UUID.randomUUID());
    digit_string = tokens{k}{1};
    out = regexprep(out, sprintf('<a href="\\#%s">',tokens{k}{1}), ...
        sprintf('<a href="#%s">',link));
    out = regexprep(out, sprintf('<a name="%s">',tokens{k}{1}), ...
        sprintf('<a name="%s">',link));
end

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


function html_str = joinAdjacentMATLABCodeSections(html_str)

opening = '<pre class="language-matlab">';
openingPattern = regexptranslate('escape', opening);
closing = '</pre>';
closingPattern = regexptranslate('escape', closing);

[startIdx, endIdx] = regexp(html_str, [openingPattern '(.*?)' closingPattern]);

sectionStartDiff = startIdx(2:end) - endIdx(1:end-1);
duplicateSections = sectionStartDiff == 1;
changeIdx = startIdx([false duplicateSections]);

numBack = numel(closing);
numForward = numel(opening);
whitespace = [repmat(' ', 1, numBack+numForward-1) sprintf('\n')];
for idx = 1:numel(changeIdx)
    html_str(changeIdx(idx)-numBack:changeIdx(idx)+numForward-1) = whitespace;
end
html_str = regexprep(html_str, whitespace, '\n');


